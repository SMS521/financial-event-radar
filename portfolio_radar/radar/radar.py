"""Portfolio Radar — one run = one dashboard.

  python radar.py              live run: fetch everything now, build dashboard, open it
  python radar.py --cloud      open the newest report prepared by the nightly cloud run
  python radar.py --sitecheck  only test which finance sites this PC can reach
  python radar.py --no-open    build without opening a browser (used by the cloud run)
"""
import json
import os
import sys
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import sources as S  # noqa: E402
from render import render  # noqa: E402

CFG = os.path.join(ROOT, "config")
REPORTS = os.path.join(ROOT, "reports")


def load(name, default=None):
    p = os.path.join(CFG, name) if not os.path.isabs(name) else name
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def pct(a, b):
    return None if not a or not b else (a / b - 1) * 100


def changes(series):
    closes = [c for _, c in series]
    if len(closes) < 2:
        return {}
    last = closes[-1]

    def back(n):
        return pct(last, closes[-1 - n]) if len(closes) > n else None
    return {"d1": back(1), "d5": back(5), "m1": back(21), "m3": pct(last, closes[0])}


def tone(items, settings):
    risk, good = settings["risk_words"], settings["good_words"]
    flagged = []
    score = 0
    for it in items:
        t = " " + (it.get("title") or "").lower() + " "
        r = [w for w in risk if f" {w} " in t or f" {w}," in t or f" {w}:" in t]
        g = [w for w in good if f" {w} " in t or f" {w}," in t or f" {w}:" in t]
        it["tone"] = "risk" if len(r) > len(g) else "good" if g else "neutral"
        score += len(g) - len(r)
        if it["tone"] != "neutral":
            flagged.append(it)
    return score, flagged


def dedupe(items):
    seen, out = set(), []
    for it in items:
        k = (it.get("title") or "")[:70].lower()
        if k and k not in seen:
            seen.add(k)
            out.append(it)
    return sorted(out, key=lambda x: x.get("time") or "", reverse=True)


def analyse(h, settings, prices, today):
    """Status + reasons for one position. Several independent signals
    (price action, knock-out distance, news tone, social mood, calendar)
    each vote; the dashboard shows every reason so nothing is hidden."""
    deep = (h.get("value_eur") or 0) >= settings["deep_threshold_eur"]
    tk = h.get("underlying")
    q = h.get("query") or h["name"]
    px = prices.get(tk) if tk else None
    r = {"h": h, "deep": deep, "px": px, "reasons": [], "status": "green"}

    lev = h.get("leverage") or 1
    ch = changes(px["series"]) if px else {}
    r["chg"] = ch
    if px and h.get("kind") == "turbo" and h.get("strike"):
        p, k = px["price"], h["strike"]
        dist = (p - k) / p * 100 if h.get("direction", "long") == "long" else (k - p) / p * 100
        r["ko_dist"] = dist
        lev = p / (p - k) if dist > 0 else None   # knocked out: leverage meaningless
    r["lev"] = lev
    lev = lev or 1
    if ch.get("d1") is not None and r.get("ko_dist", 1) > 0:
        r["pos_d1"] = ch["d1"] * lev

    news = S.google_news(q, days=settings["news_days"], limit=14 if deep else 8)
    if tk and not tk.startswith("^") and "=" not in tk:
        news += S.yahoo_news(tk, limit=8 if deep else 4)
    news = dedupe(news)
    score, flagged = tone(news, settings)
    r["news"], r["news_score"] = news, score
    r["social"] = {
        "reddit": S.reddit(q, limit=8) if deep else [],
        "stocktwits": S.stocktwits(tk) if (tk and deep and "=" not in tk and not tk.startswith("^")) else None,
        "x": S.x_posts(q, settings.get("x_nitter_instances", []), limit=4) if deep else [],
    }
    ed = S.nasdaq_earnings_date(tk) if tk else None
    r["earnings"] = ed

    # ---- voting
    red, amber = [], []
    kd = r.get("ko_dist")
    if kd is not None:
        if kd < 0:
            red.append(f"Underlying is BELOW the knock-out level — this turbo has probably been knocked out")
        elif kd < 8:
            red.append(f"Only {kd:.1f}% above knock-out — a normal bad day can wipe this position")
        elif kd < 15:
            amber.append(f"{kd:.1f}% above knock-out — keep a stop or reduce size")
    if r.get("pos_d1") is not None:
        if r["pos_d1"] <= -15:
            red.append(f"Position moved about {r['pos_d1']:+.0f}% in one day (underlying {ch['d1']:+.1f}% × leverage {lev:.1f})")
        elif abs(r["pos_d1"]) >= 7:
            amber.append(f"Big move: about {r['pos_d1']:+.0f}% on the position yesterday")
    if ch.get("d5") is not None and ch["d5"] * lev <= -20:
        red.append(f"Down about {ch['d5'] * lev:.0f}% (leveraged) over 5 days")
    risk_n = sum(1 for x in flagged if x["tone"] == "risk")
    if risk_n >= 4 and score <= -3:
        red.append(f"{risk_n} negative headlines this week")
    elif risk_n >= 2 and score < 0:
        amber.append(f"{risk_n} negative headlines this week")
    if ed:
        days = (date.fromisoformat(ed) - today).days
        r["earnings_in"] = days
        if 0 <= days <= 7:
            amber.append(f"Earnings in {days} day(s) ({ed}) — expect a big move either way" +
                         (" — leverage multiplies it" if lev > 1.5 else ""))
    st = r["social"]["stocktwits"]
    if st and st["bull"] + st["bear"] >= 8:
        bear_share = st["bear"] / (st["bull"] + st["bear"])
        if bear_share >= 0.6:
            amber.append(f"StockTwits crowd turning bearish ({st['bear']} bear vs {st['bull']} bull)")
    if h.get("kind") == "factor" and lev >= 5:
        r.setdefault("info", []).append(f"{lev}x daily factor: sideways markets slowly eat the value (volatility decay)")
    if not px and tk:
        amber.append("No live price reached — check source status at the bottom")

    r["reasons"] = red + amber
    r["status"] = "red" if red else "amber" if amber else "green"
    if r["status"] == "green":
        r["reasons"] = ["No warning signals found in price, news, social or calendar"]
    return r


def run_live(open_browser=True):
    settings = load("settings.json")
    pf = load("portfolio.json")
    reach = load("reachable.json", {})
    S.BLOCKED_HOSTS.update(reach.get("blocked_hosts", []))
    now = datetime.now(timezone.utc)
    today = now.date()

    tickers = {h["underlying"] for h in pf["holdings"] if h.get("underlying")}
    tickers |= {w["underlying"] for w in pf["watchlist"]}
    tickers |= {m["underlying"] for m in pf["macro"]}
    with ThreadPoolExecutor(10) as ex:
        prices = dict(zip(tickers, ex.map(lambda t: S.yahoo_chart(t), tickers)))

    with ThreadPoolExecutor(6) as ex:
        results = list(ex.map(lambda h: analyse(h, settings, prices, today), pf["holdings"]))

    def watch(w):
        px = prices.get(w["underlying"])
        news = dedupe(S.google_news(w["query"], days=7, limit=6))
        score, _ = tone(news, settings)
        return {"w": w, "px": px, "chg": changes(px["series"]) if px else {},
                "earnings": S.nasdaq_earnings_date(w["underlying"]),
                "news": news[:3], "news_score": score}
    with ThreadPoolExecutor(6) as ex:
        watch_rows = list(ex.map(watch, pf["watchlist"]))
        macro_news = list(ex.map(lambda q: (q, dedupe(S.google_news(q, days=3, limit=4))), pf["macro_queries"]))
        poly = list(ex.map(lambda q: S.polymarket(q, limit=3),
                           ["Fed rate", "recession", "tariffs", "Taiwan", "Nvidia", "gold", "SpaceX IPO"]))
    poly_flat, seen = [], set()
    for lst in poly:
        for m in lst:
            if m["question"] not in seen:
                seen.add(m["question"])
                poly_flat.append(m)

    cloud = load(os.path.join(REPORTS, "cloud_notes.json"), None)
    data = {
        "generated": now.isoformat(timespec="minutes"),
        "mode": "live (this PC)",
        "results": results, "watch": watch_rows,
        "macro": [{"m": m, "px": prices.get(m["underlying"]),
                   "chg": changes(prices[m["underlying"]]["series"]) if prices.get(m["underlying"]) else {}}
                  for m in pf["macro"]],
        "macro_news": macro_news, "polymarket": poly_flat[:12],
        "etf_holdings": pf.get("etf_top_holdings", {}), "prices": prices,
        "sources": S.SOURCE_LOG, "reach": reach, "cloud": cloud,
    }
    os.makedirs(REPORTS, exist_ok=True)
    html = render(data)
    out = os.path.join(REPORTS, "dashboard.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    stamp = now.strftime("%Y-%m-%d_%H%M")
    with open(os.path.join(REPORTS, f"dashboard_{stamp}.html"), "w", encoding="utf-8") as f:
        f.write(html)
    summary = {"generated": data["generated"],
               "status": {r["h"]["isin"]: {"name": r["h"]["name"], "status": r["status"],
                                           "reasons": r["reasons"]} for r in results},
               "sources": S.SOURCE_LOG}
    with open(os.path.join(REPORTS, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=1)
    print("Dashboard:", out)
    if open_browser:
        webbrowser.open("file:///" + out.replace("\\", "/"))
    return out


def run_cloud():
    settings = load("settings.json")
    url = settings.get("cloud_report_url")
    out = os.path.join(REPORTS, "cloud_dashboard.html")
    if url:
        try:
            with open(out, "wb") as f:
                f.write(S.fetch(url, timeout=30))
        except Exception as e:
            print("Could not download cloud report:", e)
    if not os.path.exists(out):
        # newest email attachment saved to Downloads
        import glob
        dl = glob.glob(os.path.join(os.path.expanduser("~"), "Downloads", "*dashboard*.html"))
        if dl:
            out = max(dl, key=os.path.getmtime)
    if not os.path.exists(out):
        out = os.path.join(REPORTS, "dashboard.html")
    if not os.path.exists(out):
        print("No report yet. Open the attachment of your 7:30 email, or run the live radar.")
        return
    webbrowser.open("file:///" + out.replace("\\", "/"))


def run_sitecheck():
    sites = load("sites.json")
    res = S.site_check(sites)
    import urllib.parse
    blocked = sorted({urllib.parse.urlparse(r["url"]).hostname for r in res if not r["ok"]})
    out = {"checked": datetime.now(timezone.utc).isoformat(timespec="minutes"),
           "results": res, "blocked_hosts": blocked}
    with open(os.path.join(CFG, "reachable.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
    ok = sum(r["ok"] for r in res)
    print(f"Site check: {ok}/{len(res)} reachable")
    return out


if __name__ == "__main__":
    a = sys.argv[1:]
    if "--sitecheck" in a:
        run_sitecheck()
    elif "--cloud" in a:
        run_cloud()
    else:
        if "--skip-sitecheck" not in a:
            run_sitecheck()   # re-test every run: networks change (office vs home)
        run_live(open_browser="--no-open" not in a)
