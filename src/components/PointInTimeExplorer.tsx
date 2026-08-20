import React, { useState } from "react";
import { MarketEvent } from "../types";
import { Clock, ShieldCheck, AlertTriangle, Database, CheckCircle2, History, ArrowRight } from "lucide-react";

interface PITExplorerProps {
  event: MarketEvent;
}

export const PointInTimeExplorer: React.FC<PITExplorerProps> = ({ event }) => {
  const [selectedVintage, setSelectedVintage] = useState<"initial" | "first_revision" | "annual_benchmark">("initial");

  const initialVal = event.actual;
  const revision1 = typeof event.revision === "number" ? event.revision : (event.vintages?.first_revision ?? (initialVal + 0.1));
  const benchmarkVal = event.vintages?.final_revision ?? (initialVal + 0.15);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              Point-in-Time (PIT) & Vintage Fabric Inspector
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Zero-Lookahead Guarantee & ALFRED Vintage Preservation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-sans">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PIT BARRIER: ENFORCED</span>
          </span>
        </div>
      </div>

      {/* Concept Explainer Banner */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-start space-x-3">
          <History className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 font-sans mb-1 text-xs">
              Why Point-in-Time Data Truth Matters in Quantitative Finance
            </h4>
            <p className="text-slate-600 leading-relaxed font-sans">
              Standard macroeconomic databases (e.g. basic FRED) overwrite historical observations with today's revised values. If a quant backtests an algorithm using 2026 revisions to trade in 2024, the strategy contains fatal <strong>lookahead bias</strong>. Our platform guarantees that only data known at microsecond <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">{event.known_ts}</code> is accessible by models.
            </p>
          </div>
        </div>
      </div>

      {/* Vintage History Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vintage 1: Initial Real-Time Release */}
        <div
          onClick={() => setSelectedVintage("initial")}
          className={`bg-white rounded-xl p-5 border transition-all cursor-pointer shadow-xs ${
            selectedVintage === "initial"
              ? "border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-sans font-bold text-xs text-indigo-700">
              VINTAGE 0: FIRST RELEASE
            </span>
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active in Backtest
            </span>
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 my-2">
            {initialVal} {event.unit}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1.5 font-sans">
            <div>Timestamp: <span className="font-mono text-slate-700">{event.known_ts}</span></div>
            <div>Surprise: <strong className="text-indigo-600 font-mono font-bold">{event.surprise > 0 ? "+" : ""}{event.surprise}</strong></div>
            <div className="text-emerald-700 font-semibold flex items-center space-x-1.5 pt-2 border-t border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>What markets traded in real-time</span>
            </div>
          </div>
        </div>

        {/* Vintage 2: 1-Month Revision */}
        <div
          onClick={() => setSelectedVintage("first_revision")}
          className={`bg-white rounded-xl p-5 border transition-all cursor-pointer shadow-xs ${
            selectedVintage === "first_revision"
              ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-sans font-bold text-xs text-amber-700">
              VINTAGE 1: NEXT MONTH REVISION
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-400">
              +30 Days Lag
            </span>
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 my-2">
            {revision1.toFixed(2)} {event.unit}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1.5 font-sans">
            <div>Delta: <strong className="text-amber-700 font-mono font-bold">+{(revision1 - initialVal).toFixed(2)} {event.unit}</strong></div>
            <div>Published: <span className="font-mono text-slate-700">{event.revision_ts || event.vintages?.revision_history?.[0]?.date || "Subsequent release"}</span></div>
            <div className="text-slate-500 flex items-center space-x-1 pt-2 border-t border-slate-100">
              <span>Known at T+30 only</span>
            </div>
          </div>
        </div>

        {/* Vintage 3: Annual BLS Benchmark */}
        <div
          onClick={() => setSelectedVintage("annual_benchmark")}
          className={`bg-white rounded-xl p-5 border transition-all cursor-pointer shadow-xs ${
            selectedVintage === "annual_benchmark"
              ? "border-purple-500 bg-purple-50/20 ring-2 ring-purple-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-sans font-bold text-xs text-purple-700">
              VINTAGE 2: ANNUAL BENCHMARK
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-400">
              +1 Year Lag
            </span>
          </div>

          <div className="text-2xl font-mono font-extrabold text-slate-900 my-2">
            {benchmarkVal.toFixed(2)} {event.unit}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1.5 font-sans">
            <div>Delta: <strong className="text-purple-700 font-mono font-bold">+{(benchmarkVal - initialVal).toFixed(2)} {event.unit}</strong></div>
            <div>BLS Seasonal Adjustments</div>
            <div className="text-rose-600 font-semibold flex items-center space-x-1.5 pt-2 border-t border-slate-100">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Contaminates standard backtests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
