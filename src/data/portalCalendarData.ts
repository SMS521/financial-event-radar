export interface EconomicCalendarRow {
  id: string;
  time: string; // e.g. "08:00"
  countryIso: string; // "UK", "DE", "US", "EU", "AU", "NZ", "JP", "ES", "ZA", "CA"
  countryFlag: string;
  eventName: string;
  importanceStars: 1 | 2 | 3;
  actual?: string;
  forecast: string;
  previous: string;
  currency: string;
  dateGroup: string; // e.g. "Tuesday, August 18, 2026"
  isSpeech?: boolean;
  speakerName?: string;
  impactOnMarket: string;
  grandpaExplanation: string;
  category: "INFLATION" | "EMPLOYMENT" | "CENTRAL_BANK" | "GROWTH" | "TRADE" | "HOUSING" | "SENTIMENT";
}

export interface EarningsCalendarRow {
  id: string;
  companyName: string;
  ticker: string;
  countryFlag: string;
  epsActual?: string;
  epsForecast: string;
  revenueActual?: string;
  revenueForecast: string;
  marketCap: string;
  timeOfDay: "PRE_MARKET" | "AFTER_HOURS" | "DURING_DAY";
  lastPrice: string;
  priceChangePct: number;
  extendedHoursPrice?: string;
  extendedHoursChangePct?: number;
  revisionsUp: number;
  revisionsDown: number;
  epsSurprisePct?: string;
  revenueSurprisePct?: string;
  dateGroup: string;
  sector: string;
  bullCase: string;
  bearCase: string;
}

export interface DividendCalendarRow {
  id: string;
  companyName: string;
  ticker: string;
  countryFlag: string;
  exDividendDate: string;
  dividendAmount: number;
  currency: string;
  frequencyType: "1M" | "3M" | "6M" | "1Y";
  paymentDate: string;
  dividendYieldPct: number;
  sector: string;
  payoutSafetyScore: "SAFE" | "VERY_SAFE" | "MODERATE" | "HIGH_RISK";
}

export interface CentralBankRateRow {
  id: string;
  code: string;
  name: string;
  countryFlag: string;
  interestRatePct: number;
  nextMeetingDate: string;
  daysUntilMeeting: number;
  policyBias: "CUTTING" | "HIKING" | "PAUSED" | "EASING";
  expectedNextMove: string;
}

export interface MarketArticleRow {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  timestampAgo: string;
  category: "Analysis" | "News" | "Editor's Picks" | "Commodities" | "Currencies" | "Crypto";
  commentCount: number;
  isPopular?: boolean;
  readTimeMin: number;
  fullBodyMarkdown?: string;
  relatedTickers: string[];
}

export interface StockProProfileData {
  ticker: string;
  name: string;
  exchange: string; // e.g. "NASDAQGS:AAPL"
  sector: string;
  industry: string;
  priceUsd: number;
  dayChangeUsd: number;
  dayChangePct: number;
  range52WeekLow: number;
  range52WeekHigh: number;
  afterHoursPrice: number;
  afterHoursChangeUsd: number;
  afterHoursChangePct: number;
  description: string;
  latestReportDate: string;
  nextEarningsDate: string;
  secFilings: { label: string; url: string }[];
  keyHighlights: {
    isPositive: boolean;
    text: string;
  }[];
  peers: string[];
  fairValue: {
    averageValueUsd: number;
    downsidePct: number;
    uncertainty: "LOW" | "MEDIUM" | "HIGH";
    spreadLowUsd: number;
    spreadHighUsd: number;
    marketRange52w: { low: number; high: number };
    analystTarget: { average: number; low: number; high: number; count: number };
    investingModels: { average: number; low: number; high: number; modelCount: number };
  };
  financialHealth: {
    overallScore: number; // 1 to 5
    overallRating: string; // e.g. "Good Performance"
    cashFlowHealth: number; // 1 to 5
    growthHealth: number;
    priceMomentum: number;
    profitabilityHealth: number;
    relativeValue: number;
    description: string;
  };
  prebuiltModels: {
    id: string;
    title: string;
    updatedTimeAgo: string;
    fairValueResult: string;
  }[];
}

// 1. ECONOMIC CALENDAR DATA (Authentic Investing.com Structure)
export const ECONOMIC_CALENDAR_DATA: EconomicCalendarRow[] = [
  {
    id: "econ-1",
    time: "02:30",
    countryIso: "AU",
    countryFlag: "🇦🇺",
    eventName: "Westpac Consumer Sentiment (Aug)",
    importanceStars: 1,
    actual: "4.3%",
    forecast: "3.8%",
    previous: "4.1%",
    currency: "AUD",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Positive consumer mood supports AUD/USD exchange rate.",
    grandpaExplanation: "Australian consumers are feeling more confident about their household finances.",
    category: "SENTIMENT"
  },
  {
    id: "econ-2",
    time: "05:00",
    countryIso: "NZ",
    countryFlag: "🇳🇿",
    eventName: "RBNZ Offshore Holdings (Jul)",
    importanceStars: 1,
    actual: "56.20%",
    forecast: "-",
    previous: "55.80%",
    currency: "NZD",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Foreign holdings of NZ government bonds increased.",
    grandpaExplanation: "International investors bought more New Zealand government bonds.",
    category: "CENTRAL_BANK"
  },
  {
    id: "econ-3",
    time: "05:35",
    countryIso: "JP",
    countryFlag: "🇯🇵",
    eventName: "5-Year JGB Auction",
    importanceStars: 1,
    actual: "2.045%",
    forecast: "-",
    previous: "2.020%",
    currency: "JPY",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Yield rose 2.5bps, strengthening Yen slightly.",
    grandpaExplanation: "Japanese bond yields ticked slightly higher, firming the Yen.",
    category: "CENTRAL_BANK"
  },
  {
    id: "econ-4",
    time: "08:00",
    countryIso: "UK",
    countryFlag: "🇬🇧",
    eventName: "Claimant Count Change (Jul)",
    importanceStars: 2,
    actual: "9.4K",
    forecast: "11.2K",
    previous: "6.7K",
    currency: "GBP",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Fewer new jobless claimants than expected; labor market holds firm.",
    grandpaExplanation: "Fewer UK citizens filed for unemployment benefits than expected, showing steady hiring.",
    category: "EMPLOYMENT"
  },
  {
    id: "econ-5",
    time: "08:00",
    countryIso: "UK",
    countryFlag: "🇬🇧",
    eventName: "Employment Change 3M/3M (MoM) (Jun)",
    importanceStars: 2,
    actual: "162K",
    forecast: "135K",
    previous: "147K",
    currency: "GBP",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Strong job growth keeps Bank of England cautious on rate cuts.",
    grandpaExplanation: "162,000 new jobs were created across the UK economy over the past three months.",
    category: "EMPLOYMENT"
  },
  {
    id: "econ-6",
    time: "08:00",
    countryIso: "UK",
    countryFlag: "🇬🇧",
    eventName: "Unemployment Rate (Jun)",
    importanceStars: 3,
    actual: "4.7%",
    forecast: "4.8%",
    previous: "4.9%",
    currency: "GBP",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Unemployment fell to 4.7%; GBP/USD rallied +35 pips.",
    grandpaExplanation: "The UK unemployment rate pleasantly dropped to 4.7%, boosting British economic sentiment.",
    category: "EMPLOYMENT"
  },
  {
    id: "econ-7",
    time: "08:00",
    countryIso: "UK",
    countryFlag: "🇬🇧",
    eventName: "Average Earnings Index +Bonus (Jun)",
    importanceStars: 2,
    actual: "4.1%",
    forecast: "4.0%",
    previous: "4.3%",
    currency: "GBP",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Wage growth remains slightly above 4%, keeping service inflation sticky.",
    grandpaExplanation: "Worker wages grew by 4.1% — great for family paychecks, but keeps central banks attentive.",
    category: "INFLATION"
  },
  {
    id: "econ-8",
    time: "10:00",
    countryIso: "ES",
    countryFlag: "🇪🇸",
    eventName: "Spanish Trade Balance (Jun)",
    importanceStars: 1,
    actual: "-7.80B",
    forecast: "-",
    previous: "-8.24B",
    currency: "EUR",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Trade deficit narrowed slightly to €7.8B.",
    grandpaExplanation: "Spain narrowed its international trade deficit as exports held resilient.",
    category: "TRADE"
  },
  {
    id: "econ-9",
    time: "11:00",
    countryIso: "DE",
    countryFlag: "🇩🇪",
    eventName: "German ZEW Current Conditions (Aug)",
    importanceStars: 2,
    actual: "-65.4",
    forecast: "-68.8",
    previous: "-77.6",
    currency: "EUR",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "German economic sentiment rebounding from deep negative levels.",
    grandpaExplanation: "Financial analysts and business leaders graded current business conditions better than feared.",
    category: "SENTIMENT"
  },
  {
    id: "econ-10",
    time: "11:00",
    countryIso: "DE",
    countryFlag: "🇩🇪",
    eventName: "German ZEW Economic Sentiment (Aug)",
    importanceStars: 3,
    actual: "34.2",
    forecast: "30.0",
    previous: "26.3",
    currency: "EUR",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "DAX lifted +65 points on positive ZEW print beat.",
    grandpaExplanation: "6-month economic expectations for German businesses jumped to a healthy 34.2 points!",
    category: "SENTIMENT"
  },
  {
    id: "econ-11",
    time: "11:00",
    countryIso: "EU",
    countryFlag: "🇪🇺",
    eventName: "ZEW Economic Sentiment (Aug)",
    importanceStars: 2,
    actual: "28.9",
    forecast: "25.4",
    previous: "23.4",
    currency: "EUR",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Eurozone broad sentiment strengthens.",
    grandpaExplanation: "The broader European Union outlook is showing renewed confidence.",
    category: "SENTIMENT"
  },
  {
    id: "econ-12",
    time: "13:45",
    countryIso: "EU",
    countryFlag: "🇪🇺",
    eventName: "ECB's Lane Speaks",
    importanceStars: 2,
    actual: "-",
    forecast: "-",
    previous: "-",
    currency: "EUR",
    dateGroup: "Tuesday, August 18, 2026",
    isSpeech: true,
    speakerName: "Philip R. Lane (ECB Chief Economist)",
    impactOnMarket: "Hints at possible 25bp ECB deposit rate reduction in September.",
    grandpaExplanation: "The Chief Economist of the European Central Bank delivers guidance on upcoming interest rate decisions.",
    category: "CENTRAL_BANK"
  },
  {
    id: "econ-13",
    time: "14:15",
    countryIso: "CA",
    countryFlag: "🇨🇦",
    eventName: "Housing Starts (Jul)",
    importanceStars: 1,
    actual: "252.0K",
    forecast: "249.0K",
    previous: "239.0K",
    currency: "CAD",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Canadian home construction beats expectations.",
    grandpaExplanation: "Canadian homebuilders started 252,000 new homes at an annualized pace.",
    category: "HOUSING"
  },
  {
    id: "econ-14",
    time: "14:30",
    countryIso: "US",
    countryFlag: "🇺🇸",
    eventName: "US Consumer Price Index (CPI MoM & YoY)",
    importanceStars: 3,
    actual: "3.1%",
    forecast: "3.2%",
    previous: "3.3%",
    currency: "USD",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Core inflation cooled to 3.1%, triggering major rally in Nasdaq (+1.4%).",
    grandpaExplanation: "The most important US inflation metric! Measures whether grocery, energy, and housing prices are cooling down.",
    category: "INFLATION"
  },
  {
    id: "econ-15",
    time: "14:30",
    countryIso: "US",
    countryFlag: "🇺🇸",
    eventName: "Export & Import Price Index (MoM) (Jul)",
    importanceStars: 1,
    actual: "0.1%",
    forecast: "0.2%",
    previous: "-0.6%",
    currency: "USD",
    dateGroup: "Tuesday, August 18, 2026",
    impactOnMarket: "Import prices remain contained, confirming disinflation trend.",
    grandpaExplanation: "The cost of overseas imported goods remained steady and affordable.",
    category: "TRADE"
  }
];

// 2. EARNINGS CALENDAR DATA (Authentic Investing.com Structure)
export const EARNINGS_CALENDAR_DATA: EarningsCalendarRow[] = [
  {
    id: "earn-1",
    companyName: "Home Depot",
    ticker: "HD",
    countryFlag: "🇺🇸",
    epsActual: "4.82",
    epsForecast: "4.73",
    revenueActual: "48.10B",
    revenueForecast: "47.25B",
    marketCap: "337.22B",
    timeOfDay: "PRE_MARKET",
    lastPrice: "$337.88",
    priceChangePct: -0.29,
    extendedHoursPrice: "$338.95",
    extendedHoursChangePct: 0.32,
    revisionsUp: 11,
    revisionsDown: 17,
    epsSurprisePct: "+1.90%",
    revenueSurprisePct: "+1.80%",
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Consumer Discretionary",
    bullCase: "Strong remodeling demand and pro-contractor sales driven by lower mortgage rates.",
    bearCase: "Lumber price deflation and DIY customer spending fatigue."
  },
  {
    id: "earn-2",
    companyName: "Xiaomi ADR",
    ticker: "XIACY",
    countryFlag: "🇨🇳",
    epsActual: "-",
    epsForecast: "0.1642",
    revenueActual: "-",
    revenueForecast: "17.31B",
    marketCap: "84.92B",
    timeOfDay: "PRE_MARKET",
    lastPrice: "$16.45",
    priceChangePct: 0.00,
    revisionsUp: 0,
    revisionsDown: 1,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Technology / EV",
    bullCase: "EV delivery ramp-up (SU7 series) exceeding initial targets in mainland China.",
    bearCase: "Intense smartphone margin competition from Huawei and Honor."
  },
  {
    id: "earn-3",
    companyName: "Keysight Technologies",
    ticker: "KEYS",
    countryFlag: "🇺🇸",
    epsActual: "-",
    epsForecast: "2.48",
    revenueActual: "-",
    revenueForecast: "1.75B",
    marketCap: "61.67B",
    timeOfDay: "AFTER_HOURS",
    lastPrice: "$361.15",
    priceChangePct: 0.93,
    extendedHoursPrice: "$361.00",
    extendedHoursChangePct: -0.04,
    revisionsUp: 11,
    revisionsDown: 0,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Electronic Equipment",
    bullCase: "6G R&D contracts and AI optical networking test equipment demand.",
    bearCase: "Semiconductor foundry capex delays."
  },
  {
    id: "earn-4",
    companyName: "Baidu Inc",
    ticker: "BIDU",
    countryFlag: "🇨🇳",
    epsActual: "-",
    epsForecast: "11.19",
    revenueActual: "-",
    revenueForecast: "32.47B",
    marketCap: "35.19B",
    timeOfDay: "PRE_MARKET",
    lastPrice: "$104.12",
    priceChangePct: 0.43,
    extendedHoursPrice: "$104.50",
    extendedHoursChangePct: 0.37,
    revisionsUp: 3,
    revisionsDown: 5,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Internet & AI",
    bullCase: "Ernie Bot enterprise cloud monetization accelerating in APAC.",
    bearCase: "Legacy search advertising margin compression."
  },
  {
    id: "earn-5",
    companyName: "Amer Sports",
    ticker: "AS",
    countryFlag: "🇺🇸",
    epsActual: "-",
    epsForecast: "-0.03",
    revenueActual: "-",
    revenueForecast: "1.12B",
    marketCap: "19.12B",
    timeOfDay: "PRE_MARKET",
    lastPrice: "$32.57",
    priceChangePct: -0.91,
    extendedHoursPrice: "$32.89",
    extendedHoursChangePct: 0.98,
    revisionsUp: 12,
    revisionsDown: 1,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Apparel & Luxury Goods",
    bullCase: "Arc'teryx brand direct-to-consumer store rollout generating 35%+ margins.",
    bearCase: "Winter sports equipment inventory normalization in Europe."
  },
  {
    id: "earn-6",
    companyName: "ZTO Express",
    ticker: "ZTO",
    countryFlag: "🇨🇳",
    epsActual: "-",
    epsForecast: "3.38",
    revenueActual: "-",
    revenueForecast: "14.44B",
    marketCap: "17.32B",
    timeOfDay: "AFTER_HOURS",
    lastPrice: "$22.91",
    priceChangePct: 0.02,
    revisionsUp: 2,
    revisionsDown: 0,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Logistics",
    bullCase: "Parcel volume growth and automated sorting center cost efficiencies.",
    bearCase: "E-commerce price competition across tier 2/3 Chinese cities."
  },
  {
    id: "earn-7",
    companyName: "Toll Brothers",
    ticker: "TOL",
    countryFlag: "🇺🇸",
    epsActual: "-",
    epsForecast: "2.92",
    revenueActual: "-",
    revenueForecast: "2.62B",
    marketCap: "13.59B",
    timeOfDay: "AFTER_HOURS",
    lastPrice: "$145.45",
    priceChangePct: -1.90,
    extendedHoursPrice: "$146.00",
    extendedHoursChangePct: 0.38,
    revisionsUp: 0,
    revisionsDown: 13,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Homebuilding",
    bullCase: "Luxury home backlog and low cancellation rates.",
    bearCase: "High mortgage rate lock-in and land acquisition inflation."
  },
  {
    id: "earn-8",
    companyName: "Klarna",
    ticker: "KLAR",
    countryFlag: "🇸🇪",
    epsActual: "-",
    epsForecast: "-0.0539",
    revenueActual: "-",
    revenueForecast: "992.82M",
    marketCap: "7.86B",
    timeOfDay: "PRE_MARKET",
    lastPrice: "$19.51",
    priceChangePct: -6.16,
    extendedHoursPrice: "$19.64",
    extendedHoursChangePct: 0.67,
    revisionsUp: 1,
    revisionsDown: 1,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Fintech",
    bullCase: "AI customer service cost reduction and US merchant expansion.",
    bearCase: "Credit loss provisions in consumer installment loans."
  },
  {
    id: "earn-9",
    companyName: "Mercury Systems",
    ticker: "MRCY",
    countryFlag: "🇺🇸",
    epsActual: "-",
    epsForecast: "0.3949",
    revenueActual: "-",
    revenueForecast: "265.39M",
    marketCap: "6.80B",
    timeOfDay: "AFTER_HOURS",
    lastPrice: "$113.36",
    priceChangePct: 2.02,
    extendedHoursPrice: "$116.57",
    extendedHoursChangePct: 2.84,
    revisionsUp: 1,
    revisionsDown: 8,
    dateGroup: "Tuesday, August 18, 2026",
    sector: "Aerospace & Defense",
    bullCase: "DoD radar signal processing and avionics backlog expansion.",
    bearCase: "Fixed-price defense contract cost overruns."
  }
];

// 3. DIVIDEND CALENDAR DATA (Authentic Investing.com Structure)
export const DIVIDEND_CALENDAR_DATA: DividendCalendarRow[] = [
  {
    id: "div-1",
    companyName: "A10 Networks",
    ticker: "ATEN",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.06,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 01, 2026",
    dividendYieldPct: 0.88,
    sector: "Cybersecurity",
    payoutSafetyScore: "SAFE"
  },
  {
    id: "div-2",
    companyName: "American States Water",
    ticker: "AWR",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.5455,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 02, 2026",
    dividendYieldPct: 2.48,
    sector: "Utilities",
    payoutSafetyScore: "VERY_SAFE"
  },
  {
    id: "div-3",
    companyName: "Angel Oak Financial",
    ticker: "FINS",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.115,
    currency: "USD",
    frequencyType: "1M",
    paymentDate: "Aug 31, 2026",
    dividendYieldPct: 10.95,
    sector: "Closed-End Fund",
    payoutSafetyScore: "MODERATE"
  },
  {
    id: "div-4",
    companyName: "ARMOUR Residential",
    ticker: "ARR",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.24,
    currency: "USD",
    frequencyType: "1M",
    paymentDate: "Aug 28, 2026",
    dividendYieldPct: 17.50,
    sector: "Mortgage REIT",
    payoutSafetyScore: "HIGH_RISK"
  },
  {
    id: "div-5",
    companyName: "Artesian Resources",
    ticker: "ARTNA",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.3199,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Aug 28, 2026",
    dividendYieldPct: 3.66,
    sector: "Water Utilities",
    payoutSafetyScore: "SAFE"
  },
  {
    id: "div-6",
    companyName: "Capital One Financial",
    ticker: "COF",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.80,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 01, 2026",
    dividendYieldPct: 1.45,
    sector: "Financial Services",
    payoutSafetyScore: "VERY_SAFE"
  },
  {
    id: "div-7",
    companyName: "Carlyle Group",
    ticker: "CG",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.35,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Aug 26, 2026",
    dividendYieldPct: 2.88,
    sector: "Private Equity",
    payoutSafetyScore: "SAFE"
  },
  {
    id: "div-8",
    companyName: "Chemed Corp",
    ticker: "CHE",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.70,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 03, 2026",
    dividendYieldPct: 0.53,
    sector: "Healthcare",
    payoutSafetyScore: "VERY_SAFE"
  },
  {
    id: "div-9",
    companyName: "ConocoPhillips",
    ticker: "COP",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 0.84,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 01, 2026",
    dividendYieldPct: 2.63,
    sector: "Energy / Oil & Gas",
    payoutSafetyScore: "VERY_SAFE"
  },
  {
    id: "div-10",
    companyName: "Exxon Mobil",
    ticker: "XOM",
    countryFlag: "🇺🇸",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 1.03,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Sep 10, 2026",
    dividendYieldPct: 2.55,
    sector: "Integrated Oil",
    payoutSafetyScore: "VERY_SAFE"
  },
  {
    id: "div-11",
    companyName: "DHT Holdings Inc",
    ticker: "DHT",
    countryFlag: "🇧🇲",
    exDividendDate: "Aug 17, 2026",
    dividendAmount: 1.22,
    currency: "USD",
    frequencyType: "3M",
    paymentDate: "Aug 24, 2026",
    dividendYieldPct: 25.82,
    sector: "Crude Tankers",
    payoutSafetyScore: "MODERATE"
  }
];

// 4. CENTRAL BANKS RATES (Authentic Widget - Image 4)
export const CENTRAL_BANKS_RATES_DATA: CentralBankRateRow[] = [
  {
    id: "cb-fed",
    code: "FED",
    name: "Federal Reserve",
    countryFlag: "🇺🇸",
    interestRatePct: 3.75,
    nextMeetingDate: "Sep 16, 2026",
    daysUntilMeeting: 30,
    policyBias: "CUTTING",
    expectedNextMove: "-25 bps expected (84% probability)"
  },
  {
    id: "cb-ecb",
    code: "ECB",
    name: "European Central Bank",
    countryFlag: "🇪🇺",
    interestRatePct: 2.40,
    nextMeetingDate: "Sep 10, 2026",
    daysUntilMeeting: 24,
    policyBias: "CUTTING",
    expectedNextMove: "-25 bps expected on core disinflation"
  },
  {
    id: "cb-boe",
    code: "BOE",
    name: "Bank of England",
    countryFlag: "🇬🇧",
    interestRatePct: 3.75,
    nextMeetingDate: "Sep 17, 2026",
    daysUntilMeeting: 31,
    policyBias: "PAUSED",
    expectedNextMove: "Hold at 3.75% (Wage growth caution)"
  },
  {
    id: "cb-snb",
    code: "SNB",
    name: "Swiss National Bank",
    countryFlag: "🇨🇭",
    interestRatePct: 0.00,
    nextMeetingDate: "Sep 24, 2026",
    daysUntilMeeting: 38,
    policyBias: "PAUSED",
    expectedNextMove: "Zero rate target maintained"
  },
  {
    id: "cb-rba",
    code: "RBA",
    name: "Reserve Bank of Australia",
    countryFlag: "🇦🇺",
    interestRatePct: 4.35,
    nextMeetingDate: "Sep 29, 2026",
    daysUntilMeeting: 43,
    policyBias: "HIKING",
    expectedNextMove: "Hawkish pause / sticky services"
  },
  {
    id: "cb-boc",
    code: "BOC",
    name: "Bank of Canada",
    countryFlag: "🇨🇦",
    interestRatePct: 2.25,
    nextMeetingDate: "Sep 02, 2026",
    daysUntilMeeting: 16,
    policyBias: "CUTTING",
    expectedNextMove: "-25 bps to stimulate housing"
  },
  {
    id: "cb-rbnz",
    code: "RBNZ",
    name: "Reserve Bank of New Zealand",
    countryFlag: "🇳🇿",
    interestRatePct: 2.50,
    nextMeetingDate: "Sep 02, 2026",
    daysUntilMeeting: 16,
    policyBias: "CUTTING",
    expectedNextMove: "-50 bps aggressive easing step"
  },
  {
    id: "cb-boj",
    code: "BOJ",
    name: "Bank of Japan",
    countryFlag: "🇯🇵",
    interestRatePct: 1.00,
    nextMeetingDate: "Sep 18, 2026",
    daysUntilMeeting: 32,
    policyBias: "HIKING",
    expectedNextMove: "+25 bps rate hike on yen defense"
  },
  {
    id: "cb-cbr",
    code: "CBR",
    name: "Central Bank of Russia",
    countryFlag: "🇷🇺",
    interestRatePct: 14.00,
    nextMeetingDate: "Sep 11, 2026",
    daysUntilMeeting: 25,
    policyBias: "HIKING",
    expectedNextMove: "Hold at 14.00% war economy pressure"
  },
  {
    id: "cb-rbi",
    code: "RBI",
    name: "Reserve Bank of India",
    countryFlag: "🇮🇳",
    interestRatePct: 5.25,
    nextMeetingDate: "Oct 07, 2026",
    daysUntilMeeting: 51,
    policyBias: "PAUSED",
    expectedNextMove: "Neutral stance / strong GDP"
  },
  {
    id: "cb-pboc",
    code: "PBOC",
    name: "People's Bank of China",
    countryFlag: "🇨🇳",
    interestRatePct: 3.00,
    nextMeetingDate: "Aug 20, 2026",
    daysUntilMeeting: 3,
    policyBias: "EASING",
    expectedNextMove: "-10 bps Loan Prime Rate stimulus"
  },
  {
    id: "cb-bcb",
    code: "BCB",
    name: "Central Bank of Brazil",
    countryFlag: "🇧🇷",
    interestRatePct: 14.00,
    nextMeetingDate: "Sep 16, 2026",
    daysUntilMeeting: 30,
    policyBias: "PAUSED",
    expectedNextMove: "Hold at 14.00% fiscal watch"
  }
];

// 5. MARKET OVERVIEW & ARTICLES (Image 3 & 5)
export const MARKET_ARTICLES_DATA: MarketArticleRow[] = [
  {
    id: "art-1",
    title: "These Commodity Charts Are Flashing an Inflation Warning",
    summary: "Commodity markets are flashing signals that inflation pressure may not be finished yet. Oil, natural gas, copper, and agricultural fertilizer indices break above 200-day moving averages.",
    authorName: "Juan Manuel Benito",
    authorRole: "Senior Commodities Strategist",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "1 hour ago",
    category: "Analysis",
    commentCount: 1,
    isPopular: true,
    readTimeMin: 4,
    relatedTickers: ["CL", "NG", "HG", "XOM"],
    fullBodyMarkdown: `### Commodity Inflation Warning
Energy and industrial metals are showing synchronized momentum divergence. With Brent crude holding $84/barrel and copper inventories at multi-year lows, headline consumer price indices could see stubborn base effects into Q4.

**Key Technical Levels:**
- **WTI Crude:** Support at $78.50, Resistance at $88.20.
- **Copper Futures:** Sustained breakout above $4.45/lb triggers global manufacturing inflation alert.`
  },
  {
    id: "art-2",
    title: "Developed Markets Reclaim the Growth Lead as Emerging Economies Lose Momentum",
    summary: "Global growth is stabilizing, but leadership has shifted back to developed markets. The U.S. and parts of Europe demonstrate resilient capex spending while Asian manufacturing encounters export headwinds.",
    authorName: "Jeffrey Roach",
    authorRole: "Chief Economist",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "1 hour ago",
    category: "News",
    commentCount: 4,
    isPopular: true,
    readTimeMin: 5,
    relatedTickers: ["SPY", "QQQ", "EEM", "DAX"],
    fullBodyMarkdown: `### Diverging Macro Horizons
U.S. productivity figures (+2.6% annualized) continue to decouple from global averages. The resilience in private capital expenditure, particularly in domestic chip fabrication and cloud data centers, provides strong earnings support.`
  },
  {
    id: "art-3",
    title: "Memory Stocks Rally as Short Covering Adds Fuel to the AI Boom",
    summary: "The boom in memory stocks persists. The memory bottleneck remains acute, so the order backlog remains massive. Leveraged ETFs and institutional options volume confirm sustained institutional accumulation.",
    authorName: "Louis Navellier",
    authorRole: "Quantitative Growth Manager",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "1 hour ago",
    category: "Analysis",
    commentCount: 12,
    isPopular: true,
    readTimeMin: 3,
    relatedTickers: ["MU", "NVDA", "WDC", "SKHYNIX"],
    fullBodyMarkdown: `### High Bandwidth Memory (HBM) Super-Cycle
Micron Technology and Samsung have sold out their 2026/2027 HBM3E allocations to Nvidia and hyperscalers. The gross margin profile is expanding toward 52%, creating strong upside rerating potential.`
  },
  {
    id: "art-4",
    title: "Kevin Warsh Goes to Jackson Hole: Time to Fill in the Blanks",
    summary: "A week from Friday, key monetary policymakers will deliver landmark speeches at the Fed's Jackson Hole Symposium. The majestic mountain backdrop sets the stage for the next rate framework.",
    authorName: "Claudia Sahm",
    authorRole: "Former Fed Economist, Sahm Rule Creator",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "1 hour ago",
    category: "News",
    commentCount: 1,
    isPopular: true,
    readTimeMin: 6,
    relatedTickers: ["TNX", "DXY", "GLD"],
    fullBodyMarkdown: `### Jackson Hole Monetary Policy Framework
Central bankers will address the neutral rate of interest (R*) and the transmission mechanism of artificial intelligence on labor productivity. Expect clear guidance on balance sheet runoff (QT) termination.`
  },
  {
    id: "art-5",
    title: "Markets Broaden as the Economy Remains Delicately Balanced",
    summary: "Inflation data improved in July, but sticky services prices and pockets of AI-related power demand create a high-wire balancing act for equity index multiples.",
    authorName: "Brent Schutte",
    authorRole: "Chief Investment Officer",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "4 hours ago",
    category: "Editor's Picks",
    commentCount: 8,
    isPopular: false,
    readTimeMin: 4,
    relatedTickers: ["IWM", "RSP", "DIA"],
    fullBodyMarkdown: `### Equal-Weight vs Cap-Weight Dynamics
Market breadth has improved substantially with the S&P 500 equal-weight index outperforming the Magnificent 7 over the past 30 days. Value and dividend payers offer attractive asymmetric risk-reward.`
  },
  {
    id: "art-6",
    title: "Gold's Rebound Faces a Double Headwind: Real Yields and Oil",
    summary: "Bullion traders encounter resistance at $2,480/oz as 10-year TIPS real yields hover near 2.10% and geopolitical risk premiums experience intermittent lulls.",
    authorName: "Fawad Razaqzada",
    authorRole: "Market Analyst",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    timestampAgo: "Aug 17, 2026",
    category: "Analysis",
    commentCount: 7,
    isPopular: true,
    readTimeMin: 3,
    relatedTickers: ["XAUUSD", "GLD", "GDX"],
    fullBodyMarkdown: `### Precious Metals Technical Structure
Gold has formed a series of higher lows, supported by steady central bank reserve diversification. A weekly close above $2,500 opens target coordinates toward $2,620.`
  }
];

// 6. DETAILED STOCK PRO PROFILE (Image 6 - Apple Inc AAPL + NVDA + TSLA)
export const STOCK_PRO_PROFILES: Record<string, StockProProfileData> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQGS:AAPL",
    sector: "Information Technology",
    industry: "Technology Hardware, Storage & Peripherals",
    priceUsd: 305.65,
    dayChangeUsd: -0.28,
    dayChangePct: -0.09,
    range52WeekLow: 223.78,
    range52WeekHigh: 344.57,
    afterHoursPrice: 305.05,
    afterHoursChangeUsd: -0.60,
    afterHoursChangePct: -0.20,
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, Apple Watch, Apple Vision Pro, AirPods, Apple TV, and a comprehensive ecosystem of subscription services (App Store, Apple Music, iCloud+, Apple Pay, Apple Intelligence).",
    latestReportDate: "Jul 30, 2026",
    nextEarningsDate: "Oct 29, 2026",
    secFilings: [
      { label: "10-K", url: "#" },
      { label: "10-Q", url: "#" },
      { label: "8-K", url: "#" }
    ],
    keyHighlights: [
      { isPositive: true, text: "Has raised its dividend for 14 consecutive years with strong capital return program." },
      { isPositive: false, text: "13 analysts have revised their earnings downwards for the upcoming period." },
      { isPositive: false, text: "Trading at a high earnings multiple (P/E 33.4x) relative to near-term hardware growth." },
      { isPositive: true, text: "Prominent market leader with over 2.2 Billion active devices driving high-margin Services revenue." }
    ],
    peers: ["PYPL", "NTAP", "GEN", "GOOGL", "EEFT", "MSFT"],
    fairValue: {
      averageValueUsd: 248.20,
      downsidePct: -18.8,
      uncertainty: "LOW",
      spreadLowUsd: 203.88,
      spreadHighUsd: 263.72,
      marketRange52w: { low: 224, high: 345 },
      analystTarget: { average: 322.28, low: 215, high: 400, count: 41 },
      investingModels: { average: 248.20, low: 204, high: 264, modelCount: 14 }
    },
    financialHealth: {
      overallScore: 3,
      overallRating: "Good Performance",
      cashFlowHealth: 3,
      growthHealth: 3,
      priceMomentum: 2,
      profitabilityHealth: 4,
      relativeValue: 1,
      description: "Financial Health for Apple is determined by ranking the company on over 100 factors against companies in the Information Technology sector and operating in Developed economic markets."
    },
    prebuiltModels: [
      { id: "mod-1", title: "10Y DCF EBITDA Exit", updatedTimeAgo: "Updated 21 hours ago", fairValueResult: "$246.50" },
      { id: "mod-2", title: "10Y DCF Revenue Exit", updatedTimeAgo: "Updated 21 hours ago", fairValueResult: "$251.10" },
      { id: "mod-3", title: "10Y DCF Growth Exit", updatedTimeAgo: "Updated 21 hours ago", fairValueResult: "$242.80" },
      { id: "mod-4", title: "5Y DCF EBITDA Exit", updatedTimeAgo: "Updated 21 hours ago", fairValueResult: "$258.40" }
    ]
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQGS:NVDA",
    sector: "Information Technology",
    industry: "Semiconductors & Semiconductor Equipment",
    priceUsd: 128.40,
    dayChangeUsd: 2.15,
    dayChangePct: 1.70,
    range52WeekLow: 75.60,
    range52WeekHigh: 140.76,
    afterHoursPrice: 129.10,
    afterHoursChangeUsd: 0.70,
    afterHoursChangePct: 0.55,
    description: "NVIDIA Corporation provides graphics, compute, and networking solutions in the United States, Taiwan, China, and internationally. Its Data Center segment offers accelerated computing platforms, Blackwell GPUs, DGX SuperPODs, and CUDA software stacks.",
    latestReportDate: "Aug 26, 2026",
    nextEarningsDate: "Aug 26, 2026",
    secFilings: [
      { label: "10-K", url: "#" },
      { label: "10-Q", url: "#" },
      { label: "8-K", url: "#" }
    ],
    keyHighlights: [
      { isPositive: true, text: "Dominates over 88% of data center generative AI training and inference accelerators." },
      { isPositive: true, text: "Gross margins expand above 75% on Blackwell architecture ramp." },
      { isPositive: false, text: "High customer concentration with top 4 hyperscalers accounting for ~40% of sales." },
      { isPositive: true, text: "Unprecedented software moat with CUDA developer ecosystem exceeding 5 million engineers." }
    ],
    peers: ["AMD", "AVGO", "INTC", "QCOM", "ARM", "TSM"],
    fairValue: {
      averageValueUsd: 145.80,
      downsidePct: 13.5,
      uncertainty: "MEDIUM",
      spreadLowUsd: 118.00,
      spreadHighUsd: 168.50,
      marketRange52w: { low: 76, high: 141 },
      analystTarget: { average: 152.40, low: 90, high: 200, count: 52 },
      investingModels: { average: 145.80, low: 112, high: 178, modelCount: 16 }
    },
    financialHealth: {
      overallScore: 5,
      overallRating: "Great Performance",
      cashFlowHealth: 5,
      growthHealth: 5,
      priceMomentum: 4,
      profitabilityHealth: 5,
      relativeValue: 3,
      description: "Financial Health for Nvidia reflects industry-leading Return on Invested Capital (ROIC > 55%) and unmatched free cash flow conversion."
    },
    prebuiltModels: [
      { id: "mod-nvda-1", title: "10Y DCF EBITDA Exit", updatedTimeAgo: "Updated 5 hours ago", fairValueResult: "$148.20" },
      { id: "mod-nvda-2", title: "10Y DCF Revenue Exit", updatedTimeAgo: "Updated 5 hours ago", fairValueResult: "$144.50" },
      { id: "mod-nvda-3", title: "EV/EBITDA Multiple Valuation", updatedTimeAgo: "Updated 5 hours ago", fairValueResult: "$150.00" }
    ]
  }
};
