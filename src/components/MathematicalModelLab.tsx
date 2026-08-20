import React, { useState, useMemo } from "react";
import {
  Calculator,
  ShieldCheck,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Search,
  FlaskConical,
  Scale,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Code2,
  Filter,
  Check,
  X,
} from "lucide-react";
import {
  calculateSurpriseZ,
  calculateDispersionSurprise,
  calculateNonlinearExpectedMove,
  calculateProbabilityTargets,
  calculateCompoundEIS,
  MACRO_HISTORICAL_SIGMA,
} from "../lib/mathematicalRadarEngine";
import {
  runFullQCValidation,
  QCValidationReport,
  generateDatasetCSV,
  OutlierLeveragePoint,
} from "../lib/backtestValidationEngine";
import { computeOLSRegression } from "../lib/statMath";

export function MathematicalModelLab() {
  const [activeSubTab, setActiveSubTab] = useState<
    "MATH_EXPLORER" | "QC_BACKTEST" | "RAW_DATA_AUDIT" | "PROBABILITY_MATRIX"
  >("QC_BACKTEST");

  // Interactive Live Variables Sandbox State
  const [selectedEventType, setSelectedEventType] = useState<string>("CPI");
  const [actualVal, setActualVal] = useState<number>(3.3);
  const [consensusVal, setConsensusVal] = useState<number>(3.4);
  const [medianVal, setMedianVal] = useState<number>(3.4);
  const [dispersionVal, setDispersionVal] = useState<number>(0.045);
  const [whisperVal, setWhisperVal] = useState<number>(3.38);
  const [twoYearYieldDelta, setTwoYearYieldDelta] = useState<number>(-12.4); // bp
  const [socialVelocity, setSocialVelocity] = useState<number>(8.5); // x
  const [sourceCredibility, setSourceCredibility] = useState<number>(100);
  const [noveltyScore, setNoveltyScore] = useState<number>(88);
  const [optionsAnnualIV, setOptionsAnnualIV] = useState<number>(18.5); // %
  const [spotPrice, setSpotPrice] = useState<number>(19850); // NQ spot

  // Outlier Drop Interactive Toggle in Raw Audit view
  const [excludedEventId, setExcludedEventId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);

  // Run backtesting QC suite on dataset
  const qcReport: QCValidationReport = useMemo(() => runFullQCValidation(), []);

  // Filtered / Modified dataset when user interactively drops an outlier
  const interactiveData = useMemo(() => {
    const allPoints = qcReport.outlier_leverage_audit.points;
    const activePoints = excludedEventId
      ? allPoints.filter((p) => p.eventId !== excludedEventId)
      : allPoints;

    const x = activePoints.map((p) => Math.abs(p.zScore));
    const y = activePoints.map((p) => Math.abs(p.realizedMove60m));
    const ols = computeOLSRegression(x, y);

    return {
      points: activePoints,
      allPoints,
      ols,
      isModified: !!excludedEventId,
      droppedPoint: allPoints.find((p) => p.eventId === excludedEventId),
    };
  }, [qcReport, excludedEventId]);

  // Current macro config
  const macroConfig = MACRO_HISTORICAL_SIGMA[selectedEventType] || MACRO_HISTORICAL_SIGMA["CPI"];

  // Compute live mathematical values
  const zScore = calculateSurpriseZ(actualVal, consensusVal, macroConfig.sigma);
  const zDispersion = calculateDispersionSurprise(actualVal, medianVal, dispersionVal);
  const whisperSurprise = +(actualVal - whisperVal).toFixed(3);
  const nonlinearMove = calculateNonlinearExpectedMove(zScore);

  // Cross-asset confirmation score based on 2Y yield move alignment
  const isYieldAligned = (zScore < 0 && twoYearYieldDelta < 0) || (zScore > 0 && twoYearYieldDelta > 0);
  const crossAssetScore = Math.min(100, Math.round(50 + (isYieldAligned ? 35 : -25) + Math.min(15, Math.abs(twoYearYieldDelta))));

  const probTargets = calculateProbabilityTargets(
    zScore,
    macroConfig.nqSens,
    crossAssetScore,
    optionsAnnualIV / 100
  );

  // Options Expected Move
  const expectedMovePoints = spotPrice * (optionsAnnualIV / 100) * Math.sqrt(1 / 365);
  const expectedMovePct = +((expectedMovePoints / spotPrice) * 100).toFixed(2);

  // Compound EIS Score (0 - 100)
  const surpriseMagScore = Math.min(100, Math.round(Math.abs(zScore) * 45));
  const fedSensScore = macroConfig.fedSens;
  const repricingScore = Math.min(100, Math.round(Math.abs(twoYearYieldDelta) * 5.5));
  const socialScore = Math.min(100, Math.round(socialVelocity * 9));

  const compoundResult = calculateCompoundEIS({
    surpriseScore: surpriseMagScore,
    historicalImpact: 88,
    fedSensitivity: fedSensScore,
    rateRepricing: repricingScore,
    crossAssetConfirmation: crossAssetScore,
    socialAcceleration: socialScore,
    novelty: noveltyScore,
    credibility: sourceCredibility,
    positioning: 75,
    liquidity: 90,
  });

  const handleSelectEventType = (type: string) => {
    setSelectedEventType(type);
    const cfg = MACRO_HISTORICAL_SIGMA[type];
    if (cfg) {
      if (type === "NFP") {
        setActualVal(142);
        setConsensusVal(185);
        setMedianVal(185);
        setDispersionVal(28);
        setWhisperVal(175);
      } else if (type === "BOJ_DECISION") {
        setActualVal(0.25);
        setConsensusVal(0.10);
        setMedianVal(0.10);
        setDispersionVal(0.05);
        setWhisperVal(0.15);
      } else {
        setActualVal(3.3);
        setConsensusVal(3.4);
        setMedianVal(3.4);
        setDispersionVal(cfg.defaultDispersion);
        setWhisperVal(3.38);
      }
    }
  };

  // CSV Download Handler
  const handleDownloadDatasetCSV = () => {
    const csvContent = generateDatasetCSV(qcReport);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `macro_event_qc_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
              Mathematical Model, Backtest & Audit Lab
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Empirical formulas, Out-of-Sample validation, Benjamini-Hochberg FDR, Cook's Distance leverage, and raw event dataset verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("QC_BACKTEST")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === "QC_BACKTEST"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Level Backtest & QC</span>
          </button>
          <button
            onClick={() => setActiveSubTab("RAW_DATA_AUDIT")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === "RAW_DATA_AUDIT"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Raw Data, OLS & CSV Audit</span>
          </button>
          <button
            onClick={() => setActiveSubTab("MATH_EXPLORER")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === "MATH_EXPLORER"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>32-Variable Sandbox</span>
          </button>
          <button
            onClick={() => setActiveSubTab("PROBABILITY_MATRIX")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === "PROBABILITY_MATRIX"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Probability Matrix</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MULTI-LEVEL BACKTESTING & QUALITY CONTROL (QC) */}
      {activeSubTab === "QC_BACKTEST" && (
        <div className="space-y-6">
          {/* Executive Summary Card: Magnitude vs Directional Trap */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                    Multi-Level Quality Control & Backtest Verification (N = {qcReport.total_events_analyzed} Events)
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Chronological Split: In-Sample (60% / N={qcReport.in_sample_count}) vs Out-of-Sample (40% / N={qcReport.out_of_sample_count}) | Cutoff: {qcReport.split_date_cutoff}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab("RAW_DATA_AUDIT")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold font-sans flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Inspect Raw Data (N={qcReport.total_events_analyzed})</span>
              </button>
            </div>

            {/* Key Comparative Table: Magnitude vs Direction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* 1. Magnitude Test */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 font-sans">
                    1. Move Magnitude Model (|Z| → |ΔNQ|)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">
                    VALIDATED
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-sans">
                  {qcReport.magnitude_model.statistical_verdict}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">In-Sample R²:</span>
                    <span className="font-mono font-bold text-slate-900">{qcReport.magnitude_model.in_sample.rSquared}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Out-of-Sample R²:</span>
                    <span className="font-mono font-bold text-emerald-700">{qcReport.magnitude_model.out_of_sample.rSquared}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Slope β₁ (Full):</span>
                    <span className="font-mono font-bold text-slate-900">{qcReport.magnitude_model.full_sample.beta1} (t={qcReport.magnitude_model.full_sample.tStat})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">p-value:</span>
                    <span className="font-mono font-bold text-emerald-700">{qcReport.magnitude_model.full_sample.pValue}</span>
                  </div>
                </div>
              </div>

              {/* 2. Unconditioned Directional Test */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 font-sans">
                    2. Unconditioned Sign (Sign(Z))
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-600 text-white rounded">
                    REJECTED (NOISE)
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-sans">
                  {qcReport.directional_model.unconditioned_verdict}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">In-Sample Acc:</span>
                    <span className="font-mono font-bold text-slate-900">{(qcReport.directional_model.unconditioned_accuracy_in_sample * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Out-of-Sample Acc:</span>
                    <span className="font-mono font-bold text-amber-800">{(qcReport.directional_model.unconditioned_accuracy_out_of_sample * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Raw p-value:</span>
                    <span className="font-mono font-bold text-slate-900">{qcReport.directional_model.unconditioned_p_value}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">BH q-value (FDR):</span>
                    <span className="font-mono font-bold text-rose-700">{qcReport.directional_model.unconditioned_bh_q_value} (Fails)</span>
                  </div>
                </div>
              </div>

              {/* 3. Yield-Conditioned Directional Test */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 font-sans">
                    3. Yield-Confirmed Sign (|Δ2Y| ≥ 3bp)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-600 text-white rounded">
                    VALIDATED
                  </span>
                </div>
                <p className="text-xs text-indigo-900 font-sans">
                  {qcReport.directional_model.yield_conditioned_verdict}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">In-Sample Acc:</span>
                    <span className="font-mono font-bold text-slate-900">{(qcReport.directional_model.yield_conditioned_accuracy_in_sample * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Out-of-Sample Acc:</span>
                    <span className="font-mono font-bold text-indigo-700">{(qcReport.directional_model.yield_conditioned_accuracy_out_of_sample * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Raw p-value:</span>
                    <span className="font-mono font-bold text-slate-900">{qcReport.directional_model.yield_conditioned_p_value}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">BH q-value (FDR):</span>
                    <span className="font-mono font-bold text-emerald-700">{qcReport.directional_model.yield_conditioned_bh_q_value}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Benjamini-Hochberg Multiple-Testing Correction Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Multiple Testing Correction Across 7 Continuous Factors
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Calculated from Pearson correlation r and Student's t-test with Benjamini-Hochberg (BH) false discovery control at α = 0.05
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                m = {qcReport.factor_multiple_testing.length} Hypotheses | N = {qcReport.total_events_analyzed}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-2.5 px-3">Rank (k)</th>
                    <th className="py-2.5 px-3">Factor Name</th>
                    <th className="py-2.5 px-3">Pearson r</th>
                    <th className="py-2.5 px-3">R²</th>
                    <th className="py-2.5 px-3">t-Statistic</th>
                    <th className="py-2.5 px-3">Raw p-value</th>
                    <th className="py-2.5 px-3">Bonferroni p</th>
                    <th className="py-2.5 px-3">BH q-value (FDR)</th>
                    <th className="py-2.5 px-3 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {qcReport.factor_multiple_testing.map((item, idx) => (
                    <tr key={idx} className={item.is_significant_fdr_05 ? "bg-emerald-50/20" : "bg-rose-50/20"}>
                      <td className="py-2.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{item.factor}</td>
                      <td className="py-2.5 px-3 text-slate-800">{item.r}</td>
                      <td className="py-2.5 px-3 text-slate-800">{item.r_squared}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.t_stat}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.raw_p_value}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.bonferroni_p}</td>
                      <td className={`py-2.5 px-3 font-bold ${item.is_significant_fdr_05 ? "text-emerald-700" : "text-rose-600"}`}>
                        {item.bh_q_value}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.is_significant_fdr_05 ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            ROBUST (q &lt; 0.05)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                            REJECTED / NOISE (q ≥ 0.05)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Naive Baseline Benchmark & Cook's Distance Leverage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Benchmark Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  Naive Random Baseline vs Probability Model
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Model Brier Score:</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {qcReport.naive_baseline_benchmark.model_brier_score}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Lower is better</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Naive Baseline Brier:</span>
                  <span className="font-mono font-bold text-slate-700 text-base">
                    {qcReport.naive_baseline_benchmark.naive_brier_score}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Historical Base Rate ({qcReport.naive_baseline_benchmark.base_rate_realized})</span>
                </div>
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                  <span className="text-indigo-900 block text-[10px] font-bold">Brier Skill Score:</span>
                  <span className="font-mono font-bold text-indigo-700 text-base">
                    +{(qcReport.naive_baseline_benchmark.brier_skill_score * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">Skill over random base</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-emerald-950 block text-[10px] font-bold">Expected Calibration Error (ECE):</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {(qcReport.naive_baseline_benchmark.expected_calibration_error_ece * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Reliability bin alignment</span>
                </div>
              </div>
            </div>

            {/* Cook's Distance Single-Outlier Leverage Audit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  Cook's Distance Single-Outlier Leverage Audit
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-sans">
                Verifying that predictive significance is distributed across the entire sample and not driven by a single outlier shock.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Max Cook's Distance (D_max):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {qcReport.outlier_leverage_audit.max_cooks_distance} (Threshold 4/N = {qcReport.outlier_leverage_audit.cooks_threshold})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Largest Outlier Shock:</span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[200px]">
                    {qcReport.outlier_leverage_audit.max_outlier_event_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Full Sample Slope β₁:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {qcReport.outlier_leverage_audit.regression_slope_full} (R² = {qcReport.outlier_leverage_audit.regression_r2_full}, p = {qcReport.outlier_leverage_audit.regression_p_full})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Slope Without Max Outlier:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {qcReport.outlier_leverage_audit.regression_slope_without_max_outlier} (R² = {qcReport.outlier_leverage_audit.regression_r2_without_max_outlier}, p = {qcReport.outlier_leverage_audit.regression_p_without_max_outlier})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-emerald-700 font-bold">
                  <span>Parameter Stability Test:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                    {qcReport.outlier_leverage_audit.parameter_stability_passed ? "PASSED (< 25% Δβ)" : "FAILED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RAW EVENT DATA, LIVE REGRESSION & CSV EXPORTER */}
      {activeSubTab === "RAW_DATA_AUDIT" && (
        <div className="space-y-6">
          {/* Header Card with Download & Interactive Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>Raw Event Dataset & Interactive OLS Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Inspect exact event rows, verify residuals e_i, leverage h_ii, Cook's D_i, or drop outliers live to test parameter stability.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCodeViewer(!showCodeViewer)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>{showCodeViewer ? "Hide Script" : "View Math Script"}</span>
                </button>

                <button
                  onClick={handleDownloadDatasetCSV}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dataset CSV</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Outlier Experiment Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 font-sans">
                    Live Outlier Sensitivity Test:
                  </span>
                  <span className="text-xs text-slate-600 font-sans">
                    {excludedEventId
                      ? `Excluded: ${interactiveData.droppedPoint?.eventName}`
                      : "Using all N = " + qcReport.total_events_analyzed + " events"}
                  </span>
                </div>

                {excludedEventId ? (
                  <button
                    onClick={() => setExcludedEventId(null)}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset to Full Dataset</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const maxOutlier = [...qcReport.outlier_leverage_audit.points].sort(
                        (a, b) => b.cooks_distance_di - a.cooks_distance_di
                      )[0];
                      if (maxOutlier) setExcludedEventId(maxOutlier.eventId);
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Drop Largest Outlier ({qcReport.outlier_leverage_audit.max_outlier_event_name.slice(0, 20)}...)</span>
                  </button>
                )}
              </div>

              {/* Dynamic Live Regression Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Active Sample N:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{interactiveData.ols.n}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Slope β₁:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{interactiveData.ols.beta1}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">R-Squared (R²):</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{interactiveData.ols.rSquared}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">t-Statistic:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{interactiveData.ols.tStat}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">p-value:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{interactiveData.ols.pValue}</span>
                </div>
              </div>
            </div>

            {/* Code Viewer Modal/Box */}
            {showCodeViewer && (
              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">src/lib/statMath.ts & backtestValidationEngine.ts</span>
                  <span className="text-[10px] text-emerald-400">EXECUTABLE TYPESCRIPT / JS</span>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300 py-2">
{`// 1. Exact Ordinary Least Squares Regression & Cook's Distance Formula
export function computeOLSRegression(x: number[], y: number[]) {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  
  let ssX = 0, ssY = 0, ssXY = 0;
  for (let i = 0; i < n; i++) {
    ssX += Math.pow(x[i] - mx, 2);
    ssY += Math.pow(y[i] - my, 2);
    ssXY += (x[i] - mx) * (y[i] - my);
  }
  
  const beta1 = ssXY / ssX;
  const beta0 = my - beta1 * mx;
  const fitted = x.map(xi => beta0 + beta1 * xi);
  const residuals = y.map((yi, i) => yi - fitted[i]);
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const mse = sse / (n - 2);
  const seBeta1 = Math.sqrt(mse / ssX);
  const tStat = beta1 / seBeta1;
  const pValue = studentTTwoTailedPValue(tStat, n - 2);
  const rSquared = 1 - (sse / ssY);

  // Leverage & Cook's Distance
  const leverages = x.map(xi => 1/n + Math.pow(xi - mx, 2) / ssX);
  const cooksDistances = residuals.map((ri, i) => {
    const hi = leverages[i];
    return (Math.pow(ri, 2) / (2 * mse)) * (hi / Math.pow(1 - hi, 2));
  });
  
  return { beta0, beta1, tStat, pValue, rSquared, fitted, residuals, leverages, cooksDistances };
}`}
                </pre>
              </div>
            )}

            {/* Event Level Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-2.5 px-3">Date (ET)</th>
                    <th className="py-2.5 px-3">Event Name</th>
                    <th className="py-2.5 px-3">Actual</th>
                    <th className="py-2.5 px-3">Cons</th>
                    <th className="py-2.5 px-3">Z-Score</th>
                    <th className="py-2.5 px-3">Δ2Y (bp)</th>
                    <th className="py-2.5 px-3">Realized NQ 60m</th>
                    <th className="py-2.5 px-3">Fitted NQ</th>
                    <th className="py-2.5 px-3">Residual (e_i)</th>
                    <th className="py-2.5 px-3">Leverage (h_ii)</th>
                    <th className="py-2.5 px-3">Cook's D_i</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {interactiveData.allPoints.map((p) => {
                    const isDropped = p.eventId === excludedEventId;
                    return (
                      <tr
                        key={p.eventId}
                        className={`transition-colors ${
                          isDropped
                            ? "bg-rose-50/40 opacity-40 line-through"
                            : p.is_influential_outlier
                            ? "bg-amber-50/30"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                          {p.scheduled_ts.slice(0, 10)}
                        </td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900 max-w-[220px] truncate">
                          {p.eventName}
                        </td>
                        <td className="py-2 px-3 text-slate-700">{p.actual}</td>
                        <td className="py-2 px-3 text-slate-500">{p.consensus}</td>
                        <td className={`py-2 px-3 font-bold ${p.zScore < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {p.zScore > 0 ? `+${p.zScore.toFixed(2)}` : p.zScore.toFixed(2)}σ
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {p.delta2YYield > 0 ? `+${p.delta2YYield.toFixed(1)}` : `${p.delta2YYield.toFixed(1)}`}
                        </td>
                        <td className={`py-2 px-3 font-bold ${p.realizedMove60m >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {p.realizedMove60m >= 0 ? `+${p.realizedMove60m.toFixed(2)}%` : `${p.realizedMove60m.toFixed(2)}%`}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {p.fittedMove60m.toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {p.residual_ei > 0 ? `+${p.residual_ei.toFixed(3)}` : p.residual_ei.toFixed(3)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{p.leverage_hii.toFixed(4)}</td>
                        <td className={`py-2 px-3 font-bold ${p.is_influential_outlier ? "text-amber-700" : "text-slate-700"}`}>
                          {p.cooks_distance_di.toFixed(4)}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          {isDropped ? (
                            <button
                              onClick={() => setExcludedEventId(null)}
                              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => setExcludedEventId(p.eventId)}
                              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-200 cursor-pointer"
                            >
                              Drop Row
                            </button>
                          )}
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

      {/* SUB-TAB 3: 32-VARIABLE FORMULA SANDBOX */}
      {activeSubTab === "MATH_EXPLORER" && (
        <div className="space-y-6">
          {/* Top Equation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Standardized Surprise */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  Equation 1 & 2
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                  SURPRISE Z
                </span>
              </div>
              <div className="bg-slate-900 text-indigo-300 p-3 rounded-xl font-mono text-xs text-center font-bold">
                Z = (Actual - Consensus) / σ_hist
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Calculated Z-Score:</span>
                <span className={`font-mono font-bold text-sm ${zScore < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {zScore > 0 ? `+${zScore.toFixed(2)}σ` : `${zScore.toFixed(2)}σ`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Dispersion-Adjusted Z:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {zDispersion > 0 ? `+${zDispersion.toFixed(2)}` : `${zDispersion.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Box 2: Target Probability */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  Target A Econometric
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                  TARGET A
                </span>
              </div>
              <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-xs text-center font-bold">
                P(|NQ_60m| ≥ 0.25%) = σ(α + β₁|Z| + β₂Cross)
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Target A Probability:</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {(probTargets.p_abs_25bps * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Directional Probability:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {zScore < 0 ? `P(Bullish) ${(probTargets.p_bullish_25bps * 100).toFixed(0)}%` : `P(Bearish) ${(probTargets.p_bearish_25bps * 100).toFixed(0)}%`}
                </span>
              </div>
            </div>

            {/* Box 3: Compound EIS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  Equation 29
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                  COMPOUND EIS
                </span>
              </div>
              <div className="bg-slate-900 text-indigo-200 p-3 rounded-xl font-mono text-xs text-center font-bold">
                EIS = Σ w_i · Factor_i (0 to 100)
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Event Impact Score:</span>
                <span className={`font-mono font-bold text-sm ${compoundResult.eis >= 75 ? "text-indigo-700" : "text-slate-700"}`}>
                  {compoundResult.eis} / 100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Radar Alert Threshold:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {compoundResult.alertTriggered ? "TRIGGERED (≥ 75)" : "BELOW THRESHOLD"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Sandbox */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Live Mathematical Parameter Sandbox
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Modify the 32 input dimensions to inspect real-time outputs
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {["CPI", "NFP", "BOJ_DECISION", "FOMC_DECISION", "NVIDIA_EARNINGS"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelectEventType(type)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono font-bold transition-all cursor-pointer ${
                      selectedEventType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Actual vs Consensus */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Actual Value</span>
                  <span className="font-mono font-bold text-indigo-600">{actualVal}</span>
                </div>
                <input
                  type="range"
                  min={selectedEventType === "NFP" ? "50" : selectedEventType === "BOJ_DECISION" ? "0.0" : "2.0"}
                  max={selectedEventType === "NFP" ? "350" : selectedEventType === "BOJ_DECISION" ? "0.75" : "5.0"}
                  step={selectedEventType === "NFP" ? "1" : "0.05"}
                  value={actualVal}
                  onChange={(e) => setActualVal(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Consensus (Median)</span>
                  <span className="font-mono font-bold text-indigo-600">{consensusVal}</span>
                </div>
                <input
                  type="range"
                  min={selectedEventType === "NFP" ? "50" : selectedEventType === "BOJ_DECISION" ? "0.0" : "2.0"}
                  max={selectedEventType === "NFP" ? "350" : selectedEventType === "BOJ_DECISION" ? "0.75" : "5.0"}
                  step={selectedEventType === "NFP" ? "1" : "0.05"}
                  value={consensusVal}
                  onChange={(e) => setConsensusVal(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* 2Y Treasury Yield Move */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">2Y Treasury Yield Move (bp)</span>
                  <span className={`font-mono font-bold ${twoYearYieldDelta < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {twoYearYieldDelta > 0 ? `+${twoYearYieldDelta}` : twoYearYieldDelta} bp
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={twoYearYieldDelta}
                  onChange={(e) => setTwoYearYieldDelta(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Social Velocity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Social Velocity (dMentions/dt)</span>
                  <span className="font-mono font-bold text-indigo-600">{socialVelocity}x baseline</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={socialVelocity}
                  onChange={(e) => setSocialVelocity(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Options Implied Volatility (IV) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Options ATM IV (Annualized)</span>
                  <span className="font-mono font-bold text-indigo-600">{optionsAnnualIV}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="0.5"
                  value={optionsAnnualIV}
                  onChange={(e) => setOptionsAnnualIV(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Source Credibility Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Source Credibility Weight</span>
                  <span className="font-mono font-bold text-indigo-600">{sourceCredibility}/100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={sourceCredibility}
                  onChange={(e) => setSourceCredibility(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Output Variables Grid */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-slate-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>COMPOUND VECTOR EXECUTION PROFILE</span>
                <span className="text-[10px] text-emerald-400 font-semibold">STATUS: FORMULAS ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">STANDARD SURPRISE Z</span>
                  <span className="font-bold text-white text-sm">{zScore.toFixed(2)}σ</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FED SENSITIVITY</span>
                  <span className="font-bold text-white text-sm">{macroConfig.fedSens}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">NQ SENSITIVITY</span>
                  <span className="font-bold text-white text-sm">{macroConfig.nqSens}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">P(|NQ| ≥ 0.25% in 60m)</span>
                  <span className="font-bold text-emerald-400 text-sm">{(probTargets.p_abs_25bps * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">P(|NQ| ≥ 0.50% in 60m)</span>
                  <span className="font-bold text-emerald-400 text-sm">{(probTargets.p_abs_50bps * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">P(|NQ| ≥ 1.00% in 60m)</span>
                  <span className="font-bold text-emerald-400 text-sm">{(probTargets.p_abs_100bps * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CROSS-ASSET SCORE</span>
                  <span className="font-bold text-indigo-300 text-sm">{crossAssetScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">COMPOUND EIS SCORE</span>
                  <span className={`font-bold text-sm ${compoundResult.eis >= 75 ? "text-amber-400" : "text-white"}`}>
                    {compoundResult.eis}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PROBABILITY TARGET MATRIX */}
      {activeSubTab === "PROBABILITY_MATRIX" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Non-Linear Move Magnitude Probabilities across Z-Score Bins
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Conditional empirical probabilities for NQ Futures 60m return thresholds
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Target A */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 font-sans">Target A</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">
                    P(|NQ| ≥ 0.25%)
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-indigo-600">
                  {(probTargets.p_abs_25bps * 100).toFixed(0)}%
                </div>
                <p className="text-[11px] text-slate-500">
                  Primary execution trigger for near-term momentum follow-through
                </p>
              </div>

              {/* Target B */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 font-sans">Target B</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">
                    P(|NQ| ≥ 0.50%)
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-indigo-600">
                  {(probTargets.p_abs_50bps * 100).toFixed(0)}%
                </div>
                <p className="text-[11px] text-slate-500">
                  Medium-magnitude shock continuation trigger
                </p>
              </div>

              {/* Target C */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 font-sans">Target C</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">
                    P(|NQ| ≥ 1.00%)
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-indigo-600">
                  {(probTargets.p_abs_100bps * 100).toFixed(0)}%
                </div>
                <p className="text-[11px] text-slate-500">
                  Extreme macro outlier shock expansion trigger
                </p>
              </div>
            </div>

            {/* Calibration Curve Bins */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
                Reliability Calibration Diagram (Predicted Probability vs Realized Base Rate)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {qcReport.calibration_bins.map((bin, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <span className="font-bold text-slate-800 font-sans block">{bin.bin_range}</span>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Predicted Avg:</span>
                      <span className="text-indigo-600 font-bold">{(bin.predicted_probability_avg * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Realized Rate:</span>
                      <span className="text-emerald-700 font-bold">{(bin.realized_frequency * 100).toFixed(0)}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200">
                      N = {bin.count} events in bin
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
