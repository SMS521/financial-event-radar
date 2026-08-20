export type EventType =
  | "CPI"
  | "PCE"
  | "NFP"
  | "JOBLESS_CLAIMS"
  | "PPI"
  | "RETAIL_SALES"
  | "GDP"
  | "ISM_MANUFACTURING"
  | "FOMC_DECISION"
  | "BOJ_DECISION"
  | "NVIDIA_EARNINGS";

export type EventCategory =
  | "Inflation"
  | "Labor"
  | "Monetary Policy"
  | "Economic Activity"
  | "Corporate Earnings"
  | "Geopolitics";

export type AssetSymbol =
  | "NQ"
  | "SPX"
  | "DAX"
  | "NIKKEI"
  | "HSI"
  | "KOSPI"
  | "TREASURY_2Y"
  | "TREASURY_10Y"
  | "USD_DXY"
  | "VIX"
  | "WTI_OIL"
  | "GOLD";

export type Horizon = "1m" | "5m" | "15m" | "30m" | "60m" | "1d";

export interface AssetReturnSet {
  "1m": number;
  "5m": number;
  "15m": number;
  "30m": number;
  "60m": number;
  "1d": number;
}

export interface EventReaction {
  event_id: string;
  NQ: AssetReturnSet;
  SPX: AssetReturnSet;
  DAX: AssetReturnSet;
  NIKKEI: AssetReturnSet;
  HSI: AssetReturnSet;
  KOSPI: AssetReturnSet;
  TREASURY_2Y: AssetReturnSet; // basis points
  TREASURY_10Y: AssetReturnSet; // basis points
  USD_DXY: AssetReturnSet; // % return
  VIX: AssetReturnSet; // index points delta
  WTI_OIL: AssetReturnSet; // % return
  GOLD: AssetReturnSet; // % return
}

export interface MultidimensionalVector {
  headline_surprise: number;
  core_surprise: number;
  shelter_surprise?: number;
  services_surprise?: number;
  wage_surprise?: number;
  revision_surprise?: number;
  guidance_surprise?: number;
  sentiment_tone?: number; // -1.0 (very hawkish/bearish) to +1.0
}

export interface ConfoundingLayer {
  is_contaminated: boolean;
  confidence: "Pure" | "Contaminated" | "Marginal";
  events_within_60s: string[];
  events_within_5m: string[];
  contamination_notes: string;
}

export interface MarketState {
  fed_regime: "Hawkish Tightening" | "Dovish Pause" | "Easing Cycle" | "Higher for Longer";
  vix_regime: "Low Vol (<14)" | "Normal (14-20)" | "Elevated (20-30)" | "Crisis (>30)";
  yield_10y_trend: "Surging (+15bp 5d)" | "Rangebound" | "Falling (-10bp 5d)";
  nq_trend: "Strong Uptrend (+3% 20d)" | "Chop / Consolidating" | "Oversold Pullback";
  usd_trend: "Bullish Breakout" | "Neutral" | "Weakening";
  market_positioning: "Overextended Longs" | "Neutral" | "Net Short / De-risked";
  vix_level: number;
  yield_10y_level: number;
  fed_funds_rate: number;
}

export interface NewsItem {
  id: string;
  timestamp: string;
  latency_seconds: number;
  headline: string;
  source: string;
  sentiment_score: number;
  key_entity: string;
  event_extracted: string;
}

export interface PointInTimeVintage {
  vintage_id: string;
  as_of_date: string;
  raw_value: number;
  first_revision: number | null;
  final_revision: number | null;
  revision_history: { date: string; value: number; note: string }[];
}

export interface MarketPreEventState {
  yield2y_delta_pre_30m_bp: number;
  yield10y_delta_pre_30m_bp: number;
  dxy_return_pre_30m_pct: number;
  vix_delta_pre_30m: number;
  nq_return_pre_30m_pct: number;
  iv_rank_percentile: number;
}

export interface MarketEvent {
  event_id: string;
  event_type: EventType;
  event_name: string;
  country: string;
  market: string;
  source: string;
  scheduled_ts: string;
  publication_ts: string;
  known_ts: string; // strict Point-in-Time timestamp
  actual: number;
  previous: number;
  consensus: number;
  unit: string;
  surprise: number; // Actual - Consensus
  standardized_surprise: number; // (Actual - Consensus) / sigma
  historical_sigma: number;
  revision: number | null;
  revision_ts: string | null;
  importance: "Critical" | "High" | "Medium";
  event_category: EventCategory;
  source_quality: "Tier 1 Official (BLS/BEA/Fed)" | "Tier 1 Official (BOJ/ECB)" | "Exchange Official" | "Secondary Survey" | "Simulated Input";
  data_quality: "A+ Verified" | "A Audited" | "B Preliminary" | "Degraded" | "Simulated";
  origin_type?: "verified_feed" | "user_simulation";
  is_verified?: boolean;
  validation_status?: "valid" | "warning" | "invalid";
  validation_errors?: string[];
  multidimensional_vector: MultidimensionalVector;
  confounding: ConfoundingLayer;
  market_state: MarketState;
  pre_event_state?: MarketPreEventState;
  reactions: EventReaction;
  news_feed: NewsItem[];
  vintages?: PointInTimeVintage;
}

export interface HistoricalAnalogue {
  event: MarketEvent;
  similarity_score: number; // 0.0 to 1.0
  distance: number;
  surprise_diff: number;
  vix_diff: number;
  yield_diff: number;
  regime_match: boolean;
}

export interface AnalogueStats {
  count: number;
  median_60m: number;
  mean_60m: number;
  std_dev_60m: number;
  iqr_25_75: [number, number];
  min_return: number;
  max_return: number;
  prob_up_25: number;
  prob_up_50: number;
  prob_down_25: number;
  prob_down_50: number;
  win_rate_directional: number;
  t_statistic: number;
  p_value: number;
  surprise_percentile: number;
  best_case: number;
  worst_case: number;
  cross_asset_medians: Record<AssetSymbol, { "5m": number; "15m": number; "60m": number; "1d": number }>;
}

export interface RegressionModelResult {
  model_id: "M0" | "M1" | "M2" | "M3" | "M4" | "M5";
  model_name: string;
  formula: string;
  r_squared: number;
  adj_r_squared: number;
  aic: number;
  bic: number;
  f_statistic: number;
  coefficients: { name: string; estimate: number; std_error: number; t_stat: number; p_value: number }[];
  residual_std_error: number;
}

export interface AgentCouncilResult {
  macro_agent: {
    stance: "bullish" | "bearish" | "neutral";
    confidence: number;
    thesis: string;
    key_drivers: string[];
  };
  rates_agent: {
    stance: "bullish" | "bearish" | "neutral";
    confidence: number;
    yield_curve_view: string;
    duration_impact: string;
  };
  global_agent: {
    stance: "bullish" | "bearish" | "neutral";
    currency_transmission: string;
    global_spillover: string;
  };
  news_agent: {
    narrative_framing: string;
    algorithmic_latency: string;
    media_bias: string;
  };
  historical_scientist: {
    analogue_count: number;
    median_response: string;
    win_rate: string;
    statistical_takeaway: string;
  };
  bull_case: {
    headline: string;
    core_arguments: string[];
    target_nq_60m: string;
  };
  bear_case: {
    headline: string;
    core_arguments: string[];
    target_nq_60m: string;
  };
  skeptic_agent: {
    confounding_flags: string[];
    contamination_critique: string;
    regime_drift_warning: string;
  };
  research_manager: {
    consensus_bias: "bullish" | "bearish" | "neutral" | "conflicted";
    overall_confidence: number;
    synthesized_probability_up: number;
    synthesized_probability_down: number;
    executive_summary: string;
    why_graph_summary: string;
  };
  risk_officer: {
    recommended_action: "High Conviction Position" | "Reduced Size" | "Sit on Hands / High Contamination" | "Hedge Duration";
    max_drawdown_risk: string;
    tail_risk_warning: string;
    key_invalidation_level: string;
  };
}

export interface AgentScorecard {
  agent_name: string;
  role: string;
  events_scored: number;
  directional_accuracy: number; // e.g. 0.74 (74%)
  brier_score: number; // lower is better (0.0 to 1.0)
  log_loss: number;
  calibration_score: number; // 0-100
  economic_value_added_bps: number; // in basis points
  false_positives: number;
  false_negatives: number;
  regime_specialty: string;
}

export interface ExperimentRecord {
  id: string;
  family:
    | "Phase 0 - Historical Feasibility Baseline"
    | "Family A - Event Response"
    | "Family B - Surprise Magnitude"
    | "Family C - Market Regime"
    | "Family D - Cross-Market Transmission"
    | "Family E - News & Confounding"
    | "Family F - Agent Reasoning";
  code: string;
  title: string;
  hypothesis: string;
  target_asset: string;
  dataset: string;
  sample_size: number;
  registered_date: string;
  status: "Completed (Preserved)" | "Validated" | "Null Finding (Informative)" | "Active Experiment";
  models: RegressionModelResult[];
  key_finding: string;
  statistical_verdict: string;
}

export interface TransmissionNode {
  id: string;
  label: string;
  category: "shock" | "rates" | "fx" | "valuation" | "equities" | "global";
  delta: string;
  direction: "up" | "down" | "neutral";
  mechanism: string;
  x: number;
  y: number;
}

export interface TransmissionEdge {
  from: string;
  to: string;
  label: string;
  latency_sec: number;
  strength: number; // 0 to 1
  animated: boolean;
}

export interface FactorScore {
  name: string;
  score: number; // 0 to 100
  weight: number; // e.g. 0.20
  description: string;
  status: "Bullish" | "Bearish" | "Neutral" | "Confirmed" | "Divergent";
}

export interface EventImpactScorecard {
  macro_importance: FactorScore;
  surprise_score: FactorScore;
  news_credibility: FactorScore;
  social_acceleration: FactorScore;
  treasury_confirmation: FactorScore;
  nq_reaction: FactorScore;
  cross_asset_confirmation: FactorScore;
  total_impact_score: number; // 0 to 100
  alert_threshold: number; // 75
  is_alert_triggered: boolean;
  signal_verdict: "STRONG BULLISH" | "MODERATE BULLISH" | "NEUTRAL / CHOP" | "MODERATE BEARISH" | "STRONG BEARISH";
  confidence: number; // 0 to 100
  signal_color: "emerald" | "rose" | "amber" | "slate";
  expected_nq_move_60m: string; // e.g. "+0.85% to +1.40%"
  probability_exceeds_25bps: number; // e.g. 87%
  key_invalidation_level: string;
  recommended_strategy: string;
}

export interface CrossAssetReaction {
  symbol: string;
  name: string;
  expected_delta: string;
  actual_delta: string;
  unit: string;
  direction: "up" | "down" | "flat";
  is_aligned: boolean;
  status_note: string;
}

export interface RadarEventItem {
  id: string;
  title: string;
  category: "Macro Scheduled" | "Breaking News" | "Central Bank" | "Corporate Filing / 8-K" | "Social / Polymarket" | "Geopolitics";
  timestamp: string;
  source: string;
  credibility_rating: "Tier 1 Official (BLS/Fed)" | "Wire (Bloomberg/Reuters)" | "SEC EDGAR 8-K" | "Social Sentiment (X/Reddit/Polymarket)" | "Geopolitical Flash";
  is_scheduled: boolean;
  expected_time?: string;
  actual?: number | string;
  consensus?: number | string;
  previous?: number | string;
  unit?: string;
  surprise?: number | string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  impact_score: EventImpactScorecard;
  cross_assets: CrossAssetReaction[];
  entity_graph: {
    origin_entity: string;
    chain: string[];
    terminal_asset: string;
  };
  summary: string;
}

export interface ReverseEventAnalysis {
  detected_market_move: {
    asset: string;
    timeframe: string;
    magnitude: string;
    z_score: number;
    timestamp: string;
  };
  candidate_causes: {
    event_id: string;
    title: string;
    source: string;
    likelihood_score: number; // 0 to 100
    transmission_channel: string;
    verification_status: "Confirmed Driver" | "Probable Catalyst" | "Unrelated Noise";
  }[];
  causal_verdict: string;
}

