import React, { useState, useMemo } from "react";
import { FULL_70_EVENT_RESEARCH_COHORT } from "../data/verifiedCohort";
import {
  runWalkForwardValidation,
  computeReliabilityCalibrationReport,
  evaluateLockedHoldout,
  partitionCohortByPhase
} from "../utils/walkForwardValidation";
import {
  ShieldCheck,
  Lock,
  GitBranch,
  TrendingUp,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  Zap,
  Clock,
  ArrowRight,
  Info
} from "lucide-react";

export const WalkForwardHoldoutSuite: React.FC = () => {
  const [activeModel, setActiveModel] = useState<"MODEL_A" | "MODEL_B" | "MODEL_C">("MODEL_C");
  const [activeSubTab, setActiveSubTab] = useState<"WALK_FORWARD" | "CALIBRATION" | "LOCKED_HOLDOUT" | "PARTITIONS">(
    "WALK_FORWARD"
  );

  const allEvents = FULL_70_EVENT_RESEARCH_COHORT;
  const walkForwardWindows = useMemo(() => runWalkForwardValidation(allEvents), [allEvents]);
  const calibrationReport = useMemo(
    () => computeReliabilityCalibrationReport(allEvents, activeModel),
    [allEvents, activeModel]
  );
  const lockedHoldoutReport = useMemo(() => evaluateLockedHoldout(allEvents), [allEvents]);
  const partitions = useMemo(() => partitionCohortByPhase(allEvents), [allEvents]);

  const devCount = partitions.filter((p) => p.partition === "DEVELOPMENT").length;
  const valCount = partitions.filter((p) => p.partition === "VALIDATION").length;
  const holdoutCount = partitions.filter((p) => p.partition === "LOCKED_FINAL_HOLDOUT").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-mono font-bold border border-indigo-300 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-indigo-700" />
                <span>v3.0 RIGOROUS OUT-OF-SAMPLE ENGINE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold border border-emerald-200">
                Chronological Walk-Forward &bull; Untouched Locked Holdout &bull; Decile Calibration
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Walk-Forward Validation & Out-Of-Sample Reliability Suite
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl">
              Zero random train/test splits. Models are strictly trained on historical observations prior to each evaluation slice, tested on un-seen future releases, and validated against an immutable final holdout partition.
            </p>
          </div>

          {/* Quick Partition Summary Chips */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-slate-500 text-[10px]">DEVELOPMENT</div>
              <div className="font-bold text-slate-800">{devCount} Events</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-amber-600 text-[10px]">VALIDATION</div>
              <div className="font-bold text-amber-800">{valCount} Events</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
              <div className="text-emerald-600 text-[10px]">LOCKED HOLDOUT</div>
              <div className="font-bold text-emerald-800">{holdoutCount} Events</div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto">
          {[
            { id: "WALK_FORWARD", label: "⏳ Expanding Walk-Forward Windows", icon: GitBranch },
            { id: "CALIBRATION", label: "🎯 Decile Calibration & PR-AUC", icon: BarChart3 },
            { id: "LOCKED_HOLDOUT", label: "🔒 Untouched 2024 Final Holdout", icon: Lock },
            { id: "PARTITIONS", label: "📋 70-Event Partition Ledger", icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Chronological Walk-Forward Windows */}
      {activeSubTab === "WALK_FORWARD" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Temporal Rolling-Origin Rule:</span> Each walk-forward window only trains on events that strictly occurred prior to the test window start date. Model parameters do not have access to any future market volatility, rate regime shifts, or post-event price settlement bars.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walkForwardWindows.map((win) => (
              <div key={win.windowId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-mono font-bold">
                      WINDOW {win.windowId}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{win.testWindowLabel}</h3>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-500">Train: {win.trainSize}</span> &bull;{" "}
                    <span className="text-indigo-600 font-semibold">Test: {win.testSize}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ({win.testPositives} movers / {win.testControls} quiet)
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Model A */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Model A (Event Type Only)</span>
                      <span className="font-mono text-slate-600 text-[11px]">Brier: {win.modelA_OOS.brierScore}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <div className="text-slate-400 text-[9px]">ROC-AUC</div>
                        <div className="font-bold text-slate-800">{win.modelA_OOS.rocAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <div className="text-slate-400 text-[9px]">PR-AUC</div>
                        <div className="font-bold text-slate-800">{win.modelA_OOS.prAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <div className="text-slate-400 text-[9px]">PRECISION</div>
                        <div className="font-bold text-slate-800">{(win.modelA_OOS.precision * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-slate-100">
                        <div className="text-slate-400 text-[9px]">FALSE ALARM</div>
                        <div className="font-bold text-amber-700">{(win.modelA_OOS.falsePositiveRate * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Model B */}
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-indigo-900">Model B (+ Pre-Market State)</span>
                      <span className="font-mono text-indigo-600 text-[11px]">Brier: {win.modelB_OOS.brierScore}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                      <div className="bg-white p-1.5 rounded-md border border-indigo-100">
                        <div className="text-slate-400 text-[9px]">ROC-AUC</div>
                        <div className="font-bold text-indigo-900">{win.modelB_OOS.rocAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-indigo-100">
                        <div className="text-slate-400 text-[9px]">PR-AUC</div>
                        <div className="font-bold text-indigo-900">{win.modelB_OOS.prAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-indigo-100">
                        <div className="text-slate-400 text-[9px]">PRECISION</div>
                        <div className="font-bold text-indigo-900">{(win.modelB_OOS.precision * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-indigo-100">
                        <div className="text-slate-400 text-[9px]">FALSE ALARM</div>
                        <div className="font-bold text-amber-700">{(win.modelB_OOS.falsePositiveRate * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Model C */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-emerald-950 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Model C (+ Cross-Asset Rates Transmission)</span>
                      </span>
                      <span className="font-mono text-emerald-800 text-[11px] font-bold">Brier: {win.modelC_OOS.brierScore}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                      <div className="bg-white p-1.5 rounded-md border border-emerald-200">
                        <div className="text-slate-400 text-[9px]">ROC-AUC</div>
                        <div className="font-bold text-emerald-800">{win.modelC_OOS.rocAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-emerald-200">
                        <div className="text-slate-400 text-[9px]">PR-AUC</div>
                        <div className="font-bold text-emerald-800">{win.modelC_OOS.prAuc}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-emerald-200">
                        <div className="text-slate-400 text-[9px]">PRECISION</div>
                        <div className="font-bold text-emerald-800">{(win.modelC_OOS.precision * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-emerald-200">
                        <div className="text-slate-400 text-[9px]">FALSE ALARM</div>
                        <div className="font-bold text-emerald-700 font-bold">{(win.modelC_OOS.falsePositiveRate * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Decile Calibration & PR-AUC */}
      {activeSubTab === "CALIBRATION" && (
        <div className="space-y-6">
          {/* Model Selector Bar */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl w-fit">
            {[
              { id: "MODEL_A", label: "Model A: Event Type Baseline" },
              { id: "MODEL_B", label: "Model B: Event + Market State" },
              { id: "MODEL_C", label: "Model C: Full Rates Transmission" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeModel === m.id ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Calibration Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Expected Calibration Error (ECE)</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{calibrationReport.expectedCalibrationError}</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{calibrationReport.calibrationQuality} (&le; 0.08 target)</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Max Calibration Error (MCE)</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{calibrationReport.maxCalibrationError}</div>
              <div className="text-[11px] text-slate-500 mt-1">Peak single-bin probability deviation</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Brier Score</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{calibrationReport.brierScore}</div>
              <div className="text-[11px] text-slate-500 mt-1">Climatology baseline: {calibrationReport.brierRefClimatology}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Brier Skill Score (BSS)</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{calibrationReport.brierSkillScore}</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold">+{(calibrationReport.brierSkillScore * 100).toFixed(1)}% improvement over base rate</div>
            </div>
          </div>

          {/* Decile Calibration Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Decile Calibration Binning Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifies that events predicted with probability ~P produce moves with empirical frequency ~P.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                Class Base Rate: 28.6% (20/70)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">BIN RANGE</th>
                    <th className="py-3 px-4">SAMPLE COUNT</th>
                    <th className="py-3 px-4">POSITIVE MOVERS</th>
                    <th className="py-3 px-4">MEAN PREDICTED PROB</th>
                    <th className="py-3 px-4">EMPIRICAL ACTUAL FREQ</th>
                    <th className="py-3 px-4">CALIBRATION ERROR</th>
                    <th className="py-3 px-4">RELIABILITY FIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calibrationReport.bins.map((bin) => {
                    const isGood = bin.calibrationError <= 0.08;
                    return (
                      <tr key={bin.binIndex} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{bin.binRange}</td>
                        <td className="py-3 px-4 text-slate-700">{bin.totalPredictions}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{bin.positiveCount}</td>
                        <td className="py-3 px-4 text-indigo-700 font-bold">{(bin.meanPredictedProb * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-slate-900 font-bold">{(bin.empiricalActualFrequency * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-slate-600 font-semibold">{(bin.calibrationError * 100).toFixed(1)} pp</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGood
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {isGood ? "TIGHT FIT" : "MINOR DISPERSION"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Untouched 2024 Final Holdout */}
      {activeSubTab === "LOCKED_HOLDOUT" && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-sm border border-emerald-900 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-800/50 border border-emerald-700">
                  <Lock className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Permanently Untouched Final Holdout (v3.0 Locked)</h3>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    Evaluated strictly without hyperparameter tuning or retrospective threshold adjustments.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-emerald-400 text-[10px]">HASH CERTIFICATE</div>
                <div className="font-bold text-emerald-200">{lockedHoldoutReport.frozenParametersHash}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <div className="text-emerald-400 text-[10px] uppercase font-sans">Holdout Scope</div>
                <div className="text-sm font-bold text-white mt-0.5">{lockedHoldoutReport.holdoutRange}</div>
                <div className="text-[11px] text-emerald-300 mt-1">
                  {lockedHoldoutReport.totalEvents} Total Events ({lockedHoldoutReport.positiveMoverCases} Movers / {lockedHoldoutReport.controlQuietCases} Controls)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <div className="text-emerald-400 text-[10px] uppercase font-sans">Holdout Base Rate</div>
                <div className="text-sm font-bold text-emerald-200 mt-0.5">
                  {(lockedHoldoutReport.positiveBaseRate * 100).toFixed(1)}% Positive Movers
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">Reflects true natural market frequency</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <div className="text-emerald-400 text-[10px] uppercase font-sans">Audit Status</div>
                <div className="text-sm font-bold text-emerald-300 mt-0.5 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>BLIND EVALUATION COMPLETE</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">Zero post-hoc optimization</div>
              </div>
            </div>
          </div>

          {/* Model Holdout Performance Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Out-of-Sample Holdout Performance (Locked Events 56–70)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">MODEL ARCHITECTURE</th>
                    <th className="py-3 px-4">OUT-OF-SAMPLE ROC-AUC</th>
                    <th className="py-3 px-4">OUT-OF-SAMPLE PR-AUC</th>
                    <th className="py-3 px-4">BRIER SCORE</th>
                    <th className="py-3 px-4">PRECISION</th>
                    <th className="py-3 px-4">RECALL</th>
                    <th className="py-3 px-4">SPECIFICITY</th>
                    <th className="py-3 px-4">FALSE ALERT RATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Model A */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">Model A: Event Type Baseline</td>
                    <td className="py-3 px-4 text-slate-700">{lockedHoldoutReport.modelA_HoldoutMetrics.rocAuc}</td>
                    <td className="py-3 px-4 text-slate-700">{lockedHoldoutReport.modelA_HoldoutMetrics.prAuc}</td>
                    <td className="py-3 px-4 text-slate-600">{lockedHoldoutReport.modelA_HoldoutMetrics.brierScore}</td>
                    <td className="py-3 px-4 text-slate-700">{(lockedHoldoutReport.modelA_HoldoutMetrics.precision * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-700">{(lockedHoldoutReport.modelA_HoldoutMetrics.recall * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-slate-700">{(lockedHoldoutReport.modelA_HoldoutMetrics.specificity * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-amber-700 font-bold">{(lockedHoldoutReport.modelA_HoldoutMetrics.falseAlertRate * 100).toFixed(0)}%</td>
                  </tr>

                  {/* Model B */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-900">Model B: Event + Pre-Market State</td>
                    <td className="py-3 px-4 text-indigo-900 font-semibold">{lockedHoldoutReport.modelB_HoldoutMetrics.rocAuc}</td>
                    <td className="py-3 px-4 text-indigo-900 font-semibold">{lockedHoldoutReport.modelB_HoldoutMetrics.prAuc}</td>
                    <td className="py-3 px-4 text-indigo-700">{lockedHoldoutReport.modelB_HoldoutMetrics.brierScore}</td>
                    <td className="py-3 px-4 text-indigo-900">{(lockedHoldoutReport.modelB_HoldoutMetrics.precision * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-indigo-900">{(lockedHoldoutReport.modelB_HoldoutMetrics.recall * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-indigo-900">{(lockedHoldoutReport.modelB_HoldoutMetrics.specificity * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-amber-700 font-bold">{(lockedHoldoutReport.modelB_HoldoutMetrics.falseAlertRate * 100).toFixed(0)}%</td>
                  </tr>

                  {/* Model C */}
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-950 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Model C: Rates Transmission Channel</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">{lockedHoldoutReport.modelC_HoldoutMetrics.rocAuc}</td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">{lockedHoldoutReport.modelC_HoldoutMetrics.prAuc}</td>
                    <td className="py-3 px-4 text-emerald-800 font-bold">{lockedHoldoutReport.modelC_HoldoutMetrics.brierScore}</td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">{(lockedHoldoutReport.modelC_HoldoutMetrics.precision * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">{(lockedHoldoutReport.modelC_HoldoutMetrics.recall * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">{(lockedHoldoutReport.modelC_HoldoutMetrics.specificity * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{(lockedHoldoutReport.modelC_HoldoutMetrics.falseAlertRate * 100).toFixed(0)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold">Holdout Audit Takeaway:</span> {lockedHoldoutReport.narrativeConclusion}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 70-Event Partition Ledger */}
      {activeSubTab === "PARTITIONS" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chronological Partition Ledger (Events 1 to 70)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every release indexed by publication timestamp with permanent partition assignment.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">EVENT ID</th>
                  <th className="py-3 px-4">EVENT NAME</th>
                  <th className="py-3 px-4">RELEASE DATE ET</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">NQ 60M RETURN</th>
                  <th className="py-3 px-4">ASSIGNED PARTITION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partitions.map((row) => {
                  const ret = row.event.marketReactions.NQ.returns["60m"].value;
                  const isMover = row.event.isMarketMover;
                  return (
                    <tr key={row.event.eventId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-500">{row.chronologicalIndex}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{row.event.eventId}</td>
                      <td className="py-2.5 px-4 text-slate-800 font-sans">{row.event.eventName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.event.releaseTimestampET.split(" ")[0]}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {row.event.eventFamily}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`font-bold ${ret > 0 ? "text-emerald-700" : ret < 0 ? "text-rose-700" : "text-slate-600"}`}>
                          {ret > 0 ? "+" : ""}{ret.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.partition === "DEVELOPMENT"
                              ? "bg-slate-100 text-slate-800 border border-slate-200"
                              : row.partition === "VALIDATION"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {row.partition}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
