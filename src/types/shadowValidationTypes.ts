import { VerifiedMacroEventRecord, EventFamily } from "./provenance";

export interface ActivePredictionPipelineSummary {
  pipelineStatus: "LIVE_ACTIVE" | "STANDBY" | "PROCESSING";
  nextScheduledRelease: {
    eventName: string;
    eventFamily: EventFamily;
    scheduledTimestampET: string;
    timeRemainingSec: number;
    consensusEstimate: string;
    priorValue: string;
  };
  modelOutput: {
    modelVersion: string;
    modelHash: string;
    probMove60m: number; // e.g. 0.784
    probDown60m: number; // e.g. 0.682
    probUp60m: number; // e.g. 0.102
    expectedExcursionMfe: number; // +0.72%
    expectedExcursionMae: number; // +0.28%
    cohortBaselineRate: number; // 0.2857 (20 mover events / 70 total cohort)
    riskRatioVsBaseline: number; // 0.784 / 0.2857 = 2.74x
    confidenceGrade: "A+" | "A" | "B" | "C";
  };
  preMarketFeaturesState: {
    drift60mPct: number;
    yield2yPreDeltaBp: number;
    ivRankPercentile: number;
    realizedVol10d: number;
    regimeCluster: "HIGH_INFLATION_UNCERTAINTY" | "DISINFLATION_GOLDILOCKS" | "HAWKISH_REPRICING" | "MEGACAP_CONCENTRATION";
  };
  exAnteReactionBands: {
    hawkishSurpriseNq: string; // e.g. "-0.65% to -1.10%"
    dovishSurpriseNq: string; // e.g. "+0.50% to +0.95%"
    inlineQuietNq: string; // e.g. "-0.15% to +0.15%"
  };
}

export interface NoAlertLedgerRecord {
  decisionId: string;
  timestampET: string;
  eventNameOrHeadline: string;
  eventType: "SCHEDULED_MACRO" | "UNSCHEDULED_NEWS" | "SEC_FILING" | "FED_SPEECH" | "GEOPOLITICAL";
  isMarketMoverGroundTruth: boolean;
  predictedProbability: number;
  alertDecision: "ALERT_TRIGGERED" | "NO_ALERT_SUPPRESSED";
  gateScore: "6/6" | "5/6" | "4/6" | "3/6" | "2/6" | "1/6" | "0/6";
  gateBreakdown: {
    g1_probThreshold: boolean;
    g2_calibrationValid: boolean;
    g3_pitProvenance: boolean;
    g4_ratesConfirmed: boolean;
    g5_noConflict: boolean;
    g6_credibility: boolean;
  };
  rejectionReason: string;
  realizedPriceMove60mPct: number;
  classificationOutcome: "TRUE_POSITIVE" | "TRUE_NEGATIVE" | "FALSE_POSITIVE" | "FALSE_NEGATIVE_MISSED";
}

export interface LatencyAuditRecord {
  signalId: string;
  sourceType: string;
  headlineOrEvent: string;
  sourceTimestampET: string;
  ingestionTimestampET: string;
  normalizationTimestampET: string;
  modelInferenceTimestampET: string;
  alertTimestampET: string;
  marketReactionTimestampET: string;
  detectionLatencyMs: number; // AlertTimestamp - SourceTimestamp
  marketLeadSec: number; // MarketReaction - AlertTimestamp
  attributionConfidence: number; // 0.00 to 1.00
  competingSignalsCount: number;
}

export interface DumbBaselineComparison {
  modelName: string;
  category: "DUMB_BASELINE" | "SINGLE_FACTOR" | "HEURISTIC" | "MODEL_C_SUPERVISED";
  description: string;
  prAuc: number;
  rocAuc: number;
  brierScore: number;
  precisionAt70: number;
  recallAt70: number;
  f1Score: number;
  incrementalLiftVsBase: string;
}

export interface RegimeStabilityRecord {
  regimeId: string;
  regimeName: string;
  dateRange: string;
  macroContext: string;
  eventCount: number;
  moverCount: number;
  baseRate: number;
  modelC_prAuc: number;
  modelC_brier: number;
  modelC_precision: number;
  modelC_recall: number;
  stabilityGrade: "ROBUST" | "MODERATE_SENSITIVITY" | "REGIME_DEGRADED";
}

export interface NewsSocialAblationStudy {
  configuration: "SYSTEM_A_MACRO_MARKET" | "SYSTEM_B_MACRO_NEWS" | "SYSTEM_C_MACRO_NEWS_SOCIAL";
  label: string;
  featuresUsed: string[];
  prAuc: number;
  brierScore: number;
  f1Score: number;
  alertPrecision: number;
  medianLeadTimeSec: number;
  independentSourceClusteringEnabled: boolean;
  scientificVerdict: string;
}

export interface LiveGateConditionDetail {
  gateNumber: 1 | 2 | 3 | 4 | 5 | 6;
  gateName: string;
  shortLabel: string;
  conditionRule: string;
  liveMeasuredValue: string;
  thresholdComparison: string;
  passed: boolean;
  falsificationImpact: string;
  category: "PROBABILITY" | "CALIBRATION" | "PROVENANCE" | "TRANSMISSION" | "CROSS_CURRENT" | "CREDIBILITY";
}

export interface LiveSignalDiagnosticSnapshot {
  signalOrEventId: string;
  signalName: string;
  sourceType: string;
  timestampET: string;
  isProspectiveFutureEvent: boolean;
  predictedProbability: number;
  probDown: number;
  probUp: number;
  expectedExcursionMfePct: number;
  attributionHeadlineContributionPct: number; // Attribution separated from prediction
  overallDecision: "ALERT" | "NEAR_MISS" | "WATCH" | "NO_ALERT";
  gateScore: "6/6" | "5/6" | "4/6" | "3/6" | "2/6" | "1/6" | "0/6";
  gates: LiveGateConditionDetail[];
  rejectionOrTriggerReason: string;
  rateTransmissionEvidence: string;
  immutableSnapshotHash: string;
}

export interface LiveScorecardMetrics {
  cohortBaselineRate: number; // 0.2857 (28.6%)
  historicalBacktest: {
    prAuc: number;
    rocAuc: number;
    brierScore: number;
    precisionAt6_6: number;
    recallAt6_6: number;
    falseAlertRate: number;
    ece: number;
    medianLeadTimeSec: number;
    sampleSize: number;
  };
  liveShadowValidation: {
    prAuc: number;
    rocAuc: number;
    brierScore: number;
    precisionAt6_6: number;
    recallAt6_6: number;
    falseAlertRate: number;
    ece: number;
    medianLeadTimeSec: number;
    totalEligibleCandidates: number;
    alertsFiredCount: number;
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    trueNegatives: number;
  };
  deltas: {
    deltaPrAuc: number;
    deltaBrier: number;
    deltaPrecision: number;
    deltaRecall: number;
    deltaFalseAlertRate: number;
  };
  falsificationVerdict: "ROBUST_CONFIRMATION" | "MODERATE_LIFT" | "UNDERPERFORMING";
  summaryDescription: string;
}

export interface GateAblationExperimentRecord {
  configurationId: string;
  gateExcluded: "NONE_ALL_6" | "WITHOUT_G1_PROBABILITY" | "WITHOUT_G2_CALIBRATION" | "WITHOUT_G3_PROVENANCE" | "WITHOUT_G4_RATES" | "WITHOUT_G5_CONFLICT" | "WITHOUT_G6_CREDIBILITY";
  gateType: "FULL_SYSTEM" | "PREDICTIVE_GATE" | "OPERATIONAL_SAFETY_GATE";
  label: string;
  description: string;
  precision: number;
  recall: number;
  prAuc: number;
  falseAlertRate: number;
  deltaPrecision: number;
  deltaRecall: number;
  deltaPrAuc: number;
  deltaFalseAlertRate: number;
  scientificFinding: string;
}

export type SuppressionReasonCode =
  | "SUPPRESS_LOW_PROBABILITY"
  | "SUPPRESS_BAD_CALIBRATION"
  | "SUPPRESS_LOOKAHEAD"
  | "SUPPRESS_NO_CROSS_ASSET_CONFIRMATION"
  | "SUPPRESS_CONFLICTING_RELEASE"
  | "SUPPRESS_LOW_CREDIBILITY"
  | "SUPPRESS_DUPLICATE"
  | "SUPPRESS_STALE";

export interface SuppressionReasonCodeSummary {
  code: SuppressionReasonCode;
  count: number;
  percentage: number;
  primaryCategory: "PREDICTIVE" | "SAFETY_INTEGRITY";
  description: string;
  actionableRemedy: string;
}

export interface NegativeTestFixtureRecord {
  testId: string;
  fixtureName: string;
  category: "RUMOR" | "DUPLICATE" | "REPOSTED" | "LATE" | "CONFLICT" | "BOT_VELOCITY";
  rawPayload: string;
  expectedSuppressionCode: SuppressionReasonCode;
  actualDecision: "NO_ALERT_SUPPRESSED" | "ALERT_TRIGGERED";
  testPassed: boolean;
  reason: string;
}

export interface FrozenReleaseManifest {
  radarVersion: string;
  gitCommit: string;
  modelHash: string;
  featureSchemaHash: string;
  cohortVersion: string;
  calibrationVersion: string;
  gateConfigurationHash: string;
  sourceConfiguration: string;
  deploymentTimestamp: string;
  failClosedProvenanceRule: string;
  immutableStatus: "CRYPTOGRAPHICALLY_SEALED" | "MODIFIABLE_DRAFT";
}

export interface IncrementalInformationStudySummary {
  systemCode: "SYSTEM_A" | "SYSTEM_B" | "SYSTEM_C";
  systemName: string;
  shortLabel: string;
  inputsDescription: string;
  featuresCount: number;
  prAuc: number;
  rocAuc: number;
  brierScore: number;
  eceCalibration: number;
  alertPrecision: number;
  alertRecall: number;
  falseAlertRate: number;
  overallAccuracy: number;
  medianLeadTimeSec: number;
  deltaPrAucVsPrevious: number;
  deltaPrecisionVsPrevious: number;
  deltaBrierVsPrevious: number;
  deltaLeadTimeVsPrevious: number;
  incrementalSourceLiftCommentary: string;
}

export interface PairedEventPredictionComparison {
  eventId: string;
  eventName: string;
  eventCategory: "SCHEDULED_MACRO" | "CORPORATE_WIRE" | "GEOPOLITICAL_BREAKING" | "CENTRAL_BANK_SPEECH";
  actualMoverLabel: 0 | 1; // 1 = Realized |NQ 60m| >= 0.25%
  realized60mPct: number;
  probSystemA: number; // Macro only
  probSystemB: number; // Macro + News
  probSystemC: number; // Full Fusion (Macro + News + Social)
  systemADecision: "ALERT" | "WATCH" | "NO_ALERT";
  systemBDecision: "ALERT" | "WATCH" | "NO_ALERT";
  systemCDecision: "ALERT" | "WATCH" | "NO_ALERT";
  systemALeadTimeSec: number | null;
  systemBLeadTimeSec: number | null;
  systemCLeadTimeSec: number | null;
  brierLossA: number;
  brierLossB: number;
  brierLossC: number;
  deltaBrierB_A: number; // Negative is improvement
  deltaBrierC_B: number; // Negative is improvement
  winningSystem: "SYSTEM_A" | "SYSTEM_B" | "SYSTEM_C" | "TIED";
  incrementalValueExplanation: string;
}

export interface PreRegisteredStoppingRule {
  protocolName: string;
  primaryEndpoint: string;
  primaryThresholdRule: string;
  secondaryEndpoints: string[];
  firstCheckpointCandidates: number;
  firstCheckpointMinAlerts: number;
  secondCheckpointCandidates: number;
  definitiveEvaluationCandidates: number;
  currentProspectiveCount: number;
  currentAlertCount: number;
  ruleStatus: "COLLECTING_PRE_CHECKPOINT_1" | "CHECKPOINT_1_REACHED" | "DEFINITIVE_POWER_REACHED";
}

export interface FailClosedProvenanceAuditLog {
  rejectionId: string;
  timestampET: string;
  sourceFeed: string;
  rawPayloadSnippet: string;
  provenanceViolationReason: string;
  enforcedAction: "NO_PREDICTION_PROVENANCE_UNVERIFIABLE";
  securityImpact: string;
}

export interface CalibrationIntegrityAudit {
  calibrationModelName: string;
  calibrationFitDataEndTimestamp: string;
  calibrationParametersHash: string;
  liveUpdateCount: number; // Strict 0 during prospective freeze
  regimeClusteringState: "FROZEN_STATIC_DISPATCH";
  unauthorizedRefitDetected: boolean;
}

export interface ImmutableProspectiveRecord {
  predictionId: string;
  eventId: string;
  timestampET: string;
  modelVersion: string;
  alertTier: "ALERT" | "WATCH" | "NEAR_MISS" | "NO_ALERT";
  probabilityP_NQ_60m: number;
  probDown: number;
  probUp: number;
  gatePassedCount: number;
  gateBinaryVector: string; // e.g. "1 1 1 1 1 1"
  sourceEvidence: string;
  provenanceCheckPassed: boolean;
  failClosedTripped: boolean;
  preEventSnapshotHash: string;
  // Two-phase outcome append fields (Null or string until release realized)
  realizedStatus: "PENDING_LIVE_RELEASE" | "OBSERVED_OUTCOME_APPENDED";
  realized15mPct: number | null;
  realized30mPct: number | null;
  realized60mPct: number | null;
  maxExcursionMfePct: number | null;
  timeTo025Sec: number | null;
  timeTo050Sec: number | null;
  timeTo100Sec: number | null;
  attributionHeadlineConfidence: number | null;
  sourceIncrementalContribution: {
    macroBaseLift: number;
    newsIncrementalLift: number;
    socialIncrementalLift: number;
  };
}
