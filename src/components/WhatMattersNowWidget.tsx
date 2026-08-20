import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Clock,
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  Radio,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface WhatMattersNowProps {
  onSelectEventId?: (id: string) => void;
}

export const WhatMattersNowWidget: React.FC<WhatMattersNowProps> = ({ onSelectEventId }) => {
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 42, seconds: 18 });
  const [notificationActive, setNotificationActive] = useState(false);

  // Live countdown clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const crossAssetQuotes = [
    { symbol: "NQ (Nasdaq-100)", val: "19,842.50", chg: "+0.48%", positive: true, delta: "+94.5" },
    { symbol: "SPX (S&P 500)", val: "5,548.20", chg: "+0.32%", positive: true, delta: "+17.6" },
    { symbol: "US 2Y Yield", val: "4.625%", chg: "+2.4 bps", positive: false, delta: "+0.024" },
    { symbol: "US 10Y Yield", val: "4.218%", chg: "-1.2 bps", positive: true, delta: "-0.012" },
    { symbol: "USD Index (DXY)", val: "104.18", chg: "+0.15%", positive: false, delta: "+0.16" },
    { symbol: "VIX Volatility", val: "14.82", chg: "-4.2%", positive: true, delta: "-0.65" },
  ];

  return (
    <section
      id="ferrp-what-matters-now"
      aria-label="What Matters Now - Instant Situational Awareness"
      className="bg-white border-2 border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                What Matters Now
              </h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE RADAR SYNC</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Instant macroeconomic situational awareness & upcoming high-impact catalysts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Macro Regime:</span>
          <span className="bg-slate-100 text-slate-800 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
            Higher for Longer &bull; Normal Vol (VIX 14.8)
          </span>
          <button
            id="btn-do-not-miss-alert"
            onClick={() => setNotificationActive(!notificationActive)}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 border text-[11px] transition-all cursor-pointer ${
              notificationActive
                ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <Bell className="w-3 h-3 text-amber-600" />
            <span>{notificationActive ? "T-60m Alert Armed" : "Arm Countdown Alert"}</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 Pillars (Next Major Event, One-Line Causal Take, Cross-Asset Reaction) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pillar 1: Imminent Catalyst & Countdown (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Critical Tier-1
                </span>
                <span className="text-[11px] text-slate-300 font-mono">14:30 CET / 08:30 ET</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight pt-1">
                US Core CPI Inflation (MoM / YoY)
              </h3>
              <p className="text-xs text-indigo-200/80">
                Consensus: <strong>3.1% YoY</strong> (Prev: 3.4%) &bull; Est. Move: <strong>±0.85% NQ</strong>
              </p>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Impact Score</div>
              <div className="text-xl font-mono font-black text-amber-400">92 / 100</div>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="mt-4 pt-3 border-t border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300 font-medium">Countdown to Release:</span>
            </div>
            <div className="flex items-center space-x-1 font-mono text-sm font-black text-emerald-400 bg-black/40 px-3 py-1 rounded-lg border border-indigo-500/30">
              <span>{String(countdown.hours).padStart(2, "0")}h</span>
              <span>:</span>
              <span>{String(countdown.minutes).padStart(2, "0")}m</span>
              <span>:</span>
              <span className="text-white">{String(countdown.seconds).padStart(2, "0")}s</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Plain-English Causal Thesis & Evidence (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Causal Attribution Thesis</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Verified Engine
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              A <strong>hotter print (&gt;3.2%)</strong> immediately transmits via front-end <strong>2Y yields (+8 to +14bp)</strong>, driving discount rate multiple contraction on tech. A <strong>dovish print (&le;3.0%)</strong> unlocks duration multiple expansion.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary Transmission Channel:</span>
            <span className="font-mono font-bold text-slate-800">2Y Yield &rarr; NQ Multiples</span>
          </div>
        </div>

        {/* Pillar 3: Sensitivity Speedometer (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Move Probabilities</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">60m Window</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">P(|&Delta;NQ| &gt; 0.25%):</span>
                <strong className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">88%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">P(|&Delta;NQ| &gt; 0.50%):</span>
                <strong className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">64%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">P(|&Delta;NQ| &gt; 1.00%):</span>
                <strong className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">31%</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-400 font-mono">
            Derived from 8 KNN historical analogs
          </div>
        </div>
      </div>

      {/* Cross-Asset Reaction Pulse Strip */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-sans">
            Live Cross-Asset Pulse & Confirmation Panel
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Updated: Real-Time Tick &bull; Multi-Asset Coherence: <strong className="text-emerald-600 font-bold">CONFIRMED</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {crossAssetQuotes.map((q) => (
            <div
              key={q.symbol}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between"
            >
              <span className="text-[10px] text-slate-500 font-medium truncate">{q.symbol}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono font-bold text-slate-900 text-xs">{q.val}</span>
                <span
                  className={`font-mono font-bold text-[11px] flex items-center ${
                    q.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {q.positive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {q.chg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
