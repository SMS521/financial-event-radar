"""Data department: agents 3-6."""
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta

from company.agents.base import Agent
from company.core.base import SOURCE_STATS, cfg, now_iso, retry, secrets
from company.data import providers as P


def _store(db, symbol, rows, source):
    db.x("INSERT OR REPLACE INTO prices(symbol,date,close,high,low,volume,source) VALUES(?,?,?,?,?,?,?)",
         [(symbol, d, c, h, l, v, source) for d, c, h, l, v in rows], many=True)


def _stooq_name(sym):
    if sym.startswith("^") or "=" in sym:
        return None
    if "." in sym:
        base, ex = sym.split(".", 1)
        return {"DE": f"{base}.de", "PA": f"{base}.fr", "WA": f"{base}.pl"}.get(ex)
    return f"{sym}.us"


class PriceEngineer(Agent):
    id, name, title, dept = 3, "price_engineer", "Price Data Engineer", "Data"
    job = "Collects 5+ years of daily prices for portfolio, past trades and the research universe."

    def run(self, ctx):
        syms = [s for s in ctx.universe["symbols"]] + [{"symbol": m["symbol"], "kind": "index"} for m in ctx.universe["macro"]]
        years = ctx.settings.get("history_years", 6)
        keys = secrets()
        et = P.EToro(keys, cfg("etoro.json", {}))
        ok, fail, src_count = 0, [], {}

        def one(s):
            sym = s["symbol"]
            last = ctx.db.q("SELECT MAX(date) d FROM prices WHERE symbol=?", (sym,))[0]["d"]
            if ctx.demo:
                return sym, ctx.synth.daily(sym, s.get("kind", "stock")), "demo"
            # incremental: if we have data, only refresh recent months
            yrs = 0.3 if last and last >= (date.today() - timedelta(days=60)).isoformat() else years
            for name, fn in (("yahoo", lambda: retry(lambda: P.yahoo_daily(sym, yrs), tries=3, wait=1.5)),
                             ("stooq", lambda: P.stooq_daily(_stooq_name(sym)) if _stooq_name(sym) else []),
                             ("etoro", lambda: et.candles(et.instrument_id(s.get("etoro") or sym)) if et.ready else [])):
                try:
                    rows = fn()
                    if rows:
                        return sym, rows, name
                except Exception:
                    continue
            return sym, [], None

        with ThreadPoolExecutor(4) as ex:      # gentle: free sources throttle bursts
            for sym, rows, src in ex.map(one, syms):
                if rows:
                    _store(ctx.db, sym, rows, src)
                    ok += 1
                    src_count[src] = src_count.get(src, 0) + 1
                else:
                    fail.append(sym)
        ctx.shared["price_fail"] = fail
        msg = f"{ok}/{len(syms)} symbols updated via {src_count}" + (f"; missing: {', '.join(fail[:12])}" if fail else "")
        if ok == 0:
            return "fail", msg + " — no price source reachable"
        return ("warn" if fail else "ok"), msg


class FXEngineer(Agent):
    id, name, title, dept = 4, "fx_engineer", "FX & Macro Engineer", "Data"
    job = "Collects currency pairs (USD/INR, USD/JPY, EUR/USD, GBP/USD...) — ECB history since 1999 + Yahoo."

    def run(self, ctx):
        pairs = ctx.universe["fx"]
        if ctx.demo:
            for p in pairs:
                _store(ctx.db, p["symbol"], ctx.synth.daily(p["symbol"], "fx"), "demo")
            return "ok", f"{len(pairs)} FX pairs (demo data)"
        done, how = 0, {}
        ecb = None
        try:
            ecb = P.ecb_fx_history()
        except Exception as e:
            how["ecb_error"] = str(e)[:80]
        for p in pairs:
            rows = []
            try:
                rows = P.yahoo_daily(p["symbol"], ctx.settings.get("history_years", 6))
                src = "yahoo"
            except Exception:
                pass
            if not rows and ecb and p["base"] in list(ecb) + ["EUR"] and p["quote"] in list(ecb) + ["EUR"]:
                rows = [(d, r, None, None, None) for d, r in P.ecb_cross(ecb, p["base"], p["quote"])]
                src = "ecb"
            if rows:
                _store(ctx.db, p["symbol"], rows, src)
                done += 1
                how[src] = how.get(src, 0) + 1
        if done == 0:
            return "fail", "no FX source reachable"
        return ("ok" if done == len(pairs) else "warn"), f"{done}/{len(pairs)} FX pairs via {how}"


class EventClerk(Agent):
    id, name, title, dept = 5, "event_clerk", "Event Calendar Clerk", "Data"
    uses_ai = False
    job = "Builds the calendar: earnings dates for holdings & radar names (+ macro events from research)."

    def run(self, ctx):
        syms = [s for s in ctx.universe["symbols"] if s["group"] in ("portfolio", "traded_before") or s["kind"] == "stock"]
        found = 0
        rows = []

        def one(s):
            try:
                d = ctx.synth.earnings(s["symbol"]) if ctx.demo else P.nasdaq_earnings(s["symbol"])
                return s, d
            except Exception:
                return s, None
        with ThreadPoolExecutor(6) as ex:
            for s, d in ex.map(one, syms[:80]):
                if d:
                    rows.append((d, s["symbol"], "earnings", f"{s['name']} earnings", "demo" if ctx.demo else "Nasdaq", "", now_iso()))
                    found += 1
        ctx.db.x("INSERT OR REPLACE INTO events VALUES(?,?,?,?,?,?,?)", rows, many=True)
        return ("ok" if found else "warn"), f"{found} earnings dates on file"


class DataAuditor(Agent):
    id, name, title, dept = 6, "data_auditor", "Data Quality Auditor", "Data"
    job = "Checks gaps, spikes, stale prices. Research and trading wait until data passes (gate)."

    def run(self, ctx):
        issues, checked, stale = [], 0, []
        today = date.today()
        for s in ctx.universe["symbols"] + ctx.universe["fx"]:
            sym = s["symbol"]
            ser = ctx.db.series(sym)
            if not ser:
                continue
            checked += 1
            last = date.fromisoformat(ser[-1][0])
            if (today - last).days > ctx.risk["paper_trading"]["max_data_age_days"] + 2:
                stale.append(sym)
            for (d0, a), (d1, b) in zip(ser[-400:], ser[-399:]):
                if a and b and abs(b / a - 1) > (0.6 if "=F" in sym or s.get("kind") == "crypto" else 0.4):
                    issues.append(f"{sym} jump {round((b / a - 1) * 100)}% on {d1} (split/bad tick?)")
                    break
        ctx.shared["stale"] = stale
        need = max(10, int(0.5 * len(ctx.universe["symbols"])))
        gate = checked >= need
        ctx.shared["data_gate"] = gate
        ctx.db.memo(ctx.run_id, self.name, "data_audit", {"checked": checked, "issues": issues[:30], "stale": stale,
                                                            "sources": SOURCE_STATS, "gate": gate})
        msg = f"{checked} series checked, {len(issues)} suspicious jumps, {len(stale)} stale"
        if not gate:
            return "fail", msg + f" — GATE CLOSED (need ≥{need} series)"
        return ("warn" if issues or stale else "ok"), msg + " — gate open"
