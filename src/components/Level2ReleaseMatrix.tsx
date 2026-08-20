import React from "react";
import { MarketEvent } from "../types";
import { Gauge, Layers, AlertOctagon, CheckCircle2, Sliders, Info, Zap } from "lucide-react";

interface Level2Props {
  event: MarketEvent;
}

export const Level2ReleaseMatrix: React.FC<Level2Props> = ({ event }) => {
  const zScore = event.standardized_surprise;
  const isDovishOrPositive = zScore < 0; // for CPI, lower than expected is dovish (bullish for risk)
  const isContaminated = event.confounding.is_contaminated;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-mono font-bold">
            LEVEL 2
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
            Release Shock & Multidimensional Vector Matrix
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-sans font-semibold flex items-center space-x-1.5 ${
              isContaminated
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {isContaminated ? <AlertOctagon className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isContaminated ? "CONTAMINATED / CONFOUNDED" : "PURE ISOLATED SHOCK"}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Surprise & Z-Score Gauge */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans uppercase text-slate-500 font-bold tracking-wider flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span>Standardized Surprise (Z-Score)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula: (Act - Con) / σ
              </span>
            </div>

            <div className="my-3 text-center bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <div className="text-3xl font-mono font-extrabold tracking-tight">
                <span className={zScore < 0 ? "text-emerald-600" : zScore > 0 ? "text-rose-600" : "text-slate-800"}>
                  {zScore > 0 ? "+" : ""}{zScore.toFixed(2)} σ
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-sans">
                Raw Surprise: <strong className="text-slate-800 font-mono font-semibold">{event.surprise > 0 ? "+" : ""}{event.surprise} {event.unit}</strong> (Actual: {event.actual} vs {event.consensus} Consensus)
              </div>
            </div>

            {/* Visual deviation bar */}
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[10px] font-sans text-slate-400 font-medium">
                <span>-3.0σ (Extreme Dovish)</span>
                <span>0.0σ (In-Line)</span>
                <span>+3.0σ (Extreme Hawkish)</span>
              </div>
              <div className="relative h-3 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>
                <div
                  className={`absolute top-0 bottom-0 rounded-full transition-all ${
                    zScore < 0 ? "right-1/2 bg-emerald-500" : "left-1/2 bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(50, Math.abs(zScore / 3) * 50)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-500 flex items-center justify-between">
            <span>Historical Significance:</span>
            <span className="font-sans font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {Math.abs(zScore) > 2.0 ? "98th Percentile Shock (>2σ)" : Math.abs(zScore) > 1.0 ? "Standard Macro Deviation (1-2σ)" : "Mild Variance (<1σ)"}
            </span>
          </div>
        </div>

        {/* Multidimensional Event Vector Decomposition */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-sans uppercase text-slate-500 font-bold tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>EventVector (Joint Information Set)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">NBER Multidimensional</span>
          </div>

          <p className="text-[11px] text-slate-500 mb-3 font-sans">
            Markets react to the joint component vector, not merely the headline scalar.
          </p>

          <div className="space-y-2 text-xs font-mono">
            {event.multidimensional_vector && Object.entries(event.multidimensional_vector).map(([key, val]) => {
              if (val === undefined || key === "sentiment_tone") return null;
              const formattedKey = key.replace("_", " ").toUpperCase();
              const numVal = typeof val === "number" ? val : 0;
              const isBullish = numVal < 0;
              return (
                <div key={key} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-600 text-[11px] font-sans font-medium">{formattedKey}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${numVal === 0 ? "text-slate-500" : isBullish ? "text-emerald-600" : "text-rose-600"}`}>
                      {numVal > 0 ? "+" : ""}{numVal}
                    </span>
                    <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded font-medium ${
                      numVal === 0 ? "bg-slate-100 text-slate-500" : isBullish ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {numVal === 0 ? "Inline" : isBullish ? "Relief" : "Pressure"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Causal & Confounding Detection Layer */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans uppercase text-slate-500 font-bold tracking-wider flex items-center space-x-1.5">
                <AlertOctagon className={`w-3.5 h-3.5 ${isContaminated ? "text-amber-600" : "text-emerald-600"}`} />
                <span>Causal / Confounding Layer</span>
              </span>
              <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                isContaminated ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {event.confounding.confidence}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs shadow-xs">
                <span className="text-[11px] text-slate-600 block font-semibold mb-1 font-sans">
                  Events within &plusmn;60 seconds:
                </span>
                {event.confounding.events_within_60s.length > 0 ? (
                  <ul className="list-disc list-inside text-amber-700 font-mono text-[11px] space-y-0.5">
                    {event.confounding.events_within_60s.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-emerald-600 font-sans font-medium text-[11px]">None detected (Clean temporal barrier)</span>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs shadow-xs">
                <span className="text-[11px] text-slate-600 block font-semibold mb-1 font-sans">
                  Events within &plusmn;5 minutes:
                </span>
                {event.confounding.events_within_5m.length > 0 ? (
                  <ul className="list-disc list-inside text-amber-700 font-mono text-[11px] space-y-0.5">
                    {event.confounding.events_within_5m.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-500 font-sans text-[11px]">No secondary macro speakers or announcements</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 text-[11px] text-slate-500 font-sans border-t border-slate-200/70">
            {event.confounding.contamination_notes}
          </div>
        </div>
      </div>
    </div>
  );
};
