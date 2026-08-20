import React, { useState } from "react";
import { AlertTriangle, Info, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

export const LegalDisclaimer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      id="ferrp-legal-disclaimer-banner"
      role="note"
      aria-label="Regulatory and Simulation Legal Notice"
      className="bg-amber-950/90 text-amber-100 border-b border-amber-800/80 px-4 py-2.5 text-xs shadow-md transition-all sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-start md:items-center space-x-2.5 flex-1">
          <div className="p-1 bg-amber-500/20 text-amber-400 rounded-md shrink-0 mt-0.5 md:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="leading-snug">
            <span className="font-bold text-amber-300 uppercase tracking-wide mr-2 text-[11px] bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700/50">
              Regulatory & Simulation Notice
            </span>
            <span className="text-amber-100/90 font-medium">
              All data, surprise models, transmission chains, and historical analogs provided in FERRP are <strong>synthetic & educational</strong>, intended strictly for quantitative analytical and event-risk modeling purposes. <strong>This platform does not provide investment, trading, or financial advice.</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          <span className="text-[10px] font-mono text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded-full border border-amber-600/40">
            NON-ADVISORY • ANALYTICAL ONLY
          </span>
          <button
            id="btn-toggle-disclaimer-details"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 underline cursor-pointer focus:outline-none"
          >
            <span>{expanded ? "Less" : "Details"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          id="ferrp-disclaimer-expanded-details"
          className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-800/60 text-[11px] text-amber-200/80 grid grid-cols-1 md:grid-cols-3 gap-3 leading-relaxed animate-in fade-in duration-200"
        >
          <div className="flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Synthetic & Simulated Feeds:</strong> Volatility speedometers, causal graphs, and scenario simulations are generated via point-in-time statistical algorithms and do not guarantee live market outcomes.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>No Brokerage Execution:</strong> FERRP provides no order placement, execution routing, or capital custodial facilities. Past analog distributions do not predict future asset performance.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Data Validation Layer:</strong> Events marked with the <span className="text-emerald-400 font-bold">Verified</span> badge have passed schema and point-in-time checks, while custom simulations are flagged as <span className="text-indigo-300 font-bold">User Simulated</span>.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
