export type MarketDirection = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";

export type TimeframeId = "1m" | "5m" | "15m" | "30m" | "1h" | "5h" | "1D" | "1W" | "1M";

export interface IndicatorRow {
  name: string;
  value: string;
  action: "BUY" | "SELL" | "NEUTRAL";
}

export interface MovingAverageRow {
  period: string;
  simpleValue: string;
  simpleAction: "BUY" | "SELL";
  exponentialValue: string;
  exponentialAction: "BUY" | "SELL";
}

export interface SpeedometerData {
  timeframe: TimeframeId;
  label: string;
  summaryDirection: MarketDirection;
  summaryScore: number; // -100 to +100
  fundamentalContext?: string; // Why the market is moving fundamentally (e.g. London fix, COMEX session flows, CPI/NFP)
  newsCatalystDriver?: string; // Concrete news backing the move
  mathReasoning?: string; // Statistical/mathematical reasoning (momentum vs mean reversion)
  technicalIndicators: {
    buyCount: number;
    neutralCount: number;
    sellCount: number;
    score: number; // -100 to +100
    direction: MarketDirection;
    details: IndicatorRow[];
  };
  movingAverages: {
    buyCount: number;
    neutralCount: number;
    sellCount: number;
    score: number; // -100 to +100
    direction: MarketDirection;
    details: MovingAverageRow[];
  };
  pivotPoints: {
    classic: { s3: string; s2: string; s1: string; p: string; r1: string; r2: string; r3: string };
    fibonacci: { s3: string; s2: string; s1: string; p: string; r1: string; r2: string; r3: string };
  };
  plainEnglishAdvice?: string;
  plainGermanAdvice?: string; // Legacy fallback
  volatilityActionPlan?: {
    supportBarrier: string;
    resistanceBarrier: string;
    targetZone1: string;
    targetZone2: string;
    volatilityRange: string;
  };
  knockoutActionPlan?: {
    callSafeBarrier: string;
    putSafeBarrier: string;
    targetExitCoordinate1: string;
    targetExitCoordinate2: string;
    suggestedLeverageRange: string;
  };
}

export interface JargonExplanation {
  termKey: string;
  headline: string;
  grandpaSummary: string;
  kidAnalogy: string;
  technicalMeaning: string;
  whyItMattersForKnockouts: string;
  bullishReaction: string;
  bearishReaction: string;
  iconName: string;
}

export interface HistoricalBacktestProofItem {
  id: string;
  eventDate: string;
  eventName: string;
  predictionMadeBeforehand: "BULLISH_UP" | "BEARISH_DOWN" | "NEUTRAL_RANGE";
  predictedTargetZone: string;
  actualEventOutcome: string;
  actualMarketReactionPct: string;
  didForecastProveCorrect: boolean; // true = ✅ PROVEN POINT, false = ❌ MISSED
  proofScoreNote: string;
  knockoutProfitPotentialPct: string;
}

export interface StockCatalystWatchlistItem {
  ticker: string;
  name: string;
  assetCategory: "TECH_STOCK" | "INDEX" | "COMMODITY" | "DEFENSE";
  flagEmoji: string;
  currentPrice: number;
  currency: string;
  germanTradingHours: string; // e.g. "08:00 - 22:00 CEST"
  nextBigEventTitle: string;
  nextEventDateCest: string;
  daysUntilEvent: number;
  eventImportance: "MAXIMUM_VOLATILITY" | "HIGH_IMPACT" | "MEDIUM_IMPACT";
  
  // IF BEAT vs IF MISS target coordinates
  ifBeatScenario: {
    conditionText: string;
    expectedMovePct: string;
    targetPriceCoordinate: string;
    callKnockoutStrategy: string;
    winProbabilityPct: number;
  };
  ifMissScenario: {
    conditionText: string;
    expectedMovePct: string;
    targetPriceCoordinate: string;
    putKnockoutStrategy: string;
    dangerBarrierLevel: string;
    winProbabilityPct: number;
  };

  // Backtest Proven Track Record
  historicalAccuracyRatePct: number;
  testedCatalystCount: number;
  pastProofRecords: HistoricalBacktestProofItem[];

  // Derivative & Knockout Parameters
  derivativeGuide: {
    recommendedCallBarrier: string;
    recommendedPutBarrier: string;
    safeDistancePct: string;
    optimalTradingWindowGerman: string;
    keyRiskFactor: string;
  };
}

export interface BankExpectation {
  bankName: string;
  analyst: string;
  forecastValue: string;
  stance: "HAWKISH" | "DOVISH" | "NEUTRAL" | "BULLISH" | "BEARISH";
  commentary: string;
  targetPriceImpact: string;
}

export interface TweetSocialExpectation {
  author: string;
  handle: string;
  authorRole: string;
  avatarUrl?: string;
  tweetText: string;
  timestamp: string;
  sentiment: "BULLISH" | "BEARISH" | "CAUTION" | "NEUTRAL";
  predictedTarget: string;
  likesOrRetweets: string;
}

export interface HistoricalPriceScenario {
  outcomeCase: string;
  condition: string;
  historicalProbability: number;
  historicalSampleSize: number;
  expectedNasdaqMovePct: string;
  expectedDaxMovePct: string;
  expectedYieldMoveBps: string;
  primaryTargetZone: string;
  playbookDescription: string;
}

export interface UpcomingEconomicEvent {
  id: string;
  eventName: string;
  country: "US" | "GERMANY" | "UK" | "JAPAN" | "EUROZONE" | "HONG_KONG" | "CHINA";
  flagEmoji: string;
  category: "INFLATION" | "CENTRAL_BANK" | "GROWTH_GDP" | "EMPLOYMENT" | "TECH_EARNINGS" | "TRADE_PMI";
  germanDateTimeCest: string;
  usDateTimeEt: string;
  dateOnly: string; // YYYY-MM-DD
  timeCest: string;
  impactLevel: "HIGH" | "MEDIUM" | "LOW";
  consensusForecast: string;
  previousValue: string;
  forecastRange: string;
  unit: string;
  summaryDescription: string;
  bankExpectations: BankExpectation[];
  tweetExpectations: TweetSocialExpectation[];
  historicalScenarios: HistoricalPriceScenario[];
  estimatedDirection: MarketDirection;
  estimatedTargetDropOrGain: string;
}

export interface TodayReleasedNewsItem {
  id: string;
  headline: string;
  country: "US" | "GERMANY" | "UK" | "JAPAN" | "EUROZONE" | "CHINA";
  flagEmoji: string;
  releasedTimeCest: string;
  category: "MACRO" | "CENTRAL_BANK" | "EARNINGS" | "GEOPOLITICS" | "POLICY";
  actualValue: string;
  consensusValue: string;
  previousValue: string;
  outcomeType: "BEAT_POSITIVE" | "MISS_NEGATIVE" | "AS_EXPECTED" | "HAWKISH_SURPRISE" | "DOVISH_SURPRISE";
  isMarketPositive: boolean; // Green = true, Red = false
  marketReactionNasdaq: string;
  marketReactionDax: string;
  marketReaction10YYield: string;
  predictedTargetRange: string; // e.g. "Target: -1.5% to -2.0% Sell-off"
  targetDirection: "DOWN" | "UP" | "SIDEWAYS";
  targetMagnitudePct: number; // e.g. -1.8
  keyTakeaway: string;
  tweetReactions: TweetSocialExpectation[];
}

export interface TechnicalTimeframeSignal {
  timeframe: "5m" | "15m" | "30m" | "1h" | "5h" | "1D";
  signal: MarketDirection;
  rsiValue: number;
  rsiSignal: "BUY" | "SELL" | "NEUTRAL";
  macdValue: number;
  macdSignal: "BUY" | "SELL" | "NEUTRAL";
  ema20AboveEma50: boolean;
  overallScore: number; // -100 to +100
}

export interface InstrumentTechnicalOverview {
  symbol: string;
  displayName: string;
  assetClass: "EQUITY_INDEX" | "TECH_STOCK" | "CURRENCY" | "COMMODITY" | "CRYPTO" | "BONDS";
  flagEmoji: string;
  currentPrice: number;
  priceFormatted: string;
  change24hPct: number;
  overallRecommendation: MarketDirection;
  newsSentimentScore: number; // 0 to 100
  newsSentimentLabel: "VERY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "VERY_BEARISH";
  timeframeSignals: {
    "5m": TechnicalTimeframeSignal;
    "15m": TechnicalTimeframeSignal;
    "30m": TechnicalTimeframeSignal;
    "1h": TechnicalTimeframeSignal;
    "5h": TechnicalTimeframeSignal;
    "1D": TechnicalTimeframeSignal;
  };
  supportLevel: string;
  resistanceLevel: string;
  pivotPoint: string;
  shortCommentary: string;
}

export interface GlobalMarketSessionInfo {
  exchangeCode: "FRA" | "LSE" | "NYSE" | "TSE" | "HKEX" | "ASX";
  city: string;
  country: string;
  flagEmoji: string;
  marketName: string;
  openCest: string;
  closeCest: string;
  openLocal: string;
  closeLocal: string;
  localTimezone: string;
  status: "OPEN" | "CLOSED" | "CLOSING_SOON" | "PRE_MARKET" | "AFTER_HOURS";
  timeUntilNextEvent: string;
  volumeProfile: "PEAK_LIQUIDITY" | "MODERATE" | "LOW_AFTER_HOURS" | "CLOSED";
  keyBenchmark: string;
  keyBenchmarkChange: string;
}

export interface PoliticianTradeRecord {
  id: string;
  politicianName: string;
  party: "DEMOCRAT" | "REPUBLICAN";
  chamber: "HOUSE" | "SENATE";
  state: string;
  committeeAssignments: string[];
  ticker: string;
  companyName: string;
  transactionType: "PURCHASE" | "SALE" | "OPTION_CALL" | "OPTION_PUT";
  amountRange: string;
  estimatedAmountValue: number;
  transactionDate: string;
  disclosureFilingDate: string;
  filingDelayDays: number;
  tradeRationaleContext: string;
  subsequentPricePerformance: string;
  sourceDocLink?: string;
  insiderRiskRating: "HIGH_COMMITTEE_OVERLAP" | "MODERATE" | "ROUTINE";
}

export interface CorporateBigDealItem {
  id: string;
  companyName: string;
  ticker: string;
  dealTitle: string;
  dealType: "DEFENSE_CONTRACT" | "AI_INFRASTRUCTURE" | "STRATEGIC_PARTNERSHIP" | "MERGER_ACQUISITION" | "EARNINGS_BEAT";
  dealValueBillions: string;
  announcementDate: string;
  counterpartyOrAgency: string;
  expectedPriceImpact: string;
  summary: string;
}
