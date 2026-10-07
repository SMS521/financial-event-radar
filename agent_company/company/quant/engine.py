"""Backtest engine (pure Python, no numpy so it runs on portable Python).

Convention: a weight decided at the close of day t earns day t+1's return.
That one-day lag is what keeps the test honest (no look-ahead)."""
import math
import statistics as st


# ---------------------------------------------------------------- data shaping
def build_matrix(db, symbols, calendar_symbol=None, start=None):
    """Forward-filled close matrix on a common calendar.
    Returns dates, symbols_kept, C (T x S, None before a symbol's first price)."""
    series = {s: dict(db.series(s, start)) for s in symbols}
    series = {s: v for s, v in series.items() if len(v) > 60}
    if not series:
        return [], [], []
    if calendar_symbol and calendar_symbol in series:
        dates = sorted(series[calendar_symbol])
    else:
        allv = {}
        for v in series.values():
            for d in v:
                allv[d] = allv.get(d, 0) + 1
        need = max(1, len(series) // 3)
        dates = sorted(d for d, n in allv.items() if n >= need)
    syms = sorted(series)
    C, last = [], {s: None for s in syms}
    for d in dates:
        row = []
        for s in syms:
            v = series[s].get(d)
            if v is not None:
                last[s] = v
            row.append(last[s])
        C.append(row)
    return dates, syms, C


def returns(C):
    T, S = len(C), len(C[0]) if C else 0
    R = [[0.0] * S for _ in range(T)]
    for t in range(1, T):
        for s in range(S):
            a, b = C[t - 1][s], C[t][s]
            R[t][s] = (b / a - 1) if (a and b) else 0.0
    return R


def sma(col, n):
    out, acc = [None] * len(col), 0.0
    q = []
    for i, v in enumerate(col):
        if v is None:
            q, acc = [], 0.0
            continue
        q.append(v)
        acc += v
        if len(q) > n:
            acc -= q.pop(0)
        if len(q) == n:
            out[i] = acc / n
    return out


def rsi(col, n=2):
    out = [None] * len(col)
    up = dn = None
    for i in range(1, len(col)):
        if col[i] is None or col[i - 1] is None:
            continue
        ch = col[i] - col[i - 1]
        g, l = max(ch, 0), max(-ch, 0)
        if up is None:
            up, dn = g, l
        else:
            up = (up * (n - 1) + g) / n
            dn = (dn * (n - 1) + l) / n
        out[i] = 100.0 if dn == 0 else 100 - 100 / (1 + up / dn)
    return out


def rolling_max(col, n):
    return [max(v for v in col[max(0, i - n):i] if v is not None) if i >= n and all(
        v is not None for v in col[i - n:i]) else None for i in range(len(col))]


def rolling_min(col, n):
    return [min(v for v in col[max(0, i - n):i] if v is not None) if i >= n and all(
        v is not None for v in col[i - n:i]) else None for i in range(len(col))]


def realized_vol(rcol, n=20):
    out = [None] * len(rcol)
    for i in range(n, len(rcol)):
        w = rcol[i - n + 1:i + 1]
        out[i] = st.pstdev(w) * math.sqrt(252)
    return out


# ---------------------------------------------------------------- strategies -> weights
def _cols(C):
    return [[row[s] for row in C] for s in range(len(C[0]))]


def w_trend_sma(C, R, n=200, **_):
    T, S = len(C), len(C[0])
    W = [[0.0] * S for _ in range(T)]
    for s, col in enumerate(_cols(C)):
        m = sma(col, n)
        for t in range(T):
            if m[t] is not None and col[t] > m[t]:
                W[t][s] = 1.0 / S
    return W


def w_vol_target_trend(C, R, n=200, target_vol=0.15, **_):
    T, S = len(C), len(C[0])
    W = w_trend_sma(C, R, n)
    for s in range(S):
        vol = realized_vol([R[t][s] for t in range(T)])
        for t in range(T):
            if W[t][s] and vol[t]:
                W[t][s] *= min(1.5, target_vol / max(vol[t], 1e-4))
    return _cap(W)


def w_rsi2_reversion(C, R, entry=10, exit_sma=5, **_):
    T, S = len(C), len(C[0])
    W = [[0.0] * S for _ in range(T)]
    for s, col in enumerate(_cols(C)):
        r2, m200, mx = rsi(col, 2), sma(col, 200), sma(col, exit_sma)
        on = False
        for t in range(T):
            if col[t] is None or m200[t] is None:
                on = False
                continue
            if not on and r2[t] is not None and r2[t] < entry and col[t] > m200[t]:
                on = True
            elif on and mx[t] is not None and col[t] > mx[t]:
                on = False
            W[t][s] = 1.0 / S if on else 0.0
    return W


def w_breakout(C, R, entry=55, exit=20, **_):
    T, S = len(C), len(C[0])
    W = [[0.0] * S for _ in range(T)]
    for s, col in enumerate(_cols(C)):
        hi, lo = rolling_max(col, entry), rolling_min(col, exit)
        on = False
        for t in range(T):
            if col[t] is None:
                continue
            if not on and hi[t] is not None and col[t] >= hi[t]:
                on = True
            elif on and lo[t] is not None and col[t] <= lo[t]:
                on = False
            W[t][s] = 1.0 / S if on else 0.0
    return W


def w_dual_momentum(C, R, lookback=126, top=5, rebalance=21, **_):
    T, S = len(C), len(C[0])
    W = [[0.0] * S for _ in range(T)]
    cur = [0.0] * S
    for t in range(T):
        if t >= lookback and t % rebalance == 0:
            scores = []
            for s in range(S):
                a, b = C[t - lookback][s], C[t][s]
                if a and b:
                    scores.append((b / a - 1, s))
            scores.sort(reverse=True)
            picks = [s for sc, s in scores[:top] if sc > 0]   # absolute momentum filter
            cur = [0.0] * S
            for s in picks:
                cur[s] = 1.0 / top
        W[t] = list(cur)
    return W


def w_buy_hold(C, R, **_):
    T, S = len(C), len(C[0])
    return [[(1.0 / S if C[t][s] else 0.0) for s in range(S)] for t in range(T)]


def _cap(W):
    for row in W:
        tot = sum(row)
        if tot > 1:
            for i in range(len(row)):
                row[i] /= tot
    return W


STRATEGIES = {
    "trend_sma": w_trend_sma,
    "vol_target_trend": w_vol_target_trend,
    "rsi2_reversion": w_rsi2_reversion,
    "breakout": w_breakout,
    "dual_momentum": w_dual_momentum,
}

EXPLAIN = {
    "trend_sma": "Hold a stock only while its price is above its N-day average; otherwise cash.",
    "vol_target_trend": "Trend rule, but position size shrinks when the stock gets wild (risk-balanced).",
    "rsi2_reversion": "Buy short sharp dips in stocks that are in a long-term uptrend; sell on the bounce.",
    "breakout": "Buy when price makes a new N-day high; sell on a new shorter-term low (turtle-style).",
    "dual_momentum": "Each month hold the top-K strongest stocks of the last N days, only if they are rising.",
    "buy_hold": "Equal money in every stock, never trade (benchmark).",
}


# ---------------------------------------------------------------- simulation & metrics
def simulate(W, R, cost_bps=15):
    """Daily portfolio returns, turnover-based costs, per-symbol trade P&L."""
    T, S = len(W), len(W[0]) if W else 0
    port, trades = [0.0] * T, []
    entry_val = [None] * S
    held = [1.0] * S
    for t in range(1, T):
        prev = W[t - 1]
        gross = sum(prev[s] * R[t][s] for s in range(S))
        turn = sum(abs(W[t][s] - prev[s]) for s in range(S)) if t < T - 1 else 0.0
        port[t] = gross - turn * cost_bps / 1e4
        for s in range(S):
            if prev[s] > 0:
                held[s] *= 1 + R[t][s]
            if prev[s] == 0 and W[t][s] > 0:
                entry_val[s], held[s] = 1.0, 1.0
            elif prev[s] > 0 and W[t][s] == 0 and entry_val[s] is not None:
                trades.append(held[s] - 1)
                entry_val[s] = None
    exposure = sum(1 for t in range(T) if sum(W[t]) > 0.01) / max(T, 1)
    return port, trades, exposure


def leverage(rets, L, fin_rate=0.05):
    """Daily-reset leverage (how Faktor certificates work), incl. financing."""
    return [max(-1.0, L * r - (L - 1) * fin_rate / 252) for r in rets]


def metrics(rets, trades=None, exposure=None):
    rets = [r for r in rets if r is not None]
    n = len(rets)
    if n < 20:
        return {}
    eq, peak, mdd = 1.0, 1.0, 0.0
    for r in rets:
        eq *= 1 + r
        peak = max(peak, eq)
        mdd = min(mdd, eq / peak - 1)
    yrs = n / 252
    cagr = eq ** (1 / yrs) - 1 if eq > 0 else -1.0
    sd = st.pstdev(rets)
    sharpe = (st.mean(rets) / sd * math.sqrt(252)) if sd > 0 else 0.0
    out = {"total_return_pct": round((eq - 1) * 100, 1), "cagr_pct": round(cagr * 100, 1),
           "vol_pct": round(sd * math.sqrt(252) * 100, 1), "sharpe": round(sharpe, 2),
           "max_drawdown_pct": round(mdd * 100, 1),
           "calmar": round(cagr / abs(mdd), 2) if mdd < 0 else None, "days": n}
    if trades is not None:
        out["trades"] = len(trades)
        out["win_rate_pct"] = round(100 * sum(1 for x in trades if x > 0) / len(trades), 1) if trades else None
        out["avg_trade_pct"] = round(100 * st.mean(trades), 2) if trades else None
    if exposure is not None:
        out["exposure_pct"] = round(exposure * 100)
    return out


def equity_curve(rets, points=160):
    eq, out = 1.0, []
    for r in rets:
        eq *= 1 + r
        out.append(eq)
    step = max(1, len(out) // points)
    return [round(v, 4) for v in out[::step]]


def grid(params):
    keys = list(params)
    combos = [{}]
    for k in keys:
        combos = [dict(c, **{k: v}) for c in combos for v in params[k]]
    return combos


def run_family(name, C, R, grid_params, oos_days=252, cost_bps=15):
    """Fit params on in-sample only, then score the chosen params out-of-sample."""
    fn = STRATEGIES[name]
    split = max(260, len(C) - oos_days)
    results = []
    for p in grid(grid_params):
        W = fn(C, R, **p)
        port, trades, expo = simulate(W, R, cost_bps)
        results.append({"params": p, "port": port, "trades": trades, "exposure": expo,
                        "is": metrics(port[:split], trades, expo), "oos": metrics(port[split:])})
    results.sort(key=lambda x: x["is"].get("sharpe", -9), reverse=True)
    best = results[0]
    sh = [r["is"].get("sharpe", 0) for r in results]
    fragility = 0.0
    if len(sh) > 1 and best["is"].get("sharpe", 0) > 0:
        fragility = round((sh[0] - st.median(sh)) / abs(sh[0]), 2)
    return best, results, fragility, split
