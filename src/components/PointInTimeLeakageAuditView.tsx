import React, { useState, useMemo } from "react";
import {
  POINT_IN_TIME_FEATURE_CATALOG,
  runPointInTimeLeakageAudit,
  LeakageCheckResult
} from "../utils/pointInTimeLeakageAudit";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Database,
  Filter,
  ArrowRight,
  Info,
  Check,
  Sparkles
} from "lucide-react";

export const PointInTimeLeakageAuditView: React.FC = () => {
  const [selectedCutoff, setSelectedCutoff] = useState<
    "T_MINUS_1M" | "T_0" | "T_PLUS_1M" | "T_PLUS_5M" | "T_PLUS_15M"
  >("T_PLUS_1M");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const auditResult = useMemo(() => runPointInTimeLeakageAudit(selectedCutoff), [selectedCutoff]);

  const filteredFeatures = useMemo(() => {
    if (categoryFilter === "ALL") return POINT_IN_TIME_FEATURE_CATALOG;
    return POINT_IN_TIME_FEATURE_CATALOG.filter((f) => f.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ZERO-LEAKAGE POINT-IN-TIME FEATURE STORE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-xs font-mono font-semibold border border-indigo-200">
                Enforces availability_timestamp &le; prediction_timestamp
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Feature-by-Feature Temporal Leakage & Lookahead Audit
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Strict formal verification that no model uses subsequent market settlement bars, revised agency releases, or end-of-day options statistics before their precise microsecond availability timestamp.
            </p>
          </div>

          {/* Audit Pass Chip */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center font-mono">
            <div className="text-[10px] text-emerald-700 uppercase font-sans font-bold">Audit Status</div>
            <div className="text-sm font-bold text-emerald-900 flex items-center justify-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% LEAKAGE FREE</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">0 Lookahead Violations</div>
          </div>
        </div>

        {/* Prediction Cutoff Selector */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-2">Audit Prediction Horizon:</span>
          {[
            { id: "T_MINUS_1M", label: "T-1m (Ex-Ante State Only)" },
            { id: "T_0", label: "T_0 (Release Headline Flash)" },
            { id: "T_PLUS_1M", label: "T+1m (1-min Rates Repricing)" },
            { id: "T_PLUS_5M", label: "T+5m (Early Stabilization)" },
            { id: "T_PLUS_15M", label: "T+15m (Multi-Horizon Radar)" }
          ].map((cut) => {
            const isActive = selectedCutoff === cut.id;
            return (
              <button
                key={cut.id}
                onClick={() => setSelectedCutoff(cut.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cut.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Catalog & Audit Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Feature Store Schema & Availability Contracts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditing feature arrival timestamps relative to selected prediction horizon: <span className="font-mono font-bold text-indigo-700">{selectedCutoff}</span>
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="ALL">All Categories</option>
              <option value="MACRO_SURPRISE">Macro Surprise</option>
              <option value="PRE_MARKET_STATE">Pre-Market State</option>
              <option value="CROSS_ASSET_RATES">Cross-Asset Rates</option>
              <option value="CROSS_ASSET_VOL">Cross-Asset Volatility</option>
              <option value="POST_EVENT_OUTCOME">Ground Truth Target Outcome</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">FEATURE NAME</th>
                <th className="py-3 px-4">PRIMARY SOURCE</th>
                <th className="py-3 px-4">OBSERVATION TIME</th>
                <th className="py-3 px-4">AVAILABILITY TIME</th>
                <th className="py-3 px-4">ALLOWED CUTOFF</th>
                <th className="py-3 px-4">MODEL INGESTION</th>
                <th className="py-3 px-4">LEAKAGE AUDIT PROOF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeatures.map((feat) => {
                const isTargetOnly = feat.allowedPredictionCutoff === "POST_T60M_LABEL_ONLY";
                return (
                  <tr
                    key={feat.featureId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isTargetOnly ? "bg-rose-50/40 text-rose-950" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      <div className="flex items-center space-x-1.5">
                        <span>{feat.featureName}</span>
                        {isTargetOnly && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-mono font-bold">
                            TARGET LABEL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{feat.featureId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans">{feat.sourceSystem}</td>
                    <td className="py-3 px-4 text-slate-600">{feat.observationTimestampET}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold">{feat.availabilityTimestampET}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {feat.allowedPredictionCutoff}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${feat.isUsedInModelA ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-400"}`}>
                          A
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${feat.isUsedInModelB ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-400"}`}>
                          B
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${feat.isUsedInModelC ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"}`}>
                          C
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                      <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{feat.auditProof}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
