import { JargonExplanation } from "../types/marketIntelligenceTypes";

export const PLAIN_LANGUAGE_JARGON_DICTIONARY: JargonExplanation[] = [
  {
    termKey: "STOCK_PRINT",
    headline: "What is a 'Print' (e.g., CPI Print, Stock Print, Earnings Print)?",
    grandpaSummary:
      "Imagine a scoreboard in a sports stadium: the exact moment the official score is published onto the board is what Wall Street calls the 'Print'. When the US inflation number flashes across trader terminals at 8:30 AM ET, traders say 'The CPI print came in at 3.1%'. It simply refers to the official, newly released number.",
    kidAnalogy:
      "When you receive your report card: the exact second the grade appears on paper is the 'print'.",
    technicalMeaning:
      "The official, millisecond-stamped primary release of macroeconomic data (CPI, NFP, GDP) or corporate quarterly metrics (EPS, Revenue) from government agencies (BLS, Fed) or companies.",
    whyItMattersForKnockouts:
      "During the first 15 to 60 seconds following a print, price volatility peaks. Leveraged positions and options react almost instantly with sharp price swings.",
    bullishReaction: "Green Light: Number beats expectations, stocks jump immediately.",
    bearishReaction: "Red Light: Number disappoints, market drops rapidly.",
    iconName: "FileText"
  },
  {
    termKey: "DOVISH_PRINT",
    headline: "What does 'Dovish' (Easing / Accommodative) mean?",
    grandpaSummary:
      "The Dove is a universal symbol of peace: when central bankers like the Fed or ECB act 'dovish', they want to stimulate the economy. They lower interest rates and inject liquidity. Low borrowing costs act like high-grade fertilizer for growth tech stocks like Nvidia, Apple, and the Nasdaq 100 — sending valuations higher!",
    kidAnalogy:
      "Like a teacher who announces: 'No hard homework today, go outside and play!' Everyone cheers and celebrates.",
    technicalMeaning:
      "Monetary policy easing, interest rate cuts, or accommodative rhetoric aimed at expanding liquidity and supporting employment.",
    whyItMattersForKnockouts:
      "Dovish stance = Tailwinds for bullish/long positions on the Nasdaq 100, S&P 500, and Gold.",
    bullishReaction: "🚀 Bullish: Tech stocks (Nvidia, Micron, Apple) and Gold rise strongly.",
    bearishReaction: "The US Dollar softens as interest yield advantages decline.",
    iconName: "TrendingUp"
  },
  {
    termKey: "HAWKISH_PRINT",
    headline: "What does 'Hawkish' (Tightening / Restrictive) mean?",
    grandpaSummary:
      "The Hawk is a bird of prey: a 'hawkish' central banker hunts inflation with sharp interest rate hikes! Higher rates make borrowing expensive and slow economic expansion. For stock markets, hawkish signals usually trigger warning signs and pullbacks.",
    kidAnalogy:
      "Like a strict principal who announces surprise pop quizzes and cuts allowance. Everyone becomes cautious.",
    technicalMeaning:
      "Restrictive monetary policy, rate hikes, or balance-sheet runoff (Quantitative Tightening) to cool down inflation.",
    whyItMattersForKnockouts:
      "Hawkish stance = Caution for longs! Favorable for short positions or taking profits off the table before major events.",
    bullishReaction: "The US Dollar and Treasury yields surge.",
    bearishReaction: "🔻 Bearish: Nasdaq 100, growth stocks, and crypto face multiple compression.",
    iconName: "TrendingDown"
  },
  {
    termKey: "INLINE_PRINT",
    headline: "What is an 'In-Line Print' (Meeting Consensus Expectations)?",
    grandpaSummary:
      "Right on target! If economists expected 2.5% and the number arrives at exactly 2.5%, there is zero surprise factor. After a brief 2-minute oscillation, the market simply continues along its prevailing trend.",
    kidAnalogy:
      "When you receive the exact birthday gift on your wish list: no disappointment, but no shock either.",
    technicalMeaning:
      "Actual reported figure matches median Wall Street consensus forecasts (Bloomberg/Reuters poll) within ±0.1%.",
    whyItMattersForKnockouts:
      "Low surprise volatility. Leveraged positions are relatively protected from sudden gap risk.",
    bullishReaction: "Existing trend continues smoothly with low dispersion.",
    bearishReaction: "Absence of forced panic selling; calm consolidation.",
    iconName: "Scale"
  },
  {
    termKey: "REACTION_COORDINATES",
    headline: "What are 'Price Reaction Sensitivity Coordinates'?",
    grandpaSummary:
      "Like a GPS destination on a map! Rather than guessing 'the market will go up', algorithmic models compute from 70+ historical events: 'If core inflation drops by 0.2%, the Nasdaq 100 has an 88% probability of traveling to the exact price coordinate of 20,450 points'. It provides your exact target for taking profit or setting stops.",
    kidAnalogy:
      "Like hide-and-seek: when you know your friend hides behind the big tree (Coordinate A) 90% of the time.",
    technicalMeaning:
      "Empirically derived statistical cluster zones (Expected Return ± Standard Deviation) where institutional order books and algorithmic liquidity pools absorb post-release volume.",
    whyItMattersForKnockouts:
      "You know precisely at which price level to lock in profits (Take Profit) before mean-reversion begins.",
    bullishReaction: "Price aims directly toward upper target levels (TP1 / TP2).",
    bearishReaction: "Price descends toward lower support zones (S1 / S2).",
    iconName: "Target"
  },
  {
    termKey: "KNOCKOUT_BARRIER",
    headline: "What is a 'Barrier Level' & Risk Buffer in Leveraged Trading?",
    grandpaSummary:
      "The safety perimeter! When trading leveraged instruments, profits multiply quickly. However, if the asset price touches the red barrier line, the trade terminates. That's why models place safety buffers 5% to 10% below key support levels to withstand morning volatility.",
    kidAnalogy:
      "Like the game 'The Floor is Lava'! As long as your feet stay on the cushions, you score points. If you touch the floor, you're out.",
    technicalMeaning:
      "The stop-out / liquidation threshold where risk limits are triggered. Proper placement requires sufficient distance from anticipated event standard deviation.",
    whyItMattersForKnockouts:
      "During peak market opens (09:30 ET / 15:30 CET), volume surges. A wide safety buffer keeps your position insulated from opening spikes.",
    bullishReaction: "Long positions multiply returns during strong upward expansions.",
    bearishReaction: "Short positions multiply returns during downward corrections.",
    iconName: "ShieldAlert"
  }
];
