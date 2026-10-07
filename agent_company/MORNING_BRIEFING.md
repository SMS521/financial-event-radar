# ☀️ Morning briefing — what was built overnight

## 1. What you have

```
AgentCompany.zip (5 MB)  ──extract──▶  double-click the steps 1 → 9 in order
   20 agents · 21 self-tests · offline DEMO · 60-day trading REPLAY · step launchers · scheduler
```

| Built & tested ✅ | Built, can only be tested on your PC ⚠️ |
|---|---|
| All 20 agents + CEO pipelines with gates | Portable-Python download on your company network |
| 5-year data collector (Yahoo → Stooq → eToro fallback; ECB FX since 1999) | Real website access (this cloud machine is blocked from all finance sites) |
| Research desk (AI or rules) + fact checker that drops unsourced claims | Real Claude answers (no API key here; tested with a simulated AI and against the real API with a fake key) |
| Quant lab: 5 strategy families, unseen-year test, leverage/decay test, FX heat-map, seasonality, momentum | eToro **demo** orders (request shapes tested with a mock; endpoints partly community-documented) |
| Risk Officer veto, kill switch, stale-data refusal, demo-only eToro paths | Gmail sending from your PC |
| Paper trading: 60-day replay → 359 buys / 326 sells, equity tracked | Windows Task Scheduler setup (step 9) |
| Dashboard (positions, macro, quant, paper, radar, calendar, company board, data health) | |

## 2. Your morning, step by step (~30 min)

| # | Do | Expect | If it fails |
|---|---|---|---|
| 1 | `1 SETUP + SELF-TEST.bat` | "SELF-TEST PASSED ✅" | send `logs\setup.txt` |
| 2 | `2 DEMO …` | dashboard with purple DEMO banner | send `reports\company.log` |
| 3 | `3 PROBE …` | ✅/❌ per website — tells us what your network allows | send `reports\probe.txt` |
| 4 | `4 COLLECT 5-YEAR DATA` | `STATUS.bat` shows ~110 series × ~1,500 days | ❌ sites → we switch sources |
| 5 | `5 BACKTEST` | strategy table with verdicts on **real** data | — |
| 6 | `EDIT KEYS.bat` → add keys you have | `3 PROBE` again shows ✅ for them | — |
| 7 | `7 NIGHT RUN` once by hand | full report (+ email if Gmail set) | — |
| 8 | `8 PAPER TRADE` | virtual orders, eToro demo if keys | `STOP TRADING.bat` anytime |
| 9 | `9 SCHEDULE ON` | runs nightly 22:30, paper session 15:45 Mon–Fri | `9 SCHEDULE OFF` |

## 3. What you can backtest (edit `config\strategies.json`)

| Strategy | Idea in one line | Good for |
|---|---|---|
| `trend_sma` | hold while above N-day average | avoiding big crashes |
| `vol_target_trend` | trend + smaller size when wild | smoother ride |
| `dual_momentum` | monthly: top-K strongest, only if rising | your "AI/semis" style universe |
| `rsi2_reversion` | buy sharp dips in uptrends, sell bounce | short swings |
| `breakout` | buy new N-day highs, exit on N-day lows | big trends (gold/silver runs) |
| leverage test 1x/3x/5x | same strategy as a daily-reset Faktor product | **shows the decay that hurt your 5–8x products** |

Questions to answer with real data this week:
1. Would `trend_sma` have kept you out of your worst leveraged losses?
2. Does momentum work on *your* names (Pattern Researcher IC > 0.03)?
3. Which currency moves with your Asia/semis positions (heat-map), and does it lead by a day?
4. At what leverage does each strategy stop making money (the 1x/3x/5x column)?

## 4. Honest caveats
- Demo numbers are **simulated** — don't read anything into them.
- Strategies "approved" on 5 years can still fail; with 18 combinations tried, one looking good can be luck. That's why paper trading comes first, for weeks.
- eToro demo trading endpoints: verify with step 3 + one manual €50 demo order before scheduling.
- Corporate proxies needing a login may block Python even when the browser works — step 3 will show it.
- Information only, not financial advice.

## 5. Still open from before
- Cloud 7:30 email (no PC needed): change the environment's **Network access** setting, then tell Claude "network done".
- `portfolio_radar\` (the simpler radar) still works; Agent Company supersedes it.
