import React, { useState } from "react";
import { STOCK_CATALYST_WATCHLIST_DATA } from "../data/stockCatalystWatchlistData";
import { StockCatalystWatchlistItem } from "../types/marketIntelligenceTypes";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  Zap,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  Flame,
  Award,
  BarChart2,
  Activity,
  Shield
} from "lucide-react";

interface Props {
  isGrandpaMode: boolean;
  onSelectStock?: (ticker: string) => void;
  onOpenJargonModal: () => void;
}

export const StockEventsWatchlistTable: React.FC<Props> = ({
  isGrandpaMode,
  onSelectStock,
  onOpenJargonModal
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>("NVDA");
  const [activeTab, setActiveTab] = useState<"SCENARIOS" | "BACKTEST_PROOF" | "VOLATILITY_PARAMS">(
    "SCENARIOS"
  );

  const activeStock =
    STOCK_CATALYST_WATCHLIST_DATA.find((s) => s.ticker === selectedTicker) ||
    STOCK_CATALYST_WATCHLIST_DATA[0];

  return (
    <div
      id="stock-events-watchlist-panel"
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Panel Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xl border border-indigo-400/30 shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Upcoming Stock Catalysts & Sensitivity Reaction Coordinates
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-slate-950 font-mono">
                {activeStock.historicalAccuracyRatePct}% Empirical Accuracy
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Empirical price distributions conditioned on upside consensus beat vs. downside earnings miss
            </p>
          </div>
        </div>

        <button
          onClick={onOpenJargonModal}
          className="text-xs font-bold text-indigo-200 hover:text-white flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-indigo-300" />
          <span>Understanding Sensitivity Coordinates</span>
        </button>
      </div>

      {/* Stock Tickers Quick Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        {STOCK_CATALYST_WATCHLIST_DATA.map((item) => {
          const isSelected = item.ticker === selectedTicker;
          return (
            <button
              key={item.ticker}
              onClick={() => {
                setSelectedTicker(item.ticker);
                if (onSelectStock) onSelectStock(item.ticker);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-indigo-500/30"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs"
              }`}
            >
              <span>{item.flagEmoji}</span>
              <span>{item.ticker}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                ${item.currentPrice}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Stock Intelligence Card */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-6">
        {/* Top Active Stock Summary Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{activeStock.flagEmoji}</span>
              <h4 className="text-lg font-extrabold text-slate-900">
                {activeStock.name} ({activeStock.ticker})
              </h4>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {activeStock.currency} {activeStock.currentPrice}
              </span>
            </div>

            {/* Next Big Event */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Next Primary Catalyst:
              </span>
              <span className="font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                {activeStock.nextBigEventTitle}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {activeStock.nextEventDateCest} ({activeStock.daysUntilEvent} days remaining)
              </span>
              <span>&bull; Trading Session: {activeStock.germanTradingHours}</span>
            </div>
          </div>

          {/* Proven Backtest Badge */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center self-stretch sm:self-auto shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Verified Sample Accuracy</span>
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-1 font-mono">
              {activeStock.historicalAccuracyRatePct}%
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
              Across {activeStock.testedCatalystCount} audited past events
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("SCENARIOS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "SCENARIOS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Conditional Reaction Scenarios (Beat vs. Miss)</span>
          </button>

          <button
            onClick={() => setActiveTab("BACKTEST_PROOF")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "BACKTEST_PROOF"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Historical Backtest Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("VOLATILITY_PARAMS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "VOLATILITY_PARAMS"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Volatility Boundaries & Liquidity Levels</span>
          </button>
        </div>

        {/* Tab 1: If Beat vs If Miss Scenarios */}
        {activeTab === "SCENARIOS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
            {/* GREEN: IF BEAT SCENARIO */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>UPSIDE BEAT SCENARIO</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    Historical Win Rate: {activeStock.ifBeatScenario.winProbabilityPct}%
                  </span>
                </div>

                <p className="text-xs text-emerald-950 font-bold mt-2">
                  Condition: {activeStock.ifBeatScenario.conditionText}
                </p>

                <div className="mt-3 p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Expected Price Move:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {activeStock.ifBeatScenario.expectedMovePct}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Target Price Coordinate:</span>
                    <span className="font-black text-slate-900 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                      {activeStock.ifBeatScenario.targetPriceCoordinate}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed font-medium">
                  <span className="font-bold text-emerald-900 block mb-0.5">Scenario Strategy Playbook:</span>
                  {activeStock.ifBeatScenario.callKnockoutStrategy}
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-200/70 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>🟢 Upside Acceleration Zone</span>
                <span className="font-bold font-mono">Target: Upper Barrier TP1</span>
              </div>
            </div>

            {/* RED: IF MISS SCENARIO */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>DOWNSIDE MISS SCENARIO</span>
                  </span>
                  <span className="text-xs font-bold text-rose-800 font-mono">
                    Historical Reaction Probability: {activeStock.ifMissScenario.winProbabilityPct}%
                  </span>
                </div>

                <p className="text-xs text-rose-950 font-bold mt-2">
                  Condition: {activeStock.ifMissScenario.conditionText}
                </p>

                <div className="mt-3 p-3.5 bg-white rounded-xl border border-rose-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Expected Downside Move:</span>
                    <span className="font-bold text-rose-700 font-mono">
                      {activeStock.ifMissScenario.expectedMovePct}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Support Floor Coordinate:</span>
                    <span className="font-black text-slate-900 bg-rose-50 px-2 py-0.5 rounded font-mono">
                      {activeStock.ifMissScenario.targetPriceCoordinate}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed font-medium">
                  <span className="font-bold text-rose-900 block mb-0.5">Downside Mitigation Playbook:</span>
                  {activeStock.ifMissScenario.putKnockoutStrategy}
                </div>
              </div>

              <div className="pt-3 border-t border-rose-200/70 flex items-center justify-between text-xs text-rose-800 font-semibold">
                <span>🔴 Downside Liquidity Pool</span>
                <span className="font-bold font-mono">Support: Lower Floor S1</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Historical Backtest Proof Records */}
        {activeTab === "BACKTEST_PROOF" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Audited event history and actual market reaction for {activeStock.name}</span>
              <span className="font-bold text-slate-900 font-mono">N = {activeStock.pastProofRecords.length} Audited Events</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {activeStock.pastProofRecords.map((rec) => (
                <div key={rec.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{rec.eventDate}</span>
                      <span className="font-bold text-slate-900 text-xs">{rec.eventName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.didForecastProveCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {rec.didForecastProveCorrect ? "PROVEN HIT" : "MISSED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{rec.actualEventOutcome}</p>
                    <p className="text-[11px] text-slate-500 italic">{rec.proofScoreNote}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Actual Price Response</span>
                    <span
                      className={`text-sm font-black font-mono ${
                        rec.actualMarketReactionPct.startsWith("+")
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {rec.actualMarketReactionPct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Volatility & Barrier Parameters */}
        {activeTab === "VOLATILITY_PARAMS" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Support Floor Zone</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                ${(activeStock.currentPrice * 0.94).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500">6% below current price with buffer against spike risk.</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
              <span className="text-xs font-bold text-indigo-700 uppercase">Primary Reaction Target</span>
              <div className="text-xl font-extrabold text-indigo-700 font-mono">
                ${activeStock.ifBeatScenario.targetPriceCoordinate.replace("$", "")}
              </div>
              <p className="text-[11px] text-indigo-600">Expected post-beat expansion cluster.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase">Historical Accuracy</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono">
                {activeStock.historicalAccuracyRatePct}%
              </div>
              <p className="text-[11px] text-emerald-600">Cross-validated across {activeStock.testedCatalystCount} previous catalyst cycles.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
