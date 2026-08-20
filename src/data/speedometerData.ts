import { SpeedometerData, TimeframeId } from "../types/marketIntelligenceTypes";

export interface AssetSpeedometerPackage {
  symbol: string;
  name: string;
  assetClass: string;
  flagEmoji: string;
  currentPrice: string;
  change24h: string;
  marketHoursStatus?: string;
  fundamentalDriverSummary?: string;
  timeframes: Record<TimeframeId, SpeedometerData>;
}

export const SPEEDOMETER_DATA_STORE: Record<string, AssetSpeedometerPackage> = {
  SILVER: {
    symbol: "XAGUSD",
    name: "Silver Spot / US Dollar (COMEX & London Fix)",
    assetClass: "COMMODITY",
    flagEmoji: "⚪",
    currentPrice: "29.85",
    change24h: "+1.95%",
    marketHoursStatus: "Active Global Trading (Hong Kong Open & London Fix Momentum)",
    fundamentalDriverSummary: "Solar photovoltaic industrial demand deficit, London LBMA physical vault drain, and Asian trading session accumulation ahead of US inflation prints.",
    timeframes: {
      "1m": {
        timeframe: "1m",
        label: "1 Min",
        summaryDirection: "BUY",
        summaryScore: 48,
        fundamentalContext: "Micro-liquidity orderbook imbalance. High-frequency arbitrage desks capturing spread between Shanghai Gold Exchange (SGE) silver premium (+3.2%) and London spot.",
        newsCatalystDriver: "Early Asian session flow: Hong Kong & Singapore bullion desks executing automated institutional basket buy orders.",
        mathReasoning: "Short-term VWAP deviation +1.2 standard deviations with positive buy-volume delta (+64%).",
        technicalIndicators: {
          buyCount: 6,
          neutralCount: 2,
          sellCount: 2,
          score: 45,
          direction: "BUY",
          details: [
            { name: "RSI (14)", value: "58.4", action: "BUY" },
            { name: "STOCH (9,6)", value: "62.1", action: "BUY" },
            { name: "MACD (12,26)", value: "+0.04", action: "BUY" },
            { name: "ADX (14)", value: "24.5", action: "NEUTRAL" },
            { name: "CCI (14)", value: "+74.0", action: "BUY" },
            { name: "ATR (14)", value: "0.08", action: "NEUTRAL" }
          ]
        },
        movingAverages: {
          buyCount: 8,
          neutralCount: 0,
          sellCount: 4,
          score: 52,
          direction: "BUY",
          details: [
            { period: "MA5", simpleValue: "29.82", simpleAction: "BUY", exponentialValue: "29.83", exponentialAction: "BUY" },
            { period: "MA10", simpleValue: "29.79", simpleAction: "BUY", exponentialValue: "29.80", exponentialAction: "BUY" },
            { period: "MA20", simpleValue: "29.74", simpleAction: "BUY", exponentialValue: "29.76", exponentialAction: "BUY" },
            { period: "MA50", simpleValue: "29.68", simpleAction: "BUY", exponentialValue: "29.71", exponentialAction: "BUY" }
          ]
        },
        pivotPoints: {
          classic: { s3: "29.20", s2: "29.45", s1: "29.65", p: "29.80", r1: "30.05", r2: "30.30", r3: "30.65" },
          fibonacci: { s3: "29.30", s2: "29.50", s1: "29.68", p: "29.80", r1: "29.98", r2: "30.18", r3: "30.50" }
        },
        plainEnglishAdvice: "1-Minute Intraday Scalp: Modest buying pressure observed as Asian trading session opens. Short-term momentum favors upside testing toward $30.00.",
        volatilityActionPlan: {
          supportBarrier: "29.40",
          resistanceBarrier: "30.25",
          targetZone1: "30.05",
          targetZone2: "30.35",
          volatilityRange: "±0.85%"
        }
      },
      "5m": {
        timeframe: "5m",
        label: "5 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 76,
        fundamentalContext: "Hong Kong session cash physical buyers absorbing wholesale lots. Half-hour post-open momentum surge driven by Asian jewelry and industrial electronics demand.",
        newsCatalystDriver: "Silver Institute Bulletin: Global silver deficit expands for 4th consecutive year due to TOPCon solar cell transition requiring 30% more silver paste per watt.",
        mathReasoning: "Exponential Moving Average EMA-9 crossing decisively above EMA-21 on 2.4x volume expansion.",
        technicalIndicators: {
          buyCount: 8,
          neutralCount: 1,
          sellCount: 1,
          score: 74,
          direction: "STRONG_BUY",
          details: [
            { name: "RSI (14)", value: "64.2", action: "BUY" },
            { name: "STOCH (9,6)", value: "71.0", action: "BUY" },
            { name: "MACD (12,26)", value: "+0.11", action: "BUY" },
            { name: "Bull/Bear Power", value: "+0.18", action: "BUY" }
          ]
        },
        movingAverages: {
          buyCount: 10,
          neutralCount: 0,
          sellCount: 2,
          score: 80,
          direction: "STRONG_BUY",
          details: [
            { period: "MA10", simpleValue: "29.75", simpleAction: "BUY", exponentialValue: "29.78", exponentialAction: "BUY" },
            { period: "MA50", simpleValue: "29.60", simpleAction: "BUY", exponentialValue: "29.65", exponentialAction: "BUY" }
          ]
        },
        pivotPoints: {
          classic: { s3: "29.20", s2: "29.45", s1: "29.65", p: "29.80", r1: "30.05", r2: "30.30", r3: "30.65" },
          fibonacci: { s3: "29.30", s2: "29.50", s1: "29.68", p: "29.80", r1: "29.98", r2: "30.18", r3: "30.50" }
        },
        plainEnglishAdvice: "5-Minute Horizon: Strong buy momentum emerging from Asian session opening flows. Statistical edge favors retesting $30.10 resistance.",
        volatilityActionPlan: {
          supportBarrier: "29.35",
          resistanceBarrier: "30.40",
          targetZone1: "30.15",
          targetZone2: "30.50",
          volatilityRange: "±1.20%"
        }
      },
      "15m": {
        timeframe: "15m",
        label: "15 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 82,
        fundamentalContext: "Institutional cross-market liquidity. Gold/Silver ratio compressing from 84 down toward 81 as high-beta silver outperforms gold during precious metals rallies.",
        newsCatalystDriver: "US Dollar Index (DXY) softening -0.3% following dovish Fed remarks; commodity basket experiencing broad capital inflows.",
        mathReasoning: "Bollinger Band upper breakout with bandwidth expanding +45%, signaling directional trend impulse rather than noise.",
        technicalIndicators: {
          buyCount: 9,
          neutralCount: 1,
          sellCount: 0,
          score: 82,
          direction: "STRONG_BUY",
          details: [
            { name: "RSI (14)", value: "66.8", action: "BUY" },
            { name: "MACD (12,26)", value: "+0.18", action: "BUY" },
            { name: "Williams %R", value: "-18.0", action: "BUY" },
            { name: "CCI (14)", value: "+115.0", action: "BUY" }
          ]
        },
        movingAverages: {
          buyCount: 11,
          neutralCount: 0,
          sellCount: 1,
          score: 86,
          direction: "STRONG_BUY",
          details: [
            { period: "MA20", simpleValue: "29.62", simpleAction: "BUY", exponentialValue: "29.68", exponentialAction: "BUY" },
            { period: "MA100", simpleValue: "29.35", simpleAction: "BUY", exponentialValue: "29.42", exponentialAction: "BUY" }
          ]
        },
        pivotPoints: {
          classic: { s3: "29.10", s2: "29.40", s1: "29.65", p: "29.80", r1: "30.15", r2: "30.45", r3: "30.85" },
          fibonacci: { s3: "29.25", s2: "29.48", s1: "29.66", p: "29.80", r1: "30.04", r2: "30.22", r3: "30.60" }
        },
        plainEnglishAdvice: "15-Minute Horizon: Robust trend continuation supported by Gold/Silver ratio compression and dollar weakness. Pullbacks to $29.65 represent key dynamic support.",
        volatilityActionPlan: {
          supportBarrier: "29.25",
          resistanceBarrier: "30.60",
          targetZone1: "30.25",
          targetZone2: "30.70",
          volatilityRange: "±1.65%"
        }
      },
      "30m": {
        timeframe: "30m",
        label: "30 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 84,
        fundamentalContext: "London pre-market orders joining Asian physical accumulators. COMEX registered inventories hovering near multi-year lows (under 42M oz).",
        newsCatalystDriver: "European Green Deal supply chain targets: Industrial silver demand for electric vehicle power electronics up +18% YoY.",
        mathReasoning: "Keltner Channel mid-line acting as ascending floor; ADX at 32 indicating strong confirmed trend strength.",
        technicalIndicators: {
          buyCount: 9,
          neutralCount: 1,
          sellCount: 0,
          score: 84,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 11,
          neutralCount: 0,
          sellCount: 1,
          score: 86,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "29.00", s2: "29.35", s1: "29.60", p: "29.80", r1: "30.20", r2: "30.55", r3: "31.00" },
          fibonacci: { s3: "29.15", s2: "29.42", s1: "29.62", p: "29.80", r1: "30.08", r2: "30.32", r3: "30.75" }
        },
        plainEnglishAdvice: "30-Minute Horizon: High-conviction bullish bias ahead of European market open. Multi-session highs within reach.",
        volatilityActionPlan: {
          supportBarrier: "29.10",
          resistanceBarrier: "30.80",
          targetZone1: "30.40",
          targetZone2: "30.90",
          volatilityRange: "±2.10%"
        }
      },
      "1h": {
        timeframe: "1h",
        label: "Hourly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 88,
        fundamentalContext: "London Bullion Market Association (LBMA) vault data confirms physical outflows to Asian manufacturing centers. Real 10-year Treasury yields declining to 1.82%, boosting non-yielding precious metals.",
        newsCatalystDriver: "Macro interest rate expectations: Global central banks pivoting toward coordinated rate cuts, historically a major catalyst for 20-30% silver upside cycles.",
        mathReasoning: "Ichimoku Cloud Tenkan-Sen crossing above Kijun-Sen above Kumo cloud with positive Chikou Span confirmation.",
        technicalIndicators: {
          buyCount: 10,
          neutralCount: 1,
          sellCount: 0,
          score: 88,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 12,
          neutralCount: 0,
          sellCount: 0,
          score: 92,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "28.80", s2: "29.20", s1: "29.55", p: "29.80", r1: "30.30", r2: "30.75", r3: "31.25" },
          fibonacci: { s3: "29.00", s2: "29.32", s1: "29.58", p: "29.80", r1: "30.12", r2: "30.42", r3: "30.90" }
        },
        plainEnglishAdvice: "Hourly Horizon: One of the strongest macro setups of the session. Clear pathway toward $30.50 resistance target.",
        volatilityActionPlan: {
          supportBarrier: "28.90",
          resistanceBarrier: "31.20",
          targetZone1: "30.50",
          targetZone2: "31.00",
          volatilityRange: "±2.50%"
        }
      },
      "5h": {
        timeframe: "5h",
        label: "5 Hours",
        summaryDirection: "STRONG_BUY",
        summaryScore: 90,
        fundamentalContext: "Multi-session accumulation by institutional commodity hedge funds. Silver supply inelasticity (75% of silver mined as byproduct of copper/zinc/lead) preventing rapid supply response.",
        newsCatalystDriver: "Mining production reports from Mexico and Peru show flat output despite surging clean tech and AI server component demand.",
        mathReasoning: "SuperTrend indicator bullish green since $28.60; ATR trailing stop established at $29.10.",
        technicalIndicators: {
          buyCount: 10,
          neutralCount: 1,
          sellCount: 0,
          score: 90,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 12,
          neutralCount: 0,
          sellCount: 0,
          score: 94,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "28.50", s2: "29.00", s1: "29.45", p: "29.80", r1: "30.45", r2: "31.00", r3: "31.60" },
          fibonacci: { s3: "28.75", s2: "29.18", s1: "29.50", p: "29.80", r1: "30.22", r2: "30.60", r3: "31.20" }
        },
        plainEnglishAdvice: "5-Hour Horizon: Sustained multi-session institutional trend. Backtesting shows 84% historical win probability for trend-following strategies during similar supply deficit regimes.",
        volatilityActionPlan: {
          supportBarrier: "28.60",
          resistanceBarrier: "31.80",
          targetZone1: "30.80",
          targetZone2: "31.50",
          volatilityRange: "±3.20%"
        }
      },
      "1D": {
        timeframe: "1D",
        label: "Daily",
        summaryDirection: "STRONG_BUY",
        summaryScore: 94,
        fundamentalContext: "Structural annual supply deficit of over 200 million ounces. Industrial applications now comprise 60% of total silver demand, decoupling silver from purely monetary speculation.",
        newsCatalystDriver: "Major investment bank commodity desks raise 12-month silver target to $34.00 - $38.00/oz based on solar panel buildout and EV electronics adoption.",
        mathReasoning: "Golden Cross (50-day SMA crossing above 200-day SMA) confirmed 3 weeks ago; historical 3-month forward returns average +18.4%.",
        technicalIndicators: {
          buyCount: 11,
          neutralCount: 0,
          sellCount: 0,
          score: 95,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 12,
          neutralCount: 0,
          sellCount: 0,
          score: 96,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "27.80", s2: "28.60", s1: "29.25", p: "29.80", r1: "30.80", r2: "31.70", r3: "32.80" },
          fibonacci: { s3: "28.20", s2: "28.85", s1: "29.35", p: "29.80", r1: "30.45", r2: "31.10", r3: "32.10" }
        },
        plainEnglishAdvice: "Daily Chart: Multi-year technical breakout above $29.00 consolidation ceiling. Primary long-term target stands at $34.00.",
        volatilityActionPlan: {
          supportBarrier: "27.50",
          resistanceBarrier: "33.50",
          targetZone1: "31.50",
          targetZone2: "34.00",
          volatilityRange: "±4.80%"
        }
      },
      "1W": {
        timeframe: "1W",
        label: "Weekly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Decade-long cup-and-handle technical base completing on the weekly chart. Physical tightness in London and Swiss refiners.",
        newsCatalystDriver: "Global electrification and AI datacenters require substantial silver-plated copper busbars and high-conductivity thermal interfaces.",
        mathReasoning: "Weekly MACD histogram widening positively for 6 consecutive weeks; RSI at 68 with no bearish divergence.",
        technicalIndicators: {
          buyCount: 10,
          neutralCount: 1,
          sellCount: 0,
          score: 92,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 12,
          neutralCount: 0,
          sellCount: 0,
          score: 96,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "26.00", s2: "27.50", s1: "28.70", p: "29.80", r1: "31.50", r2: "33.20", r3: "35.50" },
          fibonacci: { s3: "26.80", s2: "27.95", s1: "28.90", p: "29.80", r1: "30.95", r2: "32.10", r3: "34.20" }
        },
        plainEnglishAdvice: "Weekly Chart: Multi-year supercycle confirmation. Structural deficit backdrop offers asymmetric upside profile.",
        volatilityActionPlan: {
          supportBarrier: "26.50",
          resistanceBarrier: "35.00",
          targetZone1: "32.50",
          targetZone2: "35.00",
          volatilityRange: "±6.50%"
        }
      },
      "1M": {
        timeframe: "1M",
        label: "Monthly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 90,
        fundamentalContext: "Global monetary debasement and central bank sovereign reserve diversification supporting tangible real assets.",
        newsCatalystDriver: "Sovereign reserves increasingly adding physical precious metals alongside Treasury holdings.",
        mathReasoning: "Multi-year secular breakout across 20-year monthly range with volume expansion.",
        technicalIndicators: {
          buyCount: 9,
          neutralCount: 2,
          sellCount: 0,
          score: 90,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 12,
          neutralCount: 0,
          sellCount: 0,
          score: 94,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "22.00", s2: "25.00", s1: "27.80", p: "29.80", r1: "33.00", r2: "36.50", r3: "42.00" },
          fibonacci: { s3: "23.50", s2: "25.90", s1: "28.10", p: "29.80", r1: "31.90", r2: "34.50", r3: "39.50" }
        },
        plainEnglishAdvice: "Monthly Secular Horizon: Decadal secular shift toward hard commodities and industrial electrification metals.",
        volatilityActionPlan: {
          supportBarrier: "24.00",
          resistanceBarrier: "40.00",
          targetZone1: "35.00",
          targetZone2: "40.00",
          volatilityRange: "±10.0%"
        }
      }
    }
  },

  GOLD: {
    symbol: "XAUUSD",
    name: "Gold Spot / US Dollar",
    assetClass: "COMMODITY",
    flagEmoji: "🟡",
    currentPrice: "2,498.40",
    change24h: "+0.62%",
    marketHoursStatus: "Active Global Trading",
    fundamentalDriverSummary: "Central bank sovereign reserve accumulation, falling real bond yields, and geopolitical safe-haven asset demand.",
    timeframes: {
      "1m": {
        timeframe: "1m",
        label: "1 Min",
        summaryDirection: "BUY",
        summaryScore: 55,
        fundamentalContext: "Gold consolidating right at the psychologically pivotal $2,500/oz threshold. Spread tightness across major interbank market makers.",
        newsCatalystDriver: "Sovereign central bank bullion purchase rate affirmations and steady ETF inflow data.",
        mathReasoning: "Tick-by-tick order flow showing steady bid support at $2,496.50 with minimal aggressive market sell orders.",
        technicalIndicators: {
          buyCount: 6,
          neutralCount: 2,
          sellCount: 3,
          score: 50,
          direction: "BUY",
          details: [
            { name: "RSI (14)", value: "59.2", action: "BUY" },
            { name: "MACD (12,26)", value: "+1.2", action: "BUY" }
          ]
        },
        movingAverages: {
          buyCount: 8,
          neutralCount: 0,
          sellCount: 4,
          score: 60,
          direction: "BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "2480", s2: "2488", s1: "2494", p: "2498", r1: "2504", r2: "2510", r3: "2520" },
          fibonacci: { s3: "2483", s2: "2490", s1: "2495", p: "2498", r1: "2502", r2: "2508", r3: "2516" }
        },
        plainEnglishAdvice: "1-Minute Intraday: Steady bid holding firmly near $2,498. Breakout above $2,502 opens quick path to $2,510.",
        volatilityActionPlan: {
          supportBarrier: "2485.00",
          resistanceBarrier: "2520.00",
          targetZone1: "2508.00",
          targetZone2: "2515.00",
          volatilityRange: "±0.45%"
        }
      },
      "5m": {
        timeframe: "5m",
        label: "5 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 78,
        fundamentalContext: "London bullion trading desk accumulation. Physical delivery demand on COMEX remaining robust.",
        newsCatalystDriver: "US real interest rates dipping following moderate PPI reading, reducing opportunity cost of holding non-yielding gold.",
        mathReasoning: "EMA 12/26 cross confirms upward momentum with ascending higher-low chart structure.",
        technicalIndicators: {
          buyCount: 8,
          neutralCount: 1,
          sellCount: 2,
          score: 75,
          direction: "STRONG_BUY",
          details: []
        },
        movingAverages: {
          buyCount: 10,
          neutralCount: 0,
          sellCount: 2,
          score: 80,
          direction: "STRONG_BUY",
          details: []
        },
        pivotPoints: {
          classic: { s3: "2480", s2: "2488", s1: "2494", p: "2498", r1: "2504", r2: "2510", r3: "2520" },
          fibonacci: { s3: "2483", s2: "2490", s1: "2495", p: "2498", r1: "2502", r2: "2508", r3: "2516" }
        },
        plainEnglishAdvice: "5-Minute Horizon: Solid upward momentum backed by continuous institutional bids above $2,494.",
        volatilityActionPlan: {
          supportBarrier: "2480.00",
          resistanceBarrier: "2525.00",
          targetZone1: "2512.00",
          targetZone2: "2522.00",
          volatilityRange: "±0.70%"
        }
      },
      "15m": {
        timeframe: "15m",
        label: "15 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 82,
        fundamentalContext: "Broad macro de-dollarization flows and sovereign reserve diversification into physical gold.",
        newsCatalystDriver: "PBOC and European central banks reporting continuous net monthly gold additions.",
        mathReasoning: "RSI at 62 leaving ample room before overbought exhaustion (75+ threshold).",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 80, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 85, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2480", s2: "2488", s1: "2494", p: "2498", r1: "2504", r2: "2510", r3: "2520" },
          fibonacci: { s3: "2483", s2: "2490", s1: "2495", p: "2498", r1: "2502", r2: "2508", r3: "2516" }
        },
        plainEnglishAdvice: "15-Minute Horizon: Steady bull trend with disciplined volume expansion. Key support anchored at $2,490.",
        volatilityActionPlan: {
          supportBarrier: "2475.00",
          resistanceBarrier: "2530.00",
          targetZone1: "2515.00",
          targetZone2: "2530.00",
          volatilityRange: "±0.95%"
        }
      },
      "30m": {
        timeframe: "30m",
        label: "30 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 85,
        fundamentalContext: "US 10-Year yield compression providing macroeconomic wind at bullion's back.",
        newsCatalystDriver: "Global ETF holdings recording 3 consecutive weeks of positive net inflows.",
        mathReasoning: "Price action maintaining position above standard 30-minute VWAP with low volatility pullbacks.",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 82, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 88, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2480", s2: "2488", s1: "2494", p: "2498", r1: "2504", r2: "2510", r3: "2520" },
          fibonacci: { s3: "2483", s2: "2490", s1: "2495", p: "2498", r1: "2502", r2: "2508", r3: "2516" }
        },
        plainEnglishAdvice: "30-Minute Horizon: High trend clarity. Upward trajectory testing multi-day highs.",
        volatilityActionPlan: {
          supportBarrier: "2470.00",
          resistanceBarrier: "2540.00",
          targetZone1: "2520.00",
          targetZone2: "2535.00",
          volatilityRange: "±1.25%"
        }
      },
      "1h": {
        timeframe: "1h",
        label: "Hourly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 90,
        fundamentalContext: "Global monetary policy easing cycle kickoff. Historical data proves gold experiences +14% average 6-month gain following initial Fed rate cuts.",
        newsCatalystDriver: "Major central bank commentary reinforces expectation of multiple rate cuts over the next 12 months.",
        mathReasoning: "All 12 major moving averages (MA5 through MA200) aligned in perfect bullish stacked formation.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 88, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 92, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2470", s2: "2482", s1: "2490", p: "2498", r1: "2508", r2: "2518", r3: "2532" },
          fibonacci: { s3: "2475", s2: "2485", s1: "2492", p: "2498", r1: "2505", r2: "2512", r3: "2524" }
        },
        plainEnglishAdvice: "Hourly Horizon: Clear institutional trend structure. Price target sits at $2,525.",
        volatilityActionPlan: {
          supportBarrier: "2460.00",
          resistanceBarrier: "2550.00",
          targetZone1: "2525.00",
          targetZone2: "2545.00",
          volatilityRange: "±1.60%"
        }
      },
      "5h": {
        timeframe: "5h",
        label: "5 Hours",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Sovereign wealth fund allocations increasing target gold weighting from 2% to 4%.",
        newsCatalystDriver: "Geopolitical frictions driving continuous sovereign demand for non-sanctionable reserve assets.",
        mathReasoning: "ADX at 36 demonstrating strong confirmed bullish trend momentum.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2460", s2: "2475", s1: "2488", p: "2498", r1: "2512", r2: "2525", r3: "2545" },
          fibonacci: { s3: "2468", s2: "2480", s1: "2490", p: "2498", r1: "2508", r2: "2518", r3: "2535" }
        },
        plainEnglishAdvice: "5-Hour Horizon: Macro safe-haven tailwinds remain unbroken. Next resistance target $2,550.",
        volatilityActionPlan: {
          supportBarrier: "2450.00",
          resistanceBarrier: "2565.00",
          targetZone1: "2535.00",
          targetZone2: "2560.00",
          volatilityRange: "±2.10%"
        }
      },
      "1D": {
        timeframe: "1D",
        label: "Daily",
        summaryDirection: "STRONG_BUY",
        summaryScore: 95,
        fundamentalContext: "Historic breakout above all previous multi-year highs into price discovery territory.",
        newsCatalystDriver: "Consensus Wall Street year-end target raised to $2,580 - $2,650/oz.",
        mathReasoning: "Daily chart showing unbroken ascending channel since November 2023 with 92% adherence to trendline support.",
        technicalIndicators: { buyCount: 11, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 96, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2430", s2: "2460", s1: "2480", p: "2498", r1: "2525", r2: "2550", r3: "2585" },
          fibonacci: { s3: "2445", s2: "2470", s1: "2485", p: "2498", r1: "2518", r2: "2538", r3: "2570" }
        },
        plainEnglishAdvice: "Daily Horizon: All-time high price discovery. Statistical models project $2,580 target range.",
        volatilityActionPlan: {
          supportBarrier: "2420.00",
          resistanceBarrier: "2600.00",
          targetZone1: "2560.00",
          targetZone2: "2600.00",
          volatilityRange: "±3.50%"
        }
      },
      "1W": {
        timeframe: "1W",
        label: "Weekly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 94,
        fundamentalContext: "Decade-long global reserve rebalancing toward hard tangible assets.",
        newsCatalystDriver: "Central bank gold purchases pacing at record >1,000 metric tons annualized.",
        mathReasoning: "Weekly momentum oscillators expanding in strong bull territory without divergence.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 92, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 96, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2350", s2: "2410", s1: "2460", p: "2498", r1: "2555", r2: "2600", r3: "2680" },
          fibonacci: { s3: "2380", s2: "2430", s1: "2470", p: "2498", r1: "2540", r2: "2580", r3: "2640" }
        },
        plainEnglishAdvice: "Weekly Horizon: Long-term macro bull market. Major target $2,650.",
        volatilityActionPlan: {
          supportBarrier: "2380.00",
          resistanceBarrier: "2680.00",
          targetZone1: "2600.00",
          targetZone2: "2650.00",
          volatilityRange: "±5.0%"
        }
      },
      "1M": {
        timeframe: "1M",
        label: "Monthly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Secular monetary shift away from unbacked fiat reserves.",
        newsCatalystDriver: "Multipolar global trade settlement agreements increasingly tied to gold bullion reserves.",
        mathReasoning: "Long-term monthly chart breaking out of multi-year base with high volume validation.",
        technicalIndicators: { buyCount: 9, neutralCount: 2, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "2200", s2: "2320", s1: "2420", p: "2498", r1: "2600", r2: "2720", r3: "2880" },
          fibonacci: { s3: "2260", s2: "2360", s1: "2440", p: "2498", r1: "2575", r2: "2660", r3: "2790" }
        },
        plainEnglishAdvice: "Monthly Horizon: Multi-year sovereign reserve cycle favors continued allocation to bullion.",
        volatilityActionPlan: {
          supportBarrier: "2250.00",
          resistanceBarrier: "2800.00",
          targetZone1: "2650.00",
          targetZone2: "2800.00",
          volatilityRange: "±8.0%"
        }
      }
    }
  },

  NQ: {
    symbol: "NQ100",
    name: "Nasdaq 100 Futures (US Tech 100)",
    assetClass: "INDEX",
    flagEmoji: "🇺🇸",
    currentPrice: "20,412.50",
    change24h: "+0.84%",
    marketHoursStatus: "CME Globex Active / US Cash Session Focus",
    fundamentalDriverSummary: "Generative AI infrastructure capex expansion, hyperscaler earnings resilience, and Federal Reserve policy easing expectations.",
    timeframes: {
      "1m": {
        timeframe: "1m",
        label: "1 Min",
        summaryDirection: "SELL",
        summaryScore: -45,
        fundamentalContext: "Short-term automated orderbook balancing ahead of upcoming US macro data release. Scalping desks taking intraday micro-profits.",
        newsCatalystDriver: "Treasury 2-Year yield ticks up +2 basis points, prompting automated algorithmic micro-hedges in tech futures.",
        mathReasoning: "Fast stochastic showing temporary overbought rejection at 20,430 resistance.",
        technicalIndicators: {
          buyCount: 2,
          neutralCount: 2,
          sellCount: 6,
          score: -40,
          direction: "SELL",
          details: [
            { name: "RSI (14)", value: "42.4", action: "NEUTRAL" },
            { name: "MACD (12,26)", value: "-4.2", action: "SELL" }
          ]
        },
        movingAverages: {
          buyCount: 3,
          neutralCount: 0,
          sellCount: 9,
          score: -50,
          direction: "SELL",
          details: []
        },
        pivotPoints: {
          classic: { s3: "20,310", s2: "20,360", s1: "20,390", p: "20,425", r1: "20,460", r2: "20,495", r3: "20,540" },
          fibonacci: { s3: "20,335", s2: "20,375", s1: "20,398", p: "20,425", r1: "20,452", r2: "20,475", r3: "20,515" }
        },
        plainEnglishAdvice: "1-Minute Horizon: Brief intraday scalp pullback. Normal liquidity cycling ahead of primary US cash session.",
        volatilityActionPlan: {
          supportBarrier: "20,350.00",
          resistanceBarrier: "20,480.00",
          targetZone1: "20,390.00",
          targetZone2: "20,460.00",
          volatilityRange: "±0.35%"
        }
      },
      "5m": {
        timeframe: "5m",
        label: "5 Min",
        summaryDirection: "NEUTRAL",
        summaryScore: 10,
        fundamentalContext: "Market consolidating within a narrow 40-point bracket as institutional desks await morning economic prints.",
        newsCatalystDriver: "Semiconductor supply chain checks indicate steady quarterly wafer fabrication orders from Nvidia and Apple.",
        mathReasoning: "RSI hovering near 50 neutral midpoint; Bollinger bands contracting indicating imminent volatility expansion.",
        technicalIndicators: { buyCount: 4, neutralCount: 3, sellCount: 3, score: 10, direction: "NEUTRAL", details: [] },
        movingAverages: { buyCount: 6, neutralCount: 0, sellCount: 6, score: 0, direction: "NEUTRAL", details: [] },
        pivotPoints: {
          classic: { s3: "20,310", s2: "20,360", s1: "20,390", p: "20,425", r1: "20,460", r2: "20,495", r3: "20,540" },
          fibonacci: { s3: "20,335", s2: "20,375", s1: "20,398", p: "20,425", r1: "20,452", r2: "20,475", r3: "20,515" }
        },
        plainEnglishAdvice: "5-Minute Horizon: Neutral range-bound trading. Look for break above 20,440 or below 20,390 for direction.",
        volatilityActionPlan: {
          supportBarrier: "20,320.00",
          resistanceBarrier: "20,500.00",
          targetZone1: "20,440.00",
          targetZone2: "20,485.00",
          volatilityRange: "±0.55%"
        }
      },
      "15m": {
        timeframe: "15m",
        label: "15 Min",
        summaryDirection: "BUY",
        summaryScore: 58,
        fundamentalContext: "Mega-cap tech equities (NVDA, MSFT, AAPL) exhibiting steady accumulation on dips.",
        newsCatalystDriver: "Positive retail sales data allays economic slowdown concerns; tech beta leading market breadth.",
        mathReasoning: "Price action respecting ascending 15-minute 20-period EMA support.",
        technicalIndicators: { buyCount: 7, neutralCount: 2, sellCount: 2, score: 55, direction: "BUY", details: [] },
        movingAverages: { buyCount: 8, neutralCount: 0, sellCount: 4, score: 62, direction: "BUY", details: [] },
        pivotPoints: {
          classic: { s3: "20,310", s2: "20,360", s1: "20,390", p: "20,425", r1: "20,460", r2: "20,495", r3: "20,540" },
          fibonacci: { s3: "20,335", s2: "20,375", s1: "20,398", p: "20,425", r1: "20,452", r2: "20,475", r3: "20,515" }
        },
        plainEnglishAdvice: "15-Minute Horizon: Moderate bullish momentum. Key intraday pivot target is 20,460.",
        volatilityActionPlan: {
          supportBarrier: "20,300.00",
          resistanceBarrier: "20,520.00",
          targetZone1: "20,460.00",
          targetZone2: "20,510.00",
          volatilityRange: "±0.75%"
        }
      },
      "30m": {
        timeframe: "30m",
        label: "30 Min",
        summaryDirection: "BUY",
        summaryScore: 65,
        fundamentalContext: "Institutional fund rebalancing favoring high-growth AI infrastructure and software names.",
        newsCatalystDriver: "Cloud software bookings growth affirming corporate AI adoption cycle.",
        mathReasoning: "MACD line crossing above signal line on positive volume divergence.",
        technicalIndicators: { buyCount: 8, neutralCount: 1, sellCount: 2, score: 65, direction: "BUY", details: [] },
        movingAverages: { buyCount: 9, neutralCount: 0, sellCount: 3, score: 70, direction: "BUY", details: [] },
        pivotPoints: {
          classic: { s3: "20,300", s2: "20,350", s1: "20,385", p: "20,425", r1: "20,465", r2: "20,505", r3: "20,555" },
          fibonacci: { s3: "20,325", s2: "20,368", s1: "20,392", p: "20,425", r1: "20,458", r2: "20,482", r3: "20,525" }
        },
        plainEnglishAdvice: "30-Minute Horizon: Constructive uptrend structure targeting 20,485 upper resistance.",
        volatilityActionPlan: {
          supportBarrier: "20,280.00",
          resistanceBarrier: "20,540.00",
          targetZone1: "20,480.00",
          targetZone2: "20,530.00",
          volatilityRange: "±0.95%"
        }
      },
      "1h": {
        timeframe: "1h",
        label: "Hourly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 84,
        fundamentalContext: "Disinflation trend allowing the Federal Reserve to begin its rate reduction cycle, providing multiple expansion for growth equities.",
        newsCatalystDriver: "Core CPI and Core PCE metrics aligning with Fed 2% long-term trajectory.",
        mathReasoning: "Price tracking cleanly above 50-hour and 200-hour moving averages; 78% win rate on historical backtested event pullbacks.",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 82, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 86, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "20,250", s2: "20,320", s1: "20,370", p: "20,425", r1: "20,475", r2: "20,530", r3: "20,600" },
          fibonacci: { s3: "20,280", s2: "20,340", s1: "20,380", p: "20,425", r1: "20,470", r2: "20,510", r3: "20,570" }
        },
        plainEnglishAdvice: "Hourly Horizon: High-conviction bullish trend structure. Target coordinate sits at 20,530.",
        volatilityActionPlan: {
          supportBarrier: "20,220.00",
          resistanceBarrier: "20,580.00",
          targetZone1: "20,500.00",
          targetZone2: "20,560.00",
          volatilityRange: "±1.20%"
        }
      },
      "5h": {
        timeframe: "5h",
        label: "5 Hours",
        summaryDirection: "STRONG_BUY",
        summaryScore: 88,
        fundamentalContext: "Corporate earnings beats across 82% of S&P 500 / Nasdaq tech constituents.",
        newsCatalystDriver: "Capex guidance from hyperscalers (Microsoft, Meta, Google, Amazon) exceeds $200B aggregate for 2026.",
        mathReasoning: "Higher highs and higher lows established across 10 consecutive 5-hour trading candles.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 88, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 92, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "20,180", s2: "20,280", s1: "20,350", p: "20,425", r1: "20,500", r2: "20,580", r3: "20,680" },
          fibonacci: { s3: "20,210", s2: "20,300", s1: "20,360", p: "20,425", r1: "20,490", r2: "20,550", r3: "20,640" }
        },
        plainEnglishAdvice: "5-Hour Horizon: Sustained multi-session uptrend. Macro conditions favor continued upward drift toward 20,600.",
        volatilityActionPlan: {
          supportBarrier: "20,150.00",
          resistanceBarrier: "20,650.00",
          targetZone1: "20,550.00",
          targetZone2: "20,620.00",
          volatilityRange: "±1.65%"
        }
      },
      "1D": {
        timeframe: "1D",
        label: "Daily",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Structural multi-year AI platform shift driving generational corporate productivity and software margins.",
        newsCatalystDriver: "Wall Street consensus 12-month forward Nasdaq target projected to 21,500 - 22,000.",
        mathReasoning: "Daily RSI healthy at 64; 50-day SMA providing solid trailing support at 19,850.",
        technicalIndicators: { buyCount: 11, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 96, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "19,800", s2: "20,050", s1: "20,220", p: "20,425", r1: "20,650", r2: "20,850", r3: "21,100" },
          fibonacci: { s3: "19,920", s2: "20,120", s1: "20,280", p: "20,425", r1: "20,570", r2: "20,730", r3: "20,980" }
        },
        plainEnglishAdvice: "Daily Chart: Robust long-term bull market with intact secular support above 20,000.",
        volatilityActionPlan: {
          supportBarrier: "19,800.00",
          resistanceBarrier: "21,000.00",
          targetZone1: "20,750.00",
          targetZone2: "21,200.00",
          volatilityRange: "±2.50%"
        }
      },
      "1W": {
        timeframe: "1W",
        label: "Weekly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 90,
        fundamentalContext: "Decade-long digital transformation and cloud computing supercycle.",
        newsCatalystDriver: "Enterprise AI adoption expanding from pilot phase into full production deployment.",
        mathReasoning: "Weekly MACD maintaining clear separation above signal line with no negative divergence.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "19,200", s2: "19,650", s1: "20,020", p: "20,425", r1: "20,850", r2: "21,250", r3: "21,800" },
          fibonacci: { s3: "19,400", s2: "19,800", s1: "20,100", p: "20,425", r1: "20,750", r2: "21,050", r3: "21,500" }
        },
        plainEnglishAdvice: "Weekly Chart: Primary secular trend firmly bullish with institutional support.",
        volatilityActionPlan: {
          supportBarrier: "19,500.00",
          resistanceBarrier: "21,500.00",
          targetZone1: "21,000.00",
          targetZone2: "21,500.00",
          volatilityRange: "±4.0%"
        }
      },
      "1M": {
        timeframe: "1M",
        label: "Monthly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Global technological productivity leadership centered in US Mega-Cap tech infrastructure.",
        newsCatalystDriver: "Record free cash flow yields enabling historic stock buyback and dividend programs.",
        mathReasoning: "Monthly trendline holding unbroken since 2010 secular bull market inception.",
        technicalIndicators: { buyCount: 9, neutralCount: 2, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "17,800", s2: "18,800", s1: "19,600", p: "20,425", r1: "21,400", r2: "22,400", r3: "23,800" },
          fibonacci: { s3: "18,200", s2: "19,100", s1: "19,800", p: "20,425", r1: "21,050", r2: "21,950", r3: "23,100" }
        },
        plainEnglishAdvice: "Monthly Chart: Multi-year secular leadership. Tech index remains standard global growth vehicle.",
        volatilityActionPlan: {
          supportBarrier: "18,500.00",
          resistanceBarrier: "23,000.00",
          targetZone1: "21,800.00",
          targetZone2: "22,500.00",
          volatilityRange: "±6.5%"
        }
      }
    }
  },

  DAX: {
    symbol: "DAX40",
    name: "Germany DAX 40 Index (Frankfurt XETRA)",
    assetClass: "INDEX",
    flagEmoji: "🇩🇪",
    currentPrice: "18,485.20",
    change24h: "+0.45%",
    marketHoursStatus: "XETRA Cash Session (09:00 - 17:30 CEST)",
    fundamentalDriverSummary: "European Central Bank interest rate reduction cycle, industrial export stabilization, and software component leadership from SAP SE.",
    timeframes: {
      "1m": {
        timeframe: "1m",
        label: "1 Min",
        summaryDirection: "NEUTRAL",
        summaryScore: 5,
        fundamentalContext: "XETRA trading in steady midday consolidation with balanced market maker books.",
        newsCatalystDriver: "ECB policy statements indicating gradual quarterly easing steps.",
        mathReasoning: "VWAP tracking flat within 15-point band.",
        technicalIndicators: { buyCount: 4, neutralCount: 3, sellCount: 4, score: 0, direction: "NEUTRAL", details: [] },
        movingAverages: { buyCount: 6, neutralCount: 0, sellCount: 6, score: 0, direction: "NEUTRAL", details: [] },
        pivotPoints: {
          classic: { s3: "18,350", s2: "18,400", s1: "18,440", p: "18,480", r1: "18,520", r2: "18,560", r3: "18,610" },
          fibonacci: { s3: "18,370", s2: "18,415", s1: "18,450", p: "18,480", r1: "18,510", r2: "18,545", r3: "18,590" }
        },
        plainEnglishAdvice: "1-Minute Horizon: Calm range-bound trading during Frankfurt trading session.",
        volatilityActionPlan: {
          supportBarrier: "18,420.00",
          resistanceBarrier: "18,540.00",
          targetZone1: "18,510.00",
          targetZone2: "18,550.00",
          volatilityRange: "±0.30%"
        }
      },
      "5m": {
        timeframe: "5m",
        label: "5 Min",
        summaryDirection: "BUY",
        summaryScore: 50,
        fundamentalContext: "German blue chips (SAP, Siemens, Allianz) seeing steady institutional buying.",
        newsCatalystDriver: "German factory orders tick up slightly, reducing recession anxieties.",
        mathReasoning: "RSI holding at 56 with ascending minor support.",
        technicalIndicators: { buyCount: 6, neutralCount: 2, sellCount: 3, score: 45, direction: "BUY", details: [] },
        movingAverages: { buyCount: 7, neutralCount: 0, sellCount: 5, score: 55, direction: "BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,350", s2: "18,400", s1: "18,440", p: "18,480", r1: "18,520", r2: "18,560", r3: "18,610" },
          fibonacci: { s3: "18,370", s2: "18,415", s1: "18,450", p: "18,480", r1: "18,510", r2: "18,545", r3: "18,590" }
        },
        plainEnglishAdvice: "5-Minute Horizon: Moderate buying pressure above 18,450 support level.",
        volatilityActionPlan: {
          supportBarrier: "18,380.00",
          resistanceBarrier: "18,560.00",
          targetZone1: "18,525.00",
          targetZone2: "18,570.00",
          volatilityRange: "±0.45%"
        }
      },
      "15m": {
        timeframe: "15m",
        label: "15 Min",
        summaryDirection: "BUY",
        summaryScore: 60,
        fundamentalContext: "European cross-border equity funds establishing long exposure in Frankfurt index.",
        newsCatalystDriver: "Eurozone inflation easing to 2.2% YoY, supporting lower corporate borrowing costs.",
        mathReasoning: "EMA 20 crossing above EMA 50 on 15-minute chart.",
        technicalIndicators: { buyCount: 7, neutralCount: 2, sellCount: 2, score: 55, direction: "BUY", details: [] },
        movingAverages: { buyCount: 8, neutralCount: 0, sellCount: 4, score: 65, direction: "BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,350", s2: "18,400", s1: "18,440", p: "18,480", r1: "18,520", r2: "18,560", r3: "18,610" },
          fibonacci: { s3: "18,370", s2: "18,415", s1: "18,450", p: "18,480", r1: "18,510", r2: "18,545", r3: "18,590" }
        },
        plainEnglishAdvice: "15-Minute Horizon: Constructive foundation building for retest of 18,550 resistance.",
        volatilityActionPlan: {
          supportBarrier: "18,350.00",
          resistanceBarrier: "18,600.00",
          targetZone1: "18,540.00",
          targetZone2: "18,590.00",
          volatilityRange: "±0.65%"
        }
      },
      "30m": {
        timeframe: "30m",
        label: "30 Min",
        summaryDirection: "BUY",
        summaryScore: 68,
        fundamentalContext: "Institutional flow analysis indicates continuous accumulation into European large caps.",
        newsCatalystDriver: "German energy cost stabilization boosting automotive and industrial margin forecasts.",
        mathReasoning: "Price action maintaining higher low pattern above 18,430 pivot.",
        technicalIndicators: { buyCount: 8, neutralCount: 1, sellCount: 2, score: 65, direction: "BUY", details: [] },
        movingAverages: { buyCount: 9, neutralCount: 0, sellCount: 3, score: 72, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,350", s2: "18,400", s1: "18,440", p: "18,480", r1: "18,520", r2: "18,560", r3: "18,610" },
          fibonacci: { s3: "18,370", s2: "18,415", s1: "18,450", p: "18,480", r1: "18,510", r2: "18,545", r3: "18,590" }
        },
        plainEnglishAdvice: "30-Minute Horizon: Steady upward drift into the Frankfurt close.",
        volatilityActionPlan: {
          supportBarrier: "18,320.00",
          resistanceBarrier: "18,620.00",
          targetZone1: "18,560.00",
          targetZone2: "18,620.00",
          volatilityRange: "±0.80%"
        }
      },
      "1h": {
        timeframe: "1h",
        label: "Hourly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 82,
        fundamentalContext: "ECB policy divergence providing relative valuation support for European equities compared to US multiples.",
        newsCatalystDriver: "Christine Lagarde's press conference remarks affirm supportive monetary stance.",
        mathReasoning: "Hourly MACD histogram positive with ADX at 28 indicating established trend.",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 80, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 85, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,300", s2: "18,380", s1: "18,430", p: "18,475", r1: "18,540", r2: "18,590", r3: "18,660" },
          fibonacci: { s3: "18,330", s2: "18,395", s1: "18,440", p: "18,475", r1: "18,525", r2: "18,560", r3: "18,620" }
        },
        plainEnglishAdvice: "Hourly Horizon: High-quality bull trend. Target sits at 18,590.",
        volatilityActionPlan: {
          supportBarrier: "18,280.00",
          resistanceBarrier: "18,680.00",
          targetZone1: "18,580.00",
          targetZone2: "18,650.00",
          volatilityRange: "±1.10%"
        }
      },
      "5h": {
        timeframe: "5h",
        label: "5 Hours",
        summaryDirection: "STRONG_BUY",
        summaryScore: 85,
        fundamentalContext: "Multinational export revenues recovering on stronger Asian and US demand.",
        newsCatalystDriver: "German export data prints above consensus for second consecutive month.",
        mathReasoning: "5-hour SuperTrend indicator comfortably green since 18,220 level.",
        technicalIndicators: { buyCount: 9, neutralCount: 2, sellCount: 0, score: 82, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 88, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,250", s2: "18,340", s1: "18,410", p: "18,460", r1: "18,550", r2: "18,620", r3: "18,720" },
          fibonacci: { s3: "18,280", s2: "18,360", s1: "18,420", p: "18,460", r1: "18,530", r2: "18,580", r3: "18,660" }
        },
        plainEnglishAdvice: "5-Hour Horizon: Sustained multi-session bull bias with 18,650 target zone.",
        volatilityActionPlan: {
          supportBarrier: "18,200.00",
          resistanceBarrier: "18,750.00",
          targetZone1: "18,620.00",
          targetZone2: "18,700.00",
          volatilityRange: "±1.50%"
        }
      },
      "1D": {
        timeframe: "1D",
        label: "Daily",
        summaryDirection: "STRONG_BUY",
        summaryScore: 88,
        fundamentalContext: "DAX index trading near historical record highs with modest 13.5x forward P/E ratio.",
        newsCatalystDriver: "Global asset managers increasing tactical European equity overweight.",
        mathReasoning: "Daily chart demonstrating ascending triangle breakout pattern.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 86, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "18,100", s2: "18,250", s1: "18,380", p: "18,450", r1: "18,580", r2: "18,700", r3: "18,880" },
          fibonacci: { s3: "18,150", s2: "18,280", s1: "18,390", p: "18,450", r1: "18,550", r2: "18,630", r3: "18,780" }
        },
        plainEnglishAdvice: "Daily Horizon: Intact structural uptrend targeting 19,000 milestone.",
        volatilityActionPlan: {
          supportBarrier: "18,100.00",
          resistanceBarrier: "19,100.00",
          targetZone1: "18,750.00",
          targetZone2: "19,000.00",
          volatilityRange: "±2.20%"
        }
      },
      "1W": {
        timeframe: "1W",
        label: "Weekly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 86,
        fundamentalContext: "European fiscal support and green technology industrial subsidies.",
        newsCatalystDriver: "Corporate balance sheets displaying historically low leverage and solid dividend yields.",
        mathReasoning: "Weekly moving averages aligned in progressive upward fan.",
        technicalIndicators: { buyCount: 9, neutralCount: 2, sellCount: 0, score: 84, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 88, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "17,600", s2: "17,950", s1: "18,220", p: "18,420", r1: "18,720", r2: "18,980", r3: "19,300" },
          fibonacci: { s3: "17,750", s2: "18,050", s1: "18,270", p: "18,420", r1: "18,650", r2: "18,880", r3: "19,180" }
        },
        plainEnglishAdvice: "Weekly Horizon: Long-term European recovery trend remains healthy.",
        volatilityActionPlan: {
          supportBarrier: "17,800.00",
          resistanceBarrier: "19,300.00",
          targetZone1: "18,900.00",
          targetZone2: "19,250.00",
          volatilityRange: "±3.5%"
        }
      },
      "1M": {
        timeframe: "1M",
        label: "Monthly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 85,
        fundamentalContext: "Secular recovery across European heavy industry and enterprise software.",
        newsCatalystDriver: "Long-term capital expenditure in European defense and energy transition infrastructure.",
        mathReasoning: "Multi-year monthly cup-and-handle pattern breaking to record territory.",
        technicalIndicators: { buyCount: 8, neutralCount: 3, sellCount: 0, score: 82, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 88, direction: "STRONG_BUY", details: [] },
        pivotPoints: {
          classic: { s3: "16,800", s2: "17,400", s1: "18,000", p: "18,350", r1: "18,950", r2: "19,500", r3: "20,200" },
          fibonacci: { s3: "17,050", s2: "17,600", s1: "18,100", p: "18,350", r1: "18,820", r2: "19,250", r3: "19,900" }
        },
        plainEnglishAdvice: "Monthly Horizon: Decadal secular breakout for the Frankfurt benchmark.",
        volatilityActionPlan: {
          supportBarrier: "17,200.00",
          resistanceBarrier: "20,000.00",
          targetZone1: "19,500.00",
          targetZone2: "20,000.00",
          volatilityRange: "±5.5%"
        }
      }
    }
  },

  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "TECH_STOCK",
    flagEmoji: "🇺🇸",
    currentPrice: "128.40",
    change24h: "+3.85%",
    marketHoursStatus: "Active US Equity Session",
    fundamentalDriverSummary: "Generative AI GPU monopoly, Blackwell B200 volume ramp, and hyperscaler capex commitments.",
    timeframes: {
      "1m": {
        timeframe: "1m",
        label: "1 Min",
        summaryDirection: "BUY",
        summaryScore: 52,
        fundamentalContext: "Institutional orderflow absorbing block sell orders at $128.00.",
        newsCatalystDriver: "Supply chain confirms Blackwell chip cluster deliveries pacing ahead of schedule.",
        mathReasoning: "Orderbook delta positive (+72% buy-side aggression).",
        technicalIndicators: { buyCount: 6, neutralCount: 2, sellCount: 2, score: 50, direction: "BUY", details: [] },
        movingAverages: { buyCount: 8, neutralCount: 0, sellCount: 4, score: 55, direction: "BUY", details: [] },
        pivotPoints: { classic: { s3: "124", s2: "126", s1: "127", p: "128.2", r1: "129.5", r2: "131", r3: "133" }, fibonacci: { s3: "124.5", s2: "126.2", s1: "127.4", p: "128.2", r1: "129.1", r2: "130.4", r3: "132.1" } },
        plainEnglishAdvice: "1-Minute Intraday: Steady buying demand maintaining support above $128.",
        volatilityActionPlan: { supportBarrier: "126.00", resistanceBarrier: "131.00", targetZone1: "129.50", targetZone2: "131.00", volatilityRange: "±0.80%" }
      },
      "5m": {
        timeframe: "5m",
        label: "5 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 78,
        fundamentalContext: "Hyperscalers confirming 100% capacity reservation for next-generation AI datacenter nodes.",
        newsCatalystDriver: "Tier-1 brokerages reiterate Strong Buy with $160 average target.",
        mathReasoning: "5-minute RSI at 63 on ascending volume profile.",
        technicalIndicators: { buyCount: 8, neutralCount: 1, sellCount: 1, score: 75, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 10, neutralCount: 0, sellCount: 2, score: 80, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "124", s2: "126", s1: "127", p: "128.2", r1: "129.5", r2: "131", r3: "133" }, fibonacci: { s3: "124.5", s2: "126.2", s1: "127.4", p: "128.2", r1: "129.1", r2: "130.4", r3: "132.1" } },
        plainEnglishAdvice: "5-Minute Horizon: Strong momentum pushing toward $130.00 psychological resistance.",
        volatilityActionPlan: { supportBarrier: "125.50", resistanceBarrier: "132.50", targetZone1: "130.50", targetZone2: "132.00", volatilityRange: "±1.20%" }
      },
      "15m": {
        timeframe: "15m",
        label: "15 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 84,
        fundamentalContext: "High gross margins (>75%) insulating company from broader semiconductor cycle volatility.",
        newsCatalystDriver: "Enterprise AI adoption expanding into sovereign defense and national supercomputing centers.",
        mathReasoning: "Moving averages stacked bullishly with 2.1x volume confirmation.",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 82, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 86, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "124", s2: "126", s1: "127", p: "128.2", r1: "129.5", r2: "131", r3: "133" }, fibonacci: { s3: "124.5", s2: "126.2", s1: "127.4", p: "128.2", r1: "129.1", r2: "130.4", r3: "132.1" } },
        plainEnglishAdvice: "15-Minute Horizon: Robust trend continuation targeting $132.50.",
        volatilityActionPlan: { supportBarrier: "124.50", resistanceBarrier: "134.00", targetZone1: "132.00", targetZone2: "133.80", volatilityRange: "±1.60%" }
      },
      "30m": {
        timeframe: "30m",
        label: "30 Min",
        summaryDirection: "STRONG_BUY",
        summaryScore: 86,
        fundamentalContext: "Software ecosystem (CUDA) creating insurmountable multi-year moat against competitors.",
        newsCatalystDriver: "Blackwell Ultra server racks pre-booked through mid-2027.",
        mathReasoning: "ADX at 34 indicating strong confirmed trend strength.",
        technicalIndicators: { buyCount: 9, neutralCount: 1, sellCount: 1, score: 84, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 11, neutralCount: 0, sellCount: 1, score: 88, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "124", s2: "126", s1: "127", p: "128.2", r1: "129.5", r2: "131", r3: "133" }, fibonacci: { s3: "124.5", s2: "126.2", s1: "127.4", p: "128.2", r1: "129.1", r2: "130.4", r3: "132.1" } },
        plainEnglishAdvice: "30-Minute Horizon: High conviction momentum across US cash hours.",
        volatilityActionPlan: { supportBarrier: "123.50", resistanceBarrier: "135.50", targetZone1: "133.00", targetZone2: "135.00", volatilityRange: "±2.10%" }
      },
      "1h": {
        timeframe: "1h",
        label: "Hourly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 90,
        fundamentalContext: "Data center revenue growing at triple-digit rates YoY.",
        newsCatalystDriver: "Upcoming catalyst event: Blackwell shipment guidance affirmation.",
        mathReasoning: "Hourly chart showing clean ascending channel breakout above $126.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 88, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 92, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "123", s2: "125", s1: "127", p: "128.2", r1: "130.5", r2: "132.8", r3: "135" }, fibonacci: { s3: "123.8", s2: "125.4", s1: "127.1", p: "128.2", r1: "129.8", r2: "131.2", r3: "133.5" } },
        plainEnglishAdvice: "Hourly Horizon: Top momentum asset. Key target coordinate is $135.00.",
        volatilityActionPlan: { supportBarrier: "122.00", resistanceBarrier: "138.00", targetZone1: "134.50", targetZone2: "138.00", volatilityRange: "±2.80%" }
      },
      "5h": {
        timeframe: "5h",
        label: "5 Hours",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Multi-year semiconductor supercycle leader.",
        newsCatalystDriver: "Expanding customer base to automotive AI and sovereign LLM infrastructure.",
        mathReasoning: "Higher timeframe moving averages aligned in perfect bullish expansion.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "120", s2: "124", s1: "126", p: "128.2", r1: "131.5", r2: "134.0", r3: "138" }, fibonacci: { s3: "121.5", s2: "124.8", s1: "126.8", p: "128.2", r1: "130.8", r2: "133.0", r3: "136.5" } },
        plainEnglishAdvice: "5-Hour Horizon: Sustained institutional trend targeting $140.00.",
        volatilityActionPlan: { supportBarrier: "119.00", resistanceBarrier: "142.00", targetZone1: "136.00", targetZone2: "140.50", volatilityRange: "±3.60%" }
      },
      "1D": {
        timeframe: "1D",
        label: "Daily",
        summaryDirection: "STRONG_BUY",
        summaryScore: 95,
        fundamentalContext: "Secular AI computing transformation with unmatched pricing power.",
        newsCatalystDriver: "Consensus analyst price targets rising to $150 - $165.",
        mathReasoning: "Daily chart showing unbroken post-split accumulation pattern.",
        technicalIndicators: { buyCount: 11, neutralCount: 0, sellCount: 0, score: 95, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 96, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "115", s2: "120", s1: "124", p: "128.2", r1: "133.0", r2: "137.5", r3: "144" }, fibonacci: { s3: "117.2", s2: "121.5", s1: "125.0", p: "128.2", r1: "132.0", r2: "135.5", r3: "141.0" } },
        plainEnglishAdvice: "Daily Chart: Unbroken AI supercycle trajectory with $145 long-term target.",
        volatilityActionPlan: { supportBarrier: "116.00", resistanceBarrier: "148.00", targetZone1: "138.00", targetZone2: "145.00", volatilityRange: "±5.0%" }
      },
      "1W": {
        timeframe: "1W",
        label: "Weekly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 94,
        fundamentalContext: "Generational corporate moat in artificial intelligence.",
        newsCatalystDriver: "Generative AI capex compounding at >35% annualized.",
        mathReasoning: "Weekly momentum oscillator maintaining pristine bullish posture.",
        technicalIndicators: { buyCount: 10, neutralCount: 1, sellCount: 0, score: 92, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 96, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "105", s2: "115", s1: "122", p: "128.2", r1: "136.0", r2: "145.0", r3: "155" }, fibonacci: { s3: "108.5", s2: "117.0", s1: "123.5", p: "128.2", r1: "134.5", r2: "141.0", r3: "150.0" } },
        plainEnglishAdvice: "Weekly Horizon: Long-term leadership intact.",
        volatilityActionPlan: { supportBarrier: "110.00", resistanceBarrier: "155.00", targetZone1: "145.00", targetZone2: "152.00", volatilityRange: "±7.5%" }
      },
      "1M": {
        timeframe: "1M",
        label: "Monthly",
        summaryDirection: "STRONG_BUY",
        summaryScore: 92,
        fundamentalContext: "Global technology index bellwether.",
        newsCatalystDriver: "Computing architecture standard for global technology industry.",
        mathReasoning: "Monthly trendline holding unbroken.",
        technicalIndicators: { buyCount: 9, neutralCount: 2, sellCount: 0, score: 90, direction: "STRONG_BUY", details: [] },
        movingAverages: { buyCount: 12, neutralCount: 0, sellCount: 0, score: 94, direction: "STRONG_BUY", details: [] },
        pivotPoints: { classic: { s3: "90", s2: "105", s1: "118", p: "128.2", r1: "142.0", r2: "155.0", r3: "170" }, fibonacci: { s3: "95.0", s2: "108.0", s1: "120.0", p: "128.2", r1: "139.0", r2: "148.0", r3: "162.0" } },
        plainEnglishAdvice: "Monthly Horizon: Premier global growth cornerstone.",
        volatilityActionPlan: { supportBarrier: "100.00", resistanceBarrier: "170.00", targetZone1: "150.00", targetZone2: "165.00", volatilityRange: "±10.0%" }
      }
    }
  }
};
