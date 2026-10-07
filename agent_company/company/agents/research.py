"""Research desk: agents 7-14 and the Fact Checker (18)."""
import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import date

from company.agents.base import Agent
from company.data import providers as P

DESKS = {
    "asia": ("Asia & FX Analyst", ["taiwan", "singapore", "poland", "asia", "japan", "china", "india", "korea"]),
    "energy": ("Energy & Industrials Analyst", ["energy", "construction", "defence", "industrial", "aerospace", "oil"]),
    "semis": ("Semiconductors & AI Analyst", ["semiconductor", "ai", "big tech", "cloud", "cyber", "quantum", "ev"]),
    "us": ("US Indices & ETF Analyst", ["us index", "us tech", "momentum", "space", "it services", "software", "banks", "benchmark", "consumer", "healthcare", "insurance"]),
    "commod": ("Commodities & Crypto Analyst", ["gold", "precious", "metal", "crypto", "copper", "silver"]),
}

NOTE_SCHEMA = {
    "type": "object",
    "properties": {"items": {"type": "array", "items": {
        "type": "object",
        "properties": {
            "key": {"type": "string"},
            "status": {"type": "string", "enum": ["red", "amber", "green"]},
            "summary": {"type": "string"},
            "notes": {"type": "array", "items": {"type": "object", "properties": {
                "time": {"type": "string"}, "text": {"type": "string"}, "url": {"type": "string"}},
                "required": ["time", "text", "url"], "additionalProperties": False}},
            "watch_next": {"type": "array", "items": {"type": "string"}}},
        "required": ["key", "status", "summary", "notes", "watch_next"], "additionalProperties": False}}},
    "required": ["items"], "additionalProperties": False}


def desk_of(segment):
    """Whole-word match, first desk wins (Asia first so 'AI / Japan' is Asia, 'Taiwan' is not 'AI')."""
    seg = (segment or "").lower()
    words_in = re.findall(r"[a-z]+", seg)
    for k, (_, words) in DESKS.items():
        if any((w in seg) if " " in w else any(x.startswith(w) for x in words_in) for w in words):
            return k
    return "us"


def price_facts(db, sym):
    ser = db.series(sym)
    if len(ser) < 30:
        return {}
    c = [v for _, v in ser]

    def ch(n):
        return round((c[-1] / c[-1 - n] - 1) * 100, 1) if len(c) > n else None
    hi = max(c[-252:])
    m200 = sum(c[-200:]) / min(200, len(c))
    return {"last": round(c[-1], 4), "as_of": ser[-1][0], "d1": ch(1), "d5": ch(5), "m1": ch(21), "m3": ch(63),
            "from_52w_high_pct": round((c[-1] / hi - 1) * 100, 1), "above_200d": c[-1] > m200}


def tone(title, settings):
    t = f" {title.lower()} "
    r = sum(1 for w in settings["risk_words"] if f" {w} " in t or f" {w}," in t)
    g = sum(1 for w in settings["good_words"] if f" {w} " in t or f" {w}," in t)
    return "risk" if r > g else "good" if g else "neutral"


def gather_items(ctx):
    """Positions (with € value) + radar names, each with a stable key."""
    items = []
    for h in ctx.portfolio.get("holdings", []):
        items.append({"key": h["isin"], "name": h["name"], "symbol": h.get("underlying"), "kind": h.get("kind"),
                      "value_eur": h.get("value_eur", 0), "strike": h.get("strike"), "leverage": h.get("leverage"),
                      "direction": h.get("direction", "long"), "segment": h.get("segment"), "query": h.get("query") or h["name"],
                      "group": "portfolio"})
    for w in ctx.portfolio.get("watchlist", []):
        items.append({"key": "radar:" + w["underlying"], "name": w["name"], "symbol": w["underlying"], "kind": "radar",
                      "value_eur": 0, "segment": w["segment"], "query": w["query"], "group": "radar", "why": w.get("why")})
    return items


class SocialSentiment(Agent):
    id, name, title, dept = 12, "social_sentiment", "Social Sentiment Analyst", "Research"
    job = "Reddit + StockTwits crowd mood for positions ≥ deep threshold (X has no free API)."

    def run(self, ctx):
        out = {}
        deep = [i for i in gather_items(ctx) if i["value_eur"] >= ctx.settings["deep_threshold_eur"]]

        def one(i):
            if ctx.demo:
                return i["key"], {"reddit": [{"title": f"Thoughts on {i['name']}?", "score": 42, "sub": "stocks",
                                              "url": "https://example.com/demo", "time": None}],
                                  "stocktwits": {"bull": 7, "bear": 5, "n": 12}}
            r = {}
            try:
                r["reddit"] = P.reddit(i["query"], 6)
            except Exception:
                r["reddit"] = []
            sym = (i["symbol"] or "").split(".")[0]
            try:
                r["stocktwits"] = P.stocktwits(sym) if sym and "=" not in sym and "^" not in sym else None
            except Exception:
                r["stocktwits"] = None
            return i["key"], r
        with ThreadPoolExecutor(4) as ex:
            for k, r in ex.map(one, deep):
                out[k] = r
        ctx.shared["social"] = out
        ctx.db.memo(ctx.run_id, self.name, "social", out)
        n = sum(1 for v in out.values() if v.get("reddit") or v.get("stocktwits"))
        return ("ok" if n else "warn"), f"crowd mood for {n}/{len(deep)} deep positions"


class PredictionMarkets(Agent):
    id, name, title, dept = 13, "prediction_markets", "Prediction Markets Analyst", "Research"
    job = "Polymarket odds on Fed, recession, tariffs, Taiwan, IPOs — what the betting crowd expects."
    QUERIES = ["Fed rate cut", "recession", "tariffs", "Taiwan", "China", "Nvidia", "gold", "SpaceX IPO", "ECB"]

    def run(self, ctx):
        out, seen = [], set()
        for q in self.QUERIES:
            try:
                rows = [{"question": f"Will {q} happen by year end? (DEMO)", "odds": {"Yes": 40 + len(q), "No": 60 - len(q)},
                         "url": "https://example.com/demo"}] if ctx.demo else P.polymarket(q, 3)
            except Exception:
                rows = []
            for r in rows:
                if r["question"] not in seen:
                    seen.add(r["question"])
                    out.append(r)
        ctx.shared["polymarket"] = out
        ctx.db.memo(ctx.run_id, self.name, "polymarket", out)
        return ("ok" if out else "warn"), f"{len(out)} live markets tracked"


class SectorAnalyst(Agent):
    dept, uses_ai = "Research", True

    def __init__(self, desk, aid):
        self.desk, self.id = desk, aid
        self.title = DESKS[desk][0]
        self.name = f"analyst_{desk}"
        self.job = f"Covers {', '.join(DESKS[desk][1][:6])}: news, management, sales, sector trend, with timestamps + sources."

    def run(self, ctx):
        mine = [i for i in gather_items(ctx) if desk_of(i["segment"]) == self.desk]
        if not mine:
            return "skip", "no positions in this desk"
        packs = []
        for i in mine:
            deep = i["value_eur"] >= ctx.settings["deep_threshold_eur"]
            try:
                news = ctx.synth.news(i["query"], 6) if ctx.demo else P.google_news(i["query"], ctx.settings["news_days"], 10 if deep else 5)
            except Exception:
                news = []
            for n in news:
                n["tone"] = tone(n["title"], ctx.settings)
                ctx.db.x("INSERT OR IGNORE INTO news VALUES(?,?,?,?,?,?,?)",
                         (i["key"], n["time"], n["title"], n["url"], n["source"], n["tone"], ctx.run_id))
            facts = price_facts(ctx.db, i["symbol"]) if i["symbol"] else {}
            if i.get("strike") and facts.get("last"):
                facts["ko_distance_pct"] = round((facts["last"] - i["strike"]) / facts["last"] * 100, 1)
            packs.append({"item": i, "facts": facts, "news": news, "deep": deep,
                          "social": ctx.shared.get("social", {}).get(i["key"])})
        ai = ctx.ai.json(self.name, SYSTEM_ANALYST, self._prompt(packs), NOTE_SCHEMA) if ctx.ai.on else None
        results = {}
        if ai:
            for it in ai.get("items", []):
                results[it["key"]] = dict(it, method="ai")
        for p in packs:                      # rule-based for anything the AI didn't cover
            k = p["item"]["key"]
            if k not in results:
                results[k] = dict(rule_assess(p, ctx), method="rules")
            results[k]["facts"] = p["facts"]
            results[k]["news"] = p["news"][:8]
            results[k]["item"] = p["item"]
            results[k]["social"] = p["social"]
        for k, r in results.items():
            ctx.db.memo(ctx.run_id, self.name, "assessment", r, symbol=k, status=r["status"])
        ctx.shared.setdefault("assessments", {}).update(results)
        reds = sum(1 for r in results.values() if r["status"] == "red")
        how = "AI" if ai else "rules"
        return "ok", f"{len(results)} names assessed ({how}); {reds} red"

    def _prompt(self, packs):
        slim = [{"key": p["item"]["key"], "name": p["item"]["name"], "kind": p["item"]["kind"],
                 "value_eur": p["item"]["value_eur"], "leverage": p["item"].get("leverage"),
                 "strike": p["item"].get("strike"), "facts": p["facts"],
                 "headlines": [{"time": n["time"], "title": n["title"], "url": n["url"], "source": n["source"]} for n in p["news"]],
                 "crowd": p["social"]} for p in packs]
        return ("Assess each position below for its owner (a retail investor holding leveraged products).\n"
                "Use ONLY the headlines and facts given; every note must copy a headline's time and url exactly. "
                "No url -> no note. 'red' = needs attention now (near knock-out, heavy leveraged loss, serious negative news); "
                "'amber' = watch (earnings soon, notable move, mixed news); 'green' = nothing material. "
                "summary: one plain-English sentence. watch_next: up to 3 concrete things to watch this week.\n\n"
                + json.dumps(slim, default=str))


SYSTEM_ANALYST = ("You are a careful equity research analyst on a small team. You never invent facts, prices, or dates; "
                  "you only use the supplied data and say when information is missing. You write short, plain sentences.")


def rule_assess(p, ctx):
    f, i = p["facts"], p["item"]
    red, amber = [], []
    lev = i.get("leverage") or 1
    kd = f.get("ko_distance_pct")
    if kd is not None:
        if kd < 0:
            red.append("underlying below knock-out level — likely knocked out")
        elif kd < ctx.risk["portfolio"]["min_turbo_knockout_distance_pct"] * 0.8:
            red.append(f"only {kd}% above knock-out")
        elif kd < ctx.risk["portfolio"]["min_turbo_knockout_distance_pct"] * 1.5:
            amber.append(f"{kd}% above knock-out")
        if kd > 0:
            lev = f["last"] / (f["last"] * kd / 100)
    if f.get("d5") is not None and f["d5"] * lev <= -20:
        red.append(f"≈{f['d5'] * lev:.0f}% leveraged loss over 5 days")
    elif f.get("d1") is not None and abs(f["d1"] * lev) >= 7:
        amber.append(f"≈{f['d1'] * lev:+.0f}% leveraged move yesterday")
    risk_n = sum(1 for n in p["news"] if n.get("tone") == "risk")
    good_n = sum(1 for n in p["news"] if n.get("tone") == "good")
    if risk_n >= 3 and risk_n > good_n + 1:
        red.append(f"{risk_n} negative headlines this week")
    elif risk_n >= 2 and risk_n > good_n:
        amber.append(f"{risk_n} negative headlines")
    st = (p.get("social") or {}).get("stocktwits") or {}
    if st.get("bull", 0) + st.get("bear", 0) >= 8 and st["bear"] > st["bull"] * 1.5:
        amber.append(f"crowd bearish ({st['bear']} vs {st['bull']})")
    notes = [{"time": n["time"], "text": n["title"], "url": n["url"]} for n in p["news"] if n.get("tone") != "neutral"][:4]
    status = "red" if red else "amber" if amber else "green"
    summary = "; ".join(red + amber) or "No warning signal in price, news or crowd mood."
    return {"key": i["key"], "status": status, "summary": summary[0].upper() + summary[1:], "notes": notes, "watch_next": []}


MACRO_SCHEMA = {"type": "object", "properties": {
    "regime": {"type": "string", "enum": ["risk-on", "neutral", "risk-off"]},
    "summary": {"type": "string"},
    "themes": {"type": "array", "items": {"type": "object", "properties": {
        "title": {"type": "string"}, "impact": {"type": "string"}, "affected": {"type": "array", "items": {"type": "string"}},
        "time": {"type": "string"}, "url": {"type": "string"}},
        "required": ["title", "impact", "affected", "time", "url"], "additionalProperties": False}},
    "this_week": {"type": "array", "items": {"type": "string"}}},
    "required": ["regime", "summary", "themes", "this_week"], "additionalProperties": False}


class MacroEconomist(Agent):
    id, name, title, dept, uses_ai = 14, "macro_economist", "Macro & Politics Economist", "Research", True
    job = "Fed/ECB/BoJ, US politics & tariffs, China–Taiwan, Korea, Japan, Indonesia → impact on your positions."
    QUERIES = ["Federal Reserve", "ECB interest rates", "US tariffs", "Taiwan China", "Bank of Japan", "South Korea economy",
               "Indonesia economy", "US inflation CPI jobs report"]

    def run(self, ctx):
        news = {}
        for q in self.QUERIES:
            try:
                news[q] = ctx.synth.news(q, 4) if ctx.demo else P.google_news(q, 4, 5)
            except Exception:
                news[q] = []
        tiles = {m["name"]: price_facts(ctx.db, m["symbol"]) for m in ctx.universe["macro"]}
        tiles.update({p["name"]: price_facts(ctx.db, p["symbol"]) for p in ctx.universe["fx"]})
        spy = price_facts(ctx.db, "SPY")
        vix = (tiles.get("VIX fear index") or {}).get("last")
        rule_regime = "risk-off" if (vix and vix > 25) or (spy and not spy.get("above_200d")) else \
            "risk-on" if (vix and vix < 16 and spy.get("above_200d")) else "neutral"
        out = None
        if ctx.ai.on:
            out = ctx.ai.json(self.name, SYSTEM_ANALYST,
                              "Write the macro briefing for a retail investor whose positions are: "
                              + ", ".join(h["name"] for h in ctx.portfolio.get("holdings", []))
                              + ".\nUse only these headlines (copy time+url exactly) and market tiles:\n"
                              + json.dumps({"headlines": news, "tiles": tiles, "polymarket": ctx.shared.get("polymarket", [])[:10]}, default=str),
                              MACRO_SCHEMA)
        if not out:
            themes = []
            for q, items in news.items():
                for n in items[:1]:
                    themes.append({"title": n["title"], "impact": q, "affected": [], "time": n["time"], "url": n["url"]})
            out = {"regime": rule_regime, "summary": f"Market regime by rules: {rule_regime} (VIX {vix}, S&P above 200-day: {spy.get('above_200d') if spy else '?'}).",
                   "themes": themes, "this_week": []}
            out["method"] = "rules"
        else:
            out["method"] = "ai"
        out["tiles"] = tiles
        out["news"] = news
        ctx.shared["macro"] = out
        ctx.db.memo(ctx.run_id, self.name, "macro", out, status=out["regime"])
        return "ok", f"regime {out['regime']} ({out['method']}), {len(out['themes'])} themes"


VERIFY_SCHEMA = {"type": "object", "properties": {"checks": {"type": "array", "items": {"type": "object", "properties": {
    "key": {"type": "string"}, "supported_note_indexes": {"type": "array", "items": {"type": "integer"}},
    "status_justified": {"type": "boolean"}, "comment": {"type": "string"}},
    "required": ["key", "supported_note_indexes", "status_justified", "comment"], "additionalProperties": False}}},
    "required": ["checks"], "additionalProperties": False}


class FactChecker(Agent):
    id, name, title, dept, uses_ai = 18, "fact_checker", "Fact Checker", "Risk & Compliance", True
    job = "Re-checks claims for positions ≥ €1,000 against sources. No source → claim dropped; unsupported red → amber."

    def run(self, ctx):
        A = ctx.shared.get("assessments", {})
        dropped = downgraded = 0
        for k, r in A.items():                       # 1) mechanical: every note needs a url we actually fetched
            urls = {n["url"] for n in r.get("news", [])}
            keep = [n for n in r.get("notes", []) if n.get("url") in urls]
            dropped += len(r.get("notes", [])) - len(keep)
            r["notes"] = keep
        deep = {k: r for k, r in A.items() if r["item"]["value_eur"] >= ctx.settings["deep_threshold_eur"]}
        if ctx.ai.on and deep:                       # 2) independent second opinion on the big positions
            payload = [{"key": k, "status": r["status"], "summary": r["summary"],
                        "notes": [dict(n, index=j) for j, n in enumerate(r["notes"])],
                        "facts": r["facts"], "sources": [{"title": n["title"], "url": n["url"], "time": n["time"]} for n in r["news"]]}
                       for k, r in deep.items()]
            res = ctx.ai.json(self.name, "You are a strict fact checker. A note is supported only if a listed source says it.",
                              "For each position: which notes are supported by the sources, and is the status justified by facts+sources?\n"
                              + json.dumps(payload, default=str), VERIFY_SCHEMA)
            for c in (res or {}).get("checks", []):
                r = A.get(c["key"])
                if not r:
                    continue
                before = len(r["notes"])
                r["notes"] = [n for j, n in enumerate(r["notes"]) if j in set(c["supported_note_indexes"])]
                dropped += before - len(r["notes"])
                r["fact_check"] = c["comment"]
                if not c["status_justified"] and r["status"] == "red":
                    r["status"] = "amber"
                    downgraded += 1
        for k, r in deep.items():
            r["verified"] = True
        ctx.db.memo(ctx.run_id, self.name, "fact_check", {"dropped": dropped, "downgraded": downgraded})
        return "ok", f"{len(deep)} big positions double-checked; {dropped} unsupported notes dropped; {downgraded} reds downgraded"
