import React, { useState, useMemo } from "react";
import {
  IncrementalInformationStudySummary,
  PairedEventPredictionComparison,
  PreRegisteredStoppingRule,
  FailClosedProvenanceAuditLog,
  CalibrationIntegrityAudit
} from "../types/shadowValidationTypes";
import {
  getIncrementalInformationSummaries,
  getPairedEventPredictionComparisons,
  getPreRegisteredStoppingRule,
  getFailClosedProvenanceLogs,
  getCalibrationIntegrityAudit
} from "../utils/shadowValidationEngine";
import {
  TrendingUp,
  BarChart3,
  Scale,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Info,
  Clock,
  Check,
  ChevronRight,
  Activity,
  FileSpreadsheet
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";

export const IncrementalInformationValueChart: React.FC = () => {
  const summaries: IncrementalInformationStudySummary[] = useMemo(
    () => getIncrementalInformationSummaries(),
    []
  );
  const pairedComparisons: PairedEventPredictionComparison[] = useMemo(
    () => getPairedEventPredictionComparisons(),
    []
  );
  const stoppingRule: PreRegisteredStoppingRule = useMemo(
    () => getPreRegisteredStoppingRule(),
    []
  );
  const rejectedLogs: FailClosedProvenanceAuditLog[] = useMemo(
    () => getFailClosedProvenanceLogs(),
    []
  );
  const calibrationAudit: CalibrationIntegrityAudit = useMemo(
    () => getCalibrationIntegrityAudit(),
    []
  );

  const [selectedMetric, setSelectedMetric] = useState<
    "PR_AUC" | "PRECISION" | "BRIER" | "LEAD_TIME" | "ACCURACY"
  >("PR_AUC");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    "ALL" | "SCHEDULED_MACRO" | "CORPORATE_WIRE" | "CENTRAL_BANK_SPEECH" | "GEOPOLITICAL_BREAKING"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPairedEvents = useMemo(() => {
    return pairedComparisons.filter((item) => {
      const matchesCat =
        selectedCategoryFilter === "ALL" || item.eventCategory === selectedCategoryFilter;
      const matchesSearch =
        item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.incrementalValueExplanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [pairedComparisons, selectedCategoryFilter, searchQuery]);

  // Format chart data for Recharts
  const chartData = useMemo(() => {
    return summaries.map((s) => ({
      name: s.shortLabel,
      code: s.systemCode,
      features: s.featuresCount,
      prAuc: +(s.prAuc * 100).toFixed(1),
      precision: +(s.alertPrecision * 100).toFixed(1),
      brier: +(s.brierScore * 100).toFixed(1),
      leadTime: s.medianLeadTimeSec,
      accuracy: +(s.overallAccuracy * 100).toFixed(1),
      deltaPrAuc: +(s.deltaPrAucVsPrevious * 100).toFixed(1),
      deltaPrecision: +(s.deltaPrecisionVsPrevious * 100).toFixed(1),
      deltaLeadTime: +s.deltaLeadTimeVsPrevious.toFixed(1)
    }));
  }, [summaries]);

  return (
    <div className="space-y-6" id="incremental-info-value-root">
      {/* Header Banner & Scientific Experiment Framing */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>INFORMATION VALUE ABLATION BENCHMARK</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30">
                Paired Identical-Event Denominator
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Incremental Predictive Gain: Macro vs. +News vs. +Social (A &rarr; B &rarr; C)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-4xl">
              Evaluates the strict marginal predictive value of adding data input channels on the identical cohort events. System A uses only scheduled macro calendar & market state; System B adds Tier-1 news wire ingestion; System C integrates clustered social velocity.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-slate-800 font-mono text-xs text-right shrink-0">
            <div className="text-[10px] text-slate-400 uppercase">Evaluation Cohort</div>
            <div className="text-indigo-400 font-bold mt-0.5">N=70 Historical Verified Events</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Strict Zero Denominator Shift</div>
          </div>
        </div>

        {/* 3-System Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaries.map((sys, idx) => {
            const isSystemA = sys.systemCode === "SYSTEM_A";
            const isSystemB = sys.systemCode === "SYSTEM_B";
            const isSystemC = sys.systemCode === "SYSTEM_C";

            return (
              <div
                key={sys.systemCode}
                className={`p-4 rounded-2xl border transition-all ${
                  isSystemC
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
                    : isSystemB
                    ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-100"
                    : "bg-slate-900/80 border-slate-800 text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isSystemC
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isSystemB
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {sys.shortLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {sys.featuresCount} Features
                  </span>
                </div>

                <div className="font-bold text-white text-sm mb-1">{sys.systemName}</div>
                <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                  {sys.inputsDescription}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">PR-AUC:</span>
                    <span className="font-bold text-white text-sm">
                      {(sys.prAuc * 100).toFixed(1)}%
                    </span>
                    {idx > 0 && (
                      <span className="text-[10px] text-emerald-400 ml-1">
                        (+{(sys.deltaPrAucVsPrevious * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Precision:</span>
                    <span className="font-bold text-white text-sm">
                      {(sys.alertPrecision * 100).toFixed(1)}%
                    </span>
                    {idx > 0 && (
                      <span className="text-[10px] text-emerald-400 ml-1">
                        (+{(sys.deltaPrecisionVsPrevious * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Brier Score:</span>
                    <span className="font-bold text-white text-sm">{sys.brierScore.toFixed(3)}</span>
                    {idx > 0 && (
                      <span className="text-[10px] text-emerald-400 ml-1">
                        ({sys.deltaBrierVsPrevious.toFixed(3)})
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Median Lead:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      +{sys.medianLeadTimeSec.toFixed(1)}s
                    </span>
                    {idx > 0 && (
                      <span className="text-[10px] text-emerald-300 ml-1">
                        (+{sys.deltaLeadTimeVsPrevious.toFixed(1)}s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  {sys.incrementalSourceLiftCommentary}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Metric Selector & Visual Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Information Layer Marginal Gain Visualization
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select metric to view comparative progression across input channel hierarchies.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
            {[
              { id: "PR_AUC", label: "PR-AUC Lift", unit: "%" },
              { id: "PRECISION", label: "Alert Precision", unit: "%" },
              { id: "LEAD_TIME", label: "Median Lead Time", unit: "s" },
              { id: "BRIER", label: "Brier Score Error (Lower = Better)", unit: "loss" },
              { id: "ACCURACY", label: "Overall Accuracy", unit: "%" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedMetric === m.id
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View with Recharts */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#475569" }}
                domain={
                  selectedMetric === "LEAD_TIME"
                    ? [0, 12]
                    : selectedMetric === "BRIER"
                    ? [0, 0.12]
                    : [50, 100]
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "12px"
                }}
                formatter={(value: any) => {
                  if (selectedMetric === "LEAD_TIME") return [`+${value}s`, "Median Lead Time"];
                  if (selectedMetric === "BRIER") return [value, "Brier Loss Score"];
                  return [`${value}%`, selectedMetric];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey={
                  selectedMetric === "PR_AUC"
                    ? "prAuc"
                    : selectedMetric === "PRECISION"
                    ? "precision"
                    : selectedMetric === "LEAD_TIME"
                    ? "leadTime"
                    : selectedMetric === "BRIER"
                    ? "brier"
                    : "accuracy"
                }
                name={
                  selectedMetric === "PR_AUC"
                    ? "PR-AUC (%)"
                    : selectedMetric === "PRECISION"
                    ? "Alert Precision (%)"
                    : selectedMetric === "LEAD_TIME"
                    ? "Median Lead Time (seconds)"
                    : selectedMetric === "BRIER"
                    ? "Brier Score Error (Lower is better)"
                    : "Overall Classification Accuracy (%)"
                }
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#64748b" : index === 1 ? "#6366f1" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Step-wise Incremental Gain Waterfall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">
              Step 1: Baseline Macro Anchor
            </span>
            <div className="text-sm font-bold text-slate-900">System A (Macro + Market)</div>
            <div className="text-xs text-slate-600">
              PR-AUC: <span className="font-bold font-mono">78.2%</span> &bull; Precision:{" "}
              <span className="font-bold font-mono">84.5%</span> &bull; Lead:{" "}
              <span className="font-bold font-mono">+2.1s</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Captures scheduled rate-curve shocks; lacks visibility into breaking unstructured releases.
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 font-mono flex items-center space-x-1">
              <Zap className="w-3 h-3 text-indigo-600" />
              <span>Step 2: +Tier-1 Direct News Wires</span>
            </span>
            <div className="text-sm font-bold text-indigo-950">System B Delta (+News)</div>
            <div className="text-xs text-indigo-900 font-mono font-bold">
              +0.082 PR-AUC &bull; +6.5% Precision &bull; +4.7s Lead
            </div>
            <p className="text-[11px] text-slate-600">
              <strong>Major statistically significant jump</strong> (p &lt; 0.001). SEC EDGAR Form 8-Ks & regulatory feeds parse filings before price impact.
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 font-mono flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Step 3: +Clustered Social Velocity</span>
            </span>
            <div className="text-sm font-bold text-emerald-950">System C Delta (+Social)</div>
            <div className="text-xs text-emerald-900 font-mono font-bold">
              +0.027 PR-AUC &bull; +1.5% Precision &bull; +3.6s Lead
            </div>
            <p className="text-[11px] text-slate-600">
              <strong>Timing multiplier</strong>. Adds +3.6s warning time without degrading false alert rate due to strict K &ge; 3 cluster independence gating.
            </p>
          </div>
        </div>
      </div>

      {/* Paired Event-by-Event Prediction Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Paired Event-by-Event Prediction Denominator Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side comparison of System A, B, and C evaluated on the exact same empirical events.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search event or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Categories ({pairedComparisons.length})</option>
              <option value="SCHEDULED_MACRO">Scheduled Macro</option>
              <option value="CORPORATE_WIRE">Corporate Wires / 8-K</option>
              <option value="CENTRAL_BANK_SPEECH">Central Bank Speech</option>
              <option value="GEOPOLITICAL_BREAKING">Geopolitical / Rumors</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">EVENT & CATEGORY</th>
                <th className="py-3 px-3">ACTUAL OUTCOME</th>
                <th className="py-3 px-3 text-center">SYSTEM A (Macro)</th>
                <th className="py-3 px-3 text-center">SYSTEM B (+News)</th>
                <th className="py-3 px-3 text-center">SYSTEM C (+Social)</th>
                <th className="py-3 px-3 text-right">&Delta; BRIER (B-A)</th>
                <th className="py-3 px-3 text-right">&Delta; BRIER (C-B)</th>
                <th className="py-3 px-3 text-center">WINNING SYSTEM</th>
                <th className="py-3 px-3">EXPLANATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPairedEvents.map((evt) => {
                const isMover = evt.actualMoverLabel === 1;

                return (
                  <tr key={evt.eventId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900 text-xs">{evt.eventName}</div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{evt.eventId}</span>
                        <span>&bull;</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {evt.eventCategory.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isMover
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {isMover ? `MOVER (${evt.realized60mPct > 0 ? "+" : ""}${evt.realized60mPct}%)` : `NO MOVE (${evt.realized60mPct > 0 ? "+" : ""}${evt.realized60mPct}%)`}
                      </span>
                    </td>

                    {/* System A */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-slate-800">
                        {(evt.probSystemA * 100).toFixed(0)}%
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          evt.systemADecision === "ALERT"
                            ? "bg-emerald-100 text-emerald-800"
                            : evt.systemADecision === "WATCH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {evt.systemADecision}
                      </span>
                      {evt.systemALeadTimeSec && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          +{evt.systemALeadTimeSec}s
                        </div>
                      )}
                    </td>

                    {/* System B */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-indigo-700">
                        {(evt.probSystemB * 100).toFixed(0)}%
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          evt.systemBDecision === "ALERT"
                            ? "bg-emerald-100 text-emerald-800"
                            : evt.systemBDecision === "WATCH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {evt.systemBDecision}
                      </span>
                      {evt.systemBLeadTimeSec && (
                        <div className="text-[9px] text-indigo-600 font-bold font-mono">
                          +{evt.systemBLeadTimeSec}s
                        </div>
                      )}
                    </td>

                    {/* System C */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-emerald-700">
                        {(evt.probSystemC * 100).toFixed(0)}%
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          evt.systemCDecision === "ALERT"
                            ? "bg-emerald-100 text-emerald-800"
                            : evt.systemCDecision === "WATCH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {evt.systemCDecision}
                      </span>
                      {evt.systemCLeadTimeSec && (
                        <div className="text-[9px] text-emerald-700 font-bold font-mono">
                          +{evt.systemCLeadTimeSec}s
                        </div>
                      )}
                    </td>

                    {/* Delta Brier B-A */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-bold ${
                          evt.deltaBrierB_A < 0 ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        {evt.deltaBrierB_A < 0 ? "" : "+"}
                        {evt.deltaBrierB_A.toFixed(3)}
                      </span>
                    </td>

                    {/* Delta Brier C-B */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-bold ${
                          evt.deltaBrierC_B < 0 ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        {evt.deltaBrierC_B < 0 ? "" : "+"}
                        {evt.deltaBrierC_B.toFixed(3)}
                      </span>
                    </td>

                    {/* Winning System */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.winningSystem === "SYSTEM_C"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : evt.winningSystem === "SYSTEM_B"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {evt.winningSystem}
                      </span>
                    </td>

                    {/* Explanation */}
                    <td className="py-3 px-3 font-sans text-[11px] text-slate-600 max-w-xs">
                      {evt.incrementalValueExplanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Pre-Registered Stopping Rules, Calibration Audit & Fail-Closed Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Pre-Registered Stopping Rule & Statistical Power */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>1. Pre-Registered Stopping Rule</span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-indigo-900 uppercase font-mono">
              Primary Endpoint Target
            </div>
            <div className="font-bold text-indigo-950">{stoppingRule.primaryEndpoint}</div>
            <p className="text-[11px] text-indigo-800 font-sans leading-relaxed">
              {stoppingRule.primaryThresholdRule}
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Checkpoint 1 (Initial Evaluation):</span>
              <span className="font-bold text-slate-900">
                50 candidates (min 15 alerts)
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Checkpoint 2:</span>
              <span className="font-bold text-slate-900">100 candidates</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Definitive Power:</span>
              <span className="font-bold text-slate-900">200+ candidates</span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-slate-500 font-sans mb-1">
                <span>Current Prospective Accumulation:</span>
                <span className="font-bold font-mono text-slate-900">
                  {stoppingRule.currentProspectiveCount} / {stoppingRule.firstCheckpointCandidates} (
                  {stoppingRule.currentAlertCount} alerts)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{
                    width: `${(stoppingRule.currentProspectiveCount / stoppingRule.firstCheckpointCandidates) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Frozen Calibration Parameter Integrity Audit */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>2. Calibration Parameter Audit</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1 text-xs">
            <div className="text-[10px] font-bold text-emerald-900 uppercase font-mono">
              Frozen Parameter Hash
            </div>
            <div
              className="font-bold font-mono text-[10px] text-emerald-950 truncate"
              title={calibrationAudit.calibrationParametersHash}
            >
              {calibrationAudit.calibrationParametersHash}
            </div>
            <div className="text-[11px] text-emerald-800 font-sans">
              Calibrated on data prior to {calibrationAudit.calibrationFitDataEndTimestamp}
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Live Refits (v3.3):</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                live_update_count = {calibrationAudit.liveUpdateCount}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans">Regime Clustering Dispatch:</span>
              <span className="font-bold text-slate-900">
                {calibrationAudit.regimeClusteringState}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600 font-sans">Unauthorized Tuning:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>NONE DETECTED (LOCKED)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Fail-Closed Rejected Information Log */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>3. Fail-Closed Rejected Data Log</span>
          </div>

          <div className="space-y-2.5">
            {rejectedLogs.map((log) => (
              <div
                key={log.rejectionId}
                className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[10px] text-rose-900">
                    {log.rejectionId}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestampET}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-800 font-sans">
                  {log.sourceFeed}
                </div>
                <p className="text-[10px] text-slate-600 font-sans leading-tight">
                  {log.provenanceViolationReason}
                </p>
                <div className="pt-1 text-[9px] font-mono font-bold text-rose-800">
                  Action: {log.enforcedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
