"""Free data sources. Standard library only (runs on portable Python).

Every function returns plain dicts and never raises: a blocked or broken
source yields an empty result plus an entry in SOURCE_LOG so the dashboard
can show which sources worked on this PC.
"""
import json
import re
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
SOURCE_LOG = {}          # source name -> {"ok": int, "fail": int, "last_error": str}
_LOG_LOCK = threading.Lock()
BLOCKED_HOSTS = set()    # filled from config/reachable.json by the site check


def _log(source, ok, err=""):
    with _LOG_LOCK:
        s = SOURCE_LOG.setdefault(source, {"ok": 0, "fail": 0, "last_error": ""})
        if ok:
            s["ok"] += 1
        else:
            s["fail"] += 1
            s["last_error"] = str(err)[:160]


def fetch(url, timeout=12, headers=None):
    host = urllib.parse.urlparse(url).hostname or ""
    if host in BLOCKED_HOSTS:
        raise OSError(f"{host} blocked on this network (site check)")
    h = {"User-Agent": UA, "Accept": "*/*"}
    h.update(headers or {})
    req = urllib.request.Request(url, headers=h)
    # urllib picks up the Windows/corporate proxy automatically.
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_json(url, **kw):
    return json.loads(fetch(url, **kw).decode("utf-8", "replace"))


def _iso(ts):
    return datetime.fromtimestamp(ts, timezone.utc).isoformat(timespec="minutes")


# ---------------------------------------------------------------- prices
def yahoo_chart(ticker, rng="3mo", interval="1d"):
    """Daily closes from Yahoo's public chart endpoint."""
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/"
           f"{urllib.parse.quote(ticker)}?range={rng}&interval={interval}")
    try:
        d = fetch_json(url)["chart"]["result"][0]
        closes = d["indicators"]["quote"][0]["close"]
        pts = [(t, c) for t, c in zip(d.get("timestamp", []), closes) if c is not None]
        meta = d["meta"]
        _log("Yahoo Finance prices", True)
        return {
            "ticker": ticker,
            "price": meta.get("regularMarketPrice") or (pts[-1][1] if pts else None),
            "prev_close": meta.get("chartPreviousClose"),
            "currency": meta.get("currency"),
            "as_of": _iso(meta["regularMarketTime"]) if meta.get("regularMarketTime") else None,
            "series": pts,
        }
    except Exception as e:
        _log("Yahoo Finance prices", False, e)
        return None


# ---------------------------------------------------------------- news
def _rss_items(xml_bytes, source_label, limit):
    out = []
    root = ET.fromstring(xml_bytes)
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        pub = it.findtext("pubDate")
        src = it.find("source")
        try:
            when = parsedate_to_datetime(pub).astimezone(timezone.utc).isoformat(timespec="minutes")
        except Exception:
            when = None
        out.append({"title": title, "url": link, "time": when,
                    "source": (src.text if src is not None else source_label)})
        if len(out) >= limit:
            break
    return out


def google_news(query, days=7, limit=12, lang="en-US", country="US"):
    q = urllib.parse.quote(f"{query} when:{days}d")
    url = f"https://news.google.com/rss/search?q={q}&hl={lang}&gl={country}&ceid={country}:{lang.split('-')[0]}"
    try:
        items = _rss_items(fetch(url), "Google News", limit)
        _log("Google News", True)
        return items
    except Exception as e:
        _log("Google News", False, e)
        return []


def yahoo_news(ticker, limit=8):
    url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={urllib.parse.quote(ticker)}&region=US&lang=en-US"
    try:
        items = _rss_items(fetch(url), "Yahoo Finance", limit)
        _log("Yahoo Finance news", True)
        return items
    except Exception as e:
        _log("Yahoo Finance news", False, e)
        return []


# ---------------------------------------------------------------- social
def reddit(query, limit=10):
    url = ("https://www.reddit.com/search.json?" + urllib.parse.urlencode(
        {"q": query, "sort": "new", "t": "week", "limit": limit}))
    try:
        d = fetch_json(url, headers={"User-Agent": "portfolio-radar/1.0 (personal use)"})
        out = []
        for c in d["data"]["children"]:
            p = c["data"]
            out.append({"title": p.get("title", ""), "sub": p.get("subreddit"),
                        "score": p.get("score", 0), "comments": p.get("num_comments", 0),
                        "time": _iso(p["created_utc"]),
                        "url": "https://www.reddit.com" + p.get("permalink", "")})
        _log("Reddit", True)
        return out
    except Exception as e:
        _log("Reddit", False, e)
        return []


def stocktwits(symbol):
    """Free public stream; messages self-tagged Bullish/Bearish by users."""
    sym = symbol.split(".")[0].replace("^", "")
    url = f"https://api.stocktwits.com/api/2/streams/symbol/{urllib.parse.quote(sym)}.json"
    try:
        d = fetch_json(url)
        bull = bear = 0
        msgs = []
        for m in d.get("messages", []):
            s = ((m.get("entities") or {}).get("sentiment") or {}).get("basic")
            bull += s == "Bullish"
            bear += s == "Bearish"
            if len(msgs) < 4:
                msgs.append({"text": m.get("body", "")[:180], "time": m.get("created_at"), "sentiment": s})
        _log("StockTwits", True)
        return {"bull": bull, "bear": bear, "n": len(d.get("messages", [])), "messages": msgs}
    except Exception as e:
        _log("StockTwits", False, e)
        return None


def x_posts(query, instances, limit=6):
    """X/Twitter has no free API. Best effort via public Nitter RSS mirrors;
    these come and go, so failure here is expected and harmless."""
    for inst in instances:
        url = f"{inst.rstrip('/')}/search/rss?f=tweets&q={urllib.parse.quote(query)}"
        try:
            items = _rss_items(fetch(url, timeout=8), "X", limit)
            if items:
                _log("X (via Nitter)", True)
                return items
        except Exception as e:
            _log("X (via Nitter)", False, e)
    return []


# ---------------------------------------------------------------- prediction markets
def polymarket(query, limit=5):
    url = "https://gamma-api.polymarket.com/public-search?" + urllib.parse.urlencode(
        {"q": query, "limit_per_type": limit, "events_status": "active"})
    try:
        d = fetch_json(url)
        out = []
        for ev in d.get("events", [])[:limit]:
            for mk in (ev.get("markets") or [])[:2]:
                try:
                    prices = json.loads(mk.get("outcomePrices") or "[]")
                    outcomes = json.loads(mk.get("outcomes") or "[]")
                except Exception:
                    prices, outcomes = [], []
                odds = {o: round(float(p) * 100) for o, p in zip(outcomes, prices)}
                out.append({"question": mk.get("question") or ev.get("title"),
                            "odds": odds, "end": mk.get("endDate"),
                            "volume": ev.get("volume"),
                            "url": f"https://polymarket.com/event/{ev.get('slug', '')}"})
        _log("Polymarket", True)
        return out
    except Exception as e:
        _log("Polymarket", False, e)
        return []


# ---------------------------------------------------------------- events
def nasdaq_earnings_date(symbol):
    """Next earnings date for US tickers (free Nasdaq endpoint)."""
    if not re.fullmatch(r"[A-Z]{1,5}", symbol or ""):
        return None
    url = f"https://api.nasdaq.com/api/analyst/{symbol}/earnings-date"
    try:
        d = fetch_json(url, headers={"Accept": "application/json"})
        txt = ((d.get("data") or {}).get("announcement") or "")
        m = re.search(r"([A-Z][a-z]{2} \d{1,2}, \d{4})", txt)
        _log("Nasdaq earnings calendar", True)
        if m:
            return datetime.strptime(m.group(1), "%b %d, %Y").date().isoformat()
    except Exception as e:
        _log("Nasdaq earnings calendar", False, e)
    return None


def site_check(sites, timeout=6):
    """Silently test which finance sites this PC can reach."""
    from concurrent.futures import ThreadPoolExecutor

    def one(s):
        t0 = time.time()
        try:
            fetch(s["url"], timeout=timeout)
            return {**s, "ok": True, "ms": int((time.time() - t0) * 1000)}
        except Exception as e:
            code = getattr(e, "code", None)
            # 401/403/429 means the network let us through; the site just refused a bot.
            return {**s, "ok": code in (401, 403, 429), "ms": int((time.time() - t0) * 1000),
                    "error": str(e)[:100]}

    with ThreadPoolExecutor(12) as ex:
        return list(ex.map(one, sites))
