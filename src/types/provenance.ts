/**
 * Truth Contract & Provenance Framework for Macroeconomic and Market Data.
 *
 * Implements strict separation across the 4 independent data dimensions:
 * 1. Macro Observation (ALFRED Point-in-Time unrevised vintage)
 * 2. Consensus Forecasts (Historical survey medians with explicit surprise taxonomy & source conflict resolution)
 * 3. Market Reactions (Observed tick/bar timestamp series - no synthetic multipliers, explicit mathematical derivation)
 * 4. News Verification (BLS/Reuters/Fed publication audit)
 */

export type DataStatus = "OBSERVED" | "DERIVED" | "ESTIMATED" | "MISSING" | "SYNTHETIC";

export type OverallEventStatus = "VERIFIED" | "PARTIAL" | "DRAFT" | "REJECTED";

export type EventFamily = "CPI" | "NFP" | "FOMC" | "PCE_PPI" | "OTHER_MACRO";

export interface Provenance {
  status: DataStatus;
  source: string;
  sourceUrl?: string;
  /** When our research pipeline ingested this artifact */
  retrievedAt: string;
  /** Timestamp when the primary source created/published the data */
  sourceTimestamp?: string;
  /** Exact historical observation timestamp being recorded (e.g. '2022-06-10 08:30:00 ET') */
  observationTimestamp?: string;
  methodology?: string;
  rawPayloadSnippet?: any;
  /** Mathematical derivation formula if status === 'DERIVED' */
  formula?: string;
  /** Input IDs / timestamps referenced in calculation */
  inputs?: string[];
  /** Conflict tracking if multiple sources disagree */
  hasConflict?: boolean;
  alternativeValues?: Array<{ source: string; value: any }>;
}

export interface ProvenanceValue<T> {
  value: T;
  provenance: Provenance;
}

/**
 * 1. Macro Observation Dimension (ALFRED Point-in-Time)
 */
export interface ProvenanceMacroObservation {
  seriesId: string;
  vintageDate: string; // e.g. '2022-06-10'
  observationDate: string; // e.g. '2022-05-01' (Reference month)
  headlineValue: ProvenanceValue<number | null>; // e.g. 8.6% for CPI, +353k for NFP, 5.25% for FOMC
  coreValue?: ProvenanceValue<number | null>; // e.g. 6.0% for Core CPI
  unit: string; // '% YoY', 'k Jobs', '% Target Rate', '% MoM'
  alfredRawResponse?: any;
}

/**
 * 2. Consensus Forecast Dimension
 */
export interface ProvenanceConsensus {
  headlineMedian: ProvenanceValue<number | null>; // e.g. 8.3%
  headlineDispersion?: ProvenanceValue<{ low: number; high: number } | null>;
  coreMedian?: ProvenanceValue<number | null>;
  priorHeadline: ProvenanceValue<number | null>;
  surpriseVsConsensus: ProvenanceValue<number | null>; // Actual - Consensus
  surpriseVsPrevious: ProvenanceValue<number | null>; // Actual - Previous
  standardizedZScore: ProvenanceValue<number | null>; // (Actual - Consensus) / rollingSigma
  hypothesisType: "SURPRISE_VS_CONSENSUS" | "SURPRISE_VS_PREVIOUS" | "SURPRISE_VS_WHISPER" | "POLICY_DECISION_RATE";
  consensusStatus: "VERIFIED" | "MISSING" | "ESTIMATED";
}

/**
 * 3. Market Reaction Dimension (Real timestamped prices around release)
 */
export interface MarketPriceObservation {
  timestamp: string; // ISO 8601 UTC
  localTimeET: string; // '08:29:00', '08:30:00', etc.
  price: number;
  provenance: Provenance;
}

export interface AssetReactionHorizons {
  symbol: "NQ" | "TREASURY_2Y" | "TREASURY_10Y" | "USD_DXY" | "VIX";
  preEventPrice: MarketPriceObservation; // T-1m (08:29:00 ET for 08:30 releases, 13:59:00 ET for 14:00 FOMC)
  releasePrice: MarketPriceObservation; // T_0 (08:30:00 ET or 14:00:00 ET)
  postEventPrices: {
    "1m": MarketPriceObservation | null;
    "5m": MarketPriceObservation | null;
    "15m": MarketPriceObservation | null;
    "30m": MarketPriceObservation | null;
    "60m": MarketPriceObservation | null;
  };
  returns: {
    "1m": ProvenanceValue<number | null>;
    "5m": ProvenanceValue<number | null>;
    "15m": ProvenanceValue<number | null>;
    "30m": ProvenanceValue<number | null>;
    "60m": ProvenanceValue<number | null>;
  };
}

export type EventDirection = "UP" | "DOWN" | "CHOP_FLAT";

/**
 * 4. Pre-Event Market State (Contextual Conditioning)
 * Full ex-ante feature set prior to release timestamp.
 */
export interface PreEventMarketState {
  nqReturnMinus120mToPre: ProvenanceValue<number | null>; // % return from T-120m to T_pre
  nqReturnMinus60mToPre: ProvenanceValue<number | null>; // % return from T-60m to T_pre
  nqReturnMinus30mToPre: ProvenanceValue<number | null>; // % return from T-30m to T_pre
  nqPreEventVolRealized5m: ProvenanceValue<number | null>; // Realized volatility / ATR over pre-event window (%)
  yield2yDeltaMinus30mBp: ProvenanceValue<number | null>; // 2Y yield delta (bp) T-30m to T_pre
  yield10yDeltaMinus30mBp: ProvenanceValue<number | null>; // 10Y yield delta (bp) T-30m to T_pre
  dxyReturnMinus30m: ProvenanceValue<number | null>; // DXY % change T-30m to T_pre
  vixDeltaMinus30m: ProvenanceValue<number | null>; // VIX point delta T-30m to T_pre
  nqRelativeVolume: ProvenanceValue<number | null>; // NQ volume / 30-day normal volume ratio
  treasuryRelativeVolume: ProvenanceValue<number | null>; // Treasury volume / normal volume ratio
  eventImpliedVolatility: "ELEVATED" | "NORMAL" | "SUBDUED"; // Options implied volatility rank
  ivRankPercentile: number; // 0 to 100 percentile
  marketContextSummary: string; // e.g. "Rallied +0.65% into release (pre-event squeeze)"
}

/**
 * 5. Rate Market Repricing & Fed Funds Expectations
 * Note: Rates transmission relationship reflects empirical market association across front-end pricing.
 */
export interface RateMarketRepricing {
  fedFundsCutProbabilityBefore: ProvenanceValue<number | null>; // e.g. 35.0%
  fedFundsCutProbabilityAfter: ProvenanceValue<number | null>; // e.g. 52.0%
  fedFundsCutOddsDeltaPercentagePoints: ProvenanceValue<number | null>; // +17.0 pp
  marketImpliedRateDeltaBp: ProvenanceValue<number | null>; // e.g. -14.2 bp
  transmissionSummary: string; // Empirical transmission relationship summary
  causalChainNarrative: string; // e.g. "Cooler CPI (-0.1%) -> Fed Cut Odds +17pp -> 2Y -18bp -> NQ +1.85%"
}

/**
 * 6. Multi-Horizon Path Excursions (MFE / MAE)
 */
export interface PathExcursions {
  mfe60: ProvenanceValue<number>; // Maximum Favorable Excursion (% max positive move in 0..60m)
  mae60: ProvenanceValue<number>; // Maximum Adverse Excursion (% max negative move in 0..60m)
  mfeTimestampMin: number; // minute of peak (e.g. 35)
  maeTimestampMin: number; // minute of trough (e.g. 2)
  pathTrajectory: "CONTINUATION_TREND" | "IMMEDIATE_WHIPSAW" | "INITIAL_SPIKE_THEN_FADE" | "INITIAL_DIP_THEN_REVERSAL" | "CONSOLIDATION";
}

/**
 * 7. Event Reaction Classification Taxonomy
 */
export type MacroReactionClassificationType =
  | "TYPE_A_DOVISH_RELIEF" // Cooler inflation / dovish shift -> Yields lower -> NQ higher
  | "TYPE_B_HAWKISH_PRESSURE" // Hot inflation / blowout jobs -> Yields higher -> NQ lower
  | "TYPE_C_FED_CUT_PRICING" // Weak growth/bad news -> Yields plunge -> NQ higher (trading Fed pivot)
  | "TYPE_D_STAGFLATION_SHOCK" // Hot inflation + slowing growth -> Yields higher -> NQ plunges
  | "TYPE_E_POLICY_ALIGNMENT" // Rate decision aligns with consensus, press conference volatility
  | "TYPE_F_QUIET_CONTROL"; // Muted reaction, sub-0.25% dispersion (Negative/Control cohort)

/**
 * 8. Null Model / Time-of-Day Baseline Comparison
 */
export interface TimeOfDayNullBaseline {
  expectedDriftReturn: number; // Historical mean 08:30-09:30 NQ return (e.g. +0.03%)
  expectedVolatilitySigma: number; // Historical standard deviation 08:30-09:30 (e.g. 0.28%)
  abnormalReturn: number; // EventReturn - ExpectedDriftReturn
  abnormalSigmaMultiple: number; // |AbnormalReturn| / expectedVolatilitySigma
  isStatisticallySignificantAt2Sigma: boolean;
}

/**
 * 9. Event Classification Target Objectives (Stage 1 Radar Ground Truth)
 */
export interface EventClassificationTargets {
  move_025_60m: boolean; // |NQ_60m| >= 0.25%
  move_050_60m: boolean; // |NQ_60m| >= 0.50%
  move_100_60m: boolean; // |NQ_60m| >= 1.00%
  up_025_60m: boolean; // NQ_60m >= +0.25%
  down_025_60m: boolean; // NQ_60m <= -0.25%
  time_to_025_min: number | null; // Minutes to first cross ±0.25%, null if never crossed
  direction: EventDirection; // "UP" | "DOWN" | "CHOP_FLAT"
  max_excursion_60m: {
    mfe: number;
    mae: number;
    dominantSide: "LONG" | "SHORT" | "NEUTRAL";
  };
}

/**
 * 10. News & Publication Audit Dimension
 */
export interface ProvenanceNewsVerification {
  primaryAgencyReleaseConfirmed: boolean;
  wireReportConfirmed: boolean;
  officialReleaseTimestampET: string;
  headlineText: string;
  sourceUrls: string[];
  independentConfirmation: boolean;
  provenance: Provenance;
}

/**
 * Raw Evidence Bundle file references for auditable reproducibility
 */
export interface RawEvidenceBundle {
  bundleDirectory: string; // e.g. '/events/US-CPI-2022-05/'
  macroRawFile: string; // 'macro/alfred-response.json'
  consensusSourceFile: string; // 'consensus/consensus-source.json'
  marketBarsFiles: {
    nq: string;
    us2y: string;
    us10y: string;
    dxy: string;
    vix: string;
  };
  newsVerificationFile: string; // 'news/bls-or-wire.json'
  goldenVerificationHash: string;
}

/**
 * Benchmark Changelog Record
 */
export interface BenchmarkChangelogEntry {
  eventId: string;
  eventName: string;
  previousValue: string;
  v2AuthoritativeValue: string;
  dimension: "NQ_60M_RETURN" | "YIELD_2Y_DELTA" | "SURPRISE_Z";
  auditRationale: string;
  sourceVerificationProof: string;
}

/**
 * Quantitative Impact Model Probability Outputs (Stage 3)
 */
export interface DetectorModelOutputs {
  modelA_eventOnly: {
    prob_move_025: number; // P(|NQ60| >= 0.25%) = f(family, surprise_z)
    prob_move_050: number;
    prob_down_025: number;
    prob_up_025: number;
    confidenceScore: number;
    formula: string;
  };
  modelB_marketState: {
    prob_move_025: number; // f(family, surprise_z, pre_drift, yield2y_pre, vix, vol)
    prob_move_050: number;
    prob_down_025: number;
    prob_up_025: number;
    confidenceScore: number;
    conditioningSummary: string;
  };
  modelC_crossAssetCutoff1m: {
    prob_move_025: number; // f(surprise, pre_state, yield2y_1m, yield10y_1m, dxy_1m, vix_1m)
    prob_move_050: number;
    prob_down_025: number;
    prob_up_025: number;
    confidenceScore: number;
    cutoffTime: "T+1m (strictly no lookahead to 60m)";
    crossAssetConfirmation: "CONFIRMED" | "DIVERGENT" | "NEUTRAL";
  };
}

/**
 * Canonical Provenance-Tracked Verified Macro Event Record
 */
export interface VerifiedMacroEventRecord {
  eventId: string; // e.g. "US-CPI-2022-05", "US-CPI-2023-10", "US-CPI-2024-03", "US-NFP-2024-01", "US-FOMC-2023-05"
  eventType:
    | "US_CPI"
    | "US_NFP"
    | "US_FOMC"
    | "US_PPI"
    | "US_PCE"
    | "US_RETAIL_SALES"
    | "US_ISM_PMI"
    | "US_ISM_MANUFACTURING"
    | "US_ISM_SERVICES"
    | "US_GDP"
    | "US_DURABLE_GOODS"
    | "US_JOBLESS_CLAIMS";
  eventFamily: EventFamily | "OTHER_MACRO";
  eventName: string;
  referencePeriod: string; // '2022-05', '2023-10', '2024-03', '2024-01', '2023-05'
  releaseTimestampET: string; // '2022-06-10 08:30:00 America/New_York'
  releaseTimestampUTC: string; // '2022-06-10T12:30:00.000Z'
  overallStatus: OverallEventStatus;
  isImmutableBenchmark: boolean; // True for the 5 frozen anchor fixtures
  isControlEvent: boolean; // True if part of the 50 negative/control quiet events (|NQ_60m| < 0.25%)
  isMarketMover: boolean; // True if |NQ_60m| >= 0.25%

  macroObservation: ProvenanceMacroObservation;
  consensus: ProvenanceConsensus;
  preEventState: PreEventMarketState;
  rateRepricing: RateMarketRepricing;
  pathExcursions: PathExcursions;
  reactionClassification: MacroReactionClassificationType;
  nullModelComparison: TimeOfDayNullBaseline;
  classificationTargets: EventClassificationTargets;
  modelOutputs?: DetectorModelOutputs;

  marketReactions: {
    NQ: AssetReactionHorizons;
    TREASURY_2Y: AssetReactionHorizons;
    TREASURY_10Y: AssetReactionHorizons;
    USD_DXY: AssetReactionHorizons;
    VIX: AssetReactionHorizons;
  };
  newsVerification: ProvenanceNewsVerification;
  evidenceBundle: RawEvidenceBundle;
  datasetHash: string;
}

/**
 * Dataset Cohort Versioning Metadata
 */
export interface DatasetCohortMetadata {
  datasetVersion: string; // "verified-cohort-v2.0"
  fixtureVersion: string; // "2.0.0"
  totalEvents: number;
  positiveEventsCount: number; // 20 market movers
  negativeControlEventsCount: number; // 50 control events
  frozenBenchmarkEvents: string[];
  codeCommitSnapshot: string;
  allRequiredFieldsVerified: boolean;
  lastForensicAuditDate: string;
  benchmarkChangelog: BenchmarkChangelogEntry[];
}
