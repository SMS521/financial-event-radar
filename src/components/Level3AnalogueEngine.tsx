import React, { useState, useEffect, useRef } from "react";
import { MarketEvent, HistoricalAnalogue, AnalogueStats, AssetSymbol } from "../types";
import {
  Database,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Filter,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Level3Props {
  currentEvent: MarketEvent;
  analogs: HistoricalAnalogue[];
  stats: AnalogueStats;
}

const SCRUBBER_STEPS = [
  { label: "T-15m", minute: -15, milestone: "Pre-Release Regime & Range Coiling" },
  { label: "T-5m", minute: -5, milestone: "Pre-Release Orderbook Thinning" },
  { label: "T0", minute: 0, milestone: "Direct Bureau Release (<140ms Algo Ingest)" },
  { label: "T+1m", minute: 1, milestone: "Algorithmic Price Discovery & Spread Shock" },
  { label: "T+5m", minute: 5, milestone: "2Y Yield Shock & Cross-Asset Confirmation" },
  { label: "T+15m", minute: 15, milestone: "Institutional Valuation Multiple Adjustment" },
  { label: "T+30m", minute: 30, milestone: "Mid-Horizon Liquidity Normalization" },
  { label: "T+60m", minute: 60, milestone: "Statistical Equilibrium & Day Horizon State" },
];

export const Level3AnalogueEngine: React.FC<Level3Props> = ({ currentEvent, analogs, stats }) => {
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>("NQ");
  const [selectedHorizon, setSelectedHorizon] = useState<"5m" | "15m" | "60m" | "1d">("60m");

  // Replay Mode State
  const [isReplayActive, setIsReplayActive] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrubIndex, setScrubIndex] = useState<number>(4); // Default at T+5m
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x

  const currentStep = SCRUBBER_STEPS[scrubIndex] || SCRUBBER_STEPS[4];

  // Auto-play timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = Math.max(250, 1500 / playbackSpeed);
      timer = setInterval(() => {
        setScrubIndex((prev) => {
          if (prev >= SCRUBBER_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const assetList: { symbol: AssetSymbol; label: string; type: string }[] = [
    { symbol: "NQ", label: "Nasdaq-100", type: "Equity Index" },
    { symbol: "SPX", label: "S&P 500", type: "Equity Index" },
    { symbol: "DAX", label: "DAX 40", type: "European Equity" },
    { symbol: "NIKKEI", label: "Nikkei 225", type: "Asian Equity" },
    { symbol: "HSI", label: "Hang Seng", type: "Asian Equity" },
    { symbol: "KOSPI", label: "KOSPI 200", type: "Asian Equity" },
    { symbol: "TREASURY_2Y", label: "US 2Y Yield", type: "Rates (bps)" },
    { symbol: "TREASURY_10Y", label: "US 10Y Yield", type: "Rates (bps)" },
    { symbol: "USD_DXY", label: "USD Index (DXY)", type: "Currency" },
    { symbol: "VIX", label: "VIX Volatility", type: "Volatility" },
    { symbol: "WTI_OIL", label: "WTI Crude", type: "Commodity" },
    { symbol: "GOLD", label: "Gold", type: "Precious Metals" },
  ];

  // Helper to interpolate return of an event at a given minute step
  const getEventReactionAtStep = (event: MarketEvent, asset: AssetSymbol, minute: number): number => {
    const rx = event.reactions?.[asset];
    if (!rx) return 0;
    if (minute <= -5) return 0;
    if (minute === 0) return 0;
    if (minute <= 1) return rx["1m"] ?? rx["5m"] * 0.3;
    if (minute <= 5) return rx["5m"] ?? 0;
    if (minute <= 15) return rx["15m"] ?? rx["5m"];
    if (minute <= 30) return rx["30m"] ?? (rx["15m"] + rx["60m"]) / 2;
    return rx["60m"] ?? rx["15m"];
  };

  const currentAssetActiveReturn = getEventReactionAtStep(currentEvent, selectedAsset, currentStep.minute);
  const isRates = selectedAsset === "TREASURY_2Y" || selectedAsset === "TREASURY_10Y";
  const unit = isRates ? "bps" : "%";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
            LEVEL 3
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider font-sans">
            Historical Analogue Engine & Replay Timeline Lab
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-sans text-slate-500">
          <span>Formula:</span>
          <code className="text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-mono">
            P(R_t+h | S_t, E_t, X_t)
          </code>
        </div>
      </div>

      {/* Top Quantitative Evidence Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            Historical Analogues
          </span>
          <div className="text-2xl font-mono font-extrabold text-indigo-600">
            {stats.count}
          </div>
          <span className="text-[10px] text-slate-400 font-sans">Matched in archive</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            Median 60m Return (NQ)
          </span>
          <div className={`text-2xl font-mono font-extrabold flex items-center ${stats.median_60m >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {stats.median_60m >= 0 ? <ArrowUpRight className="w-5 h-5 mr-0.5" /> : <ArrowDownRight className="w-5 h-5 mr-0.5" />}
            <span>{stats.median_60m > 0 ? "+" : ""}{stats.median_60m.toFixed(2)}%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">Mean: {stats.mean_60m > 0 ? "+" : ""}{stats.mean_60m.toFixed(2)}%</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            Probability P(R &gt; +0.25%)
          </span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600">
            {(stats.prob_up_25 * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-400 font-sans">P(R &gt; +0.50%): {(stats.prob_up_50 * 100).toFixed(0)}%</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            Probability P(R &lt; -0.25%)
          </span>
          <div className="text-2xl font-mono font-extrabold text-rose-600">
            {(stats.prob_down_25 * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-400 font-sans">P(R &lt; -0.50%): {(stats.prob_down_50 * 100).toFixed(0)}%</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            IQR [25% - 75%] Range
          </span>
          <div className="text-xs font-mono font-bold text-slate-800 mt-1">
            [{stats.iqr_25_75[0] > 0 ? "+" : ""}{stats.iqr_25_75[0].toFixed(2)}%, {stats.iqr_25_75[1] > 0 ? "+" : ""}{stats.iqr_25_75[1].toFixed(2)}%]
          </div>
          <span className="text-[10px] text-slate-400 font-sans">&sigma; = {stats.std_dev_60m.toFixed(2)}%</span>
        </div>

        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[10px] font-sans font-bold uppercase text-slate-500 block mb-1">
            Statistical t-Stat
          </span>
          <div className="text-2xl font-mono font-extrabold text-indigo-600">
            {stats.t_statistic.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-sans">p = {stats.p_value.toFixed(3)} {stats.p_value < 0.05 ? "(Sig)" : "(Null)"}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ANIMATED REPLAY MODE TIMELINE LAB (Powered by motion)                     */}
      {/* ========================================================================= */}
      <section
        aria-label="Replay Mode Timeline"
        className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white font-sans">
                  Interactive Horizon Replay Lab &bull; &plusmn;60m Window Scrub
                </h3>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  {selectedAsset}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Scrub through point-in-time ticks from T-15m through T+60m post-release
              </p>
            </div>
          </div>

          {/* Replay Controls: Play/Pause, Reset, Speed */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Pause" : "Play Replay"}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setScrubIndex(2); // T0
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="Reset to T0 Release"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Multiplier */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-mono font-bold">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Reaction Readout at Scrubber Index */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {/* Current Milestone */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Scrub Timestamp & Milestone
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono font-black text-indigo-400">
                {currentStep.label}
              </span>
              <span className="text-xs text-slate-300 font-medium truncate">
                {currentStep.milestone}
              </span>
            </div>
          </div>

          {/* Active Event Reaction */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Active Event {selectedAsset} Response
            </span>
            <motion.div
              key={`${currentStep.minute}-${selectedAsset}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-lg font-mono font-black ${
                currentAssetActiveReturn > 0
                  ? isRates
                    ? "text-rose-400"
                    : "text-emerald-400"
                  : currentAssetActiveReturn < 0
                  ? isRates
                    ? "text-emerald-400"
                    : "text-rose-400"
                  : "text-slate-300"
              }`}
            >
              {currentAssetActiveReturn > 0 ? "+" : ""}
              {currentAssetActiveReturn.toFixed(2)}
              {unit}
            </motion.div>
          </div>

          {/* Analogue Median at this minute */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Historical Analogs (k={analogs.length}) Median
            </span>
            <div className="text-lg font-mono font-bold text-slate-300">
              {stats.median_60m > 0 ? "+" : ""}
              {(stats.median_60m * (currentStep.minute <= 0 ? 0 : currentStep.minute / 60)).toFixed(2)}
              {unit}
            </div>
          </div>
        </div>

        {/* Animated Multi-Path Trajectory Visualization using SVG & motion */}
        <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>T-15m (Pre-Release)</span>
            <span className="text-amber-400 font-bold">T0 Release</span>
            <span>T+60m (Post-Release)</span>
          </div>

          {/* SVG Animated Graph */}
          <div className="h-32 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
              {/* Zero Equilibrium line */}
              <line x1="0" y1="60" x2="700" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              {/* T0 marker vertical line */}
              <line x1="200" y1="0" x2="200" y2="120" stroke="#6366f1" strokeDasharray="2 2" strokeWidth="1.5" />

              {/* Ghost Paths for Matching Historical Analogs */}
              {analogs.slice(0, 5).map((a, i) => {
                const rx = a.event.reactions?.[selectedAsset] || { "5m": 0, "15m": 0, "60m": 0 };
                const y0 = 60;
                const y1 = 60 - rx["5m"] * 25;
                const y2 = 60 - rx["15m"] * 25;
                const y3 = 60 - rx["60m"] * 25;
                const pathD = `M 0 60 L 200 60 Q 280 ${y1}, 380 ${y2} T 700 ${y3}`;

                return (
                  <path
                    key={a.event.event_id}
                    d={pathD}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.2"
                    strokeOpacity={0.4}
                  />
                );
              })}

              {/* Active Event Reaction Path */}
              {(() => {
                const rx = currentEvent.reactions?.[selectedAsset] || { "5m": 0, "15m": 0, "60m": 0 };
                const y0 = 60;
                const y1 = 60 - (rx["5m"] || 0) * 35;
                const y2 = 60 - (rx["15m"] || 0) * 35;
                const y3 = 60 - (rx["60m"] || 0) * 35;
                const mainPath = `M 0 60 L 200 60 Q 280 ${y1}, 380 ${y2} T 700 ${y3}`;

                // Calculate current tracer point on path based on scrubIndex
                const progressFraction = scrubIndex / (SCRUBBER_STEPS.length - 1);
                const currentX = progressFraction * 700;
                const currentY =
                  currentStep.minute <= 0
                    ? 60
                    : currentStep.minute <= 5
                    ? 60 - (rx["5m"] || 0) * 35 * (currentStep.minute / 5)
                    : currentStep.minute <= 15
                    ? y1 + (y2 - y1) * ((currentStep.minute - 5) / 10)
                    : y2 + (y3 - y2) * ((currentStep.minute - 15) / 45);

                return (
                  <>
                    <motion.path
                      d={mainPath}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                    />
                    {/* Glowing animated tracer bead */}
                    <circle cx={currentX} cy={currentY} r="6" fill="#6366f1" className="animate-pulse" />
                    <circle cx={currentX} cy={currentY} r="3" fill="#ffffff" />
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Interactive Scrub Range Input */}
          <div className="mt-4 space-y-2">
            <input
              type="range"
              min={0}
              max={SCRUBBER_STEPS.length - 1}
              step={1}
              value={scrubIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setScrubIndex(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              aria-label="Timeline scrubber"
            />

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              {SCRUBBER_STEPS.map((step, idx) => (
                <button
                  key={step.label}
                  onClick={() => {
                    setIsPlaying(false);
                    setScrubIndex(idx);
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                    scrubIndex === idx
                      ? "text-indigo-300 font-bold bg-indigo-500/20 border border-indigo-500/30"
                      : "hover:text-slate-200"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Matching Analogues List + 12-Asset Cross-Market Reaction Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Top Matching Historical Observations (k=topK) */}
        <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-sans font-bold uppercase text-slate-700 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Top Historical Analogues (KNN Search)</span>
            </span>
            <span className="text-[10px] font-sans text-slate-400">
              Matched on [Z, VIX, 10Y, Regime]
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
            {analogs.map((item, idx) => {
              const past = item.event;
              const nq60m = past.reactions.NQ["60m"];
              const isBullish = nq60m >= 0;
              return (
                <div
                  key={past.event_id}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 font-sans">
                          #{idx + 1} {past.event_type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {past.scheduled_ts.slice(0, 10)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-sans">
                        Surprise: <strong className="font-mono text-slate-700 font-semibold">{past.standardized_surprise > 0 ? "+" : ""}{past.standardized_surprise.toFixed(1)}&sigma;</strong> &bull; VIX: <span className="font-mono">{past.market_state.vix_level.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`font-bold text-sm ${isBullish ? "text-emerald-600" : "text-rose-600"}`}>
                        {isBullish ? "+" : ""}{nq60m.toFixed(2)}%
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">
                        NQ 60m Return
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans text-slate-500">
                    <span className="flex items-center space-x-1">
                      <span>Sim Score:</span>
                      <strong className="text-indigo-600 font-mono font-bold">{(item.similarity_score * 100).toFixed(0)}%</strong>
                    </span>
                    <span>2Y: <strong className={past.reactions.TREASURY_2Y["60m"] <= 0 ? "text-emerald-600 font-mono" : "text-rose-600 font-mono"}>{past.reactions.TREASURY_2Y["60m"]}bp</strong></span>
                    <span>USD: <strong className={past.reactions.USD_DXY["60m"] <= 0 ? "text-emerald-600 font-mono" : "text-rose-600 font-mono"}>{past.reactions.USD_DXY["60m"]}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 12-Asset Cross-Market Reaction Matrix across 1m, 5m, 15m, 30m, 60m, 1d */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-4 border border-slate-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <span className="text-xs font-sans font-bold uppercase text-slate-700 flex items-center space-x-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>12-Asset Cross-Market Reaction Matrix (Sample Medians)</span>
            </span>

            <div className="flex items-center space-x-1">
              {(["5m", "15m", "60m", "1d"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedHorizon === h
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {assetList.map((asset) => {
              const medians = stats.cross_asset_medians[asset.symbol] || { "5m": 0, "15m": 0, "60m": 0, "1d": 0 };
              const currentVal = currentEvent.reactions[asset.symbol]?.[selectedHorizon] ?? medians[selectedHorizon];
              const isRatesAsset = asset.symbol === "TREASURY_2Y" || asset.symbol === "TREASURY_10Y";
              const isPositive = currentVal > 0;
              const valUnit = isRatesAsset ? "bps" : "%";

              return (
                <div
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`bg-white p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    selectedAsset === asset.symbol
                      ? "border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {asset.symbol.replace("TREASURY_", "")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedHorizon}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mb-1.5 font-sans">
                    {asset.label}
                  </div>

                  <div className={`text-base font-mono font-extrabold ${isPositive ? (isRatesAsset ? "text-rose-600" : "text-emerald-600") : currentVal === 0 ? "text-slate-500" : (isRatesAsset ? "text-emerald-600" : "text-rose-600")}`}>
                    {currentVal > 0 ? "+" : ""}{currentVal.toFixed(2)}{valUnit}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between">
                    <span>Analogue:</span>
                    <span className="font-semibold text-slate-600">{medians[selectedHorizon] > 0 ? "+" : ""}{medians[selectedHorizon]?.toFixed(2)}{valUnit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Horizon Progression for Selected Asset */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-sans font-bold text-indigo-700">
                Temporal Progression: {selectedAsset} Response Path
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1m &rarr; 5m &rarr; 15m &rarr; 30m &rarr; 60m &rarr; 1d</span>
            </div>

            <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono">
              {(["1m", "5m", "15m", "30m", "60m", "1d"] as const).map((h) => {
                const r = currentEvent.reactions[selectedAsset]?.[h] ?? 0;
                const isRatesAsset = selectedAsset === "TREASURY_2Y" || selectedAsset === "TREASURY_10Y";
                const valUnit = isRatesAsset ? "bp" : "%";
                return (
                  <div key={h} className="bg-slate-50 px-2 py-2 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-sans block">{h}</span>
                    <strong className={`font-bold ${r > 0 ? (isRatesAsset ? "text-rose-600" : "text-emerald-600") : r < 0 ? (isRatesAsset ? "text-emerald-600" : "text-rose-600") : "text-slate-600"}`}>
                      {r > 0 ? "+" : ""}{r.toFixed(2)}{valUnit}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
