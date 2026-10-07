"""Chief Risk Officer (2) and Paper Trader (19)."""
import json
import os
from datetime import date

from company.agents.base import Agent
from company.brokers.paper import EToroDemo, LocalLedger
from company.core.base import ROOT, cfg, now_iso, secrets
from company.quant import engine as E


class ChiefRiskOfficer(Agent):
    id, name, title, dept = 2, "chief_risk_officer", "Chief Risk Officer", "Leadership"
    job = "Enforces your risk rules on the real portfolio and on strategies. Has VETO power — nobody overrules it."

    def run(self, ctx):
        R = ctx.risk["portfolio"]
        H = ctx.portfolio.get("holdings", [])
        total = sum(h.get("value_eur", 0) for h in H) or 1
        breaches = []
        seg = {}
        for h in H:
            pct = 100 * h.get("value_eur", 0) / total
            seg[h.get("segment")] = seg.get(h.get("segment"), 0) + pct
            if pct > R["max_position_pct"]:
                breaches.append({"level": "amber", "what": h["name"], "rule": f"position is {pct:.0f}% of portfolio (limit {R['max_position_pct']}%)"})
            if (h.get("leverage") or 1) >= R["max_leverage_warn"]:
                breaches.append({"level": "amber", "what": h["name"], "rule": f"{h['leverage']}x daily leverage (warn ≥ {R['max_leverage_warn']}x): volatility decay"})
            a = ctx.shared.get("assessments", {}).get(h["isin"], {})
            kd = (a.get("facts") or {}).get("ko_distance_pct")
            if kd is not None and kd < R["min_turbo_knockout_distance_pct"]:
                breaches.append({"level": "red", "what": h["name"], "rule": f"knock-out distance {kd}% < {R['min_turbo_knockout_distance_pct']}% minimum"})
        for s, p in seg.items():
            if p > R["max_segment_pct"]:
                breaches.append({"level": "amber", "what": s, "rule": f"segment is {p:.0f}% of portfolio (limit {R['max_segment_pct']}%)"})
        # strategy vetoes
        vetoes, allowed = [], []
        verdicts = ctx.shared.get("verdicts") or self._last_verdicts(ctx)
        regime = (ctx.shared.get("macro") or {}).get("regime")
        for name, v in verdicts.items():
            if name.startswith("_"):
                continue
            ok = v["verdict"] == "approved" or (v["verdict"] == "watch" and ctx.risk["paper_trading"].get("include_watch"))
            if ok:
                allowed.append(name)
            else:
                vetoes.append(f"{name}: {v['verdict']}")
        size_factor = 0.5 if regime == "risk-off" else 1.0
        out = {"breaches": breaches, "segments": seg, "allowed_strategies": allowed, "vetoed": vetoes,
               "size_factor": size_factor, "regime": regime}
        ctx.shared["risk"] = out
        ctx.db.memo(ctx.run_id, self.name, "risk", out)
        reds = sum(1 for b in breaches if b["level"] == "red")
        return ("warn" if reds else "ok"), (f"{len(breaches)} rule breaches ({reds} red); paper-trading allowed: {allowed or 'none'}"
                                            + (f"; risk-off → half size" if size_factor < 1 else ""))

    def _last_verdicts(self, ctx):
        rows = ctx.db.q("SELECT name, verdict, reasons FROM strategies WHERE run_id=(SELECT run_id FROM strategies ORDER BY ts DESC LIMIT 1)")
        return {r["name"]: {"verdict": r["verdict"], "reasons": json.loads(r["reasons"])} for r in rows}


class PaperTrader(Agent):
    id, name, title, dept = 19, "paper_trader", "Paper Trader (eToro DEMO only)", "Execution"
    job = "Trades only risk-approved strategies with virtual money; local ledger always, eToro demo when keys exist."

    def run(self, ctx):
        P = ctx.risk["paper_trading"]
        if not P.get("enabled"):
            return "skip", "paper trading disabled in config/risk.json"
        if os.path.exists(os.path.join(ROOT, P["kill_switch_file"])):
            return "skip", f"KILL SWITCH: {P['kill_switch_file']} exists — no trading"
        risk = ctx.shared.get("risk")
        if risk is None:
            ChiefRiskOfficer().execute(ctx)
            risk = ctx.shared["risk"]
        strategies = risk["allowed_strategies"]
        if not strategies:
            return "skip", "no strategy approved by Devil's Advocate + Risk Officer yet"
        sc = cfg("strategies.json")
        syms = [s for s in ctx.universe["symbols"] if s["group"] in set(sc["universe_groups"]) and s["kind"] in ("stock", "etf")]
        emap = {s["symbol"]: s.get("etoro") for s in syms}
        dates, symbols, C = E.build_matrix(ctx.db, [s["symbol"] for s in syms], sc.get("benchmark"))
        if not dates:
            return "fail", "no price data"
        as_of = ctx.shared.get("as_of")            # replay mode: pretend today is an earlier day
        full_R = None
        if as_of:
            k = max(i for i, d in enumerate(dates) if d <= as_of) + 1
            if "W_cache" not in ctx.shared:
                full_R = E.returns(C)
                ctx.shared["W_cache"] = {}
            ctx.shared["W_full"] = (C, full_R)
            dates, C = dates[:k], C[:k]
        age = (date.today() - date.fromisoformat(dates[-1])).days
        if age > P["max_data_age_days"] and not as_of:
            return "skip", f"data is {age} days old (limit {P['max_data_age_days']}) — refusing to trade on stale prices"
        R = E.returns(C)
        last = {s: C[-1][i] for i, s in enumerate(symbols)}
        params = self._params(ctx)
        ledger = LocalLedger(ctx.db, P["capital_eur"] / max(1, len(strategies)))
        etoro = EToroDemo(ctx.db, secrets(), cfg("etoro.json")) if P.get("use_etoro_demo") and not ctx.demo else None
        etoro = etoro if etoro and etoro.ready and not as_of else None   # replays never touch eToro
        log_n, notes = 0, []
        for strat in strategies:
            prev = ctx.db.q("SELECT value FROM paper_equity WHERE strategy=? ORDER BY date DESC LIMIT 1", (strat,))
            now_val = ledger.value(strat, last)
            if prev and now_val < prev[0]["value"] * (1 - P["daily_loss_stop_pct"] / 100):
                notes.append(f"{strat}: daily loss stop hit — no new trades")
                continue
            if as_of:   # weights never use future data (tested), so compute once on full history and slice
                cache = ctx.shared["W_cache"]
                if strat not in cache:
                    FC, FR = ctx.shared["W_full"]
                    cache[strat] = E.STRATEGIES[strat](FC, FR or E.returns(FC), **params.get(strat, {}))
                W = cache[strat][:len(C)]
            else:
                W = E.STRATEGIES[strat](C, R, **params.get(strat, {}))
            tw = sorted(((w, symbols[i]) for i, w in enumerate(W[-1]) if w > 0), reverse=True)[:P["max_open_positions"]]
            budget = ledger.value(strat, last) * risk["size_factor"]
            target = {s: min(P["max_trade_eur"], w * budget / max(sum(x for x, _ in tw), 1e-9) if tw else 0) for w, s in tw}
            held = ledger.positions(strat)
            for s in [s for s in held if s not in target]:
                pnl = ledger.sell(strat, s, last[s])
                raw = etoro.close(s, held[s]["etoro_position_id"]) if etoro else ""
                self._trade(ctx, "etoro-demo+local" if etoro else "local", strat, s, "SELL", held[s]["units"] * last[s], last[s], None, raw)
                log_n += 1
            for s, amt in target.items():
                if s in held or amt < 25 or ledger.cash(strat) < amt:
                    continue
                pid, raw = (etoro.open(s, emap.get(s), amt) if etoro else (None, ""))
                ledger.buy(strat, s, amt, last[s], dates[-1], pid)
                self._trade(ctx, "etoro-demo+local" if etoro else "local", strat, s, "BUY", amt, last[s], pid, raw)
                log_n += 1
            ctx.db.x("INSERT OR REPLACE INTO paper_equity VALUES(?,?,?)", (dates[-1], strat, ledger.value(strat, last)))
        broker = "eToro DEMO + local ledger" if etoro else "local ledger (no eToro keys)" if not ctx.demo else "local ledger (demo data)"
        return "ok", f"{log_n} virtual orders for {strategies} via {broker}" + (f"; {'; '.join(notes)}" if notes else "")

    def _params(self, ctx):
        bt = ctx.shared.get("backtest")
        if bt:
            return {k: v["params"] for k, v in bt["results"].items()}
        rows = ctx.db.q("SELECT name, params FROM strategies WHERE run_id=(SELECT run_id FROM strategies ORDER BY ts DESC LIMIT 1)")
        return {r["name"]: json.loads(r["params"]) for r in rows}

    def _trade(self, ctx, broker, strat, sym, side, amount, price, pid, raw):
        ctx.db.x("INSERT INTO trades(ts,broker,strategy,symbol,side,amount,price,position_id,status,raw) VALUES(?,?,?,?,?,?,?,?,?,?)",
                 (now_iso(), broker, strat, sym, side, round(amount, 2), price, pid, "filled", raw))
