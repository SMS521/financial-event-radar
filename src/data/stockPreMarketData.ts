export interface StockIntradayPoint {
  timeET: string; // '04:00', '06:00', '08:30', '09:30', '16:00'
  timeCET: string; // '10:00', '12:00', '14:30', '15:30', '22:00'
  priceUSD: number;
  volume: number;
  isPreMarket: boolean;
  isAfterHours?: boolean;
}

export interface StockPreMarketProfile {
  ticker: string;
  name: string;
  exchange: string;
  assetType: "Equity" | "Futures" | "ETF" | "Index" | "Commodity";
  country: string;
  flag: string;
  currency: string;
  
  // US Regular Market
  regularPrice: number;
  regularChange: number;
  regularChangePct: number;
  regularCloseTimeET: string; // e.g. "August 17 at 4:00:01 PM EDT"
  regularCloseTimeCET: string; // e.g. "17. August um 22:00:01 MESZ"
  isRegularMarketOpen: boolean;

  // Pre-Market (Pre-Open Session 04:00 - 09:30 ET / 10:00 - 15:30 CET)
  preMarketPrice: number;
  preMarketChange: number;
  preMarketChangePct: number;
  preMarketTimeET: string; // e.g. "8:46:57 AM EDT"
  preMarketTimeCET: string; // e.g. "14:46:57 MESZ"
  isPreMarketActive: boolean;

  // German / Euro Conversion (EUR Rate = ~0.925 EUR/USD)
  eurExchangeRate: number;
  regularPriceEUR: number;
  preMarketPriceEUR: number;
  dayHighUSD: number;
  dayLowUSD: number;
  dayHighEUR: number;
  dayLowEUR: number;
  prevCloseUSD: number;
  prevCloseEUR: number;
  openUSD: number;
  openEUR: number;
  fiftyTwoWeekHighUSD: number;
  fiftyTwoWeekLowUSD: number;
  fiftyTwoWeekHighEUR: number;
  fiftyTwoWeekLowEUR: number;

  // Fundamentals & Trading Details
  bidUSD: number;
  bidSize: number;
  askUSD: number;
  askSize: number;
  volume: number;
  avgVolume3Month: number;
  marketCapUSD: string;
  marketCapEUR: string;
  peRatioTTM: number;
  epsTTM: number;
  beta5Y: number;
  forwardDividendRateUSD: number;
  forwardDividendRateEUR: number;
  forwardDividendYieldPct: number;
  dividendAnnouncementBanner?: {
    text: string;
    exDate: string;
    payoutAmountUSD: number;
    payoutAmountEUR: number;
  };

  // Chart Data
  intraday1D: StockIntradayPoint[];
  historical5D: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historical1M: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historical6M: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historicalYTD: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historical1Y: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historical5Y: { date: string; closeUSD: number; closeEUR: number; volume: number }[];
  historicalAll: { date: string; closeUSD: number; closeEUR: number; volume: number }[];

  // Related News & Research for Omnibox
  news: {
    id: string;
    headline: string;
    source: string;
    publishedTime: string;
    snippet: string;
  }[];
  researchReports: {
    id: string;
    title: string;
    provider: string;
    publishedTime: string;
    rating: string;
  }[];
}

export const EUR_USD_RATE = 0.9258; // 1 USD = 0.9258 EUR (or 1 EUR = 1.0801 USD)

// Helper to generate realistic intraday series with Pre-Market (04:00 - 09:30 ET) and Regular (09:30 - 16:00 ET)
function generateIntradaySeries(prevClose: number, prePrice: number, closePrice: number, baseVol: number): StockIntradayPoint[] {
  const points: StockIntradayPoint[] = [];
  const timesET = [
    { et: "04:00 AM", cet: "10:00 MESZ", isPre: true, p: prevClose * 0.998 },
    { et: "04:30 AM", cet: "10:30 MESZ", isPre: true, p: prevClose * 1.001 },
    { et: "05:00 AM", cet: "11:00 MESZ", isPre: true, p: prevClose * 1.003 },
    { et: "05:30 AM", cet: "11:30 MESZ", isPre: true, p: prevClose * 1.002 },
    { et: "06:00 AM", cet: "12:00 MESZ", isPre: true, p: (prevClose + prePrice) / 2 - 0.4 },
    { et: "06:30 AM", cet: "12:30 MESZ", isPre: true, p: (prevClose + prePrice) / 2 + 0.2 },
    { et: "07:00 AM", cet: "13:00 MESZ", isPre: true, p: prePrice - 1.1 },
    { et: "07:30 AM", cet: "13:30 MESZ", isPre: true, p: prePrice - 0.6 },
    { et: "08:00 AM", cet: "14:00 MESZ", isPre: true, p: prePrice + 0.8 },
    { et: "08:15 AM", cet: "14:15 MESZ", isPre: true, p: prePrice + 0.4 },
    { et: "08:30 AM", cet: "14:30 MESZ", isPre: true, p: prePrice + 1.2 }, // US Macro release time
    { et: "08:46 AM", cet: "14:46 MESZ", isPre: true, p: prePrice }, // Current snapshot point in screenshot
    { et: "09:00 AM", cet: "15:00 MESZ", isPre: true, p: prePrice - 0.2 },
    { et: "09:30 AM", cet: "15:30 MESZ", isPre: false, p: closePrice * 1.01 }, // Regular Market Open
    { et: "10:00 AM", cet: "16:00 MESZ", isPre: false, p: closePrice * 1.015 },
    { et: "10:30 AM", cet: "16:30 MESZ", isPre: false, p: closePrice * 1.008 },
    { et: "11:00 AM", cet: "17:00 MESZ", isPre: false, p: closePrice * 1.005 },
    { et: "12:00 PM", cet: "18:00 MESZ", isPre: false, p: closePrice * 0.998 },
    { et: "01:00 PM", cet: "19:00 MESZ", isPre: false, p: closePrice * 0.995 },
    { et: "02:00 PM", cet: "20:00 MESZ", isPre: false, p: closePrice * 0.992 },
    { et: "03:00 PM", cet: "21:00 MESZ", isPre: false, p: closePrice * 0.996 },
    { et: "03:30 PM", cet: "21:30 MESZ", isPre: false, p: closePrice * 0.999 },
    { et: "04:00 PM", cet: "22:00 MESZ", isPre: false, p: closePrice }, // Market Close
    { et: "04:30 PM", cet: "22:30 MESZ", isPre: false, isAfterHours: true, p: closePrice * 1.002 },
    { et: "05:00 PM", cet: "23:00 MESZ", isPre: false, isAfterHours: true, p: closePrice * 1.001 },
    { et: "06:00 PM", cet: "00:00 MESZ", isPre: false, isAfterHours: true, p: closePrice * 1.003 },
  ];

  timesET.forEach((t, i) => {
    points.push({
      timeET: t.et,
      timeCET: t.cet,
      priceUSD: Number(t.p.toFixed(2)),
      volume: Math.round(baseVol * (t.isPre ? 0.25 : 1.0) * (0.8 + (i % 5) * 0.1)),
      isPreMarket: t.isPre,
      isAfterHours: t.isAfterHours || false,
    });
  });

  return points;
}

export const STOCK_PRE_MARKET_DATABASE: Record<string, StockPreMarketProfile> = {
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NasdaqGS",
    assetType: "Equity",
    country: "US",
    flag: "🇺🇸",
    currency: "USD",
    regularPrice: 480.35,
    regularChange: -15.05,
    regularChangePct: -3.04,
    regularCloseTimeET: "August 17 at 4:00:01 PM EDT",
    regularCloseTimeCET: "17. August um 22:00:01 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 482.31,
    preMarketChange: +1.96,
    preMarketChangePct: +0.41,
    preMarketTimeET: "8:46:57 AM EDT",
    preMarketTimeCET: "14:46:57 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((480.35 * EUR_USD_RATE).toFixed(2)), // €444.71
    preMarketPriceEUR: Number((482.31 * EUR_USD_RATE).toFixed(2)), // €446.52
    dayHighUSD: 485.40,
    dayLowUSD: 478.52,
    dayHighEUR: Number((485.40 * EUR_USD_RATE).toFixed(2)), // €449.38
    dayLowEUR: Number((478.52 * EUR_USD_RATE).toFixed(2)), // €443.01
    prevCloseUSD: 495.40,
    prevCloseEUR: Number((495.40 * EUR_USD_RATE).toFixed(2)),
    openUSD: 480.22,
    openEUR: Number((480.22 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 502.80,
    fiftyTwoWeekLowUSD: 388.50,
    fiftyTwoWeekHighEUR: Number((502.80 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((388.50 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 478.52,
    bidSize: 300,
    askUSD: 483.10,
    askSize: 400,
    volume: 28250867,
    avgVolume3Month: 22400000,
    marketCapUSD: "$3.567T",
    marketCapEUR: "€3.302T",
    peRatioTTM: 26.73,
    epsTTM: 17.97,
    beta5Y: 1.10,
    forwardDividendRateUSD: 3.64,
    forwardDividendRateEUR: 3.37,
    forwardDividendYieldPct: 0.76,
    dividendAnnouncementBanner: {
      text: "MSFT announced a cash dividend of $0.91 with an ex-date of Aug. 20, 2026",
      exDate: "Aug 20, 2026",
      payoutAmountUSD: 0.91,
      payoutAmountEUR: 0.84,
    },

    intraday1D: generateIntradaySeries(495.40, 482.31, 480.35, 120000),
    historical5D: [
      { date: "Aug 11", closeUSD: 498.20, closeEUR: 461.23, volume: 21500000 },
      { date: "Aug 12", closeUSD: 499.80, closeEUR: 462.71, volume: 23100000 },
      { date: "Aug 13", closeUSD: 496.10, closeEUR: 459.29, volume: 19800000 },
      { date: "Aug 14", closeUSD: 495.40, closeEUR: 458.64, volume: 20400000 },
      { date: "Aug 17", closeUSD: 480.35, closeEUR: 444.71, volume: 28250000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 465.00, closeEUR: 430.50, volume: 18900000 },
      { date: "Jul 25", closeUSD: 472.40, closeEUR: 437.35, volume: 22100000 },
      { date: "Aug 01", closeUSD: 484.20, closeEUR: 448.27, volume: 24500000 },
      { date: "Aug 08", closeUSD: 494.00, closeEUR: 457.34, volume: 26100000 },
      { date: "Aug 17", closeUSD: 480.35, closeEUR: 444.71, volume: 28250000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 415.00, closeEUR: 384.21, volume: 95000000 },
      { date: "Mar 2026", closeUSD: 432.50, closeEUR: 400.41, volume: 102000000 },
      { date: "Apr 2026", closeUSD: 448.00, closeEUR: 414.76, volume: 98000000 },
      { date: "May 2026", closeUSD: 465.20, closeEUR: 430.68, volume: 110000000 },
      { date: "Jun 2026", closeUSD: 482.10, closeEUR: 446.33, volume: 105000000 },
      { date: "Aug 2026", closeUSD: 480.35, closeEUR: 444.71, volume: 115000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 395.00, closeEUR: 365.69, volume: 88000000 },
      { date: "Mar 2026", closeUSD: 432.50, closeEUR: 400.41, volume: 102000000 },
      { date: "May 2026", closeUSD: 465.20, closeEUR: 430.68, volume: 110000000 },
      { date: "Aug 2026", closeUSD: 480.35, closeEUR: 444.71, volume: 115000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 385.00, closeEUR: 356.43, volume: 450000000 },
      { date: "Nov 2025", closeUSD: 398.20, closeEUR: 368.65, volume: 420000000 },
      { date: "Feb 2026", closeUSD: 415.00, closeEUR: 384.21, volume: 390000000 },
      { date: "May 2026", closeUSD: 465.20, closeEUR: 430.68, volume: 410000000 },
      { date: "Aug 2026", closeUSD: 480.35, closeEUR: 444.71, volume: 460000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 240.00, closeEUR: 222.19, volume: 2100000000 },
      { date: "2022", closeUSD: 260.00, closeEUR: 240.71, volume: 2400000000 },
      { date: "2023", closeUSD: 330.00, closeEUR: 305.51, volume: 2200000000 },
      { date: "2024", closeUSD: 420.00, closeEUR: 388.84, volume: 2050000000 },
      { date: "2025", closeUSD: 460.00, closeEUR: 425.87, volume: 1950000000 },
      { date: "2026", closeUSD: 480.35, closeEUR: 444.71, volume: 1450000000 },
    ],
    historicalAll: [
      { date: "2010", closeUSD: 28.00, closeEUR: 25.92, volume: 8000000000 },
      { date: "2015", closeUSD: 55.00, closeEUR: 50.92, volume: 7500000000 },
      { date: "2020", closeUSD: 220.00, closeEUR: 203.68, volume: 6000000000 },
      { date: "2024", closeUSD: 420.00, closeEUR: 388.84, volume: 2050000000 },
      { date: "2026", closeUSD: 480.35, closeEUR: 444.71, volume: 1450000000 },
    ],

    news: [
      {
        id: "news-msft-1",
        headline: "Microsoft Azure AI Revenue Surges 34% with Enterprise Copilot Deployments",
        source: "The Wall Street Journal",
        publishedTime: "2 hours ago",
        snippet: "Cloud capacity expansion and OpenAI partnership drive strong forward guidance among institutional desks.",
      },
      {
        id: "news-msft-2",
        headline: "Berkshire Hathaway Boosts Alphabet & Tech Infrastructure Stakes in Q2 Filings",
        source: "Bloomberg",
        publishedTime: "yesterday",
        snippet: "Warren Buffett's conglomerate maintained broad enterprise software exposure with key cloud holdings.",
      },
      {
        id: "news-msft-3",
        headline: "Warren Buffett's Berkshire doubles down on undervalued retail and tech",
        source: "TheStreet",
        publishedTime: "20 hours ago",
        snippet: "Consolidated value positioning signals defensive resilience ahead of FOMC policy pivot.",
      },
    ],
    researchReports: [
      {
        id: "rep-msft-1",
        title: "Analyst Report: Microsoft Corp. (MSFT) Cloud & Margin Outlook",
        provider: "Morningstar",
        publishedTime: "2 weeks ago",
        rating: "Wide Moat • 4-Star Valuation",
      },
      {
        id: "rep-msft-2",
        title: "Morningstar | A Weekly Summary of Stock Ideas and Developments",
        provider: "Morningstar",
        publishedTime: "last week",
        rating: "Top Large-Cap Conviction",
      },
    ],
  },

  M: {
    ticker: "M",
    name: "Macy's, Inc.",
    exchange: "NYQ",
    assetType: "Equity",
    country: "US",
    flag: "🇺🇸",
    currency: "USD",
    regularPrice: 16.45,
    regularChange: -0.32,
    regularChangePct: -1.91,
    regularCloseTimeET: "August 17 at 4:00:01 PM EDT",
    regularCloseTimeCET: "17. August um 22:00:01 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 16.78,
    preMarketChange: +0.33,
    preMarketChangePct: +2.01,
    preMarketTimeET: "8:48:12 AM EDT",
    preMarketTimeCET: "14:48:12 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((16.45 * EUR_USD_RATE).toFixed(2)),
    preMarketPriceEUR: Number((16.78 * EUR_USD_RATE).toFixed(2)),
    dayHighUSD: 16.90,
    dayLowUSD: 16.20,
    dayHighEUR: Number((16.90 * EUR_USD_RATE).toFixed(2)),
    dayLowEUR: Number((16.20 * EUR_USD_RATE).toFixed(2)),
    prevCloseUSD: 16.77,
    prevCloseEUR: Number((16.77 * EUR_USD_RATE).toFixed(2)),
    openUSD: 16.50,
    openEUR: Number((16.50 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 22.40,
    fiftyTwoWeekLowUSD: 13.80,
    fiftyTwoWeekHighEUR: Number((22.40 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((13.80 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 16.40,
    bidSize: 1200,
    askUSD: 16.80,
    askSize: 800,
    volume: 8450000,
    avgVolume3Month: 7200000,
    marketCapUSD: "$4.52B",
    marketCapEUR: "€4.18B",
    peRatioTTM: 6.80,
    epsTTM: 2.42,
    beta5Y: 1.85,
    forwardDividendRateUSD: 0.69,
    forwardDividendRateEUR: 0.64,
    forwardDividendYieldPct: 4.19,
    dividendAnnouncementBanner: {
      text: "Macy's declared quarterly cash dividend of $0.1737 per share",
      exDate: "Sep 15, 2026",
      payoutAmountUSD: 0.17,
      payoutAmountEUR: 0.16,
    },

    intraday1D: generateIntradaySeries(16.77, 16.78, 16.45, 45000),
    historical5D: [
      { date: "Aug 11", closeUSD: 16.80, closeEUR: 15.55, volume: 6800000 },
      { date: "Aug 12", closeUSD: 16.95, closeEUR: 15.69, volume: 7100000 },
      { date: "Aug 13", closeUSD: 16.60, closeEUR: 15.37, volume: 6200000 },
      { date: "Aug 14", closeUSD: 16.77, closeEUR: 15.53, volume: 6500000 },
      { date: "Aug 17", closeUSD: 16.45, closeEUR: 15.23, volume: 8450000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 15.80, closeEUR: 14.63, volume: 24000000 },
      { date: "Jul 25", closeUSD: 16.20, closeEUR: 15.00, volume: 28000000 },
      { date: "Aug 01", closeUSD: 16.90, closeEUR: 15.65, volume: 32000000 },
      { date: "Aug 08", closeUSD: 16.85, closeEUR: 15.60, volume: 29000000 },
      { date: "Aug 17", closeUSD: 16.45, closeEUR: 15.23, volume: 35000000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 18.20, closeEUR: 16.85, volume: 120000000 },
      { date: "Apr 2026", closeUSD: 17.50, closeEUR: 16.20, volume: 110000000 },
      { date: "Jun 2026", closeUSD: 15.90, closeEUR: 14.72, volume: 115000000 },
      { date: "Aug 2026", closeUSD: 16.45, closeEUR: 15.23, volume: 130000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 19.50, closeEUR: 18.05, volume: 90000000 },
      { date: "Apr 2026", closeUSD: 17.50, closeEUR: 16.20, volume: 110000000 },
      { date: "Aug 2026", closeUSD: 16.45, closeEUR: 15.23, volume: 130000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 15.20, closeEUR: 14.07, volume: 380000000 },
      { date: "Nov 2025", closeUSD: 16.80, closeEUR: 15.55, volume: 410000000 },
      { date: "Feb 2026", closeUSD: 18.20, closeEUR: 16.85, volume: 390000000 },
      { date: "May 2026", closeUSD: 16.80, closeEUR: 15.55, volume: 360000000 },
      { date: "Aug 2026", closeUSD: 16.45, closeEUR: 15.23, volume: 400000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 28.00, closeEUR: 25.92, volume: 1800000000 },
      { date: "2022", closeUSD: 20.50, closeEUR: 18.98, volume: 1900000000 },
      { date: "2023", closeUSD: 17.00, closeEUR: 15.74, volume: 1600000000 },
      { date: "2024", closeUSD: 19.00, closeEUR: 17.59, volume: 1500000000 },
      { date: "2025", closeUSD: 16.00, closeEUR: 14.81, volume: 1400000000 },
      { date: "2026", closeUSD: 16.45, closeEUR: 15.23, volume: 980000000 },
    ],
    historicalAll: [
      { date: "2015", closeUSD: 68.00, closeEUR: 62.95, volume: 5000000000 },
      { date: "2018", closeUSD: 36.00, closeEUR: 33.33, volume: 4500000000 },
      { date: "2020", closeUSD: 8.50, closeEUR: 7.87, volume: 6000000000 },
      { date: "2024", closeUSD: 19.00, closeEUR: 17.59, volume: 1500000000 },
      { date: "2026", closeUSD: 16.45, closeEUR: 15.23, volume: 980000000 },
    ],

    news: [
      {
        id: "news-m-1",
        headline: "Analyst Report: Macy's, Inc. Real Estate Valuation & Digital Transformation",
        source: "Morningstar",
        publishedTime: "2 months ago",
        snippet: "Store closure efficiencies and private credit retail buyout rumors provide floor valuation support.",
      },
      {
        id: "news-m-2",
        headline: "Daily - Vickers Top Buyers & Sellers: Institutional Inflows into M",
        source: "Argus",
        publishedTime: "last year",
        snippet: "Value-oriented hedge funds add retail turnarounds to back-to-school consumer baskets.",
      },
    ],
    researchReports: [
      {
        id: "rep-m-1",
        title: "Analyst Report: Macy's, Inc.",
        provider: "Morningstar",
        publishedTime: "2 months ago",
        rating: "Fair Value Estimate $20.00",
      },
    ],
  },

  "QM=F": {
    ticker: "QM=F",
    name: "E-mini Crude Oil Futures, Sep-20",
    exchange: "NYM",
    assetType: "Futures",
    country: "US",
    flag: "🛢️",
    currency: "USD",
    regularPrice: 77.42,
    regularChange: -0.85,
    regularChangePct: -1.09,
    regularCloseTimeET: "August 17 at 5:00:00 PM EDT",
    regularCloseTimeCET: "17. August um 23:00:00 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 78.15,
    preMarketChange: +0.73,
    preMarketChangePct: +0.94,
    preMarketTimeET: "8:45:00 AM EDT",
    preMarketTimeCET: "14:45:00 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((77.42 * EUR_USD_RATE).toFixed(2)),
    preMarketPriceEUR: Number((78.15 * EUR_USD_RATE).toFixed(2)),
    dayHighUSD: 78.60,
    dayLowUSD: 76.90,
    dayHighEUR: Number((78.60 * EUR_USD_RATE).toFixed(2)),
    dayLowEUR: Number((76.90 * EUR_USD_RATE).toFixed(2)),
    prevCloseUSD: 78.27,
    prevCloseEUR: Number((78.27 * EUR_USD_RATE).toFixed(2)),
    openUSD: 77.50,
    openEUR: Number((77.50 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 92.40,
    fiftyTwoWeekLowUSD: 67.50,
    fiftyTwoWeekHighEUR: Number((92.40 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((67.50 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 78.12,
    bidSize: 50,
    askUSD: 78.18,
    askSize: 50,
    volume: 185000,
    avgVolume3Month: 210000,
    marketCapUSD: "N/A (Futures Contract)",
    marketCapEUR: "N/A (Futures Contract)",
    peRatioTTM: 0,
    epsTTM: 0,
    beta5Y: 0.65,
    forwardDividendRateUSD: 0,
    forwardDividendRateEUR: 0,
    forwardDividendYieldPct: 0,

    intraday1D: generateIntradaySeries(78.27, 78.15, 77.42, 8000),
    historical5D: [
      { date: "Aug 11", closeUSD: 79.10, closeEUR: 73.23, volume: 195000 },
      { date: "Aug 12", closeUSD: 78.80, closeEUR: 72.95, volume: 205000 },
      { date: "Aug 13", closeUSD: 77.90, closeEUR: 72.12, volume: 180000 },
      { date: "Aug 14", closeUSD: 78.27, closeEUR: 72.46, volume: 190000 },
      { date: "Aug 17", closeUSD: 77.42, closeEUR: 71.68, volume: 185000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 81.20, closeEUR: 75.18, volume: 800000 },
      { date: "Jul 25", closeUSD: 79.50, closeEUR: 73.60, volume: 850000 },
      { date: "Aug 01", closeUSD: 78.10, closeEUR: 72.31, volume: 920000 },
      { date: "Aug 08", closeUSD: 79.20, closeEUR: 73.32, volume: 880000 },
      { date: "Aug 17", closeUSD: 77.42, closeEUR: 71.68, volume: 900000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 74.00, closeEUR: 68.51, volume: 3800000 },
      { date: "Apr 2026", closeUSD: 84.50, closeEUR: 78.23, volume: 4200000 },
      { date: "Jun 2026", closeUSD: 80.00, closeEUR: 74.06, volume: 3900000 },
      { date: "Aug 2026", closeUSD: 77.42, closeEUR: 71.68, volume: 4100000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 72.50, closeEUR: 67.12, volume: 3200000 },
      { date: "Apr 2026", closeUSD: 84.50, closeEUR: 78.23, volume: 4200000 },
      { date: "Aug 2026", closeUSD: 77.42, closeEUR: 71.68, volume: 4100000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 75.00, closeEUR: 69.44, volume: 12000000 },
      { date: "Nov 2025", closeUSD: 71.50, closeEUR: 66.19, volume: 11000000 },
      { date: "Feb 2026", closeUSD: 74.00, closeEUR: 68.51, volume: 13000000 },
      { date: "May 2026", closeUSD: 82.00, closeEUR: 75.92, volume: 14000000 },
      { date: "Aug 2026", closeUSD: 77.42, closeEUR: 71.68, volume: 12500000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 65.00, closeEUR: 60.18, volume: 45000000 },
      { date: "2022", closeUSD: 95.00, closeEUR: 87.95, volume: 60000000 },
      { date: "2023", closeUSD: 78.00, closeEUR: 72.21, volume: 52000000 },
      { date: "2024", closeUSD: 80.00, closeEUR: 74.06, volume: 50000000 },
      { date: "2025", closeUSD: 75.00, closeEUR: 69.44, volume: 48000000 },
      { date: "2026", closeUSD: 77.42, closeEUR: 71.68, volume: 35000000 },
    ],
    historicalAll: [
      { date: "2015", closeUSD: 50.00, closeEUR: 46.29, volume: 120000000 },
      { date: "2020", closeUSD: 38.00, closeEUR: 35.18, volume: 180000000 },
      { date: "2022", closeUSD: 95.00, closeEUR: 87.95, volume: 60000000 },
      { date: "2026", closeUSD: 77.42, closeEUR: 71.68, volume: 35000000 },
    ],

    news: [
      {
        id: "news-qm-1",
        headline: "OPEC+ Signals Discipline in Extended Output Targets",
        source: "Reuters",
        publishedTime: "3 hours ago",
        snippet: "Global maritime tanker flows show tightening physical deliveries in Asian refiner corridors.",
      },
    ],
    researchReports: [
      {
        id: "rep-qm-1",
        title: "Energy Outlook: Brent & WTI Spread Dynamics",
        provider: "EIA / S&P Global",
        publishedTime: "1 week ago",
        rating: "Neutral Bias",
      },
    ],
  },

  "MGC=F": {
    ticker: "MGC=F",
    name: "Micro Gold Futures, Dec-2026",
    exchange: "CMX",
    assetType: "Futures",
    country: "US",
    flag: "🥇",
    currency: "USD",
    regularPrice: 2485.60,
    regularChange: +14.20,
    regularChangePct: +0.57,
    regularCloseTimeET: "August 17 at 5:00:00 PM EDT",
    regularCloseTimeCET: "17. August um 23:00:00 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 2492.40,
    preMarketChange: +6.80,
    preMarketChangePct: +0.27,
    preMarketTimeET: "8:47:30 AM EDT",
    preMarketTimeCET: "14:47:30 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((2485.60 * EUR_USD_RATE).toFixed(2)), // €2301.17
    preMarketPriceEUR: Number((2492.40 * EUR_USD_RATE).toFixed(2)), // €2307.46
    dayHighUSD: 2498.00,
    dayLowUSD: 2472.50,
    dayHighEUR: Number((2498.00 * EUR_USD_RATE).toFixed(2)),
    dayLowEUR: Number((2472.50 * EUR_USD_RATE).toFixed(2)),
    prevCloseUSD: 2471.40,
    prevCloseEUR: Number((2471.40 * EUR_USD_RATE).toFixed(2)),
    openUSD: 2475.00,
    openEUR: Number((2475.00 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 2520.00,
    fiftyTwoWeekLowUSD: 1980.00,
    fiftyTwoWeekHighEUR: Number((2520.00 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((1980.00 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 2492.00,
    bidSize: 15,
    askUSD: 2492.80,
    askSize: 15,
    volume: 95000,
    avgVolume3Month: 85000,
    marketCapUSD: "N/A (Futures Contract)",
    marketCapEUR: "N/A (Futures Contract)",
    peRatioTTM: 0,
    epsTTM: 0,
    beta5Y: 0.15,
    forwardDividendRateUSD: 0,
    forwardDividendRateEUR: 0,
    forwardDividendYieldPct: 0,

    intraday1D: generateIntradaySeries(2471.40, 2492.40, 2485.60, 4500),
    historical5D: [
      { date: "Aug 11", closeUSD: 2445.00, closeEUR: 2263.58, volume: 82000 },
      { date: "Aug 12", closeUSD: 2460.00, closeEUR: 2277.47, volume: 88000 },
      { date: "Aug 13", closeUSD: 2455.00, closeEUR: 2272.84, volume: 84000 },
      { date: "Aug 14", closeUSD: 2471.40, closeEUR: 2288.02, volume: 91000 },
      { date: "Aug 17", closeUSD: 2485.60, closeEUR: 2301.17, volume: 95000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 2390.00, closeEUR: 2212.66, volume: 380000 },
      { date: "Jul 25", closeUSD: 2415.00, closeEUR: 2235.81, volume: 410000 },
      { date: "Aug 01", closeUSD: 2440.00, closeEUR: 2258.95, volume: 430000 },
      { date: "Aug 08", closeUSD: 2465.00, closeEUR: 2282.10, volume: 460000 },
      { date: "Aug 17", closeUSD: 2485.60, closeEUR: 2301.17, volume: 475000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 2150.00, closeEUR: 1990.47, volume: 1800000 },
      { date: "Apr 2026", closeUSD: 2320.00, closeEUR: 2147.86, volume: 2100000 },
      { date: "Jun 2026", closeUSD: 2380.00, closeEUR: 2203.40, volume: 1950000 },
      { date: "Aug 2026", closeUSD: 2485.60, closeEUR: 2301.17, volume: 2250000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 2060.00, closeEUR: 1907.15, volume: 1600000 },
      { date: "Apr 2026", closeUSD: 2320.00, closeEUR: 2147.86, volume: 2100000 },
      { date: "Aug 2026", closeUSD: 2485.60, closeEUR: 2301.17, volume: 2250000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 1950.00, closeEUR: 1805.31, volume: 5500000 },
      { date: "Nov 2025", closeUSD: 1990.00, closeEUR: 1842.34, volume: 5800000 },
      { date: "Feb 2026", closeUSD: 2150.00, closeEUR: 1990.47, volume: 6200000 },
      { date: "May 2026", closeUSD: 2350.00, closeEUR: 2175.63, volume: 6500000 },
      { date: "Aug 2026", closeUSD: 2485.60, closeEUR: 2301.17, volume: 6800000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 1800.00, closeEUR: 1666.44, volume: 22000000 },
      { date: "2022", closeUSD: 1820.00, closeEUR: 1684.96, volume: 24000000 },
      { date: "2023", closeUSD: 2060.00, closeEUR: 1907.15, volume: 25000000 },
      { date: "2024", closeUSD: 2350.00, closeEUR: 2175.63, volume: 27000000 },
      { date: "2025", closeUSD: 2420.00, closeEUR: 2240.44, volume: 26000000 },
      { date: "2026", closeUSD: 2485.60, closeEUR: 2301.17, volume: 18000000 },
    ],
    historicalAll: [
      { date: "2010", closeUSD: 1250.00, closeEUR: 1157.25, volume: 50000000 },
      { date: "2015", closeUSD: 1150.00, closeEUR: 1064.67, volume: 55000000 },
      { date: "2020", closeUSD: 1900.00, closeEUR: 1759.02, volume: 65000000 },
      { date: "2026", closeUSD: 2485.60, closeEUR: 2301.17, volume: 18000000 },
    ],

    news: [
      {
        id: "news-mgc-1",
        headline: "Central Bank Gold Reserves Reach All-Time Highs",
        source: "World Gold Council",
        publishedTime: "4 hours ago",
        snippet: "De-dollarization diversification and lower real rate yields drive sovereign accumulation.",
      },
    ],
    researchReports: [
      {
        id: "rep-mgc-1",
        title: "Precious Metals Strategic Allocation Q3",
        provider: "UBS Wealth Management",
        publishedTime: "3 days ago",
        rating: "Overweight Gold Target $2,600",
      },
    ],
  },

  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NasdaqGS",
    assetType: "Equity",
    country: "US",
    flag: "🇺🇸",
    currency: "USD",
    regularPrice: 124.60,
    regularChange: +4.62,
    regularChangePct: +3.85,
    regularCloseTimeET: "August 17 at 4:00:01 PM EDT",
    regularCloseTimeCET: "17. August um 22:00:01 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 126.85,
    preMarketChange: +2.25,
    preMarketChangePct: +1.81,
    preMarketTimeET: "8:47:15 AM EDT",
    preMarketTimeCET: "14:47:15 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((124.60 * EUR_USD_RATE).toFixed(2)),
    preMarketPriceEUR: Number((126.85 * EUR_USD_RATE).toFixed(2)),
    dayHighUSD: 127.40,
    dayLowUSD: 122.10,
    dayHighEUR: Number((127.40 * EUR_USD_RATE).toFixed(2)),
    dayLowEUR: Number((122.10 * EUR_USD_RATE).toFixed(2)),
    prevCloseUSD: 119.98,
    prevCloseEUR: Number((119.98 * EUR_USD_RATE).toFixed(2)),
    openUSD: 123.00,
    openEUR: Number((123.00 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 140.76,
    fiftyTwoWeekLowUSD: 45.10,
    fiftyTwoWeekHighEUR: Number((140.76 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((45.10 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 126.80,
    bidSize: 800,
    askUSD: 126.90,
    askSize: 900,
    volume: 52400000,
    avgVolume3Month: 48000000,
    marketCapUSD: "$3.08T",
    marketCapEUR: "€2.85T",
    peRatioTTM: 58.20,
    epsTTM: 2.14,
    beta5Y: 1.68,
    forwardDividendRateUSD: 0.04,
    forwardDividendRateEUR: 0.037,
    forwardDividendYieldPct: 0.03,
    dividendAnnouncementBanner: {
      text: "NVIDIA declared quarterly cash dividend of $0.01 per post-split share",
      exDate: "Sep 11, 2026",
      payoutAmountUSD: 0.01,
      payoutAmountEUR: 0.009,
    },

    intraday1D: generateIntradaySeries(119.98, 126.85, 124.60, 250000),
    historical5D: [
      { date: "Aug 11", closeUSD: 118.20, closeEUR: 109.43, volume: 42000000 },
      { date: "Aug 12", closeUSD: 121.50, closeEUR: 112.48, volume: 46000000 },
      { date: "Aug 13", closeUSD: 119.00, closeEUR: 110.17, volume: 40000000 },
      { date: "Aug 14", closeUSD: 119.98, closeEUR: 111.08, volume: 44000000 },
      { date: "Aug 17", closeUSD: 124.60, closeEUR: 115.35, volume: 52400000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 112.00, closeEUR: 103.69, volume: 180000000 },
      { date: "Jul 25", closeUSD: 115.40, closeEUR: 106.84, volume: 195000000 },
      { date: "Aug 01", closeUSD: 118.00, closeEUR: 109.24, volume: 210000000 },
      { date: "Aug 08", closeUSD: 121.20, closeEUR: 112.21, volume: 220000000 },
      { date: "Aug 17", closeUSD: 124.60, closeEUR: 115.35, volume: 235000000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 85.00, closeEUR: 78.69, volume: 900000000 },
      { date: "Apr 2026", closeUSD: 105.00, closeEUR: 97.21, volume: 1100000000 },
      { date: "Jun 2026", closeUSD: 128.00, closeEUR: 118.50, volume: 1250000000 },
      { date: "Aug 2026", closeUSD: 124.60, closeEUR: 115.35, volume: 1180000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 68.00, closeEUR: 62.95, volume: 850000000 },
      { date: "Apr 2026", closeUSD: 105.00, closeEUR: 97.21, volume: 1100000000 },
      { date: "Aug 2026", closeUSD: 124.60, closeEUR: 115.35, volume: 1180000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 45.00, closeEUR: 41.66, volume: 4200000000 },
      { date: "Nov 2025", closeUSD: 58.00, closeEUR: 53.70, volume: 4600000000 },
      { date: "Feb 2026", closeUSD: 85.00, closeEUR: 78.69, volume: 4900000000 },
      { date: "May 2026", closeUSD: 115.00, closeEUR: 106.47, volume: 5100000000 },
      { date: "Aug 2026", closeUSD: 124.60, closeEUR: 115.35, volume: 5300000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 18.00, closeEUR: 16.66, volume: 18000000000 },
      { date: "2022", closeUSD: 15.00, closeEUR: 13.89, volume: 22000000000 },
      { date: "2023", closeUSD: 45.00, closeEUR: 41.66, volume: 25000000000 },
      { date: "2024", closeUSD: 95.00, closeEUR: 87.95, volume: 28000000000 },
      { date: "2025", closeUSD: 110.00, closeEUR: 101.84, volume: 26000000000 },
      { date: "2026", closeUSD: 124.60, closeEUR: 115.35, volume: 21000000000 },
    ],
    historicalAll: [
      { date: "2010", closeUSD: 0.80, closeEUR: 0.74, volume: 40000000000 },
      { date: "2016", closeUSD: 5.00, closeEUR: 4.63, volume: 38000000000 },
      { date: "2020", closeUSD: 14.00, closeEUR: 12.96, volume: 35000000000 },
      { date: "2026", closeUSD: 124.60, closeEUR: 115.35, volume: 21000000000 },
    ],

    news: [
      {
        id: "news-nvda-1",
        headline: "Hyperscalers increase Blackwell AI chip cluster purchase orders by 30%",
        source: "Financial Times",
        publishedTime: "1 hour ago",
        snippet: "TSMC advanced packaging capacity unlocks higher yield ramps for enterprise datacenters.",
      },
    ],
    researchReports: [
      {
        id: "rep-nvda-1",
        title: "Semiconductor Supercycle & Data Center AI TAM Expansion",
        provider: "Goldman Sachs Equity Research",
        publishedTime: "Yesterday",
        rating: "Buy Target $155.00",
      },
    ],
  },

  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NasdaqGS",
    assetType: "Equity",
    country: "US",
    flag: "🇺🇸",
    currency: "USD",
    regularPrice: 221.80,
    regularChange: +2.63,
    regularChangePct: +1.20,
    regularCloseTimeET: "August 17 at 4:00:01 PM EDT",
    regularCloseTimeCET: "17. August um 22:00:01 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: 223.45,
    preMarketChange: +1.65,
    preMarketChangePct: +0.74,
    preMarketTimeET: "8:46:00 AM EDT",
    preMarketTimeCET: "14:46:00 MESZ (Deutschland)",
    isPreMarketActive: true,

    eurExchangeRate: EUR_USD_RATE,
    regularPriceEUR: Number((221.80 * EUR_USD_RATE).toFixed(2)),
    preMarketPriceEUR: Number((223.45 * EUR_USD_RATE).toFixed(2)),
    dayHighUSD: 224.10,
    dayLowUSD: 219.80,
    dayHighEUR: Number((224.10 * EUR_USD_RATE).toFixed(2)),
    dayLowEUR: Number((219.80 * EUR_USD_RATE).toFixed(2)),
    prevCloseUSD: 219.17,
    prevCloseEUR: Number((219.17 * EUR_USD_RATE).toFixed(2)),
    openUSD: 220.50,
    openEUR: Number((220.50 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighUSD: 237.23,
    fiftyTwoWeekLowUSD: 164.08,
    fiftyTwoWeekHighEUR: Number((237.23 * EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((164.08 * EUR_USD_RATE).toFixed(2)),

    bidUSD: 223.40,
    bidSize: 500,
    askUSD: 223.50,
    askSize: 600,
    volume: 45200000,
    avgVolume3Month: 41000000,
    marketCapUSD: "$3.41T",
    marketCapEUR: "€3.16T",
    peRatioTTM: 33.40,
    epsTTM: 6.64,
    beta5Y: 1.08,
    forwardDividendRateUSD: 1.00,
    forwardDividendRateEUR: 0.93,
    forwardDividendYieldPct: 0.45,
    dividendAnnouncementBanner: {
      text: "Apple declared cash dividend of $0.25 per share",
      exDate: "Aug 12, 2026",
      payoutAmountUSD: 0.25,
      payoutAmountEUR: 0.23,
    },

    intraday1D: generateIntradaySeries(219.17, 223.45, 221.80, 180000),
    historical5D: [
      { date: "Aug 11", closeUSD: 218.00, closeEUR: 201.82, volume: 38000000 },
      { date: "Aug 12", closeUSD: 219.50, closeEUR: 203.21, volume: 40000000 },
      { date: "Aug 13", closeUSD: 218.40, closeEUR: 202.20, volume: 37000000 },
      { date: "Aug 14", closeUSD: 219.17, closeEUR: 202.91, volume: 39000000 },
      { date: "Aug 17", closeUSD: 221.80, closeEUR: 205.34, volume: 45200000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 212.00, closeEUR: 196.27, volume: 160000000 },
      { date: "Jul 25", closeUSD: 215.00, closeEUR: 199.05, volume: 175000000 },
      { date: "Aug 01", closeUSD: 218.20, closeEUR: 202.01, volume: 185000000 },
      { date: "Aug 08", closeUSD: 220.00, closeEUR: 203.68, volume: 190000000 },
      { date: "Aug 17", closeUSD: 221.80, closeEUR: 205.34, volume: 205000000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 185.00, closeEUR: 171.27, volume: 850000000 },
      { date: "Apr 2026", closeUSD: 198.00, closeEUR: 183.31, volume: 920000000 },
      { date: "Jun 2026", closeUSD: 215.00, closeEUR: 199.05, volume: 980000000 },
      { date: "Aug 2026", closeUSD: 221.80, closeEUR: 205.34, volume: 950000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 182.00, closeEUR: 168.50, volume: 800000000 },
      { date: "Apr 2026", closeUSD: 198.00, closeEUR: 183.31, volume: 920000000 },
      { date: "Aug 2026", closeUSD: 221.80, closeEUR: 205.34, volume: 950000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 175.00, closeEUR: 162.02, volume: 3800000000 },
      { date: "Nov 2025", closeUSD: 182.00, closeEUR: 168.50, volume: 4100000000 },
      { date: "Feb 2026", closeUSD: 185.00, closeEUR: 171.27, volume: 3900000000 },
      { date: "May 2026", closeUSD: 205.00, closeEUR: 189.79, volume: 4200000000 },
      { date: "Aug 2026", closeUSD: 221.80, closeEUR: 205.34, volume: 4400000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 130.00, closeEUR: 120.35, volume: 17000000000 },
      { date: "2022", closeUSD: 145.00, closeEUR: 134.24, volume: 19000000000 },
      { date: "2023", closeUSD: 180.00, closeEUR: 166.64, volume: 18000000000 },
      { date: "2024", closeUSD: 210.00, closeEUR: 194.42, volume: 16500000000 },
      { date: "2025", closeUSD: 215.00, closeEUR: 199.05, volume: 16000000000 },
      { date: "2026", closeUSD: 221.80, closeEUR: 205.34, volume: 12500000000 },
    ],
    historicalAll: [
      { date: "2005", closeUSD: 2.50, closeEUR: 2.31, volume: 50000000000 },
      { date: "2010", closeUSD: 10.00, closeEUR: 9.26, volume: 48000000000 },
      { date: "2020", closeUSD: 110.00, closeEUR: 101.84, volume: 35000000000 },
      { date: "2026", closeUSD: 221.80, closeEUR: 205.34, volume: 12500000000 },
    ],

    news: [
      {
        id: "news-aapl-1",
        headline: "Apple Intelligence Integration Across iOS 18 Spurs Replacement Cycle",
        source: "Bloomberg",
        publishedTime: "3 hours ago",
        snippet: "Greater China hardware orders show sequential resilience across premium Pro tiers.",
      },
    ],
    researchReports: [
      {
        id: "rep-aapl-1",
        title: "Apple Inc. Global Services & Device Supercycle Model",
        provider: "Morgan Stanley",
        publishedTime: "3 days ago",
        rating: "Overweight Target $250",
      },
    ],
  },

  DAX: {
    ticker: "DAX",
    name: "DAX 40 Index (Germany)",
    exchange: "XETRA",
    assetType: "Index",
    country: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    regularPrice: 18465.20,
    regularChange: +138.50,
    regularChangePct: +0.76,
    regularCloseTimeET: "August 17 at 11:30:00 AM EDT",
    regularCloseTimeCET: "17. August um 17:30:00 MESZ (XETRA Schluss)",
    isRegularMarketOpen: false,

    preMarketPrice: 18520.80,
    preMarketChange: +55.60,
    preMarketChangePct: +0.30,
    preMarketTimeET: "8:47:00 AM EDT",
    preMarketTimeCET: "14:47:00 MESZ (Vorboerse / L&S)",
    isPreMarketActive: true,

    eurExchangeRate: 1.0,
    regularPriceEUR: 18465.20,
    preMarketPriceEUR: 18520.80,
    dayHighUSD: Number((18540.00 / EUR_USD_RATE).toFixed(2)),
    dayLowUSD: Number((18390.00 / EUR_USD_RATE).toFixed(2)),
    dayHighEUR: 18540.00,
    dayLowEUR: 18390.00,
    prevCloseUSD: Number((18326.70 / EUR_USD_RATE).toFixed(2)),
    prevCloseEUR: 18326.70,
    openUSD: Number((18410.00 / EUR_USD_RATE).toFixed(2)),
    openEUR: 18410.00,
    fiftyTwoWeekHighUSD: Number((18890.00 / EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekLowUSD: Number((14630.00 / EUR_USD_RATE).toFixed(2)),
    fiftyTwoWeekHighEUR: 18890.00,
    fiftyTwoWeekLowEUR: 14630.00,

    bidUSD: Number((18518.00 / EUR_USD_RATE).toFixed(2)),
    bidSize: 100,
    askUSD: Number((18522.00 / EUR_USD_RATE).toFixed(2)),
    askSize: 100,
    volume: 58200000,
    avgVolume3Month: 62000000,
    marketCapUSD: "$1.95T",
    marketCapEUR: "€1.80T",
    peRatioTTM: 14.20,
    epsTTM: 1300.35,
    beta5Y: 1.02,
    forwardDividendRateUSD: 0,
    forwardDividendRateEUR: 0,
    forwardDividendYieldPct: 3.12,

    intraday1D: generateIntradaySeries(18326.70, 18520.80, 18465.20, 350000),
    historical5D: [
      { date: "Aug 11", closeUSD: 19800, closeEUR: 18330, volume: 55000000 },
      { date: "Aug 12", closeUSD: 19910, closeEUR: 18430, volume: 58000000 },
      { date: "Aug 13", closeUSD: 19850, closeEUR: 18380, volume: 52000000 },
      { date: "Aug 14", closeUSD: 19790, closeEUR: 18326, volume: 54000000 },
      { date: "Aug 17", closeUSD: 19945, closeEUR: 18465, volume: 58200000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: 19500, closeEUR: 18050, volume: 220000000 },
      { date: "Jul 25", closeUSD: 19680, closeEUR: 18220, volume: 235000000 },
      { date: "Aug 01", closeUSD: 19800, closeEUR: 18330, volume: 250000000 },
      { date: "Aug 08", closeUSD: 19900, closeEUR: 18420, volume: 260000000 },
      { date: "Aug 17", closeUSD: 19945, closeEUR: 18465, volume: 275000000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: 18800, closeEUR: 17400, volume: 1100000000 },
      { date: "Apr 2026", closeUSD: 19600, closeEUR: 18150, volume: 1250000000 },
      { date: "Jun 2026", closeUSD: 19750, closeEUR: 18280, volume: 1200000000 },
      { date: "Aug 2026", closeUSD: 19945, closeEUR: 18465, volume: 1300000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: 18100, closeEUR: 16750, volume: 1050000000 },
      { date: "Apr 2026", closeUSD: 19600, closeEUR: 18150, volume: 1250000000 },
      { date: "Aug 2026", closeUSD: 19945, closeEUR: 18465, volume: 1300000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: 17200, closeEUR: 15920, volume: 4800000000 },
      { date: "Nov 2025", closeUSD: 17800, closeEUR: 16480, volume: 5100000000 },
      { date: "Feb 2026", closeUSD: 18800, closeEUR: 17400, volume: 5300000000 },
      { date: "May 2026", closeUSD: 19800, closeEUR: 18330, volume: 5600000000 },
      { date: "Aug 2026", closeUSD: 19945, closeEUR: 18465, volume: 5800000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: 17100, closeEUR: 15840, volume: 21000000000 },
      { date: "2022", closeUSD: 15000, closeEUR: 13900, volume: 24000000000 },
      { date: "2023", closeUSD: 18100, closeEUR: 16750, volume: 22500000000 },
      { date: "2024", closeUSD: 19200, closeEUR: 17780, volume: 21000000000 },
      { date: "2025", closeUSD: 19500, closeEUR: 18050, volume: 20500000000 },
      { date: "2026", closeUSD: 19945, closeEUR: 18465, volume: 15000000000 },
    ],
    historicalAll: [
      { date: "2000", closeUSD: 7500, closeEUR: 6944, volume: 45000000000 },
      { date: "2010", closeUSD: 6800, closeEUR: 6296, volume: 55000000000 },
      { date: "2020", closeUSD: 13700, closeEUR: 12683, volume: 60000000000 },
      { date: "2026", closeUSD: 19945, closeEUR: 18465, volume: 15000000000 },
    ],

    news: [
      {
        id: "news-dax-1",
        headline: "ECB Rate Cut Expectations Provide Support to German Industrial Champions",
        source: "Handelsblatt",
        publishedTime: "2 hours ago",
        snippet: "Automotive and chemical sectors lead Frankfurt gains ahead of Jackson Hole conference.",
      },
    ],
    researchReports: [
      {
        id: "rep-dax-1",
        title: "DAX 40 Earnings Multiples vs S&P 500 Historical Discount",
        provider: "Deutsche Bank Research",
        publishedTime: "4 days ago",
        rating: "Overweight DAX Equities Target 19,200",
      },
    ],
  },
};

export const QUICK_ALL_SYMBOLS_SEARCH_LIST = [
  { ticker: "MSFT", name: "Microsoft Corporation", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 480.35, prePrice: 482.31, changePct: +0.41, priceEUR: 446.52 },
  { ticker: "M", name: "Macy's, Inc.", assetType: "Equity", exchange: "NYQ", flag: "🇺🇸", price: 16.45, prePrice: 16.78, changePct: +2.01, priceEUR: 15.53 },
  { ticker: "QM=F", name: "E-mini Crude Oil Futures,Sep-20", assetType: "Futures", exchange: "NYM", flag: "🛢️", price: 77.42, prePrice: 78.15, changePct: +0.94, priceEUR: 72.35 },
  { ticker: "MGC=F", name: "Micro Gold Futures,Dec-2026", assetType: "Futures", exchange: "CMX", flag: "🥇", price: 2485.60, prePrice: 2492.40, changePct: +0.27, priceEUR: 2307.46 },
  { ticker: "BO=F", name: "Mont Belvieu TET Propane (OPIS)", assetType: "Futures", exchange: "NYM", flag: "⛽", price: 0.74, prePrice: 0.75, changePct: +1.35, priceEUR: 0.69 },
  { ticker: "MRCO", name: "Mercator Acquisition Corp. Class A Ordinary Shares", assetType: "Equity", exchange: "NGM", flag: "🇺🇸", price: 10.42, prePrice: 10.45, changePct: +0.29, priceEUR: 9.67 },
  { ticker: "SOLC", name: "Canary Marinade Solana ETF Shares of Beneficial Interest", assetType: "Equity", exchange: "NGM", flag: "🪙", price: 24.80, prePrice: 25.10, changePct: +1.21, priceEUR: 23.24 },
  { ticker: "NVDA", name: "NVIDIA Corporation", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 124.60, prePrice: 126.85, changePct: +1.81, priceEUR: 117.44 },
  { ticker: "AAPL", name: "Apple Inc.", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 221.80, prePrice: 223.45, changePct: +0.74, priceEUR: 206.87 },
  { ticker: "DAX", name: "DAX 40 Index (Germany)", assetType: "Index", exchange: "XETRA", flag: "🇩🇪", price: 18465.20, prePrice: 18520.80, changePct: +0.30, priceEUR: 18520.80 },
  { ticker: "META", name: "Meta Platforms Inc.", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 532.40, prePrice: 536.80, changePct: +0.83, priceEUR: 496.97 },
  { ticker: "TSLA", name: "Tesla, Inc.", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 218.50, prePrice: 222.10, changePct: +1.65, priceEUR: 205.62 },
  { ticker: "AMZN", name: "Amazon.com, Inc.", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 186.20, prePrice: 188.15, changePct: +1.05, priceEUR: 174.19 },
  { ticker: "GOOGL", name: "Alphabet Inc. Class A", assetType: "Equity", exchange: "NasdaqGS", flag: "🇺🇸", price: 168.40, prePrice: 170.20, changePct: +1.07, priceEUR: 157.57 },
  { ticker: "SAP", name: "SAP SE (Germany)", assetType: "Equity", exchange: "XETRA", flag: "🇩🇪", price: 198.50, prePrice: 199.80, changePct: +0.65, priceEUR: 199.80 },
  { ticker: "ASML", name: "ASML Holding N.V. (Netherlands/EU)", assetType: "Equity", exchange: "AMS", flag: "🇳🇱", price: 845.00, prePrice: 852.50, changePct: +0.89, priceEUR: 852.50 },
];

/**
 * Universal safe getter for StockPreMarketProfile.
 * Guarantees a fully valid, crash-proof profile for ANY ticker requested.
 */
export function getStockPreMarketProfile(rawTicker: string): StockPreMarketProfile {
  const ticker = (rawTicker || "MSFT").trim().toUpperCase();
  
  if (STOCK_PRE_MARKET_DATABASE[ticker]) {
    return STOCK_PRE_MARKET_DATABASE[ticker];
  }

  // Check if ticker is in search list
  const searchItem = QUICK_ALL_SYMBOLS_SEARCH_LIST.find(
    (s) => s.ticker.toUpperCase() === ticker
  );

  const price = searchItem ? searchItem.price : 150.00;
  const prePrice = searchItem ? searchItem.prePrice : price * 1.008;
  const change = prePrice - price;
  const changePct = searchItem ? searchItem.changePct : ((change / price) * 100);
  const name = searchItem ? searchItem.name : `${ticker} Corporation`;
  const exchange = searchItem ? searchItem.exchange : "NasdaqGS";
  const flag = searchItem ? searchItem.flag : "🌐";
  const isEuroAsset = searchItem?.ticker === "DAX" || searchItem?.ticker === "SAP" || searchItem?.ticker === "ASML";
  const eurRate = isEuroAsset ? 1.0 : EUR_USD_RATE;

  const generatedProfile: StockPreMarketProfile = {
    ticker,
    name,
    exchange,
    assetType: (searchItem?.assetType as any) || "Equity",
    country: isEuroAsset ? "Germany / EU" : "US",
    flag,
    currency: isEuroAsset ? "EUR" : "USD",
    
    regularPrice: price,
    regularChange: Number((price * 0.004).toFixed(2)),
    regularChangePct: 0.40,
    regularCloseTimeET: "August 17 at 4:00:00 PM EDT",
    regularCloseTimeCET: "17. August um 22:00:00 MESZ",
    isRegularMarketOpen: false,

    preMarketPrice: prePrice,
    preMarketChange: Number(change.toFixed(2)),
    preMarketChangePct: Number(changePct.toFixed(2)),
    preMarketTimeET: "8:46:57 AM EDT",
    preMarketTimeCET: "14:46:57 MESZ (German Pre-Open / Vorboerse)",
    isPreMarketActive: true,

    eurExchangeRate: eurRate,
    regularPriceEUR: Number((price * eurRate).toFixed(2)),
    preMarketPriceEUR: Number((prePrice * eurRate).toFixed(2)),
    dayHighUSD: Number((Math.max(price, prePrice) * 1.015).toFixed(2)),
    dayLowUSD: Number((Math.min(price, prePrice) * 0.985).toFixed(2)),
    dayHighEUR: Number((Math.max(price, prePrice) * 1.015 * eurRate).toFixed(2)),
    dayLowEUR: Number((Math.min(price, prePrice) * 0.985 * eurRate).toFixed(2)),
    prevCloseUSD: price,
    prevCloseEUR: Number((price * eurRate).toFixed(2)),
    openUSD: Number((price * 0.995).toFixed(2)),
    openEUR: Number((price * 0.995 * eurRate).toFixed(2)),
    fiftyTwoWeekHighUSD: Number((price * 1.35).toFixed(2)),
    fiftyTwoWeekLowUSD: Number((price * 0.72).toFixed(2)),
    fiftyTwoWeekHighEUR: Number((price * 1.35 * eurRate).toFixed(2)),
    fiftyTwoWeekLowEUR: Number((price * 0.72 * eurRate).toFixed(2)),

    bidUSD: Number((prePrice - 0.05).toFixed(2)),
    bidSize: 400,
    askUSD: Number((prePrice + 0.05).toFixed(2)),
    askSize: 600,
    volume: 14500000,
    avgVolume3Month: 18200000,
    marketCapUSD: `$${(price * 0.008).toFixed(2)}B`,
    marketCapEUR: `€${(price * 0.008 * eurRate).toFixed(2)}B`,
    peRatioTTM: 28.5,
    epsTTM: Number((price / 28.5).toFixed(2)),
    beta5Y: 1.15,
    forwardDividendRateUSD: Number((price * 0.012).toFixed(2)),
    forwardDividendRateEUR: Number((price * 0.012 * eurRate).toFixed(2)),
    forwardDividendYieldPct: 1.20,

    intraday1D: generateIntradaySeries(price, prePrice, price, 150000),
    historical5D: [
      { date: "Aug 11", closeUSD: price * 0.97, closeEUR: price * 0.97 * eurRate, volume: 14000000 },
      { date: "Aug 12", closeUSD: price * 0.98, closeEUR: price * 0.98 * eurRate, volume: 15500000 },
      { date: "Aug 13", closeUSD: price * 0.99, closeEUR: price * 0.99 * eurRate, volume: 13200000 },
      { date: "Aug 14", closeUSD: price * 0.995, closeEUR: price * 0.995 * eurRate, volume: 16800000 },
      { date: "Aug 17", closeUSD: price, closeEUR: price * eurRate, volume: 14500000 },
    ],
    historical1M: [
      { date: "Jul 18", closeUSD: price * 0.92, closeEUR: price * 0.92 * eurRate, volume: 65000000 },
      { date: "Jul 25", closeUSD: price * 0.95, closeEUR: price * 0.95 * eurRate, volume: 72000000 },
      { date: "Aug 01", closeUSD: price * 0.97, closeEUR: price * 0.97 * eurRate, volume: 68000000 },
      { date: "Aug 08", closeUSD: price * 0.99, closeEUR: price * 0.99 * eurRate, volume: 75000000 },
      { date: "Aug 17", closeUSD: price, closeEUR: price * eurRate, volume: 71000000 },
    ],
    historical6M: [
      { date: "Feb 2026", closeUSD: price * 0.85, closeEUR: price * 0.85 * eurRate, volume: 380000000 },
      { date: "Apr 2026", closeUSD: price * 0.90, closeEUR: price * 0.90 * eurRate, volume: 420000000 },
      { date: "Jun 2026", closeUSD: price * 0.95, closeEUR: price * 0.95 * eurRate, volume: 410000000 },
      { date: "Aug 2026", closeUSD: price, closeEUR: price * eurRate, volume: 390000000 },
    ],
    historicalYTD: [
      { date: "Jan 2026", closeUSD: price * 0.88, closeEUR: price * 0.88 * eurRate, volume: 320000000 },
      { date: "Apr 2026", closeUSD: price * 0.92, closeEUR: price * 0.92 * eurRate, volume: 360000000 },
      { date: "Aug 2026", closeUSD: price, closeEUR: price * eurRate, volume: 340000000 },
    ],
    historical1Y: [
      { date: "Aug 2025", closeUSD: price * 0.78, closeEUR: price * 0.78 * eurRate, volume: 1800000000 },
      { date: "Nov 2025", closeUSD: price * 0.82, closeEUR: price * 0.82 * eurRate, volume: 1900000000 },
      { date: "Feb 2026", closeUSD: price * 0.88, closeEUR: price * 0.88 * eurRate, volume: 1750000000 },
      { date: "May 2026", closeUSD: price * 0.94, closeEUR: price * 0.94 * eurRate, volume: 1850000000 },
      { date: "Aug 2026", closeUSD: price, closeEUR: price * eurRate, volume: 1950000000 },
    ],
    historical5Y: [
      { date: "2021", closeUSD: price * 0.55, closeEUR: price * 0.55 * eurRate, volume: 8500000000 },
      { date: "2022", closeUSD: price * 0.50, closeEUR: price * 0.50 * eurRate, volume: 9200000000 },
      { date: "2023", closeUSD: price * 0.68, closeEUR: price * 0.68 * eurRate, volume: 8800000000 },
      { date: "2024", closeUSD: price * 0.80, closeEUR: price * 0.80 * eurRate, volume: 9100000000 },
      { date: "2025", closeUSD: price * 0.90, closeEUR: price * 0.90 * eurRate, volume: 8900000000 },
      { date: "2026", closeUSD: price, closeEUR: price * eurRate, volume: 7500000000 },
    ],
    historicalAll: [
      { date: "2010", closeUSD: price * 0.15, closeEUR: price * 0.15 * eurRate, volume: 15000000000 },
      { date: "2015", closeUSD: price * 0.30, closeEUR: price * 0.30 * eurRate, volume: 18000000000 },
      { date: "2020", closeUSD: price * 0.60, closeEUR: price * 0.60 * eurRate, volume: 22000000000 },
      { date: "2026", closeUSD: price, closeEUR: price * eurRate, volume: 25000000000 },
    ],

    news: [
      {
        id: `news-${ticker}-1`,
        headline: `${name} Active in Global Pre-Market Session Ahead of European Open`,
        source: "MarketWatch / Bloomberg",
        publishedTime: "25 min ago",
        snippet: `Institutional order flow reflects ongoing pre-market volume crossing German and US early broker networks.`,
      },
    ],
    researchReports: [
      {
        id: `rep-${ticker}-1`,
        title: `${name} Quantitative Valuation Model & Consensus Target`,
        provider: "Goldman Sachs / UBS",
        publishedTime: "2 days ago",
        rating: "Buy / Outperform Target",
      },
    ],
  };

  // Cache in database
  STOCK_PRE_MARKET_DATABASE[ticker] = generatedProfile;
  return generatedProfile;
}
