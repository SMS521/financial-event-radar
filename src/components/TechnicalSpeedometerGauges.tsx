import React, { useState } from "react";
import { SPEEDOMETER_DATA_STORE } from "../data/speedometerData";
import { TimeframeId, MarketDirection } from "../types/marketIntelligenceTypes";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Globe,
  FileText,
  Compass,
  BarChart3
} from "lucide-react";

interface Props {
  isGrandpaMode: boolean;
  selectedAssetSymbol?: string;
  onOpenJargonModal: () => void;
}

const TIMEFRAME_OPTIONS: { id: TimeframeId; label: string; period: string }[] = [
  { id: "1m", label: "1 Min", period: "Scalp" },
  { id: "5m", label: "5 Min", period: "Micro" },
  { id: "15m", label: "15 Min", period: "Intraday" },
  { id: "30m", label: "30 Min", period: "Session" },
  { id: "1h", label: "Hourly", period: "Swing" },
  { id: "5h", label: "5 Hours", period: "Multi-Session" },
  { id: "1D", label: "Daily", period: "Primary" },
  { id: "1W", label: "Weekly", period: "Macro" },
  { id: "1M", label: "Monthly", period: "Secular" }
];

export const TechnicalSpeedometerGauges: React.FC<Props> = ({
  isGrandpaMode,
  selectedAssetSymbol = "SILVER",
  onOpenJargonModal
}) => {
  const [activeAsset, setActiveAsset] = useState<string>(
    SPEEDOMETER_DATA_STORE[selectedAssetSymbol] ? selectedAssetSymbol : "SILVER"
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeId>("1h");
  const [showIndicatorDetails, setShowIndicatorDetails] = useState<boolean>(false);

  const assetData = SPEEDOMETER_DATA_STORE[activeAsset] || SPEEDOMETER_DATA_STORE["SILVER"] || SPEEDOMETER_DATA_STORE["NQ"];
  const currentTfData = assetData.timeframes[selectedTimeframe] || assetData.timeframes["1h"];

  // Helper to format market direction in objective, compliant terminology
  const getDirectionBadge = (dir: MarketDirection) => {
    switch (dir) {
      case "STRONG_BUY":
        return {
          label: "Strong Bullish Momentum",
          shortLabel: "Bullish Trend",
          bg: "bg-emerald-600 text-white",
          border: "border-emerald-700",
          lightBg: "bg-emerald-50 text-emerald-800 border border-emerald-200",
          colorHex: "#10b981",
          gaugeText: "STRONG BULLISH"
        };
      case "BUY":
        return {
          label: "Bullish Momentum",
          shortLabel: "Moderate Bull",
          bg: "bg-emerald-500 text-white",
          border: "border-emerald-600",
          lightBg: "bg-emerald-50 text-emerald-800 border border-emerald-200",
          colorHex: "#059669",
          gaugeText: "BULLISH BIAS"
        };
      case "NEUTRAL":
        return {
          label: "Neutral / Range Consolidation",
          shortLabel: "Neutral Range",
          bg: "bg-slate-500 text-white",
          border: "border-slate-600",
          lightBg: "bg-slate-100 text-slate-700 border border-slate-200",
          colorHex: "#64748b",
          gaugeText: "NEUTRAL / FLAT"
        };
      case "SELL":
        return {
          label: "Bearish Momentum",
          shortLabel: "Moderate Bear",
          bg: "bg-rose-500 text-white",
          border: "border-rose-600",
          lightBg: "bg-rose-50 text-rose-800 border border-rose-200",
          colorHex: "#f43f5e",
          gaugeText: "BEARISH BIAS"
        };
      case "STRONG_SELL":
        return {
          label: "Strong Bearish Pressure",
          shortLabel: "Bearish Trend",
          bg: "bg-rose-600 text-white",
          border: "border-rose-700",
          lightBg: "bg-rose-50 text-rose-800 border border-rose-200",
          colorHex: "#e11d48",
          gaugeText: "STRONG BEARISH"
        };
    }
  };

  // Convert score (-100 to +100) to gauge rotation degrees (-80 to +80 deg)
  const scoreToAngle = (score: number): number => {
    const clamped = Math.max(-100, Math.min(100, score));
    return (clamped / 100) * 80;
  };

  const badge = getDirectionBadge(currentTfData.summaryDirection);

  return (
    <div
      id="technical-speedometer-panel"
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Top Asset & Timeframe Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {assetData.flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {assetData.name}
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-slate-900 text-white">
                  {assetData.symbol}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {assetData.change24h}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
                <span className="font-bold text-slate-900 font-mono text-sm">{assetData.currentPrice}</span>
                <span>&bull;</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  {assetData.marketHoursStatus || "Active Global Market"}
                </span>
              </p>
            </div>
          </div>

          {/* Asset Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-xs flex-wrap">
            {Object.keys(SPEEDOMETER_DATA_STORE).map((key) => {
              const item = SPEEDOMETER_DATA_STORE[key];
              const isSelected = activeAsset === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveAsset(key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <span className="mr-1">{item.flagEmoji}</span>
                  <span>{item.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Timeframe Selector Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Multi-Timeframe Horizon Analysis
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Select horizon to inspect mathematical momentum & fundamental news drivers
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {TIMEFRAME_OPTIONS.map((tf) => {
              const dataForTf = assetData.timeframes[tf.id] || assetData.timeframes["1h"];
              const isSelected = selectedTimeframe === tf.id;
              const tfBadge = getDirectionBadge(dataForTf.summaryDirection);

              return (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {tf.label}
                  </span>
                  <span className={`text-[10px] font-medium ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {tf.period}
                  </span>
                  <span
                    className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isSelected ? "bg-white/20 text-white" : tfBadge.lightBg
                    }`}
                  >
                    {tfBadge.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Speedometers & Quantitative Meters */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Quantitative Momentum & Technical Gauges ({currentTfData.label})</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregating 12 Moving Averages, 8 Statistical Oscillators, and Real-Time Order Flow
            </p>
          </div>

          <button
            onClick={onOpenJargonModal}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-colors w-fit"
          >
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Plain-English Glossary</span>
          </button>
        </div>

        {/* 3 Speedometer Gauges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Gauge 1: Oscillators */}
          <div className="flex flex-col items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Technical Oscillators
            </span>

            <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <path d="M 20 100 A 80 80 0 0 1 52 44" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                <path d="M 56 40 A 80 80 0 0 1 85 24" fill="none" stroke="#f97316" strokeWidth="14" />
                <path d="M 90 22 A 80 80 0 0 1 110 22" fill="none" stroke="#94a3b8" strokeWidth="14" />
                <path d="M 115 24 A 80 80 0 0 1 144 40" fill="none" stroke="#84cc16" strokeWidth="14" />
                <path d="M 148 44 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />

                <g
                  transform={`rotate(${scoreToAngle(currentTfData.technicalIndicators.score)}, 100, 100)`}
                  className="transition-transform duration-700 ease-out"
                >
                  <polygon points="97,100 103,100 101,26 99,26" fill="#1e293b" />
                  <circle cx="100" cy="100" r="8" fill="#0f172a" />
                  <circle cx="100" cy="100" r="3" fill="#ffffff" />
                </g>
              </svg>
            </div>

            <div className="mt-2 text-center">
              <span className="text-sm font-extrabold text-slate-800">
                {currentTfData.technicalIndicators.direction === "STRONG_BUY"
                  ? "Strong Bullish Signal"
                  : currentTfData.technicalIndicators.direction === "BUY"
                  ? "Bullish Indicator Bias"
                  : currentTfData.technicalIndicators.direction === "NEUTRAL"
                  ? "Neutral / Balanced"
                  : currentTfData.technicalIndicators.direction === "SELL"
                  ? "Bearish Indicator Bias"
                  : "Strong Bearish Signal"}
              </span>
              <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-slate-600 font-medium">
                <span className="text-rose-600 font-bold font-mono">Bear: {currentTfData.technicalIndicators.sellCount}</span>
                <span className="text-slate-500 font-bold font-mono">Neutral: {currentTfData.technicalIndicators.neutralCount}</span>
                <span className="text-emerald-600 font-bold font-mono">Bull: {currentTfData.technicalIndicators.buyCount}</span>
              </div>
            </div>
          </div>

          {/* Gauge 2: Central SUMMARY Gauge */}
          <div className="flex flex-col items-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 rounded-full text-[10px] font-mono font-bold tracking-wider">
              {currentTfData.label} COMPASS
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Composite Directional Compass
            </span>

            <div className="relative w-52 h-28 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <path d="M 20 100 A 80 80 0 0 1 52 44" fill="none" stroke="#f43f5e" strokeWidth="16" strokeLinecap="round" />
                <path d="M 56 40 A 80 80 0 0 1 85 24" fill="none" stroke="#fb923c" strokeWidth="16" />
                <path d="M 90 22 A 80 80 0 0 1 110 22" fill="none" stroke="#64748b" strokeWidth="16" />
                <path d="M 115 24 A 80 80 0 0 1 144 40" fill="none" stroke="#4ade80" strokeWidth="16" />
                <path d="M 148 44 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="round" />

                <g
                  transform={`rotate(${scoreToAngle(currentTfData.summaryScore)}, 100, 100)`}
                  className="transition-transform duration-700 ease-out"
                >
                  <polygon points="96,100 104,100 102,22 98,22" fill="#ffffff" />
                  <circle cx="100" cy="100" r="9" fill="#10b981" />
                  <circle cx="100" cy="100" r="4" fill="#0f172a" />
                </g>
              </svg>
            </div>

            <div className="mt-3 text-center">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500 text-slate-950 shadow-md">
                {badge.gaugeText}
              </div>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                Score: <strong className="text-white font-mono">{currentTfData.summaryScore > 0 ? `+${currentTfData.summaryScore}` : currentTfData.summaryScore}/100</strong> &bull; Modeled Outlook
              </p>
            </div>
          </div>

          {/* Gauge 3: Moving Averages */}
          <div className="flex flex-col items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Moving Average Trends
            </span>

            <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <path d="M 20 100 A 80 80 0 0 1 52 44" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                <path d="M 56 40 A 80 80 0 0 1 85 24" fill="none" stroke="#f97316" strokeWidth="14" />
                <path d="M 90 22 A 80 80 0 0 1 110 22" fill="none" stroke="#94a3b8" strokeWidth="14" />
                <path d="M 115 24 A 80 80 0 0 1 144 40" fill="none" stroke="#84cc16" strokeWidth="14" />
                <path d="M 148 44 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" />

                <g
                  transform={`rotate(${scoreToAngle(currentTfData.movingAverages.score)}, 100, 100)`}
                  className="transition-transform duration-700 ease-out"
                >
                  <polygon points="97,100 103,100 101,26 99,26" fill="#1e293b" />
                  <circle cx="100" cy="100" r="8" fill="#0f172a" />
                  <circle cx="100" cy="100" r="3" fill="#ffffff" />
                </g>
              </svg>
            </div>

            <div className="mt-2 text-center">
              <span className="text-sm font-extrabold text-slate-800">
                {currentTfData.movingAverages.direction === "STRONG_BUY"
                  ? "Strong Bullish MA Alignment"
                  : currentTfData.movingAverages.direction === "BUY"
                  ? "Bullish Trend Stacking"
                  : currentTfData.movingAverages.direction === "NEUTRAL"
                  ? "Neutral Moving Averages"
                  : currentTfData.movingAverages.direction === "SELL"
                  ? "Bearish Trend Stacking"
                  : "Strong Bearish MA Alignment"}
              </span>
              <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-slate-600 font-medium">
                <span className="text-rose-600 font-bold font-mono">Bear: {currentTfData.movingAverages.sellCount}</span>
                <span className="text-slate-500 font-bold font-mono">Neutral: {currentTfData.movingAverages.neutralCount}</span>
                <span className="text-emerald-600 font-bold font-mono">Bull: {currentTfData.movingAverages.buyCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fundamental Driver & News Catalyst Deep Dive ("WHY is it moving?") */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h5 className="font-bold text-sm tracking-tight text-white">
                Underlying Fundamental, News & Mathematical Rationale ({currentTfData.label} Horizon)
              </h5>
            </div>
            <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              AUDITED BACKTEST DATA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Fundamental Context */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                <Globe className="w-3.5 h-3.5" />
                <span>1. Fundamental Macro Context</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-normal">
                {currentTfData.fundamentalContext ||
                  "Global macroeconomic monetary flows and orderbook imbalances driving baseline trend."}
              </p>
            </div>

            {/* News Catalyst */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <FileText className="w-3.5 h-3.5" />
                <span>2. Concrete News Catalyst</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-normal">
                {currentTfData.newsCatalystDriver ||
                  "Recent economic release consensus alignment driving algorithmic and institutional positioning."}
              </p>
            </div>

            {/* Mathematical / Statistical Edge */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>3. Mathematical & Volatility Model</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-normal">
                {currentTfData.mathReasoning ||
                  "Empirical standard deviation channels confirming statistical continuation probability."}
              </p>
            </div>
          </div>

          {/* Plain-English Scenario Note */}
          <div className="pt-2 border-t border-slate-800 text-xs flex items-start gap-2.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">FERRP Research Takeaway: </strong>
              {currentTfData.plainEnglishAdvice || currentTfData.plainGermanAdvice}
            </p>
          </div>
        </div>

        {/* Volatility Sensitivity Coordinates & Target Zones */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Volatility Reaction Boundaries & Sensitivity Levels</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                  {currentTfData.label} Focus
                </span>
              </h5>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Empirical support/resistance coordinates where institutional liquidity pools typically concentrate during economic releases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-indigo-200/80">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Dynamic Support
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {currentTfData.volatilityActionPlan?.supportBarrier ||
                  currentTfData.knockoutActionPlan?.callSafeBarrier ||
                  currentTfData.pivotPoints.classic.s1}
              </span>
            </div>
            <div className="w-px h-8 bg-indigo-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-800 block">
                Primary Target (TP1)
              </span>
              <span className="text-sm font-extrabold text-indigo-700 font-mono">
                {currentTfData.volatilityActionPlan?.targetZone1 ||
                  currentTfData.knockoutActionPlan?.targetExitCoordinate1 ||
                  currentTfData.pivotPoints.classic.r1}
              </span>
            </div>
            <div className="w-px h-8 bg-indigo-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                Extension Target (TP2)
              </span>
              <span className="text-sm font-extrabold text-emerald-700 font-mono">
                {currentTfData.volatilityActionPlan?.targetZone2 ||
                  currentTfData.knockoutActionPlan?.targetExitCoordinate2 ||
                  currentTfData.pivotPoints.classic.r2}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Detailed Indicator & Pivot Table */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setShowIndicatorDetails(!showIndicatorDetails)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            {showIndicatorDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Hide Indicator Details & Pivot Grid</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>View Full Indicator Table (RSI, MACD, Stochastic, Classic & Fibonacci Pivots)</span>
              </>
            )}
          </button>

          <span className="text-xs text-slate-400 font-mono font-medium">
            Volatility Model: {currentTfData.volatilityActionPlan?.volatilityRange || "Standard Normal"}
          </span>
        </div>

        {/* Expanded Technical Details Table */}
        {showIndicatorDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200 pt-2">
            {/* Technical Oscillators */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h6 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide flex items-center justify-between">
                <span>Oscillator Readings ({currentTfData.label})</span>
                <span className="text-[10px] text-slate-500 font-mono">8 Core Indicators</span>
              </h6>
              <div className="space-y-2 text-xs">
                {currentTfData.technicalIndicators.details.map((ind, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <span className="font-semibold text-slate-800">{ind.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-mono font-bold">{ind.value}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ind.action === "BUY"
                            ? "bg-emerald-100 text-emerald-800"
                            : ind.action === "SELL"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ind.action === "BUY" ? "BULLISH" : ind.action === "SELL" ? "BEARISH" : "NEUTRAL"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pivot Points */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h6 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide flex items-center justify-between">
                <span>Pivot Reaction Levels (Classic & Fibonacci)</span>
                <span className="text-[10px] text-slate-500 font-mono">Floor/Ceiling Grid</span>
              </h6>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Resistance R2 / R1</span>
                  <span className="font-bold text-emerald-600 font-mono block">R2: {currentTfData.pivotPoints.classic.r2}</span>
                  <span className="font-bold text-emerald-700 font-mono block">R1: {currentTfData.pivotPoints.classic.r1}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Central Pivot Point</span>
                  <span className="font-extrabold text-indigo-600 text-base font-mono block mt-1">
                    {currentTfData.pivotPoints.classic.p}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                    Support Zones (S1 / S2 / S3)
                  </span>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-rose-600 font-mono">S1: {currentTfData.pivotPoints.classic.s1}</span>
                    <span className="font-bold text-rose-700 font-mono">S2: {currentTfData.pivotPoints.classic.s2}</span>
                    <span className="font-bold text-rose-800 font-mono">S3: {currentTfData.pivotPoints.classic.s3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regulatory & Risk Disclaimer */}
        <div className="p-3.5 bg-slate-100/90 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-700">Regulatory Non-Advisory Notice: </strong>
            FERRP provides macroeconomic event intelligence, algorithmic momentum speedometers, and backtested scenario coordinates for research and educational purposes only. FERRP does not issue buy or sell recommendations, personalized investment advice, or financial management services.
          </p>
        </div>
      </div>
    </div>
  );
};
