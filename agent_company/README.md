# 🏢 Agent Company — your 20-agent research & paper-trading team

Runs on your Windows PC with **nothing to install** (it brings its own portable Python).
Real money is never touched: the code has **no real-money trading path**.

```
                         ┌──────────────────────┐
                         │ 1 CEO / Orchestrator │  timetable + gates
                         └──┬───────┬────────┬──┘
   ┌────────────────────────┘       │        └─────────────────────────┐
   ▼                                ▼                                  ▼
 DATA DEPT (⚙)              RESEARCH DESK (🧠/⚙)                 QUANT LAB (⚙/🧠)
 3 Price Engineer            7 Energy & Industrials              15 Pattern Researcher
 4 FX & Macro Engineer       8 Semis & AI                        16 Backtester
 5 Event Clerk               9 US Indices & ETFs                 17 Devil's Advocate
 6 Data Auditor ── GATE ──▶ 10 Asia & FX                              │
                            11 Commodities & Crypto                    │
                            12 Social Sentiment                        │
                            13 Prediction Markets                      │
                            14 Macro & Politics                        │
                            18 Fact Checker ──────┐                    │
                                                  ▼                    ▼
                                      2 CHIEF RISK OFFICER  (VETO power)
                                                  │
                              ┌───────────────────┴────────────────┐
                              ▼                                    ▼
                      19 Paper Trader (DEMO only)          20 Reporter → dashboard + 7:30 email
```
⚙ = plain code (free, same every time) · 🧠 = uses Claude when `ANTHROPIC_API_KEY` is set, rules otherwise.

## Step by step (do them in order, each is a double-click)

| Step | File | What you should see | Needs |
|---|---|---|---|
| 1 | `1 SETUP + SELF-TEST.bat` | Downloads portable Python once, runs 21 offline tests → **SELF-TEST PASSED ✅** | internet once |
| 2 | `2 DEMO - whole company offline.bat` | All 20 agents run on *simulated* data → dashboard opens (purple DEMO banner) | nothing |
| 3 | `3 PROBE - which websites and keys work.bat` | ✅/❌ list: Yahoo, Stooq, ECB, Google News, Reddit, StockTwits, Polymarket, Nasdaq, eToro, Anthropic | — |
| 4 | `4 COLLECT 5-YEAR DATA.bat` | ~100 symbols + 11 currency pairs, 6 years daily → `data\market.db` | internet |
| 5 | `5 BACKTEST - quant lab.bat` | Strategy leaderboard, equity curves, FX heat-map, verdicts | step 4 |
| 6 | `6 RESEARCH - news and analysts.bat` | 🔴🟡🟢 per position with sourced, timestamped notes | internet |
| 7 | `7 NIGHT RUN - everything.bat` | Steps 4+5+6 + risk + report (+ email if Gmail set) | — |
| 8 | `8 PAPER TRADE - one session.bat` | Virtual orders for approved strategies | step 5 |
| 9 | `9 SCHEDULE ON (nightly + daily).bat` | Night run 22:30 daily, paper session 15:45 Mon–Fri, hidden | — |

Extras: `EDIT KEYS.bat` · `OPEN DASHBOARD.bat` · `STATUS - what is in the database.bat` ·
`STOP TRADING (kill switch).bat` · `9 SCHEDULE OFF.bat`

## Data you get

| Already inside the zip (`data\starter.db`, loaded on first run) | Collected by step 4 on your PC |
|---|---|
| 28 currency pairs daily since **1971** (USD/INR, USD/JPY, EUR/USD, GBP/USD, KRW, TWD, SGD, CNY…) | ~100 core symbols × up to 30 years daily (Yahoo → Stooq → eToro fallback) |
| VIX daily since 1990 · Brent/WTI since 1986 · US gas since 1997 | all ~500 **S&P 500** stocks × 12 years (closing prices only, to save space) |
| S&P 500 monthly since 1871 · gold since 1833 · US 10y yield · US CPI | refreshed nightly (only the newest days are downloaded) |

Storage is compact: one SQLite file, integer dates/prices, ~18 bytes per price row
(≈4.5× smaller than a plain table). Expect 30–50 MB in total. `python -m company.cli pack` shrinks it; it also runs monthly.

## Keys (all optional — `EDIT KEYS.bat`)

| Key | Turns on | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | 🧠 AI analysts, macro economist, pattern explanations, fact checker | rule-based versions run instead |
| `ETORO_API_KEY` + `ETORO_USER_KEY` (**demo** user key) | orders mirrored to your eToro **virtual** account; eToro candles as data fallback | local paper ledger only |
| `GMAIL_ADDRESS` + `GMAIL_APP_PASSWORD` | 7:30 email from this PC | dashboard file only |

Keys live in `secrets\keys.txt` on your PC only. Never paste them in chat or email.

## Your controls (all plain text, edit with Notepad)

| File | What you control |
|---|---|
| `config\portfolio.json` | your positions (update after trading) + radar watchlist |
| `config\universe.json` | the 90-symbol research universe, currencies, macro tiles |
| `config\risk.json` | position/segment limits, knock-out minimum, paper capital, max trade size, loss stop |
| `config\strategies.json` | which strategies are tested and their parameter grids |
| `config\settings.json` | email address, AI model and call budget, news window |

## Safety design
- **Gates:** no research/trading on bad data (Data Auditor) · no paper trade without Devil's Advocate + Risk Officer approval.
- **Honest backtests:** parameters picked on old data only, judged on the last unseen year; a test proves strategies never see future prices.
- **Kill switch:** `STOP TRADING (kill switch).bat` creates `STOP_TRADING.txt`; delete it to resume.
- **No real money:** eToro config only contains `/demo/` trading paths, and a test fails if that ever changes.

## If something goes wrong
Look at `reports\company.log` and `reports\probe.txt`, or the "Company board" and "Data health" sections of the dashboard.
Send those to Claude.

> Information only, not financial advice. Backtests are hypothetical; patterns can stop working.
