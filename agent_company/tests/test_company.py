"""Self-test suite. Runs offline in ~1 minute: python -m unittest discover -s tests"""
import io
import json
import os
import random
import sys
import tempfile
import unittest
import zipfile
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from company.core import base  # noqa: E402
from company.core.base import DB  # noqa: E402
from company.quant import engine as E  # noqa: E402
from company.data import providers as P  # noqa: E402


def rand_matrix(T=600, S=6, seed=1):
    rnd = random.Random(seed)
    C, p = [], [100.0] * S
    for _ in range(T):
        p = [x * (1 + rnd.gauss(0.0003, 0.015)) for x in p]
        C.append(list(p))
    return C


class Engine(unittest.TestCase):
    def test_no_lookahead(self):
        """Changing FUTURE prices must not change any PAST weight."""
        C = rand_matrix()
        R = E.returns(C)
        cut = 400
        C2 = [row[:] for row in C]
        for t in range(cut + 1, len(C2)):
            C2[t] = [x * 3 for x in C2[t]]
        R2 = E.returns(C2)
        for name, fn in E.STRATEGIES.items():
            W1, W2 = fn(C, R), fn(C2, R2)
            self.assertEqual(W1[:cut + 1], W2[:cut + 1], f"{name} peeks into the future")

    def test_metrics_known_series(self):
        m = E.metrics([0.01] * 252)
        self.assertAlmostEqual(m["total_return_pct"], (1.01 ** 252 - 1) * 100, delta=0.2)
        self.assertEqual(m["max_drawdown_pct"], 0.0)
        m = E.metrics([0.0] * 100 + [-0.5] + [0.0] * 100)
        self.assertAlmostEqual(m["max_drawdown_pct"], -50.0, delta=0.1)

    def test_costs_reduce_return(self):
        C = rand_matrix()
        R = E.returns(C)
        W = E.w_trend_sma(C, R, n=20)
        a, _, _ = E.simulate(W, R, 0)
        b, _, _ = E.simulate(W, R, 50)
        self.assertGreater(sum(a), sum(b))

    def test_leverage_decay(self):
        # up 10%, down 9.09% -> flat unleveraged, but 3x daily loses money
        rets = [0.10, -1 / 11] * 50
        flat = E.metrics(rets)["total_return_pct"]
        lev = E.metrics(E.leverage(rets, 3, 0))["total_return_pct"]
        self.assertAlmostEqual(flat, 0, delta=0.5)
        self.assertLess(lev, -10)

    def test_weights_never_exceed_100pct(self):
        C = rand_matrix()
        R = E.returns(C)
        for name, fn in E.STRATEGIES.items():
            for row in fn(C, R):
                self.assertLessEqual(sum(row), 1.0001, name)

    def test_run_family_picks_on_in_sample(self):
        C = rand_matrix(800)
        R = E.returns(C)
        best, allres, frag, split = E.run_family("trend_sma", C, R, {"n": [20, 50, 100]}, 200)
        self.assertEqual(best["is"]["sharpe"], max(r["is"]["sharpe"] for r in allres))
        self.assertEqual(split, 600)


class Ledger(unittest.TestCase):
    def test_buy_sell_cash(self):
        from company.brokers.paper import LocalLedger
        with tempfile.TemporaryDirectory() as d:
            db = DB(os.path.join(d, "t.db"))
            L = LocalLedger(db, 1000)
            self.assertEqual(L.cash("s"), 1000)
            L.buy("s", "AAA", 200, 10, "2026-01-01")
            self.assertAlmostEqual(L.value("s", {"AAA": 12}), 1040)
            pnl = L.sell("s", "AAA", 12)
            self.assertAlmostEqual(pnl, 40)
            self.assertAlmostEqual(L.cash("s"), 1040)
            self.assertEqual(L.positions("s"), {})


class Parsers(unittest.TestCase):
    def test_google_news_rss(self):
        xml = b"""<rss><channel><item><title>Siemens Energy wins contract</title><link>https://x/1</link>
<pubDate>Tue, 06 Oct 2026 08:00:00 GMT</pubDate><source url="https://r">Reuters</source></item></channel></rss>"""
        with mock.patch.object(P, "http", return_value=xml):
            n = P.google_news("Siemens Energy")
        self.assertEqual(n[0]["source"], "Reuters")
        self.assertTrue(n[0]["time"].startswith("2026-10-06T08:00"))

    def test_yahoo_parse(self):
        js = {"chart": {"result": [{"timestamp": [1759708800, 1759795200], "meta": {},
              "indicators": {"quote": [{"close": [10, None], "high": [11, 1], "low": [9, 1], "volume": [5, 1]}],
                             "adjclose": [{"adjclose": [9.5, None]}]}}]}}
        with mock.patch.object(P, "http_json", return_value=js):
            rows = P.yahoo_daily("X")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][1], 9.5)   # adjusted close preferred

    def test_ecb_cross(self):
        csv_txt = "Date,USD,INR,JPY,\n2026-10-06,1.10,92.0,165.0,\n2026-10-05,1.00,90.0,N/A,\n"
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as z:
            z.writestr("eurofxref-hist.csv", csv_txt)
        with mock.patch.object(P, "http", return_value=buf.getvalue()):
            fx = P.ecb_fx_history()
        usdinr = dict(P.ecb_cross(fx, "USD", "INR"))
        self.assertAlmostEqual(usdinr["2026-10-06"], 92.0 / 1.10)
        self.assertEqual(dict(P.ecb_cross(fx, "EUR", "USD"))["2026-10-05"], 1.0)

    def test_stooq_parse(self):
        with mock.patch.object(P, "http", return_value="Date,Open,High,Low,Close,Volume\n2026-10-05,1,2,0.5,1.5,100\n"):
            self.assertEqual(P.stooq_daily("aapl.us")[0][:2], ("2026-10-05", 1.5))


class Agents(unittest.TestCase):
    def test_desk_routing(self):
        from company.agents.research import desk_of
        self.assertEqual(desk_of("Taiwan"), "asia")
        self.assertEqual(desk_of("Semiconductors"), "semis")
        self.assertEqual(desk_of("Energy"), "energy")
        self.assertEqual(desk_of("Gold"), "commod")

    def test_rule_assess_knockout(self):
        from company.agents.research import rule_assess
        ctx = mock.Mock(risk=json.load(open(os.path.join(base.CONFIG, "risk.json"))))
        p = {"facts": {"last": 100, "ko_distance_pct": 3, "d1": 0, "d5": 0}, "news": [], "social": None,
             "item": {"key": "k", "leverage": None}}
        self.assertEqual(rule_assess(p, ctx)["status"], "red")
        p["facts"]["ko_distance_pct"] = 40
        self.assertEqual(rule_assess(p, ctx)["status"], "green")

    def test_ai_off_without_key(self):
        from company.core.ai import AI
        with mock.patch("company.core.ai.secrets", return_value={}):
            ai = AI()
        self.assertFalse(ai.on)
        self.assertIsNone(ai.json("x", "s", "p", {}))

    def test_twenty_agents(self):
        from company.agents.registry import STAFF
        self.assertEqual(len(STAFF), 20)
        self.assertEqual(sorted(a.id for a in STAFF), list(range(1, 21)))

    def test_no_real_money_path(self):
        conf = json.load(open(os.path.join(base.CONFIG, "etoro.json")))
        for k, v in conf["paths"].items():
            if "execution" in v:
                self.assertIn("/demo/", v, f"{k} is not a demo path")


class FakeAI:
    """Pretends to be Claude: marks every position red with one made-up and one real note."""
    on, error = True, None

    def __init__(self):
        self.n = 0

    def calls(self):
        return self.n

    def json(self, agent, system, prompt, schema):
        self.n += 1
        if agent.startswith("analyst_"):
            data = json.loads(prompt[prompt.index("["):])
            return {"items": [{"key": d["key"], "status": "red", "summary": "AI says red",
                               "notes": ([{"time": h["time"], "text": h["title"], "url": h["url"]} for h in d["headlines"][:1]]
                                         + [{"time": "x", "text": "invented claim", "url": "https://fake.example"}]),
                               "watch_next": ["earnings"]} for d in data]}
        if agent == "fact_checker":
            data = json.loads(prompt[prompt.index("["):])
            return {"checks": [{"key": d["key"], "supported_note_indexes": [0], "status_justified": False,
                                "comment": "red not supported"} for d in data]}
        return None


class AIMode(unittest.TestCase):
    def test_ai_merge_and_fact_check(self):
        from company.agents.base import Context
        from company.agents.registry import collect, research
        with tempfile.TemporaryDirectory() as d:
            db = DB(os.path.join(d, "a.db"))
            ctx = Context(run_id="ai", mode="demo", demo=True, db=db, ai=FakeAI(), synth=P.Synthetic(seed=5, years=2))
            collect(ctx)
            research(ctx)
            A = ctx.shared["assessments"]
            self.assertTrue(all(a["method"] == "ai" for a in A.values()))
            for a in A.values():   # invented url must always be dropped by the mechanical check
                self.assertFalse(any(n["url"] == "https://fake.example" for n in a["notes"]))
            big = [a for a in A.values() if a["item"]["value_eur"] >= 1000]
            self.assertTrue(big and all(a["status"] == "amber" and a.get("verified") for a in big))
            small = [a for a in A.values() if 0 < a["item"]["value_eur"] < 1000]
            self.assertTrue(all(a["status"] == "red" for a in small))


class EToroDemoOrders(unittest.TestCase):
    def test_open_close_use_demo_paths_and_bodies(self):
        from company.brokers.paper import EToroDemo
        import company.data.providers as prov
        calls = []

        def fake_http(url, source, method="GET", headers=None, body=None, **kw):
            calls.append((method, url, body, headers))
            if "search" in url:
                return json.dumps({"items": [{"instrumentId": 1001}]})
            if "market-open-orders" in url:
                return json.dumps({"orderForOpen": {"positionID": 555}})
            return json.dumps({"ok": True})
        with tempfile.TemporaryDirectory() as d, mock.patch.object(prov, "http", fake_http), \
                mock.patch.object(prov, "http_json", lambda u, s, **k: json.loads(fake_http(u, s, **k))):
            conf = json.load(open(os.path.join(base.CONFIG, "etoro.json")))
            b = EToroDemo(DB(os.path.join(d, "e.db")), {"ETORO_API_KEY": "a", "ETORO_USER_KEY": "u"}, conf)
            pid, raw = b.open("AAPL", "AAPL", 100)
            self.assertEqual(pid, 555)
            b.close("AAPL", 555)
        posts = [c for c in calls if c[0] == "POST"]
        self.assertEqual(posts[0][2], {"InstrumentID": 1001, "IsBuy": True, "Leverage": 1, "Amount": 100})
        self.assertIn("/trading/execution/demo/market-open-orders/by-amount", posts[0][1])
        self.assertIn("/trading/execution/demo/market-close-orders/positions/555", posts[1][1])
        self.assertTrue(all(c[3]["x-api-key"] == "a" and c[3]["x-request-id"] for c in calls))


class Safety(unittest.TestCase):
    def test_kill_switch_blocks_trading(self):
        from company.agents.base import Context
        from company.agents.risk_exec import PaperTrader
        ks = os.path.join(base.ROOT, "STOP_TRADING.txt")
        existed = os.path.exists(ks)
        open(ks, "a").close()
        try:
            with tempfile.TemporaryDirectory() as d:
                ctx = Context(run_id="k", mode="day", demo=True, db=DB(os.path.join(d, "k.db")), ai=None)
                status, msg = PaperTrader().run(ctx)
            self.assertEqual(status, "skip")
            self.assertIn("KILL SWITCH", msg)
        finally:
            if not existed:
                os.remove(ks)

    def test_stale_data_blocks_trading(self):
        from company.agents.base import Context
        from company.agents.risk_exec import PaperTrader
        with tempfile.TemporaryDirectory() as d:
            db = DB(os.path.join(d, "s.db"))
            db.x("INSERT INTO prices VALUES('SPY','2020-01-02',1,1,1,1,'t')")
            ctx = Context(run_id="s", mode="day", demo=True, db=db, ai=None)
            ctx.shared["risk"] = {"allowed_strategies": ["trend_sma"], "size_factor": 1}
            with mock.patch("company.quant.engine.build_matrix", return_value=(["2020-01-02"], ["SPY"], [[1.0]])):
                status, msg = PaperTrader().run(ctx)
        self.assertEqual(status, "skip")
        self.assertIn("stale", msg)


class EndToEnd(unittest.TestCase):
    def test_demo_pipeline(self):
        """Whole company on synthetic data: every agent must finish, dashboard must exist."""
        from company.agents.base import Context
        from company.agents.registry import run_pipeline
        from company.core.ai import AI
        with tempfile.TemporaryDirectory() as d, mock.patch.object(base, "REPORTS", d):
            import company.agents.reporter as rep
            with mock.patch.object(rep, "REPORTS", d):
                db = DB(os.path.join(d, "demo.db"))
                ctx = Context(run_id="test", mode="demo", demo=True, db=db, ai=AI(demo=True),
                              synth=P.Synthetic(seed=3, years=3))
                path = run_pipeline(ctx)
                self.assertTrue(os.path.exists(path))
                runs = {r["agent"]: r["status"] for r in db.q("SELECT agent, status FROM agent_runs")}
                self.assertEqual(len(runs), 20, sorted(runs))
                self.assertNotIn("fail", runs.values(), runs)
                html = open(path, encoding="utf-8").read()
                for section in ("What needs your attention", "Quant lab", "Company board", "Paper trading"):
                    self.assertIn(section, html)


if __name__ == "__main__":
    unittest.main()
