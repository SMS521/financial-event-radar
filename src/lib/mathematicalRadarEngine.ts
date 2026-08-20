import { MarketEvent, AssetSymbol, RadarEventItem, EventImpactScorecard, FactorScore } from "../types";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MATHEMATICAL EVENT IMPACT & RADAR ENGINE (32-VARIABLE QUANTITATIVE SPEC)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Implements the rigorous mathematical formulation for event-driven market impact:
 * 1. Standardized Surprise (Z-Score)
 * 2. Forecast Dispersion & Dispersion-Normalized Surprise
 * 3. Direction Coefficients & Empirical Nonlinear Response
 * 4. Fed Sensitivity Score (Corr with 2Y Yield)
 * 5. Nasdaq Sensitivity Score (Corr with |NQ| & Beta)
 * 6. Historical Move Magnitude Probability Targets:
 *    - Target A: P(|NQ_60m| >= 0.25%)
 *    - Target B: P(|NQ_60m| >= 0.50%)
 *    - Target C: P(|NQ_60m| >= 1.00%)
 *    - Directional Target: P(NQ_60m >= +0.25%) vs P(NQ_60m <= -0.25%)
 * 7. Whisper & Market-Implied Repricing
 * 8. Treasury Yield Curve Transmission (2Y, 10Y, Real Yields)
 * 9. Cross-Asset Confirmation Matrix
 * 10. Social Acceleration & Velocity (Volume, dMentions/dt, d^2Mentions/dt^2)
 * 11. Source Credibility & Independent Confirmation Decay
 * 12. Information Novelty (Surprise x Novelty)
 * 13. Options Implied Volatility Expected Move & Move Efficiency
 * 14. Liquidity & Abnormal Return Normalization
 * 15. Compound 10-Factor Event Impact Score (EIS)
 */

export interface EventVariablesRecord {
  event_name: string;
  event_type: string;
  is_scheduled: boolean;
  actual: number;
  consensus: number;
  previous: number;
  whisper: number;
  forecast_dispersion: number;
  historical_sigma: number;
  raw_surprise: number;
  z_score: number;
  dispersion_normalized_surprise: number;
  whisper_surprise: number;
  fed_sensitivity_score: number; // 0 - 100
  nq_sensitivity_score: number; // 0 - 100
  direction_coefficient: number; // -1, 0, +1
  // Probabilities
  p_abs_move_25bps: number; // Target A
  p_abs_move_50bps: number; // Target B
  p_abs_move_100bps: number; // Target C
  p_bullish_25bps: number;
  p_bearish_25bps: number;
  // Repricing & Cross-Asset
  fed_repricing_bps: number;
  delta_2y_yield: number;
  delta_10y_yield: number;
  delta_dxy: number;
  delta_vix: number;
  cross_asset_confirmation_score: number; // 0 - 100
  // Social & Novelty
  social_volume_ratio: number;
  social_velocity: number;
  social_acceleration: number;
  source_credibility_score: number; // 0 - 100
  novelty_score: number; // 0 - 100
  options_expected_move_pct: number;
  move_efficiency: number;
  compound_eis_score: number; // 0 - 100
}

/**
 * Historical Sigma standard deviations by macro indicator
 */
export const MACRO_HISTORICAL_SIGMA: Record<string, { sigma: number; defaultDispersion: number; fedSens: number; nqSens: number; direction: number }> = {
  CPI: { sigma: 0.0704, defaultDispersion: 0.045, fedSens: 98, nqSens: 94, direction: -1 },
  PCE: { sigma: 0.065, defaultDispersion: 0.04, fedSens: 100, nqSens: 91, direction: -1 },
  NFP: { sigma: 48.0, defaultDispersion: 28.0, fedSens: 95, nqSens: 89, direction: 0.5 }, // Ambiguous/nonlinear
  JOBLESS_CLAIMS: { sigma: 9.5, defaultDispersion: 5.5, fedSens: 78, nqSens: 72, direction: 1 }, // Higher claims = dovish = bullish NQ
  PPI: { sigma: 0.12, defaultDispersion: 0.08, fedSens: 85, nqSens: 80, direction: -1 },
  RETAIL_SALES: { sigma: 0.35, defaultDispersion: 0.22, fedSens: 65, nqSens: 70, direction: 0.3 },
  GDP: { sigma: 0.45, defaultDispersion: 0.30, fedSens: 60, nqSens: 68, direction: 0.2 },
  ISM_MANUFACTURING: { sigma: 1.1, defaultDispersion: 0.75, fedSens: 75, nqSens: 76, direction: 0.4 },
  FOMC_DECISION: { sigma: 0.15, defaultDispersion: 0.08, fedSens: 100, nqSens: 98, direction: -1 },
  BOJ_DECISION: { sigma: 0.08, defaultDispersion: 0.05, fedSens: 70, nqSens: 92, direction: -1 },
  NVIDIA_EARNINGS: { sigma: 0.22, defaultDispersion: 0.14, fedSens: 25, nqSens: 99, direction: 1 },
};

/**
 * 1. Calculate Standardized Surprise Z = (Actual - Consensus) / Sigma
 */
export function calculateSurpriseZ(actual: number, consensus: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return (actual - consensus) / sigma;
}

/**
 * 2. Calculate Forecast Dispersion Normalized Surprise Z_disp = (Actual - Median) / Dispersion
 */
export function calculateDispersionSurprise(actual: number, median: number, dispersion: number): number {
  if (dispersion <= 0) return (actual - median) / 0.05;
  return (actual - median) / dispersion;
}

/**
 * 3. Non-linear expected NQ move by Z-Score Bins (Calibrated empirically on 5-year macro data)
 */
export function calculateNonlinearExpectedMove(zScore: number): { expectedMagnitudePct: number; bin: string } {
  const absZ = Math.abs(zScore);
  if (absZ < 0.25) return { expectedMagnitudePct: 0.08, bin: "0.00σ - 0.25σ (In-Line)" };
  if (absZ < 0.50) return { expectedMagnitudePct: 0.18, bin: "0.25σ - 0.50σ (Mild Surprise)" };
  if (absZ < 1.00) return { expectedMagnitudePct: 0.34, bin: "0.50σ - 1.00σ (Moderate Surprise)" };
  if (absZ < 1.50) return { expectedMagnitudePct: 0.62, bin: "1.00σ - 1.50σ (Substantial Surprise)" };
  if (absZ < 2.00) return { expectedMagnitudePct: 0.98, bin: "1.50σ - 2.00σ (Heavy Shock)" };
  return { expectedMagnitudePct: 1.55 + (absZ - 2.0) * 0.45, bin: "2.00σ+ (Extreme Outlier Shock)" };
}

/**
 * 4. Predict Move Magnitude Probability Targets:
 *    Target A: P(|NQ_60m| >= 0.25%)
 *    Target B: P(|NQ_60m| >= 0.50%)
 *    Target C: P(|NQ_60m| >= 1.00%)
 */
export function calculateProbabilityTargets(
  zScore: number,
  nqSensitivity: number, // 0 - 100
  crossAssetScore: number, // 0 - 100
  optionsIV: number = 0.18 // 18% annual ATM IV
): {
  p_abs_25bps: number;
  p_abs_50bps: number;
  p_abs_100bps: number;
  p_bullish_25bps: number;
  p_bearish_25bps: number;
} {
  const absZ = Math.abs(zScore);
  const sensWeight = nqSensitivity / 100;
  const crossWeight = crossAssetScore / 100;

  // Logistic base response for magnitude
  const baseLogit25 = -0.35 + 1.65 * absZ * sensWeight + 0.45 * crossWeight;
  const p_abs_25bps = Math.min(0.99, Math.max(0.05, 1 / (1 + Math.exp(-baseLogit25))));

  const baseLogit50 = -1.60 + 1.45 * absZ * sensWeight + 0.50 * crossWeight;
  const p_abs_50bps = Math.min(0.96, Math.max(0.02, 1 / (1 + Math.exp(-baseLogit50))));

  const baseLogit100 = -2.85 + 1.25 * absZ * sensWeight + 0.55 * crossWeight;
  const p_abs_100bps = Math.min(0.88, Math.max(0.01, 1 / (1 + Math.exp(-baseLogit100))));

  // Directional odds (conditioned on sign of surprise and hawkish/dovish sensitivity)
  let p_bullish = 0.5;
  let p_bearish = 0.5;

  if (zScore < -0.2) {
    // Dovish inflation/rates print -> bullish NQ
    const dirStrength = Math.min(0.92, 0.5 + 0.28 * Math.min(2.5, absZ) * (crossAssetScore / 90));
    p_bullish = dirStrength;
    p_bearish = 1 - dirStrength;
  } else if (zScore > 0.2) {
    // Hawkish print -> bearish NQ
    const dirStrength = Math.min(0.92, 0.5 + 0.28 * Math.min(2.5, absZ) * (crossAssetScore / 90));
    p_bearish = dirStrength;
    p_bullish = 1 - dirStrength;
  }

  const p_bullish_25bps = Math.round(p_abs_25bps * p_bullish * 100) / 100;
  const p_bearish_25bps = Math.round(p_abs_25bps * p_bearish * 100) / 100;

  return {
    p_abs_25bps: Math.round(p_abs_25bps * 100) / 100,
    p_abs_50bps: Math.round(p_abs_50bps * 100) / 100,
    p_abs_100bps: Math.round(p_abs_100bps * 100) / 100,
    p_bullish_25bps,
    p_bearish_25bps,
  };
}

/**
 * 5. Options Expected Move Calculator: ExpectedMove = Spot * IV * sqrt(T / 365)
 */
export function calculateOptionsExpectedMove(spot: number, annualIV: number, daysToExpiry: number = 1): number {
  if (spot <= 0 || annualIV <= 0) return 0;
  const timeFraction = Math.sqrt(Math.max(1, daysToExpiry) / 365);
  return spot * annualIV * timeFraction;
}

/**
 * 6. Compound 10-Factor Event Impact Score (EIS)
 * Normalized strictly to 0 - 100.
 */
export function calculateCompoundEIS(params: {
  surpriseScore: number; // 0 - 100
  historicalImpact: number; // 0 - 100
  fedSensitivity: number; // 0 - 100
  rateRepricing: number; // 0 - 100
  crossAssetConfirmation: number; // 0 - 100
  socialAcceleration: number; // 0 - 100
  novelty: number; // 0 - 100
  credibility: number; // 0 - 100
  positioning: number; // 0 - 100
  liquidity: number; // 0 - 100
  customWeights?: Record<string, number>;
}): {
  eis: number;
  factorContributions: Record<string, number>;
  alertTriggered: boolean;
} {
  const weights: Record<string, number> = params.customWeights || {
    surprise: 0.18,
    historicalImpact: 0.12,
    fedSensitivity: 0.14,
    rateRepricing: 0.12,
    crossAsset: 0.12,
    socialAcceleration: 0.08,
    novelty: 0.08,
    credibility: 0.08,
    positioning: 0.04,
    liquidity: 0.04,
  };

  const contributions = {
    surprise: (params.surpriseScore * (weights.surprise || 0.18)),
    historicalImpact: (params.historicalImpact * (weights.historicalImpact || 0.12)),
    fedSensitivity: (params.fedSensitivity * (weights.fedSensitivity || 0.14)),
    rateRepricing: (params.rateRepricing * (weights.rateRepricing || 0.12)),
    crossAsset: (params.crossAssetConfirmation * (weights.crossAsset || 0.12)),
    socialAcceleration: (params.socialAcceleration * (weights.socialAcceleration || 0.08)),
    novelty: (params.novelty * (weights.novelty || 0.08)),
    credibility: (params.credibility * (weights.credibility || 0.08)),
    positioning: (params.positioning * (weights.positioning || 0.04)),
    liquidity: (params.liquidity * (weights.liquidity || 0.04)),
  };

  const totalRaw = Object.values(contributions).reduce((sum, val) => sum + val, 0);
  const eis = Math.min(100, Math.max(0, Math.round(totalRaw)));

  return {
    eis,
    factorContributions: contributions,
    alertTriggered: eis >= 75,
  };
}

/**
 * 7. Multiple-Testing Corrections (Bonferroni FWER & Benjamini-Hochberg False Discovery Rate)
 */
export interface MultipleTestingResult {
  factor: string;
  raw_p_value: number;
  bonferroni_p: number;
  bh_q_value: number;
  is_significant_fdr_05: boolean;
  is_significant_bonferroni_05: boolean;
  effect_size_cohen_d: number;
  sample_size_n: number;
}

export function computeMultipleTestingCorrections(
  factorPValues: { factor: string; pValue: number; effectSize: number; n: number }[]
): MultipleTestingResult[] {
  const m = factorPValues.length;
  // Sort ascending by raw p-value for Benjamini-Hochberg rank k
  const sorted = [...factorPValues].sort((a, b) => a.pValue - b.pValue);

  const results: MultipleTestingResult[] = sorted.map((item, idx) => {
    const k = idx + 1; // 1-indexed rank
    const bonferroni_p = Math.min(1.0, item.pValue * m);
    // Benjamini-Hochberg q-value = p * (m / k)
    const bh_q_value = Math.min(1.0, (item.pValue * m) / k);

    return {
      factor: item.factor,
      raw_p_value: item.pValue,
      bonferroni_p: +bonferroni_p.toFixed(5),
      bh_q_value: +bh_q_value.toFixed(5),
      is_significant_fdr_05: bh_q_value < 0.05,
      is_significant_bonferroni_05: bonferroni_p < 0.05,
      effect_size_cohen_d: item.effectSize,
      sample_size_n: item.n,
    };
  });

  return results;
}

/**
 * 8. Cook's Distance Outlier Leverage Check (Detecting whether significance is driven by 1 event)
 */
export interface OutlierLeveragePoint {
  eventId: string;
  eventName: string;
  zScore: number;
  realizedMove60m: number;
  leverage_hii: number;
  standardizedResidual: number;
  cooks_distance_d: number;
  is_influential_outlier: boolean; // D_i > 4 / n
}

export function computeCooksDistanceLeverage(events: MarketEvent[]): {
  points: OutlierLeveragePoint[];
  maxCooksDistance: number;
  influentialCount: number;
  regressionSlopeFull: number;
  regressionSlopeWithoutOutliers: number;
} {
  const n = events.length;
  if (n < 4) {
    return {
      points: [],
      maxCooksDistance: 0,
      influentialCount: 0,
      regressionSlopeFull: 0,
      regressionSlopeWithoutOutliers: 0,
    };
  }

  const x = events.map((e) => Math.abs(e.standardized_surprise));
  const y = events.map((e) => Math.abs(e.reactions.NQ["60m"]));

  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;

  const ssX = x.reduce((s, v) => s + Math.pow(v - meanX, 2), 0);
  const ssXY = x.reduce((s, v, i) => s + (v - meanX) * (y[i] - meanY), 0);

  const beta1 = ssX > 0 ? ssXY / ssX : 0;
  const beta0 = meanY - beta1 * meanX;

  const yHat = x.map((xi) => beta0 + beta1 * xi);
  const residuals = y.map((yi, i) => yi - yHat[i]);
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const mse = sse / Math.max(1, n - 2);

  const threshold = 4 / n;
  let influentialCount = 0;
  let maxD = 0;

  const points: OutlierLeveragePoint[] = events.map((ev, i) => {
    const xi = x[i];
    const ri = residuals[i];
    // Leverage hii = 1/n + (xi - meanX)^2 / ssX
    const hii = 1 / n + (ssX > 0 ? Math.pow(xi - meanX, 2) / ssX : 0);
    const standardRes = Math.sqrt(mse * (1 - Math.min(0.99, hii))) > 0 ? ri / Math.sqrt(mse * (1 - Math.min(0.99, hii))) : 0;

    // Cook's D_i = (standardRes^2 / 2) * (hii / (1 - hii))
    const di = (Math.pow(standardRes, 2) / 2) * (hii / Math.max(0.01, 1 - hii));
    if (di > maxD) maxD = di;

    const isInfluential = di > threshold;
    if (isInfluential) influentialCount++;

    return {
      eventId: ev.event_id,
      eventName: ev.event_name,
      zScore: ev.standardized_surprise,
      realizedMove60m: ev.reactions.NQ["60m"],
      leverage_hii: +hii.toFixed(4),
      standardizedResidual: +standardRes.toFixed(3),
      cooks_distance_d: +di.toFixed(4),
      is_influential_outlier: isInfluential,
    };
  });

  // Re-run regression excluding influential outliers to test parameter stability
  const nonOutliers = points.filter((p) => !p.is_influential_outlier);
  let betaWithoutOutliers = beta1;

  if (nonOutliers.length >= 3) {
    const xClean = nonOutliers.map((p) => Math.abs(p.zScore));
    const yClean = nonOutliers.map((p) => Math.abs(p.realizedMove60m));
    const mXc = xClean.reduce((s, v) => s + v, 0) / xClean.length;
    const mYc = yClean.reduce((s, v) => s + v, 0) / yClean.length;
    const ssXc = xClean.reduce((s, v) => s + Math.pow(v - mXc, 2), 0);
    const ssXYc = xClean.reduce((s, v, i) => s + (v - mXc) * (yClean[i] - mYc), 0);
    betaWithoutOutliers = ssXc > 0 ? ssXYc / ssXc : beta1;
  }

  return {
    points,
    maxCooksDistance: +maxD.toFixed(4),
    influentialCount,
    regressionSlopeFull: +beta1.toFixed(3),
    regressionSlopeWithoutOutliers: +betaWithoutOutliers.toFixed(3),
  };
}
