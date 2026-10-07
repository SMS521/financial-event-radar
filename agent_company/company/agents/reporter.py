"""Reporter & Designer (20): one self-contained HTML dashboard + the 7:30 email."""
import json
import os
import smtplib
import ssl
from datetime import date, datetime, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape as E

from company.agents.base import Agent
from company.core.base import REPORTS, SOURCE_STATS, cfg, now_iso, secrets

C = {"red": "#e5484d", "amber": "#f5a524", "green": "#30a46c", "ok": "#30a46c", "warn": "#f5a524",
     "fail": "#e5484d", "skip": "#8b93a3", "approved": "#30a46c", "watch": "#f5a524", "rejected": "#e5484d"}
DOT = {"red": "🔴", "amber": "🟡", "green": "🟢"}


def fmt(v, suf="%", d=1, sign=True):
    if v is None:
        return "–"
    return f"{v:+.{d}f}{suf}" if sign else f"{v:,.{d}f}{suf}"


def cls(v):
    return "" if v is None else "up" if v >= 0 else "dn"


def stamp(t):
    return (t or "").replace("T", " ")[:16] + (" UTC" if t else "time n/a")


def spark(vals, w=160, h=40, color=None, base=None):
    vals = [v for v in vals if v is not None]
    if len(vals) < 2:
        return "<span class='muted'>no data</span>"
    lo, hi = min(vals + ([base] if base else [])), max(vals + ([base] if base else []))
    rng = (hi - lo) or 1
    pts = " ".join(f"{i * w / (len(vals) - 1):.1f},{h - 3 - (v - lo) / rng * (h - 6):.1f}" for i, v in enumerate(vals))
    col = color or (C["green"] if vals[-1] >= vals[0] else C["red"])
    bl = ""
    if base:
        y = h - 3 - (base - lo) / rng * (h - 6)
        bl = f'<line x1="0" x2="{w}" y1="{y:.1f}" y2="{y:.1f}" stroke="currentColor" opacity=".25" stroke-dasharray="3 3"/>'
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true">{bl}<polyline fill="none" stroke="{col}" stroke-width="1.6" points="{pts}"/></svg>'


def multi_line(series, w=760, h=220):
    """Several equity curves on one chart, each labelled at its end."""
    pal = ["#3e63dd", "#30a46c", "#f5a524", "#e5484d", "#8e4ec6", "#12a594", "#8b93a3"]
    allv = [v for s in series.values() for v in s]
    if not allv:
        return ""
    lo, hi = min(allv), max(allv)
    rng = (hi - lo) or 1
    out = []
    for i, (name, vals) in enumerate(series.items()):
        if len(vals) < 2:
            continue
        col = "#8b93a3" if name.startswith("benchmark") else pal[i % len(pal)]
        dash = ' stroke-dasharray="4 3"' if name.startswith("benchmark") else ""
        pts = " ".join(f"{j * (w - 190) / (len(vals) - 1):.1f},{h - 8 - (v - lo) / rng * (h - 16):.1f}" for j, v in enumerate(vals))
        y = h - 8 - (vals[-1] - lo) / rng * (h - 16)
        out.append(f'<polyline fill="none" stroke="{col}" stroke-width="1.8"{dash} points="{pts}"/>'
                   f'<text x="{w - 186}" y="{y + 4:.1f}" font-size="11" fill="{col}">{E(name)} {vals[-1]:.2f}x</text>')
    y1 = h - 8 - (1 - lo) / rng * (h - 16)
    return (f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="equity curves">'
            f'<line x1="0" x2="{w - 190}" y1="{y1:.1f}" y2="{y1:.1f}" stroke="currentColor" opacity=".2"/>{"".join(out)}</svg>')


def heat(v):
    if v is None:
        return "transparent"
    a = min(1, abs(v) / 0.6)
    return f"rgba(48,164,108,{a:.2f})" if v > 0 else f"rgba(229,72,77,{a:.2f})"


class Reporter(Agent):
    id, name, title, dept = 20, "reporter", "Reporter & Designer", "Execution"
    job = "Builds the dashboard and the 7:30 email: status lights, charts, sources, scorecard."

    def run(self, ctx):
        html = self.render(ctx)
        os.makedirs(REPORTS, exist_ok=True)
        path = os.path.join(REPORTS, "dashboard.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        with open(os.path.join(REPORTS, f"dashboard_{ctx.run_id}.html"), "w", encoding="utf-8") as f:
            f.write(html)
        ctx.shared["dashboard_path"] = path
        sent = ""
        if ctx.mode == "night" and not ctx.demo:
            sent = self.email(ctx, path)
        return "ok", f"dashboard written ({len(html) // 1024} KB){'; ' + sent if sent else ''}"

    # ------------------------------------------------------------ email
    def email(self, ctx, path):
        k = secrets()
        if not (k.get("GMAIL_ADDRESS") and k.get("GMAIL_APP_PASSWORD")):
            return "email skipped (no Gmail app password in secrets/keys.txt)"
        A = ctx.shared.get("assessments", {})
        cnt = {s: sum(1 for a in A.values() if a["status"] == s and a["item"]["group"] == "portfolio") for s in DOT}
        msg = MIMEMultipart()
        msg["Subject"] = f"📡 Radar {date.today()} — 🔴 {cnt['red']} · 🟡 {cnt['amber']} · 🟢 {cnt['green']}"
        msg["From"] = k["GMAIL_ADDRESS"]
        msg["To"] = ctx.settings.get("email_to") or k["GMAIL_ADDRESS"]
        msg.attach(MIMEText(self.email_body(ctx), "html", "utf-8"))
        with open(path, "rb") as f:
            att = MIMEApplication(f.read(), Name=f"dashboard_{date.today()}.html")
        att["Content-Disposition"] = f'attachment; filename="dashboard_{date.today()}.html"'
        msg.attach(att)
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=30) as s:
                s.login(k["GMAIL_ADDRESS"], k["GMAIL_APP_PASSWORD"])
                s.send_message(msg)
            return f"email sent to {msg['To']}"
        except Exception as e:
            return f"email FAILED: {e}"

    def email_body(self, ctx):
        A = ctx.shared.get("assessments", {})
        rows = sorted((a for a in A.values() if a["item"]["group"] == "portfolio"),
                      key=lambda a: ({"red": 0, "amber": 1, "green": 2}[a["status"]], -a["item"]["value_eur"]))
        macro = ctx.shared.get("macro", {})
        tr = "".join(f"<tr><td>{DOT[a['status']]}</td><td><b>{E(a['item']['name'])}</b><br><span style='color:#666'>€{a['item']['value_eur']:,.0f}</span></td>"
                     f"<td>{E(a['summary'])}</td></tr>" for a in rows)
        return (f"<div style='font-family:Segoe UI,Arial;max-width:720px'><h2>📡 Morning radar — {date.today()}</h2>"
                f"<p><b>Market regime:</b> {E(macro.get('regime', '?'))}. {E(macro.get('summary', ''))}</p>"
                f"<table cellpadding='6' style='border-collapse:collapse;font-size:14px'>{tr}</table>"
                f"<p>Full interactive dashboard attached (open in a browser).</p>"
                f"<p style='color:#888;font-size:12px'>Information only, not financial advice.</p></div>")

    # ------------------------------------------------------------ dashboard
    def render(self, ctx):
        db = ctx.db
        runs = db.q("SELECT * FROM agent_runs WHERE run_id=?", (ctx.run_id,))
        rmap = {r["agent"]: r for r in runs}
        from company.agents.registry import STAFF
        board = "".join(
            f'<div class="agent {rmap.get(a.name, {}).get("status", "idle")}"><div class="ahead"><b>#{a.id} {E(a.title)}</b>'
            f'<span class="tag">{"🧠 AI" if a.uses_ai else "⚙ code"}</span></div><div class="muted small">{E(a.dept)} · {E(a.job)}</div>'
            f'<div class="amsg">{E((rmap.get(a.name) or {}).get("message", "not part of this run"))}</div></div>'
            for a in STAFF)

        A = ctx.shared.get("assessments", {})
        port = sorted((a for a in A.values() if a["item"]["group"] == "portfolio"),
                      key=lambda a: ({"red": 0, "amber": 1, "green": 2}[a["status"]], -a["item"]["value_eur"]))
        radar = [a for a in A.values() if a["item"]["group"] == "radar"]
        tot = sum(a["item"]["value_eur"] for a in port)
        cnt = {s: [a for a in port if a["status"] == s] for s in DOT}

        actions = "".join(f'<li class="{a["status"]}"><b>{DOT[a["status"]]} {E(a["item"]["name"])}</b> '
                          f'<span class="muted">€{a["item"]["value_eur"]:,.0f}</span><br>{E(a["summary"])}</li>'
                          for a in port if a["status"] != "green") or "<li class='green'>🟢 Nothing needs attention.</li>"
        for b in (ctx.shared.get("risk") or {}).get("breaches", []):
            actions += f'<li class="{b["level"]}"><b>🛡 Risk rule — {E(b["what"])}</b><br>{E(b["rule"])}</li>'

        cards = "".join(self.card(ctx, a) for a in port)
        mac = ctx.shared.get("macro", {})
        tiles = "".join(f'<div class="tile"><small>{E(n)}</small><b>{(t or {}).get("last", "–")}</b>'
                        f'<span class="{cls((t or {}).get("d1"))}">{fmt((t or {}).get("d1"))} 1d</span>'
                        f'<span class="muted small">{fmt((t or {}).get("m1"))} 1m</span></div>'
                        for n, t in (mac.get("tiles") or {}).items())
        themes = "".join(f'<li><b>{E(t["title"])}</b> <span class="muted small">{E(t.get("impact", ""))} · {stamp(t.get("time"))}</span>'
                         f'{" · <a href=" + chr(39) + E(t["url"]) + chr(39) + " target=_blank>source</a>" if t.get("url") else ""}</li>'
                         for t in mac.get("themes", [])[:10])
        poly = "".join(f'<div class="pm"><a href="{E(p["url"])}" target="_blank">{E(p["question"] or "")}</a><div>'
                       + " ".join(f"<b>{v}%</b> {E(k)}" for k, v in list(p["odds"].items())[:2]) + "</div></div>"
                       for p in ctx.shared.get("polymarket", [])[:12])

        quant = self.quant_section(ctx)
        paper = self.paper_section(ctx)
        events = db.q("SELECT * FROM events WHERE date>=? ORDER BY date LIMIT 25", (date.today().isoformat(),))
        ev = "".join(f"<tr><td>{E(e['date'])}</td><td>{E(e['text'])}</td><td class='muted'>{E(e['source'])}</td></tr>" for e in events)
        rad = "".join(f'<tr><td>{DOT[a["status"]]} <b>{E(a["item"]["name"])}</b><br><span class="muted small">{E(a["item"].get("why") or "")}</span></td>'
                      f'<td>{fmt(a["facts"].get("d1"))}</td><td>{fmt(a["facts"].get("m1"))}</td><td>{fmt(a["facts"].get("from_52w_high_pct"))}</td>'
                      f'<td>{E(a["summary"])}</td></tr>' for a in sorted(radar, key=lambda a: a["item"]["name"]))
        audit = (db.memos(ctx.run_id, "data_auditor", "data_audit") or [{"body": {}}])[-1]["body"]
        src = "".join(f'<tr><td>{E(k)}</td><td>{"✅" if v["ok"] else "❌"} {v["ok"]} ok / {v["fail"]} failed</td><td class="muted small">{E(v["last_error"])}</td></tr>'
                      for k, v in sorted(SOURCE_STATS.items()))
        demo_banner = ('<div class="banner">DEMO MODE — synthetic offline data. Numbers are NOT real markets; this run proves the '
                       'machinery works end to end.</div>') if ctx.demo else ""
        ai_line = f"AI agents: {'ON (' + str(ctx.ai.calls()) + ' calls)' if ctx.ai.on else 'OFF — rule-based mode' + (' (' + ctx.ai.error + ')' if getattr(ctx.ai, 'error', None) else ' (no ANTHROPIC_API_KEY)')}"

        return PAGE.format(
            css=CSS, demo=demo_banner, built=stamp(now_iso()), run=E(ctx.run_id), mode=E(ctx.mode), ai=E(ai_line),
            tot=f"{tot:,.0f}", nred=len(cnt["red"]), namb=len(cnt["amber"]), ngrn=len(cnt["green"]),
            ered=f"{sum(a['item']['value_eur'] for a in cnt['red']):,.0f}", eamb=f"{sum(a['item']['value_eur'] for a in cnt['amber']):,.0f}",
            regime=E(mac.get("regime", "–")), actions=actions, macro_summary=E(mac.get("summary", "")), tiles=tiles,
            themes=themes or "<li class='muted'>No macro research this run.</li>", cards=cards or "<p class='muted'>Research desk did not run.</p>",
            quant=quant, paper=paper, events=ev or "<tr><td colspan=3 class='muted'>No upcoming events on file.</td></tr>",
            radar=rad or "<tr><td colspan=5 class='muted'>No radar research this run.</td></tr>",
            poly=poly or "<p class='muted'>No prediction markets this run.</p>", board=board,
            audit=E(f"{audit.get('checked', '?')} series checked · {len(audit.get('issues', []))} suspicious jumps · {len(audit.get('stale', []))} stale"),
            issues="".join(f"<li>{E(i)}</li>" for i in audit.get("issues", [])[:10]), sources=src)

    def card(self, ctx, a):
        i, f = a["item"], a.get("facts", {})
        ser = [v for _, v in ctx.db.series(i["symbol"])[-90:]] if i.get("symbol") else []
        ko = ""
        if f.get("ko_distance_pct") is not None:
            kd = f["ko_distance_pct"]
            c = C["red"] if kd < 8 else C["amber"] if kd < 15 else C["green"]
            ko = (f'<div class="ko"><span>Distance to knock-out</span><b style="color:{c}">{kd}%</b><div class="track">'
                  f'<div class="fill" style="width:{max(0, min(kd, 40)) / 40 * 100:.0f}%;background:{c}"></div></div></div>')
        notes = "".join(f'<li><a href="{E(n["url"])}" target="_blank">{E(n["text"])}</a><span class="meta">{stamp(n.get("time"))}</span></li>'
                        for n in a.get("notes", []))
        news = "".join(f'<li class="{E(n.get("tone", ""))}"><a href="{E(n["url"])}" target="_blank">{E(n["title"])}</a>'
                       f'<span class="meta">{E(n.get("source") or "")} · {stamp(n.get("time"))}</span></li>' for n in a.get("news", [])[:6])
        st = ((a.get("social") or {}).get("stocktwits")) or {}
        mood = ""
        if st.get("bull", 0) + st.get("bear", 0):
            b = st["bull"] / (st["bull"] + st["bear"]) * 100
            mood = (f'<div class="ko"><span>StockTwits mood</span><b>{st["bull"]}▲ / {st["bear"]}▼</b><div class="track">'
                    f'<div class="fill" style="width:{b:.0f}%;background:{C["green"]}"></div></div></div>')
        watch = "".join(f"<li>{E(w)}</li>" for w in a.get("watch_next", []))
        badge = f'<span class="tag">{"🧠 AI" if a.get("method") == "ai" else "⚙ rules"}</span>' + (' <span class="tag">✔ fact-checked</span>' if a.get("verified") else "")
        return f"""<details class="card {a['status']}" {'open' if a['status'] == 'red' else ''}><summary>
<div class="ctop"><span class="badge" style="background:{C[a['status']]}">{DOT[a['status']]} {a['status'].upper()}</span><b>€{i['value_eur']:,.0f}</b></div>
<h3>{E(i['name'])}</h3><div class="row">{spark(ser, base=i.get('strike'))}<div class="nums">
<div><small>Underlying</small><b>{f.get('last', '–')}</b></div>
<div><small>1d · 5d · 1m</small><b><span class="{cls(f.get('d1'))}">{fmt(f.get('d1'))}</span> · <span class="{cls(f.get('d5'))}">{fmt(f.get('d5'))}</span> · <span class="{cls(f.get('m1'))}">{fmt(f.get('m1'))}</span></b></div>
<div><small>vs 52w high</small><b>{fmt(f.get('from_52w_high_pct'))}</b></div></div></div>{ko}
<p class="sum">{E(a['summary'])}</p></summary>
<div class="more">{badge}<div class="meta">{E(i.get('segment') or '')} · {E(i['key'])} · tracked via {E(i.get('symbol') or 'news only')} · data {E(f.get('as_of', '?'))}</div>
{mood}{('<div class="sub">Key notes (sourced)</div><ul class="news">' + notes + '</ul>') if notes else ''}
{('<div class="sub">Watch next</div><ul>' + watch + '</ul>') if watch else ''}
{('<div class="sub">Fact checker</div><p class="small">' + E(a['fact_check']) + '</p>') if a.get('fact_check') else ''}
<div class="sub">Headlines</div><ul class="news">{news or '<li class=muted>none found</li>'}</ul></div></details>"""

    def quant_section(self, ctx):
        bt = ctx.shared.get("backtest")
        if not bt:
            rows = ctx.db.q("SELECT * FROM strategies WHERE run_id=(SELECT run_id FROM strategies ORDER BY ts DESC LIMIT 1)")
            if not rows:
                return "<p class='muted'>No backtest yet — run step 4.</p>"
            return "<table><tr><th>Strategy</th><th>Verdict</th><th>Unseen-year</th></tr>" + "".join(
                f"<tr><td>{E(r['name'])}</td><td style='color:{C.get(r['verdict'], '')}'>{E(r['verdict'])}</td><td>{E(r['oos_metrics'])}</td></tr>" for r in rows) + "</table>"
        V = ctx.shared.get("verdicts", {})
        curves = {k: v["equity"] for k, v in bt["results"].items()}
        curves["benchmark hold"] = bt["bench"]["equity"]
        rows = ""
        for k, r in sorted(bt["results"].items(), key=lambda x: -x[1]["oos"].get("sharpe", -9)):
            v = V.get(k, {"verdict": "–", "reasons": []})
            lev = " · ".join(f"{L}x: {m.get('cagr_pct')}%/yr, DD {m.get('max_drawdown_pct')}%" for L, m in r["leverage"].items())
            rows += (f"<tr><td><b>{E(k)}</b><br><span class='muted small'>{E(r['explain'])}</span><br><span class='small'>params {E(json.dumps(r['params']))}</span></td>"
                     f"<td><span class='badge' style='background:{C.get(v['verdict'], '#888')}'>{E(v['verdict'])}</span><ul class='small'>"
                     + "".join(f"<li>{E(x)}</li>" for x in v["reasons"]) + "</ul></td>"
                     f"<td>{r['is'].get('cagr_pct')}%/yr<br>Sharpe {r['is'].get('sharpe')}<br>DD {r['is'].get('max_drawdown_pct')}%<br>{r['is'].get('trades')} trades, win {r['is'].get('win_rate_pct')}%</td>"
                     f"<td><b>{r['oos'].get('total_return_pct')}%</b><br>Sharpe {r['oos'].get('sharpe')}<br>DD {r['oos'].get('max_drawdown_pct')}%</td>"
                     f"<td class='small'>{E(lev)}</td></tr>")
        b = bt["bench"]
        rows += (f"<tr class='muted'><td>benchmark: equal-weight buy &amp; hold</td><td>–</td><td>{b['is'].get('cagr_pct')}%/yr<br>Sharpe {b['is'].get('sharpe')}<br>DD {b['is'].get('max_drawdown_pct')}%</td>"
                 f"<td>{b['oos'].get('total_return_pct')}%<br>Sharpe {b['oos'].get('sharpe')}</td><td></td></tr>")
        P = ctx.shared.get("patterns", {})
        ins = "".join(f"<li><b>{E(i['title'])}</b> <span class='tag'>{E(i['confidence'])}</span><br>{E(i['explanation'])}<br><i>{E(i['how_to_use'])}</i></li>" for i in P.get("insights", []))
        fx = P.get("fx_links", [])
        fxs = sorted({x["fx"] for x in fx})
        segs = sorted({x["segment"] for x in fx})
        look = {(x["fx"], x["segment"]): x["corr"] for x in fx}
        hm = ("<table class='hm'><tr><th></th>" + "".join(f"<th>{E(s)}</th>" for s in segs) + "</tr>" + "".join(
            f"<tr><th>{E(f)}</th>" + "".join(f"<td style='background:{heat(look.get((f, s)))}'>{look.get((f, s), '') if look.get((f, s)) is not None else ''}</td>" for s in segs) + "</tr>" for f in fxs)
            + "</table>") if fx else ""
        seas = P.get("seasonality_spy_pct", {})
        sbar = "".join(f"<div class='sb'><div style='height:{min(60, abs(v) * 15):.0f}px;background:{C['green'] if v >= 0 else C['red']}'></div><small>{m}</small><small>{v}</small></div>" for m, v in seas.items())
        return (f"<p class='muted'>{bt['n_symbols']} symbols · {E(bt['start'])} → {E(bt['end'])} · parameters chosen on data before "
                f"<b>{E(bt['split_date'])}</b>, then judged on the unseen period after it.</p>{multi_line(curves)}"
                f"<div class='tblwrap'><table><tr><th>Strategy</th><th>Devil's Advocate</th><th>Training years</th><th>Unseen year</th><th>With leverage (full period)</th></tr>{rows}</table></div>"
                f"<h3>Pattern findings</h3><ul class='ins'>{ins}</ul>"
                f"<h3>Currency ↔ segment links (daily correlation, ~2y)</h3><div class='tblwrap'>{hm}</div>"
                f"<h3>S&amp;P 500 average return by calendar month (%)</h3><div class='seas'>{sbar}</div>"
                f"<p class='muted small'>Momentum persistence: IC {P.get('momentum', {}).get('avg_ic')} over {P.get('momentum', {}).get('months')} months · breadth {P.get('breadth_above_200d_pct')}% above 200-day</p>")

    def paper_section(self, ctx):
        eq = ctx.db.q("SELECT * FROM paper_equity ORDER BY date")
        if not eq:
            return "<p class='muted'>No paper trades yet. They start once a strategy is approved (step 6).</p>"
        by = {}
        for r in eq:
            by.setdefault(r["strategy"], []).append(r["value"])
        tr = ctx.db.q("SELECT * FROM trades ORDER BY id DESC LIMIT 25")
        rows = "".join(f"<tr><td>{stamp(t['ts'])}</td><td>{E(t['strategy'])}</td><td>{E(t['side'])}</td><td>{E(t['symbol'])}</td>"
                       f"<td>€{t['amount']:,.0f}</td><td>{t['price']:.2f}</td><td class='muted small'>{E(t['broker'])}</td></tr>" for t in tr)
        tiles = "".join(f"<div class='tile'><small>{E(k)}</small><b>€{v[-1]:,.0f}</b><span class='{cls(v[-1] - v[0])}'>{fmt((v[-1] / v[0] - 1) * 100)} since start</span>{spark(v, 120, 28)}</div>" for k, v in by.items())
        return f"<div class='tiles'>{tiles}</div><div class='tblwrap'><table><tr><th>Time</th><th>Strategy</th><th>Side</th><th>Symbol</th><th>Amount</th><th>Price</th><th>Broker</th></tr>{rows}</table></div>"


CSS = """
:root{--bg:#0f1115;--panel:#171a21;--line:#262a33;--text:#e7e9ee;--muted:#8b93a3}
@media (prefers-color-scheme: light){:root{--bg:#f6f7f9;--panel:#fff;--line:#e3e6eb;--text:#14171c;--muted:#5f6878}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,Segoe UI,Roboto,sans-serif}
.wrap{max-width:1300px;margin:0 auto;padding:16px}a{color:inherit}.muted{color:var(--muted)}.small{font-size:12px}
h1{margin:0;font-size:22px}h2{font-size:17px;margin:0 0 10px}h3{font-size:14px;margin:14px 0 6px}
nav{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}nav a{border:1px solid var(--line);border-radius:99px;padding:3px 10px;text-decoration:none;font-size:12px}
.banner{background:#8e4ec6;color:#fff;padding:8px 12px;border-radius:8px;margin:8px 0;font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px}.kpi b{font-size:22px;display:block}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin:12px 0}
.actions{list-style:none;padding:0;margin:0;display:grid;gap:8px}.actions li{padding:9px;border-radius:8px;border-left:4px solid}
.actions .red{border-color:#e5484d;background:rgba(229,72,77,.08)}.actions .amber{border-color:#f5a524;background:rgba(245,165,36,.08)}.actions .green{border-color:#30a46c}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(370px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;border-top:4px solid}
.card.red{border-top-color:#e5484d}.card.amber{border-top-color:#f5a524}.card.green{border-top-color:#30a46c}
summary{list-style:none;cursor:pointer}summary::-webkit-details-marker{display:none}
.ctop{display:flex;justify-content:space-between;align-items:center}.badge{color:#fff;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:600}
.row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.nums{display:grid;gap:2px;font-size:12px}.nums small{color:var(--muted);display:block}
.up{color:#30a46c}.dn{color:#e5484d}.tag{font-size:10px;border:1px solid var(--line);border-radius:4px;padding:0 4px;color:var(--muted)}
.ko{margin:6px 0;font-size:12px}.ko span{color:var(--muted)}.ko b{float:right}.track{height:6px;background:var(--line);border-radius:3px;margin-top:3px;overflow:hidden}.fill{height:100%}
.sum{margin:6px 0 0}.more{margin-top:8px;border-top:1px dashed var(--line);padding-top:8px}
.sub{font-weight:600;margin:10px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.news{list-style:none;padding:0;margin:0}.news li{padding:4px 0;border-bottom:1px solid var(--line)}.meta{display:block;color:var(--muted);font-size:11px}
.news .risk a{color:#e5484d}.news .good a{color:#30a46c}
.board{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:8px}
.agent{border:1px solid var(--line);border-left:4px solid #8b93a3;border-radius:8px;padding:8px;background:var(--panel)}
.agent.ok{border-left-color:#30a46c}.agent.warn{border-left-color:#f5a524}.agent.fail{border-left-color:#e5484d}.agent.skip{border-left-color:#8b93a3}
.ahead{display:flex;justify-content:space-between;gap:6px}.amsg{font-size:12px;margin-top:4px}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.tile{border:1px solid var(--line);border-radius:8px;padding:8px}.tile small,.tile span{display:block}.tile b{display:block}
table{width:100%;border-collapse:collapse;font-size:12px}td,th{padding:6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.tblwrap{overflow-x:auto}
.hm td{text-align:center;min-width:44px}.hm th{font-size:11px}
.seas{display:flex;gap:6px;align-items:flex-end;height:100px}.sb{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:36px}.sb div{width:22px;border-radius:3px}
.pmgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}.pm{border:1px solid var(--line);border-radius:8px;padding:8px}
.ins li{margin-bottom:8px}footer{color:var(--muted);font-size:11px;margin:20px 0}
@media (max-width:480px){.grid{grid-template-columns:1fr}}
"""

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agent Company</title><style>{css}</style></head><body><div class="wrap">
<h1>🏢 Agent Company — daily report</h1><div class="muted">Built {built} · run {run} · mode {mode} · {ai}</div>{demo}
<nav><a href="#act">⚡ Attention</a><a href="#pos">📊 Positions</a><a href="#macro">🌍 Macro</a><a href="#quant">🧪 Quant lab</a><a href="#paper">💼 Paper trading</a><a href="#radar">🎯 Radar</a><a href="#cal">📅 Calendar</a><a href="#board">🏢 Company board</a><a href="#data">🛰 Data</a></nav>
<div class="kpis"><div class="kpi"><small class="muted">Portfolio (config values)</small><b>€{tot}</b></div>
<div class="kpi" style="border-left:4px solid #e5484d"><small class="muted">🔴 Act now</small><b>{nred}</b><small>€{ered}</small></div>
<div class="kpi" style="border-left:4px solid #f5a524"><small class="muted">🟡 Watch</small><b>{namb}</b><small>€{eamb}</small></div>
<div class="kpi" style="border-left:4px solid #30a46c"><small class="muted">🟢 All good</small><b>{ngrn}</b></div>
<div class="kpi"><small class="muted">Market regime</small><b>{regime}</b></div></div>
<section class="panel" id="act"><h2>⚡ What needs your attention</h2><ul class="actions">{actions}</ul></section>
<h2 id="pos" style="margin-top:20px">📊 Positions</h2><div class="grid">{cards}</div>
<section class="panel" id="macro"><h2>🌍 Macro &amp; politics</h2><p>{macro_summary}</p><div class="tiles">{tiles}</div><h3>Themes (sourced)</h3><ul>{themes}</ul>
<h3>Prediction markets</h3><div class="pmgrid">{poly}</div></section>
<section class="panel" id="quant"><h2>🧪 Quant lab — what the backtests say</h2>{quant}</section>
<section class="panel" id="paper"><h2>💼 Paper trading (virtual money)</h2>{paper}</section>
<section class="panel" id="radar"><h2>🎯 Radar — names you traded before</h2><div class="tblwrap"><table><tr><th>Name</th><th>1d</th><th>1m</th><th>vs 52w high</th><th>Assessment</th></tr>{radar}</table></div></section>
<section class="panel" id="cal"><h2>📅 Event calendar</h2><div class="tblwrap"><table><tr><th>Date</th><th>Event</th><th>Source</th></tr>{events}</table></div></section>
<section class="panel" id="board"><h2>🏢 Company board — what each of the 20 agents did</h2><div class="board">{board}</div></section>
<section class="panel" id="data"><h2>🛰 Data health</h2><p>{audit}</p><ul class="small">{issues}</ul><div class="tblwrap"><table>{sources}</table></div></section>
<footer>Information only, not financial advice. Backtests are hypothetical; past patterns can stop working. Paper trading uses virtual money only — this software contains no real-money trading path.</footer>
</div></body></html>"""
