"""Command line entry point. Usually started by the numbered .bat files.

  python -m company.cli demo        whole company on synthetic offline data (proves it works)
  python -m company.cli collect     download 5+ years of prices + FX
  python -m company.cli backtest    quant lab on your data
  python -m company.cli research    research desk only
  python -m company.cli night       full nightly pipeline (+ email if configured)
  python -m company.cli day         paper-trading session
  python -m company.cli probe       read-only check of eToro + Anthropic keys and data sources
  python -m company.cli status      what's in the database
  python -m company.cli selftest    offline test suite
"""
import os
import sys
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from company.core.base import DATA, DB, REPORTS, SOURCE_STATS, cfg, log, new_run_id, secrets  # noqa: E402
from company.core.ai import AI  # noqa: E402


def open_file(path, quiet):
    if path and not quiet:
        webbrowser.open("file:///" + os.path.abspath(path).replace("\\", "/"))


def cmd_pipeline(mode, quiet=False):
    from company.agents.base import Context
    from company.agents.registry import run_pipeline
    demo = mode == "demo"
    db = DB(os.path.join(DATA, "demo.db") if demo else None)
    ctx = Context(run_id=new_run_id(mode), mode=mode, demo=demo, db=db, ai=AI(demo=demo))
    if demo:
        from company.data.providers import Synthetic
        ctx.synth = Synthetic()
    path = run_pipeline(ctx)
    print("\nDashboard:", path)
    open_file(path, quiet)
    return ctx


def cmd_replay(days=60, demo=True, quiet=False):
    """Walk the Paper Trader forward day by day over the last N days (tests the full trade cycle)."""
    from company.agents.base import Context
    from company.agents.registry import cro, devil, backtester, pattern, trader, reporter
    from company.brokers.paper import SCHEMA
    db = DB(os.path.join(DATA, "replay.db"))
    if demo:
        from company.data.providers import Synthetic
        import shutil
        db.con.close()
        os.remove(db.path)
        src = os.path.join(DATA, "demo.db")
        if not os.path.exists(src):
            cmd_pipeline("demo", quiet=True)
        shutil.copy(src, os.path.join(DATA, "replay.db"))
        db = DB(os.path.join(DATA, "replay.db"))
    db.x(SCHEMA, script=True)
    for t in ("trades", "paper_equity", "paper_positions", "paper_cash"):
        db.x(f"DELETE FROM {t}")
    ctx = Context(run_id=new_run_id("replay"), mode="day", demo=demo, db=db, ai=AI(demo=True))
    cal = [r["date"] for r in db.q("SELECT date FROM prices WHERE symbol='SPY' ORDER BY date")][-days:]
    cro.execute(ctx)
    for d in cal:
        ctx.shared["as_of"] = d
        trader.run(ctx)
    ctx.shared.pop("as_of")
    reporter.execute(ctx)
    eq = db.q("SELECT strategy, MIN(value) lo, MAX(value) hi FROM paper_equity GROUP BY strategy")
    n = db.q("SELECT side, COUNT(*) n FROM trades GROUP BY side")
    print(f"Replayed {len(cal)} days: trades {n}; equity ranges {eq}")
    open_file(ctx.shared.get("dashboard_path"), quiet)


def cmd_status():
    db = DB()
    rows = db.q("SELECT symbol, COUNT(*) n, MIN(date) a, MAX(date) b, MAX(source) src FROM prices GROUP BY symbol ORDER BY symbol")
    print(f"{len(rows)} series in {db.path}")
    for r in rows:
        print(f"  {r['symbol']:<12} {r['n']:>5} days  {r['a']} → {r['b']}  ({r['src']})")
    print("strategies:", db.q("SELECT name, verdict FROM strategies WHERE run_id=(SELECT run_id FROM strategies ORDER BY ts DESC LIMIT 1)"))
    print("paper equity:", db.q("SELECT strategy, date, value FROM paper_equity ORDER BY date DESC LIMIT 6"))


def cmd_probe():
    """Read-only checks. Never places an order."""
    from company.data import providers as P
    k = secrets()
    lines = []

    def chk(name, fn):
        try:
            r = fn()
            lines.append(f"✅ {name}: {str(r)[:140]}")
        except Exception as e:
            lines.append(f"❌ {name}: {str(e)[:160]}")
    chk("Yahoo Finance (SPY, 5 days)", lambda: P.yahoo_daily("SPY", 0.02)[-1])
    chk("Stooq (aapl.us)", lambda: P.stooq_daily("aapl.us")[-1])
    chk("ECB FX (USD rows)", lambda: len(P.ecb_fx_history().get("USD", [])))
    chk("Google News", lambda: P.google_news("Siemens Energy", 3, 1)[0]["title"])
    chk("Reddit", lambda: len(P.reddit("Nvidia", 2)))
    chk("StockTwits", lambda: P.stocktwits("NVDA"))
    chk("Polymarket", lambda: P.polymarket("Fed", 1))
    chk("Nasdaq earnings", lambda: P.nasdaq_earnings("NVDA"))
    if k.get("ANTHROPIC_API_KEY"):
        ai = AI()
        chk("Anthropic API", lambda: ai.json("probe", "Reply briefly.", "Say ok.", {"type": "object", "properties": {"ok": {"type": "string"}}, "required": ["ok"], "additionalProperties": False}) or ai.error)
    else:
        lines.append("➖ Anthropic API: no key in secrets/keys.txt (AI agents will use rules)")
    if k.get("ETORO_API_KEY") and k.get("ETORO_USER_KEY"):
        et = P.EToro(k, cfg("etoro.json"))
        chk("eToro search AAPL", lambda: et.instrument_id("AAPL"))
        chk("eToro candles AAPL (1000 daily)", lambda: (lambda c: f"{len(c)} candles {c[0][0]}→{c[-1][0]}")(et.candles(et.instrument_id("AAPL"))))
        chk("eToro DEMO portfolio", lambda: str(et.get(cfg("etoro.json")["paths"]["demo_portfolio"]))[:140])
    else:
        lines.append("➖ eToro: no keys in secrets/keys.txt")
    os.makedirs(REPORTS, exist_ok=True)
    out = os.path.join(REPORTS, "probe.txt")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    print("\nSaved:", out)


def main(argv):
    quiet = "--quiet" in argv
    args = [a for a in argv if not a.startswith("--")]
    cmd = args[0] if args else "demo"
    if cmd in ("demo", "collect", "backtest", "research", "night", "day"):
        cmd_pipeline(cmd, quiet)
    elif cmd == "selftest":
        import unittest
        import warnings
        warnings.simplefilter("ignore")
        print("Running offline self-tests (no internet, no keys needed)...")
        suite = unittest.defaultTestLoader.discover(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tests"))
        res = unittest.TextTestRunner(verbosity=1).run(suite)
        print("\nSELF-TEST " + ("PASSED ✅" if res.wasSuccessful() else "FAILED ❌ — send logs to Claude"))
        sys.exit(0 if res.wasSuccessful() else 1)
    elif cmd == "status":
        cmd_status()
    elif cmd == "replay":
        cmd_replay(int(args[1]) if len(args) > 1 else 60, demo="--real" not in argv, quiet=quiet)
    elif cmd == "probe":
        cmd_probe()
    elif cmd == "open":
        open_file(os.path.join(REPORTS, "dashboard.html"), False)
    else:
        print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
