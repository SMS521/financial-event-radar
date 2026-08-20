import React from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  FileText,
  ShieldCheck,
  Cpu,
  ArrowDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface CausalWhyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  surpriseZ?: string;
  actualVsConsensus?: string;
  movePct?: string;
  asset?: string;
}

export const CausalWhyDrawer: React.FC<CausalWhyDrawerProps> = ({
  isOpen,
  onClose,
  eventTitle = "US Core CPI Inflation Print",
  surpriseZ = "+1.4σ",
  actualVsConsensus = "0.4% MoM vs 0.3% expected",
  movePct = "-0.62%",
  asset = "NQ (Nasdaq-100)",
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="causal-why-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="causal-why-heading" className="text-base font-bold text-slate-900 font-sans">
                Causal Event Attribution &bull; Why is {asset} {movePct}?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Deterministic mathematical transmission & verified market rationale
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
            aria-label="Close Causal Attribution Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* 1. Primary Driver Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 block">
              Primary Driver Identified
            </span>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{eventTitle}</h4>
              <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                Surprise {surpriseZ}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {actualVsConsensus} &bull; Release classification: <strong>Hawkish Macro Shock</strong>
            </p>
          </div>

          {/* 2. Step-by-Step Causal Transmission Chain */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block font-sans">
              Deterministic Transmission Chain
            </span>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 font-mono text-xs">
              <div className="flex items-center space-x-2 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>CPI Standardized Surprise: <strong>{surpriseZ}</strong></span>
              </div>
              <div className="pl-2.5 border-l-2 border-slate-300 ml-2.5 py-0.5 text-slate-400 text-[10px]">
                &darr; Algorithmic repricing of FOMC rate trajectory
              </div>

              <div className="flex items-center space-x-2 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Front-End 2Y Treasury Yield Shock: <strong className="text-rose-600">+9.2 bps</strong></span>
              </div>
              <div className="pl-2.5 border-l-2 border-slate-300 ml-2.5 py-0.5 text-slate-400 text-[10px]">
                &darr; Discount rate multiple contraction across duration
              </div>

              <div className="flex items-center space-x-2 text-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>USD Index (DXY) Liquidity Pressure: <strong className="text-rose-600">+0.37%</strong></span>
              </div>
              <div className="pl-2.5 border-l-2 border-slate-300 ml-2.5 py-0.5 text-slate-400 text-[10px]">
                &darr; Global liquidity drain on high-beta technology
              </div>

              <div className="flex items-center space-x-2 text-slate-900 font-bold bg-white p-2 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Observed Nasdaq-100 (NQ) Reaction: <strong className="text-rose-600">{movePct}</strong></span>
              </div>
            </div>
          </div>

          {/* 3. Cross-Asset Confirmation Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center space-x-1 text-emerald-800 font-bold text-[11px] uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cross-Asset Confirmation</span>
              </div>
              <ul className="space-y-1 text-slate-700 font-mono text-[11px]">
                <li className="flex items-center justify-between">
                  <span>US 2Y Yield</span>
                  <strong className="text-rose-700">+9bp &bull; Confirmed</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>USD Index (DXY)</span>
                  <strong className="text-rose-700">+0.37% &bull; Confirmed</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>VIX Index</span>
                  <strong className="text-rose-700">+8.2% &bull; Confirmed</strong>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Model Integrity & Confidence
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-xl font-mono font-black text-indigo-700">84%</span>
                  <span className="text-[11px] text-slate-500 font-medium">Confidence Score</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Conflicts: <strong className="text-emerald-700">None detected (Single-impulse)</strong>
              </div>
            </div>
          </div>

          {/* 4. Evidence & Provenance Sources */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block font-sans">
              Point-in-Time Evidence & Data Sources
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <span>1. BLS Direct Bureau Feed</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <span>2. Treasury Tick Archive</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <span>3. Reuters News Ingest (120ms)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <span>4. CME FedWatch Terminal</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Analytical Simulation &bull; Non-Advisory
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
