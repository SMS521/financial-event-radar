import { VerifiedMacroEventRecord, EventFamily } from "./provenance";

export type DatasetPartitionType = "DEVELOPMENT" | "VALIDATION" | "LOCKED_FINAL_HOLDOUT";

export interface PartitionedCohortRecord {
  event: VerifiedMacroEventRecord;
  partition: DatasetPartitionType;
  chronologicalIndex: number;
}

export interface WalkForwardWindowResult {
  windowId: number;
  trainWindowLabel: string; // e.g. "Events 1–40 (2022-06 to 2023-05)"
  testWindowLabel: string; // e.g. "Events 41–50 (2023-06 to 2023-09)"
  trainSize: number;
  testSize: number;
  testPositives: number;
  testControls: number;
  modelA_OOS: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
  };
  modelB_OOS: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
  };
  modelC_OOS: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
  };
}

export interface CalibrationBin {
  binIndex: number;
  binRange: string; // e.g. "0.00 – 0.10"
  minProb: number;
  maxProb: number;
  totalPredictions: number;
  positiveCount: number;
  meanPredictedProb: number;
  empiricalActualFrequency: number;
  calibrationError: number; // |meanPredictedProb - empiricalActualFrequency|
}

export interface ReliabilityCalibrationReport {
  modelName: string;
  bins: CalibrationBin[];
  expectedCalibrationError: number; // ECE
  maxCalibrationError: number; // MCE
  brierScore: number;
  brierRefClimatology: number; // Brier skill score benchmark
  brierSkillScore: number; // 1 - (Brier / BrierRef)
  calibrationQuality: "WELL_CALIBRATED" | "MODERATELY_CALIBRATED" | "MISCALIBRATED";
}

export interface LockedHoldoutEvaluationReport {
  holdoutVersion: string; // "v3.0-locked-holdout"
  holdoutRange: string; // e.g. "Events 56–70 (2024)"
  totalEvents: number;
  positiveMoverCases: number;
  controlQuietCases: number;
  positiveBaseRate: number; // e.g. 26.7%
  frozenParametersHash: string;
  evaluatedTimestamp: string;
  modelA_HoldoutMetrics: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    specificity: number;
    falseAlertRate: number;
  };
  modelB_HoldoutMetrics: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    specificity: number;
    falseAlertRate: number;
  };
  modelC_HoldoutMetrics: {
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    precision: number;
    recall: number;
    specificity: number;
    falseAlertRate: number;
  };
  narrativeConclusion: string;
}

/**
 * Point-in-Time Feature Leakage Audit Schema
 */
export interface FeatureLeakageAuditRecord {
  featureId: string;
  featureName: string;
  category: "MACRO_SURPRISE" | "PRE_MARKET_STATE" | "CROSS_ASSET_RATES" | "CROSS_ASSET_VOL" | "POST_EVENT_OUTCOME";
  sourceSystem: string;
  observationTimestampET: string;
  availabilityTimestampET: string; // Exact microsecond/second when data arrives
  allowedPredictionCutoff: "T_MINUS_1M" | "T_0" | "T_PLUS_1M" | "T_PLUS_5M" | "T_PLUS_15M" | "POST_T60M_LABEL_ONLY";
  isUsedInModelA: boolean;
  isUsedInModelB: boolean;
  isUsedInModelC: boolean;
  leakageStatus: "PASS_ZERO_LEAKAGE" | "FATAL_LOOKAHEAD_VIOLATION";
  auditProof: string;
}

/**
 * Multi-Horizon Live Prediction
 */
export interface MultiHorizonPrediction {
  horizon1m_to_15m: {
    predictionTimestampET: string;
    targetLabel: "P(|NQ| >= 0.25% by +15m)";
    probMove: number;
    probDown: number;
    probUp: number;
    expectedExcursionMfe: number;
    expectedExcursionMae: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  horizon5m_to_30m: {
    predictionTimestampET: string;
    targetLabel: "P(|NQ| >= 0.25% by +30m)";
    probMove: number;
    probDown: number;
    probUp: number;
    expectedExcursionMfe: number;
    expectedExcursionMae: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  horizon15m_to_60m: {
    predictionTimestampET: string;
    targetLabel: "P(|NQ| >= 0.25% by +60m)";
    probMove: number;
    probDown: number;
    probUp: number;
    expectedExcursionMfe: number;
    expectedExcursionMae: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
}

/**
 * Unscheduled Breaking News & Social Signals Detector
 */
export interface UnscheduledSignalRecord {
  signalId: string;
  timestampET: string;
  entity: string; // e.g. "NVDA", "FED_POWELL", "US_TREASURY", "OPEC", "TSMC"
  sourceType: "NEWS_WIRE" | "SEC_EDGAR" | "FED_SPEECH" | "SOCIAL_VELOCITY" | "GEOPOLITICAL_FEED";
  headline: string;
  noveltyScore: number; // 0.00 to 1.00 (Uniqueness vs existing known macro calendar)
  credibilityScore: number; // 0.00 to 1.00 (Source reliability & official corroboration)
  velocityMultiplier: number; // e.g. 7.4x normal transmission speed
  marketRelevance: number; // 0.00 to 1.00 (Expected beta to NQ / Rates)
  inferredEventType: "EARNINGS_GUIDANCE" | "UNSCHEDULED_FED_COMMENT" | "TREASURY_AUCTION_SHOCK" | "GEOPOLITICAL_ESCALATION" | "CHIP_EXPORT_RESTRICTION";
  estimatedNqDirectionBias: "BULLISH" | "BEARISH" | "VOLATILITY_EXPANSION";
  rawSnippet: string;
}

/**
 * Trading-Grade Multi-Gate Alert Evaluation
 */
export interface TradingGradeAlert {
  alertId: string;
  generatedAtET: string;
  eventOrSignalName: string;
  eventType: string;
  surpriseDescription: string;
  
  // Gate criteria checks
  gates: {
    probabilityThresholdPassed: boolean; // P(move) >= threshold (e.g. 0.70)
    calibrationValid: boolean; // ECE <= 0.08 in walk-forward evaluation
    dataQualityVerified: boolean; // 100% zero-leakage, unrevised point-in-time
    crossAssetConfirmed: boolean; // 2Y delta, DXY, VIX directional confirmation
    noConflictingRelease: boolean; // No dual-sided conflicting print
    credibilitySufficient: boolean; // Credibility >= 0.85
  };
  overallAlertState: "TRIGGERED_HIGH_CONFIDENCE" | "TRIGGERED_CAUTION_ALERT" | "GATE_REJECTED_FILTERED" | "STANDBY_MONITORING";
  
  // Model snapshot
  probMove60m: number;
  probDown60m: number;
  probUp60m: number;
  crossAssetSnapshot: {
    yield2yDeltaBp: number;
    dxyReturnPct: number;
    vixChange: number;
  };
  alertSeverity: "CRITICAL" | "HIGH" | "STANDARD" | "SUPPRESSED";
  actionableContext: string;
}

/**
 * Shadow-Mode Log Entry for Live Verification
 */
export interface ShadowModeLiveLogEntry {
  logId: string;
  eventTimestampET: string;
  eventIdentifier: string;
  availableSnapshotAtPrediction: {
    actualVsConsensus: string;
    surpriseZ: number;
    preNqDrift: number;
    preYield2yDeltaBp: number;
    preVixDelta: number;
    ivRank: number;
  };
  modelPredictions: {
    modelA_prob: number;
    modelB_prob: number;
    modelC_prob: number;
    directionBias: "DOWN" | "UP" | "FLAT";
  };
  alertGenerated: boolean;
  alertDecision: string;
  actualRealizedPricePath: {
    nq1m: number;
    nq5m: number;
    nq15m: number;
    nq30m: number;
    nq60m: number;
    maxExcursion: number;
    didCrossThreshold: boolean;
  };
  validationOutcome: "TRUE_POSITIVE_SUCCESS" | "TRUE_NEGATIVE_CORRECT_QUIET" | "FALSE_POSITIVE_FALSE_ALARM" | "FALSE_NEGATIVE_MISSED_MOVE";
}
