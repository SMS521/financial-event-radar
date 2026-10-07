"""Quant lab: agents 15-17."""
import json
import math
import statistics as st
from datetime import date

from company.agents.base import Agent
from company.core.base import cfg, now_iso
from company.quant import engine as E


def _corr(a, b):
    n = min(len(a), len(b))
    if n < 30:
        return None
    a, b = a[-n:], b[-n:]
    ma, mb = st.mean(a), st.mean(b)
    sa, sb = st.pstdev(a), st.pstdev(b)
    if sa == 0 or sb == 0:
        return None
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / (n * sa * sb)


def _rets(db, sym, days=520):
    s = db.series(sym)[-days - 1:]
    return {s[i][0]: s[i][1] / s[i - 1][1] - 1 for i in range(1, len(s)) if s[i - 1][1]}


def _spearman(x, y):
    def rank(v):
        o = sorted(range(len(v)), key=lambda i: v[i])
        r = [0] * len(v)
        for k, i in enumerate(o):
            r[i] = k
        return r
    return _corr(rank(x), rank(y)) if len(x) > 5 else None


INSIGHT_SCHEMA = {"type": "object", "properties": {"insights": {"type": "array", "items": {"type": "object", "properties": {
    "title": {"type": "string"}, "explanation": {"type": "string"}, "how_to_use": {"type": "string"},
    "confidence": {"type": "string", "enum": ["low", "medium", "high"]}},
    "required": ["title", "explanation", "how_to_use", "confidence"], "additionalProperties": False}}},
    "required": ["insights"], "additionalProperties": False}


class PatternResearcher(Agent):
    id, name, title, dept, uses_ai = 15, "pattern_researcher", "Pattern Researcher", "Quant Lab", True
    job = "Finds repeatable behaviour: currency links, momentum persistence, seasonality, market breadth."

    def run(self, ctx):
        db, U = ctx.db, ctx.universe
        segs = {}
        for s in U["symbols"]:
            segs.setdefault(s["segment"], []).append(s["symbol"])
        seg_ret = {}
        for seg, syms in segs.items():
            per = [_rets(db, x) for x in syms]
            days = sorted(set().union(*[set(p) for p in per])) if per else []
            seg_ret[seg] = {d: st.mean([p[d] for p in per if d in p]) for d in days if any(d in p for p in per)}
        fx_links = []
        for fx in U["fx"]:
            fr = _rets(db, fx["symbol"])
            if len(fr) < 100:
                continue
            for seg, sr in seg_ret.items():
                days = sorted(set(fr) & set(sr))
                if len(days) < 100:
                    continue
                same = _corr([fr[d] for d in days], [sr[d] for d in days])
                lead = _corr([fr[d] for d in days[:-1]], [sr[d] for d in days[1:]])
                if same is not None:
                    fx_links.append({"fx": fx["name"], "segment": seg, "corr": round(same, 2),
                                     "lead_1d": round(lead, 2) if lead is not None else None})
        fx_links.sort(key=lambda r: -abs(r["corr"]))

        # momentum persistence: does last-6-month winner keep winning next month?
        stock_syms = [s["symbol"] for s in U["symbols"] if s["kind"] in ("stock", "etf")]
        dates, syms, C = E.build_matrix(db, stock_syms, "SPY")
        ics = []
        for t in range(126, len(C) - 21, 21):
            past, fut = [], []
            for s in range(len(syms)):
                a, b, c = C[t - 126][s], C[t][s], C[t + 21][s]
                if a and b and c:
                    past.append(b / a - 1)
                    fut.append(c / b - 1)
            ic = _spearman(past, fut)
            if ic is not None:
                ics.append(ic)
        momentum = {"avg_ic": round(st.mean(ics), 3) if ics else None, "months": len(ics),
                    "positive_share_pct": round(100 * sum(1 for i in ics if i > 0) / len(ics)) if ics else None}

        spy = db.series("SPY")
        # month-of-year average return
        monthly, last_by_month = {}, {}
        for d, v in spy:
            last_by_month[d[:7]] = v
        ks = sorted(last_by_month)
        for k0, k1 in zip(ks, ks[1:]):
            m = int(k1[5:7])
            monthly.setdefault(m, []).append(last_by_month[k1] / last_by_month[k0] - 1)
        seasonality = {m: round(100 * st.mean(v), 2) for m, v in sorted(monthly.items()) if v}

        breadth = None
        if C:
            above = tot = 0
            for s in range(len(syms)):
                col = [row[s] for row in C[-200:]]
                if all(col):
                    tot += 1
                    above += col[-1] > sum(col) / 200
            breadth = round(100 * above / tot) if tot else None

        findings = {"fx_links": fx_links[:15], "momentum": momentum, "seasonality_spy_pct": seasonality,
                    "breadth_above_200d_pct": breadth, "universe_size": len(syms)}
        if ctx.ai.on:
            ai = ctx.ai.json(self.name, "You are a quantitative researcher who explains findings to a non-expert. Be honest about weak evidence; correlations are not causes.",
                             "Turn these measured statistics into at most 6 practical insights:\n" + json.dumps(findings), INSIGHT_SCHEMA)
            findings["insights"] = (ai or {}).get("insights", [])
        if not findings.get("insights"):
            ins = []
            if fx_links:
                f = fx_links[0]
                ins.append({"title": f"{f['fx']} moves with {f['segment']} (corr {f['corr']})",
                            "explanation": "Measured over the last ~2 years of daily moves.",
                            "how_to_use": "Watch this currency as an early-warning gauge for that segment.", "confidence": "low"})
            if momentum["avg_ic"] is not None:
                ins.append({"title": f"Momentum persistence IC {momentum['avg_ic']}",
                            "explanation": f"Recent winners kept winning the next month in {momentum['positive_share_pct']}% of months.",
                            "how_to_use": "Positive and steady → momentum strategies have an edge in this universe.", "confidence": "medium" if (momentum['avg_ic'] or 0) > .03 else "low"})
            if breadth is not None:
                ins.append({"title": f"{breadth}% of the universe is above its 200-day average",
                            "explanation": "Market breadth: >60% healthy, <40% weak.", "how_to_use": "Size down leveraged longs when breadth is weak.", "confidence": "medium"})
            findings["insights"] = ins
        ctx.shared["patterns"] = findings
        ctx.db.memo(ctx.run_id, self.name, "patterns", findings)
        return "ok", f"{len(fx_links)} FX links, momentum IC {momentum['avg_ic']}, breadth {breadth}%"


class Backtester(Agent):
    id, name, title, dept = 16, "backtester", "Backtester", "Quant Lab"
    job = "Tests each strategy on 5+ years incl. costs; picks parameters on old data only, scores on the last year."

    def run(self, ctx):
        sc = cfg("strategies.json")
        groups = set(sc["universe_groups"])
        syms = [s["symbol"] for s in ctx.universe["symbols"] if s["group"] in groups and s["kind"] in ("stock", "etf")]
        dates, syms, C = E.build_matrix(ctx.db, syms, sc.get("benchmark"))
        if len(dates) < 400:
            return "fail", f"not enough history ({len(dates)} days) — run data collection first"
        R = E.returns(C)
        oos, cost = sc["oos_days"], sc["cost_bps"]
        results = {}
        bh_w = E.w_buy_hold(C, R)
        bh_port, _, _ = E.simulate(bh_w, R, cost)
        split = len(C) - oos
        bench = {"is": E.metrics(bh_port[:split]), "oos": E.metrics(bh_port[split:]), "equity": E.equity_curve(bh_port)}
        spy = ctx.db.series(sc.get("benchmark", "SPY"))
        for name, spec in sc["strategies"].items():
            best, allres, frag, split = E.run_family(name, C, R, spec["grid"], oos, cost)
            lev = {}
            for L in sc.get("leverage_test", [1]):
                lp = E.leverage(best["port"], L)
                lev[str(L)] = E.metrics(lp)
            results[name] = {"params": best["params"], "is": best["is"], "oos": best["oos"], "fragility": frag,
                             "grid": [{"params": r["params"], "is_sharpe": r["is"].get("sharpe"), "oos_sharpe": r["oos"].get("sharpe")} for r in allres],
                             "leverage": lev, "equity": E.equity_curve(best["port"]), "explain": E.EXPLAIN[name]}
        ctx.shared["backtest"] = {"results": results, "bench": bench, "split_date": dates[split], "start": dates[0],
                                  "end": dates[-1], "n_symbols": len(syms)}
        best_name = max(results, key=lambda k: results[k]["oos"].get("sharpe", -9))
        return "ok", (f"{len(results)} strategy families × params on {len(syms)} symbols, {dates[0]}→{dates[-1]}; "
                      f"best out-of-sample: {best_name} (Sharpe {results[best_name]['oos'].get('sharpe')})")


class DevilsAdvocate(Agent):
    id, name, title, dept, uses_ai = 17, "devils_advocate", "Devil's Advocate", "Quant Lab", True
    job = "Tries to break every strategy: lucky? fragile params? fails on unseen year? Only survivors get paper-traded."

    def run(self, ctx):
        bt = ctx.shared.get("backtest")
        if not bt:
            return "skip", "no backtest results"
        rules = ctx.risk["strategy_approval"]
        bench_oos = bt["bench"]["oos"]
        verdicts = {}
        for name, r in bt["results"].items():
            reasons, o, i = [], r["oos"], r["is"]
            if o.get("sharpe", -9) < rules["min_oos_sharpe"]:
                reasons.append(f"unseen-year Sharpe {o.get('sharpe')} < {rules['min_oos_sharpe']}")
            if abs(o.get("max_drawdown_pct", -100)) > rules["max_oos_drawdown_pct"]:
                reasons.append(f"unseen-year drawdown {o.get('max_drawdown_pct')}% too deep")
            if (i.get("trades") or 0) < rules["min_trades"]:
                reasons.append(f"only {i.get('trades')} trades — too few to trust")
            if r["fragility"] > rules["max_param_fragility"]:
                reasons.append(f"fragile: best setting is {int(r['fragility'] * 100)}% better than typical neighbours (likely luck)")
            if i.get("sharpe") and o.get("sharpe") is not None and i["sharpe"] > 0 and o["sharpe"] < 0.3 * i["sharpe"]:
                reasons.append("edge mostly vanished out-of-sample")
            if rules.get("must_beat_benchmark_oos") and o.get("sharpe", 0) < bench_oos.get("sharpe", 0):
                reasons.append("does not beat buy-and-hold on the unseen year")
            verdict = "approved" if not reasons else ("watch" if len(reasons) == 1 else "rejected")
            verdicts[name] = {"verdict": verdict, "reasons": reasons or ["passed all checks"]}
            ctx.db.x("INSERT OR REPLACE INTO strategies VALUES(?,?,?,?,?,?,?,?,?)",
                     (ctx.run_id, name, json.dumps(r["params"]), json.dumps(r["is"]), json.dumps(r["oos"]),
                      verdict, json.dumps(verdicts[name]["reasons"]), json.dumps(r["equity"]), now_iso()))
        verdicts["_note"] = {"verdict": "info", "reasons": [
            f"{sum(len(r['grid']) for r in bt['results'].values())} combinations were tried; with that many, one can look good by chance. "
            "Paper-trade approved ones for weeks before trusting them."]}
        ctx.shared["verdicts"] = verdicts
        approved = [k for k, v in verdicts.items() if v["verdict"] == "approved"]
        return "ok", f"approved: {approved or 'none'}; " + ", ".join(f"{k}={v['verdict']}" for k, v in verdicts.items() if not k.startswith("_"))
