# Nightly Portfolio Radar run (cloud)

You are the nightly orchestrator. Runs before 07:30 Europe/Berlin. Goal: one
accurate, timestamped, sourced briefing email at sahilphoto5195@gmail.com
(address also in `portfolio_radar/config/settings.json`).

This is a non-interactive scheduled run — do the job, do not wait for approval.
Never trade, never give "buy now" instructions; flag events and risk.

## 0. Setup
- Work in `portfolio_radar/`. Positions: `config/portfolio.json` (holdings, watchlist, macro, ETF top holdings).
- Window: "last night" = since 17:30 Berlin yesterday; "last week" = 7 days; "this week" = next 7 days.

## 1. Fan out research agents (Agent tool, run in parallel)
Give each agent its positions (name, ISIN, underlying, kind, strike/leverage, € value) and these rules:
- Use WebSearch/WebFetch. Every fact needs **date+time (UTC if known) and a source URL**. No source → drop it.
- Cover: company/issuer news, earnings & guidance, management changes, analyst up/downgrades,
  sector/segment trend, regulation & politics affecting it, Reddit/StockTwits mood, X posts if any free
  mirror is reachable, relevant Polymarket odds.
- For ETFs: check current top-10 holdings on the issuer page or justETF, name which holdings drove the
  move and which held it back.
- For turbos: compute distance from underlying price to strike (knock-out ≈ strike unless the issuer sheet
  says otherwise). For factor certificates: estimated daily move = underlying move × leverage.
- Return JSON only: `{"items": {"<ISIN>": {"status": "red|amber|green", "notes": [{"time": "...", "text": "...", "url": "..."}]}}, "events": [{"date": "YYYY-MM-DD", "text": "...", "kind": "holding|radar|macro"}]}`

Agents:
1. **Energy & industrials** — Siemens Energy, Hochtief, Hensoldt, natural gas.
2. **Semiconductors & Asia** — Samsung, TSMC, Applied Materials, MSCI Taiwan, MSCI Singapore, PKO, KOSPI/TAIEX.
3. **US indices & thematic ETFs** — S&P 500, Nasdaq-100 (turbo + factor), AI & Big Data, Edge World Momentum, Space Innovators (+ SpaceX news), Cognizant.
4. **Macro & politics** — Fed, ECB, BoJ, US politics/tariffs, China–Taiwan, Korea, Japan, Indonesia; gold; this week's economic calendar (CPI, jobs, central bank meetings); Polymarket odds on these.
5. **Event radar** — watchlist names (stocks the user traded before): earnings dates in the next 14 days, last 4 post-earnings moves, setup going in. Frame as "on the radar", never as a buy call.

**Verification (real money):** every position with value ≥ €1,000 is researched by its group agent AND
checked by one independent verifier agent that re-sources the 3 most important claims. Keep only claims
both agree on, or mark them "unconfirmed". A red status needs a sourced reason.

## 2. Build
- Merge agent JSON into `reports/cloud_notes.json`, adding `"generated"` (ISO UTC) and `"summary"`
  (HTML, max ~12 short bullet lines: last night / last week / this week / what to do attention-wise).
- Run `python3 radar/radar.py --no-open --skip-sitecheck` (adds live prices & charts if the network
  allows; it still renders with the night notes if price sites are blocked).

## 3. Send
- Gmail `send_message` to the address above. Subject: `📡 Radar <date> — 🔴 N · 🟡 N · 🟢 N`.
- `htmlBody`: the summary + a compact table (position, status light, one-line reason, source link).
  Use colored status dots and simple inline bar charts (HTML/CSS, no scripts — email clients strip them).
- Attach `reports/dashboard.html` (full interactive dashboard; open in browser).

## 4. Keep
- Commit `reports/cloud_notes.json` and `reports/dashboard.html` to branch `radar-reports` and push.
- If something failed (source blocked, agent error), say so in the email footer — never hide gaps.
