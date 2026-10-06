"""Builds the single-file HTML dashboard (no external scripts, works offline,
safe to attach to an email)."""
from datetime import datetime, timezone
from html import escape as E

COL = {"red": "#e5484d", "amber": "#f5a524", "green": "#30a46c"}
ICON = {"red": "🔴", "amber": "🟡", "green": "🟢"}
LABEL = {"red": "ACT / pay attention", "amber": "Watch", "green": "All good"}


def f(v, d=1, suffix="%", sign=True):
    if v is None:
        return "–"
    return f"{v:+.{d}f}{suffix}" if sign else f"{v:,.{d}f}{suffix}"


def cls(v):
    return "" if v is None else ("up" if v >= 0 else "dn")


def ago(iso):
    if not iso:
        return ""
    try:
        t = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        h = (datetime.now(timezone.utc) - t).total_seconds() / 3600
        if h < 1:
            return f"{int(h * 60)}m ago"
        if h < 48:
            return f"{int(h)}h ago"
        return f"{int(h / 24)}d ago"
    except Exception:
        return iso[:16]


def stamp(iso):
    if not iso:
        return "time n/a"
    return iso.replace("T", " ")[:16] + " UTC"


def spark(series, w=150, h=38, strike=None):
    pts = [c for _, c in (series or [])][-60:]
    if len(pts) < 2:
        return '<div class="nospark">no chart</div>'
    lo, hi = min(pts + ([strike] if strike else [])), max(pts)
    rng = (hi - lo) or 1
    xy = [(i * w / (len(pts) - 1), h - 3 - (p - lo) / rng * (h - 6)) for i, p in enumerate(pts)]
    path = " ".join(f"{x:.1f},{y:.1f}" for x, y in xy)
    color = COL["green"] if pts[-1] >= pts[0] else COL["red"]
    ko = ""
    if strike and lo <= strike <= hi:
        y = h - 3 - (strike - lo) / rng * (h - 6)
        ko = (f'<line x1="0" x2="{w}" y1="{y:.1f}" y2="{y:.1f}" stroke="{COL["red"]}" '
              f'stroke-dasharray="3 3" stroke-width="1"/><text x="2" y="{y - 2:.1f}" '
              f'font-size="8" fill="{COL["red"]}">KO</text>')
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="60-day price">'
            f'{ko}<polyline fill="none" stroke="{color}" stroke-width="1.6" points="{path}"/>'
            f'<circle cx="{xy[-1][0]:.1f}" cy="{xy[-1][1]:.1f}" r="2.4" fill="{color}"/></svg>')


def ko_bar(dist):
    if dist is None:
        return ""
    v = max(0, min(dist, 40))
    c = COL["red"] if dist < 8 else COL["amber"] if dist < 15 else COL["green"]
    return (f'<div class="ko"><span>Distance to knock-out</span><b style="color:{c}">{dist:.1f}%</b>'
            f'<div class="track"><div class="fill" style="width:{v / 40 * 100:.0f}%;background:{c}"></div></div></div>')


def news_list(items, n):
    rows = []
    for it in items[:n]:
        t = it.get("tone", "neutral")
        dot = {"risk": "▼", "good": "▲"}.get(t, "•")
        rows.append(f'<li class="{t}"><span class="dot">{dot}</span><a href="{E(it.get("url") or "#")}" '
                    f'target="_blank" rel="noopener">{E(it.get("title") or "")}</a>'
                    f'<span class="meta">{E(it.get("source") or "")} · {stamp(it.get("time"))} · {ago(it.get("time"))}</span></li>')
    return "<ul class='news'>" + "".join(rows) + "</ul>" if rows else "<p class='muted'>No headlines found this week.</p>"


def card(r, etf_holdings, cloud_item):
    h, px, ch = r["h"], r["px"], r.get("chg", {})
    st = r["status"]
    price = f"{px['price']:,.2f} {px.get('currency') or ''}" if px and px.get("price") else "–"
    proxy = ' <span class="tag">proxy</span>' if h.get("proxy") else ""
    lev = r.get("lev") or 1
    lev_txt = f"≈{lev:.1f}x" if lev > 1.05 else "1x"
    social = r["social"]
    soc = []
    stw = social.get("stocktwits")
    if stw and stw["bull"] + stw["bear"]:
        b = stw["bull"] / (stw["bull"] + stw["bear"]) * 100
        soc.append(f'<div class="mood"><span>StockTwits mood</span><div class="track"><div class="fill" '
                   f'style="width:{b:.0f}%;background:{COL["green"]}"></div></div><small>{stw["bull"]} bull / {stw["bear"]} bear</small></div>')
    if social.get("reddit"):
        top = sorted(social["reddit"], key=lambda x: -x["score"])[:3]
        soc.append("<div class='sub'>Reddit this week</div><ul class='news'>" + "".join(
            f'<li><span class="dot">•</span><a href="{E(p["url"])}" target="_blank">{E(p["title"][:110])}</a>'
            f'<span class="meta">r/{E(p["sub"] or "")} · ▲{p["score"]} · {stamp(p["time"])}</span></li>' for p in top) + "</ul>")
    if social.get("x"):
        soc.append("<div class='sub'>X / Twitter</div>" + news_list(social["x"], 3))
    etf = ""
    for key, lst in etf_holdings.items():
        if key.startswith("_") or key.split(" (")[0] not in h["name"]:
            continue
        etf = ("<div class='sub'>Top holdings (driving this ETF)</div><div class='chips'>" +
               "".join(f"<span class='chip'>{E(x.split(':')[-1])}</span>" for x in lst) + "</div>")
    cloud = ""
    if cloud_item:
        cloud = ("<div class='cloudnote'><b>Night analysis</b>" + "".join(
            f"<p>{E(n.get('text', ''))} <span class='meta'>{stamp(n.get('time'))}"
            + (f" · <a href='{E(n['url'])}' target='_blank'>source</a>" if n.get("url") else "")
            + "</span></p>" for n in cloud_item.get("notes", [])) + "</div>")
    earn = ""
    if r.get("earnings"):
        earn = f'<div class="pill">📅 Earnings {E(r["earnings"])} ({r.get("earnings_in", "?")}d)</div>'
    info = "".join(f"<li>{E(x)}</li>" for x in r.get("info", []))
    return f"""
<details class="card {st}" {'open' if st == 'red' else ''}>
 <summary>
  <div class="ctop"><span class="badge" style="background:{COL[st]}">{ICON[st]} {LABEL[st]}</span>
   <span class="val">€{h.get('value_eur', 0):,.0f}</span></div>
  <h3>{E(h['name'])}</h3>
  <div class="row"><div>{spark(px['series'] if px else [], strike=h.get('strike'))}</div>
   <div class="nums"><div><small>Underlying</small><b>{E(price)}</b>{proxy}</div>
   <div><small>1d / 5d / 1m</small><b><span class="{cls(ch.get('d1'))}">{f(ch.get('d1'))}</span> · <span class="{cls(ch.get('d5'))}">{f(ch.get('d5'))}</span> · <span class="{cls(ch.get('m1'))}">{f(ch.get('m1'))}</span></b></div>
   <div><small>Leverage · est. position 1d</small><b>{lev_txt} · <span class="{cls(r.get('pos_d1'))}">{f(r.get('pos_d1'), 0)}</span></b></div></div></div>
  {ko_bar(r.get('ko_dist'))}
  <ul class="reasons">{''.join(f'<li>{E(x)}</li>' for x in r['reasons'])}</ul>
 </summary>
 <div class="more">
  <div class="meta">{E(h.get('segment', ''))} · {E(h.get('isin', ''))} · {E(h.get('issuer', '') or '')} · tracked via {E(h.get('underlying') or 'news only')}{' · DEEP watch (≥ €1,000)' if r['deep'] else ''}</div>
  {earn}{cloud}
  {('<ul class="info">' + info + '</ul>') if info else ''}
  {etf}
  <div class="sub">News (newest first, {len(r['news'])} found)</div>{news_list(r['news'], 8 if r['deep'] else 5)}
  {''.join(soc)}
  <div class="links"><a href="https://www.ls-tc.de/de/suche?q={E(h.get('isin', ''))}" target="_blank">Live price L&amp;S ↗</a>
  <a href="https://www.justetf.com/en/search.html?query={E(h.get('isin', ''))}" target="_blank">justETF ↗</a>
  <a href="https://finance.yahoo.com/quote/{E(h.get('underlying') or '')}" target="_blank">Yahoo ↗</a></div>
 </div>
</details>"""


def latest(items):
    return "<br>".join(f'<a href="{E(n.get("url") or "#")}" target="_blank">{E((n.get("title") or "")[:80])}</a>'
                       for n in items[:2])


def segment_bar(results):
    seg = {}
    for r in results:
        seg[r["h"].get("segment", "Other")] = seg.get(r["h"].get("segment", "Other"), 0) + (r["h"].get("value_eur") or 0)
    tot = sum(seg.values()) or 1
    pal = ["#3e63dd", "#30a46c", "#f5a524", "#e5484d", "#8e4ec6", "#12a594", "#d6409f", "#978365",
           "#0090ff", "#ab4aba", "#46a758", "#e54666", "#6e56cf", "#ffc53d", "#00a2c7", "#a18072"]
    parts, legend = [], []
    for i, (k, v) in enumerate(sorted(seg.items(), key=lambda x: -x[1])):
        c = pal[i % len(pal)]
        parts.append(f'<div title="{E(k)} €{v:,.0f}" style="width:{v / tot * 100:.2f}%;background:{c}"></div>')
        legend.append(f'<span><i style="background:{c}"></i>{E(k)} <b>{v / tot * 100:.0f}%</b></span>')
    return f'<div class="segbar">{"".join(parts)}</div><div class="legend">{"".join(legend)}</div>'


def render(d):
    res = sorted(d["results"], key=lambda r: ({"red": 0, "amber": 1, "green": 2}[r["status"]], -(r["h"].get("value_eur") or 0)))
    tot = sum(r["h"].get("value_eur") or 0 for r in res)
    cnt = {k: sum(1 for r in res if r["status"] == k) for k in COL}
    risk_eur = {k: sum(r["h"].get("value_eur") or 0 for r in res if r["status"] == k) for k in COL}
    cloud = d.get("cloud") or {}
    cloud_items = cloud.get("items", {})

    actions = "".join(
        f'<li class="{r["status"]}"><b>{ICON[r["status"]]} {E(r["h"]["name"])}</b> <span class="muted">€{r["h"].get("value_eur", 0):,.0f}</span>'
        f'<br>{"<br>".join(E(x) for x in r["reasons"][:3])}</li>'
        for r in res if r["status"] != "green") or "<li class='green'>🟢 Nothing needs attention right now.</li>"

    events = []
    for r in res:
        if r.get("earnings"):
            events.append((r["earnings"], r["h"]["name"], "holding"))
    for w in d["watch"]:
        if w.get("earnings"):
            events.append((w["earnings"], w["w"]["name"], "radar"))
    for e in cloud.get("events", []):
        events.append((e.get("date", ""), e.get("text", ""), e.get("kind", "macro")))
    events = sorted(e for e in events if e[0] and e[0] >= datetime.now(timezone.utc).date().isoformat())[:20]
    ev_html = "".join(f'<tr><td>{E(a)}</td><td>{E(b)}</td><td><span class="tag {E(c)}">{E(c)}</span></td></tr>' for a, b, c in events) \
        or "<tr><td colspan=3 class='muted'>No dated events found by the free sources — see night analysis.</td></tr>"

    macro = "".join(
        f'<div class="tile"><small>{E(m["m"]["name"])}</small><b>{(m["px"]["price"] if m["px"] else 0):,.2f}</b>'
        f'<span class="{cls(m["chg"].get("d1"))}">{f(m["chg"].get("d1"))} 1d</span>{spark(m["px"]["series"] if m["px"] else [], 110, 26)}</div>'
        for m in d["macro"])
    mnews = "".join(f'<div class="mcol"><h4>{E(q)}</h4>{news_list(items, 3)}</div>' for q, items in d["macro_news"])

    watch = "".join(
        f'<tr><td><b>{E(w["w"]["name"])}</b><br><small class="muted">{E(w["w"]["why"])}</small></td>'
        f'<td>{spark(w["px"]["series"] if w["px"] else [], 90, 24)}</td>'
        f'<td class="{cls(w["chg"].get("d1"))}">{f(w["chg"].get("d1"))}</td><td class="{cls(w["chg"].get("m1"))}">{f(w["chg"].get("m1"))}</td>'
        f'<td>{E(w.get("earnings") or "–")}</td><td>{"▲" if w["news_score"] > 0 else "▼" if w["news_score"] < 0 else "•"} {w["news_score"]:+d}</td>'
        f'<td>{latest(w["news"])}</td></tr>'
        for w in sorted(d["watch"], key=lambda w: w.get("earnings") or "9999"))

    poly = "".join(
        f'<div class="pm"><a href="{E(m["url"])}" target="_blank">{E(m["question"] or "")}</a><div class="odds">' +
        "".join(f'<span><b>{v}%</b> {E(k)}</span>' for k, v in list(m["odds"].items())[:2]) + "</div></div>"
        for m in d["polymarket"]) or "<p class='muted'>Polymarket not reachable from this network.</p>"

    src = "".join(
        f'<tr><td>{E(k)}</td><td>{"✅" if v["ok"] else "❌"} {v["ok"]} ok / {v["fail"]} failed</td><td class="muted">{E(v["last_error"])}</td></tr>'
        for k, v in sorted(d["sources"].items()))
    reach = d.get("reach") or {}
    reach_html = ""
    if reach.get("results"):
        reach_html = "<div class='chips'>" + "".join(
            f'<span class="chip {"ok" if r["ok"] else "bad"}">{"✓" if r["ok"] else "✗"} {E(r["name"])}</span>' for r in reach["results"]) + "</div>"

    summary = ""
    if cloud.get("summary"):
        summary = f'<section class="panel cloud"><h2>🌙 Night analysis summary <small class="muted">{stamp(cloud.get("generated"))}</small></h2><div>{cloud["summary"]}</div></section>'

    cards = "".join(card(r, d["etf_holdings"], cloud_items.get(r["h"]["isin"])) for r in res)

    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio Radar</title>
<style>
:root{{--bg:#0f1115;--panel:#171a21;--line:#262a33;--text:#e7e9ee;--muted:#8b93a3;--up:#30a46c;--dn:#e5484d}}
@media (prefers-color-scheme: light){{:root:not([data-theme="dark"]){{--bg:#f6f7f9;--panel:#fff;--line:#e3e6eb;--text:#14171c;--muted:#5f6878}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,Segoe UI,Roboto,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto;padding:16px}}a{{color:inherit}}.muted{{color:var(--muted)}}
header{{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}}
h1{{margin:0;font-size:22px}}h2{{font-size:16px;margin:0 0 10px}}h3{{margin:6px 0;font-size:15px}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0}}
.kpi{{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px}}.kpi b{{font-size:22px;display:block}}
.panel{{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin:12px 0}}
.actions{{list-style:none;padding:0;margin:0;display:grid;gap:8px}}.actions li{{padding:10px;border-radius:8px;border-left:4px solid}}
.actions .red{{border-color:var(--dn);background:rgba(229,72,77,.08)}}.actions .amber{{border-color:#f5a524;background:rgba(245,165,36,.08)}}.actions .green{{border-color:var(--up)}}
.segbar{{display:flex;height:16px;border-radius:8px;overflow:hidden}}.legend{{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;font-size:12px}}.legend i{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px}}
.card{{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;border-top:4px solid}}
.card.red{{border-top-color:var(--dn)}}.card.amber{{border-top-color:#f5a524}}.card.green{{border-top-color:var(--up)}}
summary{{list-style:none;cursor:pointer}}summary::-webkit-details-marker{{display:none}}
.ctop{{display:flex;justify-content:space-between;align-items:center}}.badge{{color:#fff;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:600}}.val{{font-weight:700}}
.row{{display:flex;gap:12px;align-items:center;flex-wrap:wrap}}.nums{{display:grid;gap:2px;font-size:12px}}.nums small{{color:var(--muted);display:block}}
.up{{color:var(--up)}}.dn{{color:var(--dn)}}.tag{{font-size:10px;border:1px solid var(--line);border-radius:4px;padding:0 4px;color:var(--muted)}}
.ko,.mood{{margin:8px 0;font-size:12px}}.ko span,.mood span{{color:var(--muted)}}.ko b{{float:right}}.track{{height:6px;background:var(--line);border-radius:3px;margin-top:3px;overflow:hidden}}.fill{{height:100%}}
.reasons{{margin:6px 0 0;padding-left:18px}}.reasons li{{margin:2px 0}}.info{{font-size:12px;color:var(--muted)}}
.more{{margin-top:10px;border-top:1px dashed var(--line);padding-top:8px}}.sub{{font-weight:600;margin:10px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}}
.news{{list-style:none;padding:0;margin:0}}.news li{{padding:4px 0;border-bottom:1px solid var(--line)}}.news .meta,.meta{{display:block;color:var(--muted);font-size:11px}}
.news .dot{{display:inline-block;width:14px}}.news .risk .dot{{color:var(--dn)}}.news .good .dot{{color:var(--up)}}
.chips{{display:flex;flex-wrap:wrap;gap:6px}}.chip{{font-size:12px;border:1px solid var(--line);border-radius:99px;padding:2px 8px}}.chip.ok{{border-color:var(--up)}}.chip.bad{{border-color:var(--dn);color:var(--dn)}}
.pill{{display:inline-block;background:rgba(245,165,36,.15);padding:2px 8px;border-radius:6px;margin:6px 0}}
.links{{display:flex;gap:12px;margin-top:8px;font-size:12px}}.cloudnote{{background:rgba(62,99,221,.1);border-radius:8px;padding:8px;margin:8px 0}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}}.tile{{border:1px solid var(--line);border-radius:8px;padding:8px}}.tile small{{display:block;color:var(--muted)}}.tile b{{display:block}}
.mgrid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}}.mcol h4{{margin:4px 0}}
table{{width:100%;border-collapse:collapse;font-size:12px}}td,th{{padding:6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}
.tblwrap{{overflow-x:auto}}.pmgrid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}}.pm{{border:1px solid var(--line);border-radius:8px;padding:8px}}.odds{{display:flex;gap:10px;margin-top:4px}}
.nospark{{width:150px;color:var(--muted);font-size:11px}}footer{{color:var(--muted);font-size:11px;margin:20px 0}}
@media (max-width:480px){{.grid{{grid-template-columns:1fr}}}}
</style></head><body><div class="wrap">
<header><div><h1>📡 Portfolio Radar</h1><div class="muted">Built {stamp(d['generated'])} · mode: {E(d['mode'])}</div></div>
<div class="muted">Click any card for news, social mood &amp; sources</div></header>
<div class="kpis">
 <div class="kpi"><small class="muted">Portfolio (export values)</small><b>€{tot:,.0f}</b></div>
 <div class="kpi" style="border-left:4px solid {COL['red']}"><small class="muted">🔴 Act now</small><b>{cnt['red']}</b><small>€{risk_eur['red']:,.0f} exposed</small></div>
 <div class="kpi" style="border-left:4px solid {COL['amber']}"><small class="muted">🟡 Watch</small><b>{cnt['amber']}</b><small>€{risk_eur['amber']:,.0f}</small></div>
 <div class="kpi" style="border-left:4px solid {COL['green']}"><small class="muted">🟢 All good</small><b>{cnt['green']}</b><small>€{risk_eur['green']:,.0f}</small></div>
</div>
{summary}
<section class="panel"><h2>⚡ What needs your attention</h2><ul class="actions">{actions}</ul></section>
<section class="panel"><h2>🧩 Where your money sits (by segment)</h2>{segment_bar(res)}</section>
<section class="panel"><h2>🌍 Markets &amp; macro</h2><div class="tiles">{macro}</div><div class="mgrid" style="margin-top:12px">{mnews}</div></section>
<h2 style="margin-top:20px">📊 Positions</h2><div class="grid">{cards}</div>
<section class="panel"><h2>📅 Event calendar (next weeks)</h2><div class="tblwrap"><table><tr><th>Date</th><th>Event</th><th>Type</th></tr>{ev_html}</table></div></section>
<section class="panel"><h2>🎯 Radar — stocks you traded before</h2><p class="muted">Upcoming earnings on names you know. Not buy advice: leveraged products before earnings can gain or lose a lot.</p>
<div class="tblwrap"><table><tr><th>Name</th><th>60d</th><th>1d</th><th>1m</th><th>Earnings</th><th>News tone</th><th>Latest</th></tr>{watch}</table></div></section>
<section class="panel"><h2>🔮 Prediction markets (Polymarket odds)</h2><div class="pmgrid">{poly}</div></section>
<section class="panel"><h2>🛰 Data sources this run</h2><div class="tblwrap"><table>{src}</table></div>
<div class="sub">Sites reachable from this PC</div>{reach_html or "<p class='muted'>Site check not run.</p>"}</section>
<footer>Information only, not financial advice. Status lights are rule-based signals (price, knock-out distance, news keywords, crowd mood, calendar) — always confirm in your broker app. Turbo knock-out distances assume KO = strike; check the issuer sheet. "proxy" = tracked through a similar US-listed ETF.</footer>
</div></body></html>"""
