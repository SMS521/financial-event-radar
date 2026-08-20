import {
  UpcomingEconomicEvent,
  TodayReleasedNewsItem,
  InstrumentTechnicalOverview,
  GlobalMarketSessionInfo,
  PoliticianTradeRecord,
  CorporateBigDealItem
} from "../types/marketIntelligenceTypes";

/**
 * UPCOMING 2-WEEK ECONOMIC & CENTRAL BANK CALENDAR
 * All timestamps structured clearly with local and ET/CEST timezones
 */
export const UPCOMING_TWO_WEEKS_EVENTS: UpcomingEconomicEvent[] = [
  {
    id: "EVENT-2026-US-CPI",
    eventName: "US Consumer Price Index (CPI MoM & YoY)",
    country: "US",
    flagEmoji: "🇺🇸",
    category: "INFLATION",
    germanDateTimeCest: "Tuesday, Aug 18, 2026 • 14:30 CEST",
    usDateTimeEt: "Tuesday, Aug 18, 2026 • 08:30 ET",
    dateOnly: "2026-08-18",
    timeCest: "14:30 CEST",
    impactLevel: "HIGH",
    consensusForecast: "3.1% YoY (0.2% MoM)",
    previousValue: "3.3% YoY (0.3% MoM)",
    forecastRange: "2.9% - 3.4%",
    unit: "% YoY",
    summaryDescription: "Primary Federal Reserve inflation gauge for policy rate path. Determines September FOMC 25bp vs 50bp rate cut probability.",
    estimatedDirection: "SELL",
    estimatedTargetDropOrGain: "Target: -1.4% to -2.2% on NQ if > 3.2% Core",
    bankExpectations: [
      {
        bankName: "Goldman Sachs",
        analyst: "Jan Hatzius (Chief Economist)",
        forecastValue: "3.0% YoY",
        stance: "DOVISH",
        commentary: "Used vehicles and shelter lag will pull headline down by 25bps. Clears path for consecutive Fed rate cuts.",
        targetPriceImpact: "+1.2% NQ relief rally"
      },
      {
        bankName: "JPMorgan Chase",
        analyst: "Michael Feroli (Chief US Economist)",
        forecastValue: "3.2% YoY",
        stance: "HAWKISH",
        commentary: "Insurance and medical service super-core inflation remains sticky above 3.8%. May trigger algorithmic de-risking.",
        targetPriceImpact: "-1.5% to -1.9% NQ drop"
      },
      {
        bankName: "Morgan Stanley",
        analyst: "Ellen Zentner",
        forecastValue: "3.1% YoY",
        stance: "NEUTRAL",
        commentary: "Inline with consensus. Focus will pivot immediately to real yields and 2Y Treasury reaction.",
        targetPriceImpact: "±0.3% choppy range"
      },
      {
        bankName: "Deutsche Bank",
        analyst: "Jim Reid",
        forecastValue: "3.2% YoY",
        stance: "HAWKISH",
        commentary: "European spillover to DAX will be amplified if 10Y US Treasury yield spikes above 4.30%.",
        targetPriceImpact: "-1.1% DAX sell-off"
      }
    ],
    tweetExpectations: [
      {
        author: "Nick Timiraos (The Wall Street Journal)",
        handle: "@NickTimiraos",
        authorRole: "Fed Reporter",
        tweetText: "Markets pricing in 34bps of cuts for September. Tomorrow's CPI print is the single largest hurdle before Jackson Hole symposium.",
        timestamp: "2h ago",
        sentiment: "CAUTION",
        predictedTarget: "High volatility ±150pts NQ",
        likesOrRetweets: "1.4k Retweets"
      },
      {
        author: "Tom Lee (Fundstrat)",
        handle: "@fundstrat",
        authorRole: "Managing Partner",
        tweetText: "Shelter inflation is dropping in real-time. If CPI prints below 3.0%, expect massive short squeeze in small-caps and tech.",
        timestamp: "4h ago",
        sentiment: "BULLISH",
        predictedTarget: "+2.0% rally in QQQ",
        likesOrRetweets: "3.8k Likes"
      },
      {
        author: "Mohamed A. El-Erian",
        handle: "@elerianm",
        authorRole: "President Queens' College, Adviser",
        tweetText: "The risk is a core inflation overshoot that forces the Fed into a restrictive posture longer than markets can digest.",
        timestamp: "5h ago",
        sentiment: "BEARISH",
        predictedTarget: "-1.5% multiple contraction",
        likesOrRetweets: "2.1k Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Hot Print (Core > 3.3% YoY)",
        condition: "Surprise > +0.2% above consensus",
        historicalProbability: 28,
        historicalSampleSize: 14,
        expectedNasdaqMovePct: "-1.85%",
        expectedDaxMovePct: "-1.40%",
        expectedYieldMoveBps: "+14.2 bps",
        primaryTargetZone: "Nasdaq Target: 19,450 (-1.9%)",
        playbookDescription: "Algorithmic selling across high-multiple tech. Systematic CTAs de-gross immediately within first 15 minutes."
      },
      {
        outcomeCase: "Inline Print (Core 3.1% YoY)",
        condition: "Between -0.1% and +0.1%",
        historicalProbability: 46,
        historicalSampleSize: 23,
        expectedNasdaqMovePct: "+0.35%",
        expectedDaxMovePct: "+0.20%",
        expectedYieldMoveBps: "-2.5 bps",
        primaryTargetZone: "Nasdaq Target: 19,900 (Flat/Mild Up)",
        playbookDescription: "Initial whip-saw followed by gradual consolidation into US market open (15:30 CEST)."
      },
      {
        outcomeCase: "Cool / Dovish Print (Core < 3.0% YoY)",
        condition: "Surprise < -0.2% below consensus",
        historicalProbability: 26,
        historicalSampleSize: 13,
        expectedNasdaqMovePct: "+1.65%",
        expectedDaxMovePct: "+1.25%",
        expectedYieldMoveBps: "-11.8 bps",
        primaryTargetZone: "Nasdaq Target: 20,180 (+1.8%)",
        playbookDescription: "Massive multiple expansion rally. High beta semiconductors (NVDA, AMD) lead with +3.0% moves."
      }
    ]
  },
  {
    id: "EVENT-2026-JAPAN-BOJ",
    eventName: "Bank of Japan (BoJ) Policy Rate Decision & Press Conference",
    country: "JAPAN",
    flagEmoji: "🇯🇵",
    category: "CENTRAL_BANK",
    germanDateTimeCest: "Wednesday, Aug 19, 2026 • 04:30 CEST",
    usDateTimeEt: "Tuesday, Aug 18, 2026 • 22:30 ET",
    dateOnly: "2026-08-19",
    timeCest: "04:30 CEST",
    impactLevel: "HIGH",
    consensusForecast: "0.50% (Hike by +25bps)",
    previousValue: "0.25%",
    forecastRange: "0.25% - 0.50%",
    unit: "Policy Rate %",
    summaryDescription: "BoJ Governor Ueda decision on further rate normalization and reduction of Japanese Government Bond (JGB) purchases.",
    estimatedDirection: "SELL",
    estimatedTargetDropOrGain: "Target: -1.8% on Nikkei, -0.9% on Nasdaq due to Yen Carry Unwind",
    bankExpectations: [
      {
        bankName: "Nomura Securities",
        analyst: "Kyohei Morita",
        forecastValue: "0.50% (+25bps)",
        stance: "HAWKISH",
        commentary: "Wage growth data supports immediate rate hike. Governor Ueda will signal further tightening in Q4.",
        targetPriceImpact: "USD/JPY drops to 142.50, Yen carry trade unwinding"
      },
      {
        bankName: "Mizuho Bank",
        analyst: "Kenji Sugitani",
        forecastValue: "0.25% (Hold)",
        stance: "DOVISH",
        commentary: "BoJ may pause to monitor Tokyo inflation metrics and export company profit resilience.",
        targetPriceImpact: "+1.5% Nikkei 225 relief bounce"
      },
      {
        bankName: "Barclays Capital",
        analyst: "Tetsufumi Yamakawa",
        forecastValue: "0.50% (+25bps)",
        stance: "HAWKISH",
        commentary: "Yen carry unwind poses asymmetric risk for global tech liquidity.",
        targetPriceImpact: "-1.2% Nasdaq spillover"
      }
    ],
    tweetExpectations: [
      {
        author: "Dan Nathan (RiskReversal)",
        handle: "@RiskReversal",
        authorRole: "CNBC Contributor",
        tweetText: "Watch the BoJ announcement at 04:30 German time. Every time the Yen strengthens sharply below 145, US mega-cap tech feels the margin pressure.",
        timestamp: "1 day ago",
        sentiment: "CAUTION",
        predictedTarget: "Sell-off in chip stocks",
        likesOrRetweets: "890 Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Hawkish Rate Hike (+25bps + Bond Cut)",
        condition: "Rate raised to 0.50% with aggressive tapering",
        historicalProbability: 55,
        historicalSampleSize: 8,
        expectedNasdaqMovePct: "-1.10%",
        expectedDaxMovePct: "-0.80%",
        expectedYieldMoveBps: "+4.5 bps JGB",
        primaryTargetZone: "Nikkei Target: -2.4% / Nasdaq Target: -1.2%",
        playbookDescription: "Yen appreciates rapidly towards 141.00. Global carry trade margin calls trigger algorithmic selling in early European morning."
      },
      {
        outcomeCase: "Dovish Pause (Hold at 0.25%)",
        condition: "Rate kept unchanged",
        historicalProbability: 45,
        historicalSampleSize: 6,
        expectedNasdaqMovePct: "+0.80%",
        expectedDaxMovePct: "+0.60%",
        expectedYieldMoveBps: "-3.2 bps",
        primaryTargetZone: "Nikkei Target: +2.1% / Nasdaq Target: +0.8%",
        playbookDescription: "Short-covering in Japanese equities and relief for US leveraged positions."
      }
    ]
  },
  {
    id: "EVENT-2026-GER-ZEW",
    eventName: "Germany ZEW Economic Sentiment Index",
    country: "GERMANY",
    flagEmoji: "🇩🇪",
    category: "GROWTH_GDP",
    germanDateTimeCest: "Tuesday, Aug 18, 2026 • 11:00 CEST",
    usDateTimeEt: "Tuesday, Aug 18, 2026 • 05:00 ET",
    dateOnly: "2026-08-18",
    timeCest: "11:00 CEST",
    impactLevel: "MEDIUM",
    consensusForecast: "42.5 Index Points",
    previousValue: "41.8 Index Points",
    forecastRange: "39.0 - 45.0",
    unit: "Index",
    summaryDescription: "Leading survey of German institutional investors and financial analysts evaluating the 6-month economic outlook for the Eurozone powerhouse.",
    estimatedDirection: "BUY",
    estimatedTargetDropOrGain: "Target: +0.6% on DAX 40 if > 44.0",
    bankExpectations: [
      {
        bankName: "Commerzbank",
        analyst: "Dr. Jörg Krämer",
        forecastValue: "43.2",
        stance: "BULLISH",
        commentary: "Industrial export orders to Asia and chemical sector stabilizing. DAX industrial exporters will benefit.",
        targetPriceImpact: "+0.7% DAX upside"
      },
      {
        bankName: "Allianz SE",
        analyst: "Ludovic Subran",
        forecastValue: "41.0",
        stance: "NEUTRAL",
        commentary: "High energy transition costs continue to weigh on mid-sized Mittelstand capital expenditures.",
        targetPriceImpact: "DAX sideways 18,400 zone"
      }
    ],
    tweetExpectations: [
      {
        author: "Holger Zschaepitz (WELT Financial)",
        handle: "@schuldensuehner",
        authorRole: "Chief Market Editor",
        tweetText: "Good morning from Berlin! Germany ZEW expectation index due at 11:00 CEST. DAX looking for catalysts to break above 18,500.",
        timestamp: "3h ago",
        sentiment: "NEUTRAL",
        predictedTarget: "DAX 18,550 resistance test",
        likesOrRetweets: "760 Retweets"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Strong Beat (ZEW > 45.0)",
        condition: "Surprise > +3.0 index pts",
        historicalProbability: 35,
        historicalSampleSize: 10,
        expectedNasdaqMovePct: "+0.30%",
        expectedDaxMovePct: "+0.85%",
        expectedYieldMoveBps: "+3.0 bps Bund",
        primaryTargetZone: "DAX 40 Target: +0.9%",
        playbookDescription: "Auto manufacturers (BMW, Mercedes, VW) and SAP lead European morning trading session."
      }
    ]
  },
  {
    id: "EVENT-2026-UK-CPI",
    eventName: "UK Inflation Rate (CPI YoY & Core)",
    country: "UK",
    flagEmoji: "🇬🇧",
    category: "INFLATION",
    germanDateTimeCest: "Wednesday, Aug 19, 2026 • 08:00 CEST",
    usDateTimeEt: "Wednesday, Aug 19, 2026 • 02:00 ET",
    dateOnly: "2026-08-19",
    timeCest: "08:00 CEST",
    impactLevel: "HIGH",
    consensusForecast: "2.3% YoY (Core 3.4%)",
    previousValue: "2.4% YoY (Core 3.5%)",
    forecastRange: "2.1% - 2.6%",
    unit: "% YoY",
    summaryDescription: "Office for National Statistics UK inflation print directly steering Bank of England (BoE) rate reduction trajectory.",
    estimatedDirection: "BUY",
    estimatedTargetDropOrGain: "Target: +0.5% FTSE 100 / GBP/USD to 1.2850",
    bankExpectations: [
      {
        bankName: "HSBC Global Research",
        analyst: "Chris Hare",
        forecastValue: "2.2% YoY",
        stance: "DOVISH",
        commentary: "Services inflation cooling down faster than expected. Clears runway for BoE Autumn rate cuts.",
        targetPriceImpact: "+0.6% FTSE 100"
      },
      {
        bankName: "UBS Investment Bank",
        analyst: "Anna Titareva",
        forecastValue: "2.4% YoY",
        stance: "NEUTRAL",
        commentary: "Sticky wage growth will keep BoE on a cautious, data-dependent pace.",
        targetPriceImpact: "Flat GBP"
      }
    ],
    tweetExpectations: [
      {
        author: "Faisal Islam (BBC Economics)",
        handle: "@faisalislam",
        authorRole: "Economics Editor",
        tweetText: "UK inflation numbers land at 07:00 London / 08:00 Frankfurt. Crucial test for Governor Bailey's rate-easing timetable.",
        timestamp: "6h ago",
        sentiment: "BULLISH",
        predictedTarget: "BoE cut bets increase",
        likesOrRetweets: "420 Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Cool UK CPI (< 2.2%)",
        condition: "Surprise < -0.2%",
        historicalProbability: 40,
        historicalSampleSize: 11,
        expectedNasdaqMovePct: "+0.40%",
        expectedDaxMovePct: "+0.55%",
        expectedYieldMoveBps: "-6.2 bps Gilt",
        primaryTargetZone: "FTSE Target: +0.8%",
        playbookDescription: "Positive European opening sentiment spills over to DAX and CAC40."
      }
    ]
  },
  {
    id: "EVENT-2026-US-JACKSON-HOLE",
    eventName: "Federal Reserve Jackson Hole Economic Symposium (Keynote Powell)",
    country: "US",
    flagEmoji: "🇺🇸",
    category: "CENTRAL_BANK",
    germanDateTimeCest: "Friday, Aug 21, 2026 • 16:00 CEST",
    usDateTimeEt: "Friday, Aug 21, 2026 • 10:00 ET",
    dateOnly: "2026-08-21",
    timeCest: "16:00 CEST",
    impactLevel: "HIGH",
    consensusForecast: "Dovish Pivot Guidance",
    previousValue: "Restrictive Baseline",
    forecastRange: "Dovish vs Hawkish Pushback",
    unit: "Policy Outlook",
    summaryDescription: "Fed Chair Jerome Powell's annual economic keynote speech setting global central bank monetary policy architecture for 2026-2027.",
    estimatedDirection: "STRONG_BUY",
    estimatedTargetDropOrGain: "Target: +1.8% rally or -2.5% sell-off depending on neutral rate guidance",
    bankExpectations: [
      {
        bankName: "Goldman Sachs",
        analyst: "David Mericle",
        forecastValue: "Dovish Framework",
        stance: "BULLISH",
        commentary: "Powell will emphasize balancing inflation risks with maximum employment mandate. Green light for cuts.",
        targetPriceImpact: "+1.6% S&P 500"
      },
      {
        bankName: "Citigroup",
        analyst: "Andrew Hollenhorst",
        forecastValue: "Hawkish Guardrail",
        stance: "BEARISH",
        commentary: "Powell will warn markets not to price in aggressive 125bp cuts in 2026.",
        targetPriceImpact: "-1.7% Nasdaq drop"
      }
    ],
    tweetExpectations: [
      {
        author: "Steve Liesman (CNBC)",
        handle: "@SteveLiesman",
        authorRole: "Senior Economics Reporter",
        tweetText: "All eyes on Wyoming. Powell's tone at 10am ET / 16:00 CEST will dictate market direction for the remainder of Q3.",
        timestamp: "12h ago",
        sentiment: "NEUTRAL",
        predictedTarget: "Critical macro pivot point",
        likesOrRetweets: "1.9k Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Dovish Speech (Labor focus)",
        condition: "Clear indication of policy recalibration",
        historicalProbability: 60,
        historicalSampleSize: 12,
        expectedNasdaqMovePct: "+1.75%",
        expectedDaxMovePct: "+1.30%",
        expectedYieldMoveBps: "-9.4 bps",
        primaryTargetZone: "Nasdaq Target: +1.8% to 20,200+",
        playbookDescription: "Broad-based risk rally across US and European equity indices."
      },
      {
        outcomeCase: "Hawkish Pushback (Higher for longer warning)",
        condition: "Resistance against rapid easing expectations",
        historicalProbability: 40,
        historicalSampleSize: 8,
        expectedNasdaqMovePct: "-2.10%",
        expectedDaxMovePct: "-1.60%",
        expectedYieldMoveBps: "+11.2 bps",
        primaryTargetZone: "Nasdaq Target: -2.1% to 19,300",
        playbookDescription: "Sharp sell-off in growth assets, high valuation multiples contract."
      }
    ]
  },
  {
    id: "EVENT-2026-NVDA-EARNINGS",
    eventName: "NVIDIA Corporation (NVDA) Q2 FY27 Earnings & AI Guidance",
    country: "US",
    flagEmoji: "🇺🇸",
    category: "TECH_EARNINGS",
    germanDateTimeCest: "Wednesday, Aug 26, 2026 • 22:20 CEST",
    usDateTimeEt: "Wednesday, Aug 26, 2026 • 16:20 ET",
    dateOnly: "2026-08-26",
    timeCest: "22:20 CEST",
    impactLevel: "HIGH",
    consensusForecast: "$0.84 EPS / $33.5B Revenue",
    previousValue: "$0.68 EPS / $26.0B Revenue",
    forecastRange: "$0.80 - $0.92 EPS",
    unit: "$ USD",
    summaryDescription: "The undisputed barometer of global AI hyperscaler capex and semiconductor hardware demand.",
    estimatedDirection: "STRONG_BUY",
    estimatedTargetDropOrGain: "Target: ±7.5% implied earnings move on NVDA stock ($2.8T market cap swing)",
    bankExpectations: [
      {
        bankName: "Bank of America",
        analyst: "Vivek Arya",
        forecastValue: "$34.8B Revenue / $0.88 EPS",
        stance: "BULLISH",
        commentary: "Blackwell chip architectures ramping at full capacity. Hyperscalers (MSFT, META, GOOG) increasing capex commitments.",
        targetPriceImpact: "+8.5% NVDA / +2.2% Nasdaq"
      },
      {
        bankName: "Bernstein",
        analyst: "Stacy Rasgon",
        forecastValue: "$33.8B Revenue",
        stance: "BULLISH",
        commentary: "Supply constraints are the only bottleneck. Datacenter gross margins sustain above 75%.",
        targetPriceImpact: "+5.0% NVDA"
      }
    ],
    tweetExpectations: [
      {
        author: "Dan Ives (Wedbush)",
        handle: "@DivesOfWallSt",
        authorRole: "Tech Analyst",
        tweetText: "NVIDIA earnings is the Godfather of AI tech earnings season. The $1 Trillion AI infrastructure buildout is just entering second inning.",
        timestamp: "1 day ago",
        sentiment: "BULLISH",
        predictedTarget: "Target $160 for NVDA",
        likesOrRetweets: "5.1k Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Massive AI Revenue Beat (Rev > $35.0B)",
        condition: "Guidance +10% above Wall St consensus",
        historicalProbability: 62,
        historicalSampleSize: 10,
        expectedNasdaqMovePct: "+2.40%",
        expectedDaxMovePct: "+1.10%",
        expectedYieldMoveBps: "+1.5 bps",
        primaryTargetZone: "Nasdaq Target: +2.4% / NVDA Target: +9.0%",
        playbookDescription: "Global AI supply chain (ASML, TSMC, ARM, Supermicro) surges in European & Asian trading sessions next day."
      }
    ]
  },
  {
    id: "EVENT-2026-US-NFP",
    eventName: "US Non-Farm Payrolls (NFP) & Unemployment Rate",
    country: "US",
    flagEmoji: "🇺🇸",
    category: "EMPLOYMENT",
    germanDateTimeCest: "Friday, Aug 28, 2026 • 14:30 CEST",
    usDateTimeEt: "Friday, Aug 28, 2026 • 08:30 ET",
    dateOnly: "2026-08-28",
    timeCest: "14:30 CEST",
    impactLevel: "HIGH",
    consensusForecast: "+165k Jobs / 4.2% Unemployment",
    previousValue: "+114k Jobs / 4.3% Unemployment",
    forecastRange: "+120k to +210k",
    unit: "Jobs Count",
    summaryDescription: "Bureau of Labor Statistics monthly employment snapshot. Direct determinant of US economic soft landing vs Sahm-rule recession risk.",
    estimatedDirection: "BUY",
    estimatedTargetDropOrGain: "Target: +1.1% on Nasdaq if 150k-180k Goldilocks zone",
    bankExpectations: [
      {
        bankName: "Wells Fargo",
        analyst: "Jay Bryson",
        forecastValue: "+160k / 4.2%",
        stance: "BULLISH",
        commentary: "Healthy moderation without labor market breakdown. Perfect Goldilocks regime.",
        targetPriceImpact: "+1.0% equities"
      }
    ],
    tweetExpectations: [
      {
        author: "Claudia Sahm (Sahm Consulting)",
        handle: "@Claudia_Sahm",
        authorRole: "Economist / Former Fed",
        tweetText: "Watch the 3-month moving average of unemployment closely. A dip to 4.2% would alleviate recession trigger alarm bells.",
        timestamp: "2 days ago",
        sentiment: "BULLISH",
        predictedTarget: "Recession odds drop to 15%",
        likesOrRetweets: "3.2k Likes"
      }
    ],
    historicalScenarios: [
      {
        outcomeCase: "Goldilocks Employment (+150k to +180k)",
        condition: "Inline with stable wage growth (0.3% MoM)",
        historicalProbability: 50,
        historicalSampleSize: 15,
        expectedNasdaqMovePct: "+1.15%",
        expectedDaxMovePct: "+0.80%",
        expectedYieldMoveBps: "+2.0 bps",
        primaryTargetZone: "Nasdaq Target: +1.2%",
        playbookDescription: "Broad-based risk-on sentiment going into the weekend."
      },
      {
        outcomeCase: "Disaster Print (< +90k or Job Losses)",
        condition: "Surprise < -75k below consensus",
        historicalProbability: 20,
        historicalSampleSize: 6,
        expectedNasdaqMovePct: "-2.30%",
        expectedDaxMovePct: "-1.90%",
        expectedYieldMoveBps: "-18.5 bps",
        primaryTargetZone: "Nasdaq Target: -2.3% / 10Y Yield Plunge",
        playbookDescription: "Emergency rate cut pricing, aggressive flight-to-safety into US Treasuries and Gold."
      }
    ]
  }
];

/**
 * TODAY'S LIVE & RECENTLY RELEASED NEWS / DATA
 * With real Green (Beat / Positive) vs Red (Miss / Negative) indicators and Target Down/Up zones
 */
export const TODAY_RELEASED_NEWS_FEED: TodayReleasedNewsItem[] = [
  {
    id: "NEWS-2026-US-RETAIL",
    headline: "US Retail Sales MoM Smashes Consensus (+1.0% vs +0.3% Exp)",
    country: "US",
    flagEmoji: "🇺🇸",
    releasedTimeCest: "Today • 14:30 CEST",
    category: "MACRO",
    actualValue: "+1.0% MoM",
    consensusValue: "+0.3% MoM",
    previousValue: "-0.2% MoM",
    outcomeType: "BEAT_POSITIVE",
    isMarketPositive: true,
    marketReactionNasdaq: "+1.42% Rally in NQ",
    marketReactionDax: "+0.88% in DAX",
    marketReaction10YYield: "+6.8 bps to 3.92%",
    predictedTargetRange: "Target: +1.2% to +1.8% Uptrend Extension",
    targetDirection: "UP",
    targetMagnitudePct: 1.45,
    keyTakeaway: "Strong consumer spending completely extinguishes immediate US recession fears. Retailers (WMT, AMZN, COST) and tech leading upside.",
    tweetReactions: [
      {
        author: "Mohamed A. El-Erian",
        handle: "@elerianm",
        authorRole: "Chief Economic Adviser",
        tweetText: "A solid US retail sales print (+1.0%) proves the US consumer engine is far from stalled. Soft landing thesis firmly intact.",
        timestamp: "15m ago",
        sentiment: "BULLISH",
        predictedTarget: "S&P 500 pushes towards all-time highs",
        likesOrRetweets: "1.8k Likes"
      }
    ]
  },
  {
    id: "NEWS-2026-US-CLAIMS",
    headline: "US Initial Jobless Claims Fall to 227k (vs 235k Exp) — Labor Resilient",
    country: "US",
    flagEmoji: "🇺🇸",
    releasedTimeCest: "Today • 14:30 CEST",
    category: "MACRO",
    actualValue: "227k",
    consensusValue: "235k",
    previousValue: "234k",
    outcomeType: "BEAT_POSITIVE",
    isMarketPositive: true,
    marketReactionNasdaq: "+0.65% Tech Push",
    marketReactionDax: "+0.45% DAX Boost",
    marketReaction10YYield: "+3.2 bps",
    predictedTargetRange: "Target: +0.7% Continuation",
    targetDirection: "UP",
    targetMagnitudePct: 0.65,
    keyTakeaway: "Initial claims decline for the second straight week, debunking sudden spike in corporate layoff narratives.",
    tweetReactions: [
      {
        author: "Nick Timiraos",
        handle: "@NickTimiraos",
        authorRole: "WSJ Fed Reporter",
        tweetText: "Jobless claims drop to 227,000. No signs of sudden labor market deterioration.",
        timestamp: "25m ago",
        sentiment: "BULLISH",
        predictedTarget: "Fed maintains steady 25bp cut pace",
        likesOrRetweets: "940 Retweets"
      }
    ]
  },
  {
    id: "NEWS-2026-HK-RETAIL",
    headline: "Hong Kong Retail Sales Slumps -9.7% YoY (Miss vs -6.5% Exp)",
    country: "CHINA",
    flagEmoji: "🇭🇰",
    releasedTimeCest: "Today • 10:30 CEST",
    category: "MACRO",
    actualValue: "-9.7% YoY",
    consensusValue: "-6.5% YoY",
    previousValue: "-11.5% YoY",
    outcomeType: "MISS_NEGATIVE",
    isMarketPositive: false,
    marketReactionNasdaq: "-0.25% Luxury & Consumer drag",
    marketReactionDax: "-0.40% European Luxury (LVMH, Kering)",
    marketReaction10YYield: "Unchanged",
    predictedTargetRange: "Target: -1.5% to -2.0% Sell-off on European Luxury & HK Tech",
    targetDirection: "DOWN",
    targetMagnitudePct: -1.65,
    keyTakeaway: "Cross-border mainland spending outflow and weak outbound tourism continue to pressure Hong Kong commercial retailers.",
    tweetReactions: [
      {
        author: "Michael Pettis",
        handle: "@michaelxpettis",
        authorRole: "Professor of Finance, Peking University",
        tweetText: "Weak domestic consumer demand in the region underscores need for direct fiscal household support rather than supply-side debt expansion.",
        timestamp: "3h ago",
        sentiment: "BEARISH",
        predictedTarget: "Hang Seng remains range-bound",
        likesOrRetweets: "610 Likes"
      }
    ]
  },
  {
    id: "NEWS-2026-ECB-SPEECH",
    headline: "ECB President Lagarde Speech Hints at Second Rate Cut in September",
    country: "EUROZONE",
    flagEmoji: "🇪🇺",
    releasedTimeCest: "Today • 11:15 CEST",
    category: "CENTRAL_BANK",
    actualValue: "Dovish Guidance",
    consensusValue: "Neutral",
    previousValue: "Data-dependent",
    outcomeType: "DOVISH_SURPRISE",
    isMarketPositive: true,
    marketReactionNasdaq: "+0.30% Global Spillover",
    marketReactionDax: "+0.72% DAX Surge (18,480)",
    marketReaction10YYield: "-4.1 bps German 10Y Bund",
    predictedTargetRange: "Target: +1.0% DAX 40 / EUR/USD Dips to 1.0920",
    targetDirection: "UP",
    targetMagnitudePct: 0.85,
    keyTakeaway: "Lagarde notes Eurozone wage growth indicators are tracking baseline projections, paving path for 25bp ECB deposit rate cut to 3.50%.",
    tweetReactions: [
      {
        author: "Holger Zschaepitz",
        handle: "@schuldensuehner",
        authorRole: "WELT Financial",
        tweetText: "ECB's Lagarde opens the door for a September rate cut. European sovereign bond yields dropping across the curve. DAX loves it!",
        timestamp: "1h ago",
        sentiment: "BULLISH",
        predictedTarget: "DAX 40 target 18,600",
        likesOrRetweets: "1.1k Likes"
      }
    ]
  },
  {
    id: "NEWS-2026-JAPAN-GDP",
    headline: "Japan Q2 GDP Annualized Surges +3.1% (Massive Beat vs +2.1% Exp)",
    country: "JAPAN",
    flagEmoji: "🇯🇵",
    releasedTimeCest: "Today • 01:50 CEST",
    category: "MACRO",
    actualValue: "+3.1% Annualized",
    consensusValue: "+2.1% Annualized",
    previousValue: "-2.3% (Revised)",
    outcomeType: "BEAT_POSITIVE",
    isMarketPositive: true,
    marketReactionNasdaq: "+0.20% Global growth support",
    marketReactionDax: "+0.35% Exporters",
    marketReaction10YYield: "+5.0 bps JGB 10Y",
    predictedTargetRange: "Target: +1.5% Nikkei / USD/JPY tested 146.80",
    targetDirection: "UP",
    targetMagnitudePct: 1.20,
    keyTakeaway: "Japanese private consumption rebounded for the first time in 5 quarters after historic shunto spring wage increases.",
    tweetReactions: [
      {
        author: "Jesper Koll (Monex Group)",
        handle: "@JesperKoll",
        authorRole: "Global Ambassador",
        tweetText: "Japan GDP beat confirms Japanese domestic corporate animal spirits and wage-price virtuous cycle are real.",
        timestamp: "7h ago",
        sentiment: "BULLISH",
        predictedTarget: "Nikkei 38,000 base firmly established",
        likesOrRetweets: "820 Likes"
      }
    ]
  }
];

/**
 * INVESTING.COM STYLE MULTI-TIMEFRAME TECHNICAL SIGNALS
 * 5m, 15m, 30m, 1h, 5h, 1D directional indicators for Nasdaq 100, S&P 500, DAX 40, etc.
 */
export const INSTRUMENT_TECHNICAL_OVERVIEWS: InstrumentTechnicalOverview[] = [
  {
    symbol: "NQ",
    displayName: "Nasdaq 100 E-mini Futures (NQ)",
    assetClass: "EQUITY_INDEX",
    flagEmoji: "🇺🇸",
    currentPrice: 19842.50,
    priceFormatted: "19,842.50",
    change24hPct: +1.48,
    overallRecommendation: "STRONG_BUY",
    newsSentimentScore: 86,
    newsSentimentLabel: "VERY_BULLISH",
    supportLevel: "19,650.00",
    resistanceLevel: "20,050.00",
    pivotPoint: "19,780.00",
    shortCommentary: "Aggressive algorithmic dip-buying post-Retail Sales. Strong momentum across mega-cap semiconductors (NVDA, AVGO, QCOM).",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "STRONG_BUY",
        rsiValue: 68.4,
        rsiSignal: "BUY",
        macdValue: 24.5,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 88
      },
      "15m": {
        timeframe: "15m",
        signal: "STRONG_BUY",
        rsiValue: 64.2,
        rsiSignal: "BUY",
        macdValue: 38.1,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 82
      },
      "30m": {
        timeframe: "30m",
        signal: "BUY",
        rsiValue: 59.8,
        rsiSignal: "BUY",
        macdValue: 19.4,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 68
      },
      "1h": {
        timeframe: "1h",
        signal: "BUY",
        rsiValue: 56.5,
        rsiSignal: "BUY",
        macdValue: 12.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 62
      },
      "5h": {
        timeframe: "5h",
        signal: "NEUTRAL",
        rsiValue: 51.2,
        rsiSignal: "NEUTRAL",
        macdValue: -4.2,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: 10
      },
      "1D": {
        timeframe: "1D",
        signal: "BUY",
        rsiValue: 58.0,
        rsiSignal: "BUY",
        macdValue: 45.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 70
      }
    }
  },
  {
    symbol: "GER40",
    displayName: "Germany DAX 40 Index (DE40)",
    assetClass: "EQUITY_INDEX",
    flagEmoji: "🇩🇪",
    currentPrice: 18465.20,
    priceFormatted: "18,465.20",
    change24hPct: +0.76,
    overallRecommendation: "BUY",
    newsSentimentScore: 74,
    newsSentimentLabel: "BULLISH",
    supportLevel: "18,320.00",
    resistanceLevel: "18,650.00",
    pivotPoint: "18,410.00",
    shortCommentary: "European session boosted by dovish ECB remarks and German chemical sector rebound. Testing key 18,500 resistance.",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "BUY",
        rsiValue: 61.2,
        rsiSignal: "BUY",
        macdValue: 14.2,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 65
      },
      "15m": {
        timeframe: "15m",
        signal: "STRONG_BUY",
        rsiValue: 66.8,
        rsiSignal: "BUY",
        macdValue: 22.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 78
      },
      "30m": {
        timeframe: "30m",
        signal: "BUY",
        rsiValue: 58.5,
        rsiSignal: "BUY",
        macdValue: 16.5,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 60
      },
      "1h": {
        timeframe: "1h",
        signal: "BUY",
        rsiValue: 54.0,
        rsiSignal: "NEUTRAL",
        macdValue: 8.2,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 55
      },
      "5h": {
        timeframe: "5h",
        signal: "NEUTRAL",
        rsiValue: 49.5,
        rsiSignal: "NEUTRAL",
        macdValue: -2.1,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: 5
      },
      "1D": {
        timeframe: "1D",
        signal: "BUY",
        rsiValue: 56.2,
        rsiSignal: "BUY",
        macdValue: 31.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 64
      }
    }
  },
  {
    symbol: "ES",
    displayName: "S&P 500 E-mini Futures (ES)",
    assetClass: "EQUITY_INDEX",
    flagEmoji: "🇺🇸",
    currentPrice: 5542.75,
    priceFormatted: "5,542.75",
    change24hPct: +1.12,
    overallRecommendation: "STRONG_BUY",
    newsSentimentScore: 82,
    newsSentimentLabel: "VERY_BULLISH",
    supportLevel: "5,490.00",
    resistanceLevel: "5,580.00",
    pivotPoint: "5,520.00",
    shortCommentary: "Broad breadth participation across Financials, Industrials, and Tech. Breadth ratio 4:1 advancing vs declining stocks.",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "STRONG_BUY",
        rsiValue: 65.5,
        rsiSignal: "BUY",
        macdValue: 8.4,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 80
      },
      "15m": {
        timeframe: "15m",
        signal: "STRONG_BUY",
        rsiValue: 63.0,
        rsiSignal: "BUY",
        macdValue: 12.1,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 76
      },
      "30m": {
        timeframe: "30m",
        signal: "BUY",
        rsiValue: 58.2,
        rsiSignal: "BUY",
        macdValue: 7.5,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 65
      },
      "1h": {
        timeframe: "1h",
        signal: "BUY",
        rsiValue: 55.4,
        rsiSignal: "BUY",
        macdValue: 4.8,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 58
      },
      "5h": {
        timeframe: "5h",
        signal: "BUY",
        rsiValue: 53.0,
        rsiSignal: "NEUTRAL",
        macdValue: 2.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 52
      },
      "1D": {
        timeframe: "1D",
        signal: "BUY",
        rsiValue: 59.5,
        rsiSignal: "BUY",
        macdValue: 18.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 68
      }
    }
  },
  {
    symbol: "NVDA",
    displayName: "NVIDIA Corporation (NVDA)",
    assetClass: "TECH_STOCK",
    flagEmoji: "🇺🇸",
    currentPrice: 124.60,
    priceFormatted: "$124.60",
    change24hPct: +3.85,
    overallRecommendation: "STRONG_BUY",
    newsSentimentScore: 92,
    newsSentimentLabel: "VERY_BULLISH",
    supportLevel: "$118.00",
    resistanceLevel: "$130.00",
    pivotPoint: "$122.50",
    shortCommentary: "Leading global market advance. Massive institutional call option buying ahead of Q2 earnings next week.",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "STRONG_BUY",
        rsiValue: 72.5,
        rsiSignal: "BUY",
        macdValue: 1.85,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 92
      },
      "15m": {
        timeframe: "15m",
        signal: "STRONG_BUY",
        rsiValue: 69.1,
        rsiSignal: "BUY",
        macdValue: 2.40,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 88
      },
      "30m": {
        timeframe: "30m",
        signal: "STRONG_BUY",
        rsiValue: 65.0,
        rsiSignal: "BUY",
        macdValue: 2.10,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 84
      },
      "1h": {
        timeframe: "1h",
        signal: "BUY",
        rsiValue: 61.5,
        rsiSignal: "BUY",
        macdValue: 1.50,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 74
      },
      "5h": {
        timeframe: "5h",
        signal: "BUY",
        rsiValue: 56.0,
        rsiSignal: "NEUTRAL",
        macdValue: 0.80,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 60
      },
      "1D": {
        timeframe: "1D",
        signal: "STRONG_BUY",
        rsiValue: 64.0,
        rsiSignal: "BUY",
        macdValue: 3.50,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 82
      }
    }
  },
  {
    symbol: "EURUSD",
    displayName: "Euro / US Dollar (EUR/USD)",
    assetClass: "CURRENCY",
    flagEmoji: "🇪🇺",
    currentPrice: 1.0975,
    priceFormatted: "1.0975",
    change24hPct: -0.32,
    overallRecommendation: "SELL",
    newsSentimentScore: 42,
    newsSentimentLabel: "BEARISH",
    supportLevel: "1.0920",
    resistanceLevel: "1.1040",
    pivotPoint: "1.0990",
    shortCommentary: "US Dollar Index (DXY) rebounded +0.45% following hot Retail Sales, putting pressure on Euro pair.",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "SELL",
        rsiValue: 38.2,
        rsiSignal: "SELL",
        macdValue: -0.0012,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: -65
      },
      "15m": {
        timeframe: "15m",
        signal: "SELL",
        rsiValue: 41.0,
        rsiSignal: "SELL",
        macdValue: -0.0018,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: -58
      },
      "30m": {
        timeframe: "30m",
        signal: "NEUTRAL",
        rsiValue: 46.5,
        rsiSignal: "NEUTRAL",
        macdValue: -0.0008,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: -20
      },
      "1h": {
        timeframe: "1h",
        signal: "NEUTRAL",
        rsiValue: 49.0,
        rsiSignal: "NEUTRAL",
        macdValue: 0.0002,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 0
      },
      "5h": {
        timeframe: "5h",
        signal: "BUY",
        rsiValue: 53.5,
        rsiSignal: "NEUTRAL",
        macdValue: 0.0015,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 40
      },
      "1D": {
        timeframe: "1D",
        signal: "BUY",
        rsiValue: 55.0,
        rsiSignal: "BUY",
        macdValue: 0.0028,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 55
      }
    }
  },
  {
    symbol: "BTCUSD",
    displayName: "Bitcoin / USD (BTC)",
    assetClass: "CRYPTO",
    flagEmoji: "🪙",
    currentPrice: 59420.00,
    priceFormatted: "$59,420",
    change24hPct: +2.35,
    overallRecommendation: "BUY",
    newsSentimentScore: 78,
    newsSentimentLabel: "BULLISH",
    supportLevel: "$57,800",
    resistanceLevel: "$61,500",
    pivotPoint: "$58,900",
    shortCommentary: "Spot ETF inflows turned positive with +$88M net additions. Regained 20-day EMA support.",
    timeframeSignals: {
      "5m": {
        timeframe: "5m",
        signal: "BUY",
        rsiValue: 62.0,
        rsiSignal: "BUY",
        macdValue: 180.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 68
      },
      "15m": {
        timeframe: "15m",
        signal: "BUY",
        rsiValue: 60.5,
        rsiSignal: "BUY",
        macdValue: 240.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 64
      },
      "30m": {
        timeframe: "30m",
        signal: "BUY",
        rsiValue: 58.0,
        rsiSignal: "BUY",
        macdValue: 195.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 59
      },
      "1h": {
        timeframe: "1h",
        signal: "BUY",
        rsiValue: 55.2,
        rsiSignal: "NEUTRAL",
        macdValue: 110.0,
        macdSignal: "BUY",
        ema20AboveEma50: true,
        overallScore: 52
      },
      "5h": {
        timeframe: "5h",
        signal: "NEUTRAL",
        rsiValue: 48.0,
        rsiSignal: "NEUTRAL",
        macdValue: -45.0,
        macdSignal: "SELL",
        ema20AboveEma50: false,
        overallScore: -5
      },
      "1D": {
        timeframe: "1D",
        signal: "NEUTRAL",
        rsiValue: 49.5,
        rsiSignal: "NEUTRAL",
        macdValue: 30.0,
        macdSignal: "BUY",
        ema20AboveEma50: false,
        overallScore: 10
      }
    }
  }
];

/**
 * GLOBAL MARKET SESSIONS & CLOCK OVERVIEW
 * Structured according to German Timeline (CEST)
 */
export const GLOBAL_MARKET_SESSIONS: GlobalMarketSessionInfo[] = [
  {
    exchangeCode: "FRA",
    city: "Frankfurt (XETRA)",
    country: "Germany",
    flagEmoji: "🇩🇪",
    marketName: "Frankfurt Stock Exchange (DAX)",
    openCest: "09:00 CEST",
    closeCest: "17:30 CEST",
    openLocal: "09:00 CEST",
    closeLocal: "17:30 CEST",
    localTimezone: "Europe/Berlin",
    status: "OPEN",
    timeUntilNextEvent: "Closes in 1h 45m",
    volumeProfile: "PEAK_LIQUIDITY",
    keyBenchmark: "DAX 40",
    keyBenchmarkChange: "+0.76%"
  },
  {
    exchangeCode: "LSE",
    city: "London",
    country: "United Kingdom",
    flagEmoji: "🇬🇧",
    marketName: "London Stock Exchange (FTSE)",
    openCest: "09:00 CEST",
    closeCest: "17:30 CEST",
    openLocal: "08:00 BST",
    closeLocal: "16:30 BST",
    localTimezone: "Europe/London",
    status: "OPEN",
    timeUntilNextEvent: "Closes in 1h 45m",
    volumeProfile: "PEAK_LIQUIDITY",
    keyBenchmark: "FTSE 100",
    keyBenchmarkChange: "+0.62%"
  },
  {
    exchangeCode: "NYSE",
    city: "New York",
    country: "United States",
    flagEmoji: "🇺🇸",
    marketName: "NYSE & NASDAQ",
    openCest: "15:30 CEST",
    closeCest: "22:00 CEST",
    openLocal: "09:30 EDT",
    closeLocal: "16:00 EDT",
    localTimezone: "America/New_York",
    status: "OPEN",
    timeUntilNextEvent: "Closes in 6h 15m",
    volumeProfile: "PEAK_LIQUIDITY",
    keyBenchmark: "Nasdaq 100",
    keyBenchmarkChange: "+1.48%"
  },
  {
    exchangeCode: "TSE",
    city: "Tokyo",
    country: "Japan",
    flagEmoji: "🇯🇵",
    marketName: "Tokyo Stock Exchange (Nikkei)",
    openCest: "02:00 CEST",
    closeCest: "08:30 CEST",
    openLocal: "09:00 JST",
    closeLocal: "15:30 JST",
    localTimezone: "Asia/Tokyo",
    status: "CLOSED",
    timeUntilNextEvent: "Opens tomorrow at 02:00 CEST",
    volumeProfile: "CLOSED",
    keyBenchmark: "Nikkei 225",
    keyBenchmarkChange: "+0.78% (Closed)"
  },
  {
    exchangeCode: "HKEX",
    city: "Hong Kong",
    country: "Hong Kong",
    flagEmoji: "🇭🇰",
    marketName: "Hong Kong Stock Exchange (Hang Seng)",
    openCest: "03:30 CEST",
    closeCest: "10:00 CEST",
    openLocal: "09:30 HKT",
    closeLocal: "16:00 HKT",
    localTimezone: "Asia/Hong_Kong",
    status: "CLOSED",
    timeUntilNextEvent: "Opens tomorrow at 03:30 CEST",
    volumeProfile: "CLOSED",
    keyBenchmark: "Hang Seng Index",
    keyBenchmarkChange: "-0.42% (Closed)"
  },
  {
    exchangeCode: "ASX",
    city: "Sydney",
    country: "Australia",
    flagEmoji: "🇦🇺",
    marketName: "Australian Securities Exchange",
    openCest: "01:00 CEST",
    closeCest: "07:00 CEST",
    openLocal: "10:00 AEST",
    closeLocal: "16:00 AEST",
    localTimezone: "Australia/Sydney",
    status: "CLOSED",
    timeUntilNextEvent: "Opens tomorrow at 01:00 CEST",
    volumeProfile: "CLOSED",
    keyBenchmark: "ASX 200",
    keyBenchmarkChange: "+0.31% (Closed)"
  }
];

/**
 * SIMULATED LEGISLATIVE & COMMITTEE JURISDICTION TRADING STUDY (EDUCATIONAL MODEL)
 * Synthetic demonstration records illustrating policy transmission & committee calendar overlaps.
 * All entries are synthetic educational models and do NOT represent real individual transactions.
 */
export const POLITICIAN_TRADING_LEDGER: PoliticianTradeRecord[] = [
  {
    id: "SIM-TRADE-01-NVDA",
    politicianName: "Rep. Alex Vance (Illustrative Persona)",
    party: "DEMOCRAT",
    chamber: "HOUSE",
    state: "CA-12",
    committeeAssignments: ["Energy & Commerce", "Technology & Innovation"],
    ticker: "NVDA",
    companyName: "NVIDIA Corporation",
    transactionType: "OPTION_CALL",
    amountRange: "$1,000,000 - $5,000,000",
    estimatedAmountValue: 2500000,
    transactionDate: "2026-07-28",
    disclosureFilingDate: "2026-08-04",
    filingDelayDays: 7,
    tradeRationaleContext: "Hypothetical case study: Long option structure analyzed against public Department of Energy computing initiative announcements and policy review windows.",
    subsequentPricePerformance: "+14.2% in simulation window",
    insiderRiskRating: "HIGH_COMMITTEE_OVERLAP"
  },
  {
    id: "SIM-TRADE-02-MSFT",
    politicianName: "Rep. Marcus Hayes (Illustrative Persona)",
    party: "REPUBLICAN",
    chamber: "HOUSE",
    state: "TX-08",
    committeeAssignments: ["Foreign Affairs", "Homeland Security"],
    ticker: "MSFT",
    companyName: "Microsoft Corporation",
    transactionType: "PURCHASE",
    amountRange: "$250,000 - $500,000",
    estimatedAmountValue: 350000,
    transactionDate: "2026-07-30",
    disclosureFilingDate: "2026-08-11",
    filingDelayDays: 12,
    tradeRationaleContext: "Hypothetical case study: Equity accumulation modeled around multilateral cybersecurity framework agreements and defense cloud infrastructure announcements.",
    subsequentPricePerformance: "+6.8% in simulation window",
    insiderRiskRating: "HIGH_COMMITTEE_OVERLAP"
  },
  {
    id: "SIM-TRADE-03-LMT",
    politicianName: "Sen. Robert Sterling (Illustrative Persona)",
    party: "REPUBLICAN",
    chamber: "SENATE",
    state: "AL",
    committeeAssignments: ["Senate Armed Services", "Appropriations"],
    ticker: "LMT",
    companyName: "Lockheed Martin Corp",
    transactionType: "PURCHASE",
    amountRange: "$100,000 - $250,000",
    estimatedAmountValue: 175000,
    transactionDate: "2026-08-02",
    disclosureFilingDate: "2026-08-14",
    filingDelayDays: 12,
    tradeRationaleContext: "Hypothetical case study: Aerospace allocation modeled against national defense authorization act procurement timeline disclosures.",
    subsequentPricePerformance: "+5.1% in simulation window",
    insiderRiskRating: "HIGH_COMMITTEE_OVERLAP"
  },
  {
    id: "SIM-TRADE-04-PLTR",
    politicianName: "Rep. Eleanor Davies (Illustrative Persona)",
    party: "DEMOCRAT",
    chamber: "HOUSE",
    state: "NY-05",
    committeeAssignments: ["Oversight & Government Reform", "Homeland Security"],
    ticker: "PLTR",
    companyName: "Palantir Technologies",
    transactionType: "PURCHASE",
    amountRange: "$150,000 - $350,000",
    estimatedAmountValue: 220000,
    transactionDate: "2026-08-05",
    disclosureFilingDate: "2026-08-15",
    filingDelayDays: 10,
    tradeRationaleContext: "Hypothetical case study: Data analytics allocation evaluated following public enterprise defense software program awards.",
    subsequentPricePerformance: "+11.4% in simulation window",
    insiderRiskRating: "HIGH_COMMITTEE_OVERLAP"
  },
  {
    id: "SIM-TRADE-05-AAPL",
    politicianName: "Rep. Thomas Bennett (Illustrative Persona)",
    party: "REPUBLICAN",
    chamber: "HOUSE",
    state: "TN-04",
    committeeAssignments: ["Judiciary Subcomm. on Antitrust", "Commerce"],
    ticker: "AAPL",
    companyName: "Apple Inc.",
    transactionType: "SALE",
    amountRange: "$500,000 - $1,000,000",
    estimatedAmountValue: 750000,
    transactionDate: "2026-08-01",
    disclosureFilingDate: "2026-08-12",
    filingDelayDays: 11,
    tradeRationaleContext: "Hypothetical case study: Consumer tech divestment modeled ahead of scheduled public regulatory hearings regarding digital marketplace frameworks.",
    subsequentPricePerformance: "-1.8% in simulation window",
    insiderRiskRating: "MODERATE"
  },
  {
    id: "SIM-TRADE-06-ASML",
    politicianName: "Rep. Sarah Chen (Illustrative Persona)",
    party: "DEMOCRAT",
    chamber: "HOUSE",
    state: "CA-17",
    committeeAssignments: ["Armed Services", "Strategic Technology Committee"],
    ticker: "ASML",
    companyName: "ASML Holding NV",
    transactionType: "PURCHASE",
    amountRange: "$50,000 - $100,000",
    estimatedAmountValue: 75000,
    transactionDate: "2026-08-08",
    disclosureFilingDate: "2026-08-16",
    filingDelayDays: 8,
    tradeRationaleContext: "Hypothetical case study: Semiconductor equipment position modeled in relation to international lithography export licensing updates.",
    subsequentPricePerformance: "+4.3% in simulation window",
    insiderRiskRating: "HIGH_COMMITTEE_OVERLAP"
  }
];

/**
 * MAJOR CORPORATE BIG DEALS, PARTNERSHIPS & CONTRACTS
 */
export const CORPORATE_BIG_DEALS_FEED: CorporateBigDealItem[] = [
  {
    id: "DEAL-PLTR-DOD",
    companyName: "Palantir Technologies",
    ticker: "PLTR",
    dealTitle: "U.S. Department of Defense Awards $480M Maven Smart System AI Contract",
    dealType: "DEFENSE_CONTRACT",
    dealValueBillions: "$0.48B",
    announcementDate: "1 day ago",
    counterpartyOrAgency: "US Army / Joint Staff",
    expectedPriceImpact: "+7.2% stock surge",
    summary: "Production agreement to expand computer vision AI workflows across military commands and target recognition suites."
  },
  {
    id: "DEAL-MSFT-BLACKROCK",
    companyName: "Microsoft & BlackRock",
    ticker: "MSFT",
    dealTitle: "$30 Billion Global AI Infrastructure Investment Partnership (GAIIP)",
    dealType: "AI_INFRASTRUCTURE",
    dealValueBillions: "$30.0B",
    announcementDate: "2 days ago",
    counterpartyOrAgency: "BlackRock, Global Infrastructure Partners, MGX",
    expectedPriceImpact: "+3.5% sustained tailwind",
    summary: "Multi-decade funding for next-generation gigawatt datacenter buildouts, nuclear clean power, and high-speed energy grids in the US and Europe."
  },
  {
    id: "DEAL-SAP-AWS",
    companyName: "SAP SE",
    ticker: "SAP",
    dealTitle: "SAP Expands Generative AI Collaboration with AWS Bedrock Enterprise Cloud",
    dealType: "STRATEGIC_PARTNERSHIP",
    dealValueBillions: "$1.8B",
    announcementDate: "Today",
    counterpartyOrAgency: "Amazon Web Services (AWS)",
    expectedPriceImpact: "+2.1% DAX component lift",
    summary: "Integrates Bedrock LLMs directly into SAP S/4HANA Cloud for global ERP enterprise automation and supply chain optimization."
  }
];

/**
 * SEARCHABLE STOCK / ASSET DATABASE FOR DEEP DIVE
 */
export interface SearchableAssetItem {
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  flagEmoji: string;
  sector: string;
  price: number;
  changePct: number;
  overallSignal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  analystConsensus: string;
  targetPriceAvg: number;
  politicianActivity: string;
  latestHeadline: string;
  sentimentScore: number;
}

export const SEARCHABLE_ASSETS_DATABASE: SearchableAssetItem[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Semiconductors & AI Hardware",
    price: 124.60,
    changePct: +3.85,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (38 Buys / 3 Holds / 0 Sells)",
    targetPriceAvg: 152.00,
    politicianActivity: "Rep. Alex Vance (Illustrative Persona) exercised $2.5M in call options (Bullish)",
    latestHeadline: "Hyperscalers increase Blackwell AI chip cluster purchase orders by 30%",
    sentimentScore: 94
  },
  {
    ticker: "NQ",
    name: "Nasdaq 100 Futures",
    exchange: "CME",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Index Futures",
    price: 19842.50,
    changePct: +1.48,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Bullish Momentum",
    targetPriceAvg: 20500.00,
    politicianActivity: "Net Tech Buying across House Representatives",
    latestHeadline: "Hot Retail Sales extinguishes recession fears; rally expands",
    sentimentScore: 86
  },
  {
    ticker: "DAX",
    name: "DAX 40 Index (Germany)",
    exchange: "XETRA",
    country: "Germany",
    flagEmoji: "🇩🇪",
    sector: "Index (Equities)",
    price: 18465.20,
    changePct: +0.76,
    overallSignal: "BUY",
    analystConsensus: "Moderate Buy (Target 19,000)",
    targetPriceAvg: 19100.00,
    politicianActivity: "Bundstag energy subsidy approval support",
    latestHeadline: "ECB Lagarde dovish comments boost Frankfurt industrial components",
    sentimentScore: 74
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Consumer Electronics & Services",
    price: 221.80,
    changePct: +1.20,
    overallSignal: "BUY",
    analystConsensus: "Buy (32 Buys / 9 Holds / 2 Sells)",
    targetPriceAvg: 245.00,
    politicianActivity: "Rep. Thomas Bennett (Illustrative Persona) sold $750k position",
    latestHeadline: "Apple Intelligence beta rollout drives iPhone 16 upgrade supercycle demand",
    sentimentScore: 79
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Software & Cloud Services",
    price: 428.50,
    changePct: +1.65,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (42 Buys / 2 Holds)",
    targetPriceAvg: 495.00,
    politicianActivity: "Rep. Marcus Hayes (Illustrative Persona) purchased $350k shares",
    latestHeadline: "Azure AI growth accelerates to +33% YoY on enterprise Copilot adoption",
    sentimentScore: 88
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies",
    exchange: "NYSE",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Enterprise AI & Defense Software",
    price: 32.40,
    changePct: +4.80,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Buy / Momentum Target",
    targetPriceAvg: 38.00,
    politicianActivity: "Rep. Eleanor Davies (Illustrative Persona) bought $220k; Rep. Sarah Chen net buyer",
    latestHeadline: "Secures $480M DoD AI contract and commercial customer count up 83%",
    sentimentScore: 92
  },
  {
    ticker: "SAP",
    name: "SAP SE (Germany)",
    exchange: "XETRA",
    country: "Germany",
    flagEmoji: "🇩🇪",
    sector: "Enterprise Software (ERP)",
    price: 196.80,
    changePct: +2.10,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (Target €220)",
    targetPriceAvg: 220.00,
    politicianActivity: "European sovereign tech independence favorite",
    latestHeadline: "AWS partnership for enterprise generative AI deepens cloud migration",
    sentimentScore: 84
  },
  {
    ticker: "ASML",
    name: "ASML Holding NV",
    exchange: "NASDAQ / Euronext",
    country: "Netherlands",
    flagEmoji: "🇳🇱",
    sector: "Semiconductor Equipment",
    price: 864.00,
    changePct: +2.90,
    overallSignal: "BUY",
    analystConsensus: "Strong Buy (Target $1,050)",
    targetPriceAvg: 1050.00,
    politicianActivity: "Rep. Sarah Chen (Illustrative Persona) bought $75k shares",
    latestHeadline: "Next-gen High-NA EUV machines shipment pipeline accelerates for 2027",
    sentimentScore: 85
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "EVs & Autonomous AI / Robotics",
    price: 218.40,
    changePct: +3.20,
    overallSignal: "BUY",
    analystConsensus: "Hold / High Volatility (Target $250)",
    targetPriceAvg: 250.00,
    politicianActivity: "Mixed Congressional disclosures",
    latestHeadline: "Robotaxi unveiling event date confirmed; FSD v13 training compute online",
    sentimentScore: 76
  },
  {
    ticker: "GOLD",
    name: "Gold Spot (XAU/USD)",
    exchange: "COMEX / Global Spot",
    country: "GLOBAL",
    flagEmoji: "🟡",
    sector: "Precious Metals & Reserve Asset",
    price: 2498.40,
    changePct: +0.85,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (Target $2,580)",
    targetPriceAvg: 2580.00,
    politicianActivity: "Central banks & sovereign wealth fund net accumulation",
    latestHeadline: "Global central banks accelerate physical bullion purchases as real yields drop",
    sentimentScore: 91
  },
  {
    ticker: "SILVER",
    name: "Silver Spot (XAG/USD)",
    exchange: "COMEX / Global Spot",
    country: "GLOBAL",
    flagEmoji: "⚪",
    sector: "Precious Metals & Industrial Photovoltaics",
    price: 29.85,
    changePct: +1.95,
    overallSignal: "BUY",
    analystConsensus: "Strong Buy (Target $34.00)",
    targetPriceAvg: 34.00,
    politicianActivity: "Clean Energy Act solar panel industrial demand tailwinds",
    latestHeadline: "Solar photovoltaic manufacturing and AI server interconnects drive physical silver deficit",
    sentimentScore: 87
  },
  {
    ticker: "SPX",
    name: "S&P 500 Index (ES Futures)",
    exchange: "CME / CBOE",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Benchmark Broad Market Index",
    price: 5584.20,
    changePct: +0.92,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Bullish (Target 5,750)",
    targetPriceAvg: 5750.00,
    politicianActivity: "Broad bipartisan index ETF holding base across Senate & House",
    latestHeadline: "Broad market participation widens beyond Mega-Caps post-Retail Sales beat",
    sentimentScore: 84
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Semiconductors & AI Accelerators",
    price: 154.30,
    changePct: +2.80,
    overallSignal: "BUY",
    analystConsensus: "Buy (34 Buys / 7 Holds)",
    targetPriceAvg: 185.00,
    politicianActivity: "Ro Khanna and House Commerce members disclosed purchase positions",
    latestHeadline: "MI350X AI accelerators win major Tier-2 cloud deployment purchase orders",
    sentimentScore: 83
  },
  {
    ticker: "LMT",
    name: "Lockheed Martin Corp",
    exchange: "NYSE",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Defense & Aerospace",
    price: 546.20,
    changePct: +1.45,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (Target $580)",
    targetPriceAvg: 580.00,
    politicianActivity: "Tommy Tuberville purchased $175k during NDAA committee sessions",
    latestHeadline: "US Senate advances $850B Defense Supplemental with major F-35 and missile funding",
    sentimentScore: 89
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. (Google)",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "Search, Cloud & Gemini AI Ecosystem",
    price: 168.90,
    changePct: +1.35,
    overallSignal: "BUY",
    analystConsensus: "Buy (39 Buys / 5 Holds)",
    targetPriceAvg: 200.00,
    politicianActivity: "Subcommittee on Antitrust filings monitored",
    latestHeadline: "Google Cloud Gemini AI API enterprise revenue surges +29% YoY",
    sentimentScore: 82
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    country: "US",
    flagEmoji: "🇺🇸",
    sector: "E-Commerce & AWS Cloud",
    price: 182.40,
    changePct: +1.75,
    overallSignal: "STRONG_BUY",
    analystConsensus: "Strong Buy (45 Buys / 1 Hold)",
    targetPriceAvg: 220.00,
    politicianActivity: "House Judiciary disclosures recorded",
    latestHeadline: "AWS Bedrock enterprise custom AI compute bookings jump to multi-billion run-rate",
    sentimentScore: 88
  }
];
