# 📡 Portfolio Radar — start here

```
 ┌──────────── NIGHT (cloud, 22:30 → 07:30) ────────────┐        ┌──────── YOUR PC ────────┐
 │ 5 research agents + verifier agents (≥ €1,000 pos.)  │        │ double-click            │
 │ news · earnings · management · politics · Reddit ·   │──────▶ │  "Radar NIGHT REPORT"   │
 │ StockTwits · Polymarket · ETF holdings · knock-outs  │ email  │   → night dashboard     │
 │        ↓                                             │ 07:30  │                         │
 │ 📧 email to you with summary + dashboard.html        │        │  "Radar LIVE"           │
 └──────────────────────────────────────────────────────┘        │   → fresh scan now      │
                                                                 └─────────────────────────┘
```

## 1. Install on your PC (2 minutes, no admin rights)

| Step | Do this |
|---|---|
| 1 | Download `PortfolioRadar.zip` and right-click → **Extract All** to e.g. `Documents\PortfolioRadar` |
| 2 | Double-click **`Radar LIVE.vbs`** |
| 3 | Wait ~1–2 min. First time only, it downloads portable Python (~10 MB) into the folder. Nothing is installed. |
| 4 | Your browser opens the dashboard. Nothing else appears on screen. |

If your company blocks `.vbs` files, use **`Radar LIVE (if vbs blocked).bat`** (shows a small minimised window).

## 2. The two buttons

| File | What it does | Speed |
|---|---|---|
| `Radar NIGHT REPORT.vbs` | Opens the report from the night run (newest `dashboard*.html` you saved from the 7:30 email into Downloads) | instant |
| `Radar LIVE.vbs` | Tests 32 finance sites in the background, then scans prices, news, Reddit, StockTwits, X mirrors, Polymarket, earnings dates — right now | 1–2 min |

## 3. Reading the dashboard

| Light | Meaning |
|---|---|
| 🔴 **Act / pay attention** | near knock-out, big leveraged loss, cluster of bad news |
| 🟡 **Watch** | earnings soon, big move, crowd turning bearish, some bad news |
| 🟢 **All good** | no warning signal found |

Every news line has a **source, date & time (UTC)** and a link. Click a card to open the details.
The red dashed **KO** line in a chart is the turbo's knock-out level.

## 4. When you trade
Edit `config\portfolio.json` (Notepad is fine): change `qty` / `value_eur`, add or remove positions.
Copy an existing line for the format. Ask Claude to do it for you from a new Trade Republic export.

## 5. Troubleshooting
- Nothing opens → open `logs_last_run.txt` / `logs_setup.txt`.
- Dashboard "Data sources" section shows ❌ → that site is blocked on your network; the night email still covers it.
- Python download blocked → ask Claude; alternative is copying a portable Python folder from home into `python\`.

> Information only, not financial advice. Signals are rules + research, not guarantees.
