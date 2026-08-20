import React, { useState, useEffect, useMemo } from "react";
import {
  UPCOMING_TWO_WEEKS_EVENTS,
  TODAY_RELEASED_NEWS_FEED,
  INSTRUMENT_TECHNICAL_OVERVIEWS,
  GLOBAL_MARKET_SESSIONS,
  POLITICIAN_TRADING_LEDGER,
  CORPORATE_BIG_DEALS_FEED,
  SEARCHABLE_ASSETS_DATABASE,
  SearchableAssetItem
} from "../data/marketIntelligenceData";
import {
  UpcomingEconomicEvent,
  TodayReleasedNewsItem,
  InstrumentTechnicalOverview
} from "../types/marketIntelligenceTypes";
import { NewsEventDetailModal } from "./NewsEventDetailModal";
import { StockSearchDetailModal } from "./StockSearchDetailModal";
import { TechnicalSpeedometerGauges } from "./TechnicalSpeedometerGauges";
import { StockEventsWatchlistTable } from "./StockEventsWatchlistTable";
import { PlainLanguageJargonExplainerModal } from "./PlainLanguageJargonExplainerModal";
import { GlobalMarketWatchlistSidebar } from "./GlobalMarketWatchlistSidebar";
import { PoliticalInsiderTrackingModule } from "./PoliticalInsiderTrackingModule";
import { LiveStockIntelligenceSearchBar } from "./LiveStockIntelligenceSearchBar";
import {
  Search,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Building,
  UserCheck,
  Twitter,
  Target,
  Zap,
  Activity,
  ChevronRight,
  Globe,
  DollarSign,
  Filter,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart3,
  ExternalLink,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  HelpCircle,
  SlidersHorizontal
} from "lucide-react";

export const EasyMarketTraderDashboard: React.FC = () => {
  // Grandpa Mode / Simple Plain Language Mode Toggle
  const [isGrandpaMode, setIsGrandpaMode] = useState<boolean>(true);
  const [isJargonModalOpen, setIsJargonModalOpen] = useState<boolean>(false);

  // Active Speedometer Asset (Default to Silver Spot)
  const [selectedSpeedometerAsset, setSelectedSpeedometerAsset] = useState<string>("SILVER");

  // Active Modals & Selected Assets
  const [selectedCalendarEvent, setSelectedCalendarEvent] =
    useState<UpcomingEconomicEvent | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] =
    useState<TodayReleasedNewsItem | null>(null);
  const [selectedStockAsset, setSelectedStockAsset] =
    useState<SearchableAssetItem | null>(null);

  // Calendar country filter
  const [calendarFilter, setCalendarFilter] = useState<
    "ALL" | "US" | "GERMANY" | "UK" | "JAPAN" | "EUROZONE"
  >("ALL");

  // Live German Time (CEST) ticker
  const [germanTime, setGermanTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/Berlin",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };
      setGermanTime(
        new Intl.DateTimeFormat("en-US", options).format(now) + " CEST (Berlin)"
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered upcoming events
  const filteredEvents = useMemo(() => {
    return UPCOMING_TWO_WEEKS_EVENTS.filter((e) => {
      if (calendarFilter === "ALL") return true;
      return e.country === calendarFilter;
    });
  }, [calendarFilter]);

  const handleSelectTickerFromSidebar = (ticker: string) => {
    const upper = ticker.toUpperCase();
    if (upper.includes("SILVER") || upper.includes("XAG")) {
      setSelectedSpeedometerAsset("SILVER");
    } else if (upper.includes("GOLD") || upper.includes("XAU")) {
      setSelectedSpeedometerAsset("GOLD");
    } else if (upper.includes("NQ") || upper.includes("QQQ") || upper.includes("NASDAQ")) {
      setSelectedSpeedometerAsset("NQ");
    } else if (upper.includes("DAX") || upper.includes("GER40")) {
      setSelectedSpeedometerAsset("DAX");
    } else if (upper.includes("NVDA") || upper.includes("NVIDIA")) {
      setSelectedSpeedometerAsset("NVDA");
    }

    const found = SEARCHABLE_ASSETS_DATABASE.find(
      (a) => a.ticker.toUpperCase() === upper
    );
    if (found) {
      setSelectedStockAsset(found);
    }
  };

  return (
    <div className="space-y-6" id="easy-market-trader-dashboard-root">
      {/* 1. TOP GLOBAL RIBBON: GERMAN TIME + GRANDPA MODE TOGGLE + LIVE INTELLIGENCE SEARCH */}
      <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FERRP REAL-TIME MARKET RADAR</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
                🇩🇪 German Timezone (CEST &bull; Berlin)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Financial Event Risk & Multi-Timeframe Gauges</span>
            </h2>

            <p className="text-xs text-slate-400 max-w-3xl">
              {isGrandpaMode
                ? "👵 Plain English Mode Active: Complex market jargon is translated into clear explanations with concrete news catalyst drivers and math models."
                : "Multi-horizon quantitative analysis for Silver, Gold, Nasdaq 100, DAX 40, and Equities with verified rationale."}
            </p>
          </div>

          {/* Right Controls: Mode Toggle & Glossary */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Grandpa / Simple Mode Switcher */}
            <div className="p-1.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setIsGrandpaMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isGrandpaMode
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>👵</span>
                <span>Plain English Mode</span>
              </button>

              <button
                onClick={() => setIsGrandpaMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isGrandpaMode
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>💼</span>
                <span>Institutional Analyst</span>
              </button>
            </div>

            {/* Jargon Glossary Button */}
            <button
              onClick={() => setIsJargonModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Financial Lexicon</span>
            </button>

            {/* German Live Clock Display */}
            <div className="p-2.5 rounded-2xl bg-black/70 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center justify-end space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Berlin Local Time:</span>
              </div>
              <div className="text-emerald-400 font-mono font-bold text-xs mt-0.5">
                {germanTime || "Loading German timezone..."}
              </div>
            </div>
          </div>
        </div>

        {/* Live Stock Intelligence Search Bar */}
        <LiveStockIntelligenceSearchBar
          onSelectAsset={(asset) => {
            setSelectedStockAsset(asset);
            handleSelectTickerFromSidebar(asset.ticker);
          }}
        />
      </div>

      {/* 2. GLOBAL MARKET WATCHLIST SIDEBAR COMPONENT */}
      <GlobalMarketWatchlistSidebar
        onSelectTicker={handleSelectTickerFromSidebar}
      />

      {/* 3. PROMINENT TECHNICAL SPEEDOMETER GAUGES */}
      <TechnicalSpeedometerGauges
        isGrandpaMode={isGrandpaMode}
        selectedAssetSymbol={selectedSpeedometerAsset}
        onOpenJargonModal={() => setIsJargonModalOpen(true)}
      />

      {/* 4. STOCK EVENTS WATCHLIST & PROVEN HISTORICAL BACKTEST PROOF TABLE */}
      <StockEventsWatchlistTable
        isGrandpaMode={isGrandpaMode}
        onSelectStock={(ticker) => handleSelectTickerFromSidebar(ticker)}
        onOpenJargonModal={() => setIsJargonModalOpen(true)}
      />

      {/* 5. CONGRESSIONAL STOCK ACT & INSIDER DISCLOSURES */}
      <PoliticalInsiderTrackingModule
        onSelectTicker={handleSelectTickerFromSidebar}
      />

      {/* 6. MAIN 2-COLUMN SPLIT LAYOUT: 2-WEEK CALENDAR BESIDE THE NEWS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 2-WEEK UPCOMING NEWS & CENTRAL BANK CALENDAR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    2-Week Event & Central Bank Calendar
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  All upcoming high-impact releases mapped to German local time (CEST).
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-100">
                {filteredEvents.length} Events
              </span>
            </div>

            {/* Country Filters */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "ALL", label: "All Regions" },
                { id: "US", label: "🇺🇸 United States" },
                { id: "GERMANY", label: "🇩🇪 Germany" },
                { id: "UK", label: "🇬🇧 United Kingdom" },
                { id: "JAPAN", label: "🇯🇵 Japan" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCalendarFilter(c.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    calendarFilter === c.id
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Event List Items */}
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedCalendarEvent(evt)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-2 group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-base">{evt.flagEmoji}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                          {evt.category}
                        </span>
                        {evt.impactLevel === "HIGH" && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            HIGH VOLATILITY
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                        {evt.eventName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800 flex items-center space-x-1">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>

                  {/* German Date & Time */}
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{evt.germanDateTimeCest}</span>
                  </div>

                  {/* Forecast vs Previous Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">Consensus Forecast:</span>
                      <span className="font-bold text-slate-800 text-xs">{evt.consensusForecast}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">Previous Value:</span>
                      <span className="font-bold text-slate-800 text-xs">{evt.previousValue}</span>
                    </div>
                  </div>

                  {/* Target Price Reaction Indicator */}
                  <div className="p-2 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] font-mono text-indigo-950 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold">{evt.estimatedTargetDropOrGain}</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-sans underline group-hover:text-indigo-800">
                      View Bank Forecasts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY'S LIVE NEWS + BIG DEALS */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: TODAY'S LIVE & RECENTLY RELEASED NEWS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Today's Live News & Catalyst Feed (Beat / Miss Monitor)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Green = Better than expectation (Upside expansion) &bull; Red = Below consensus (Disappointment dip).
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {TODAY_RELEASED_NEWS_FEED.map((news) => {
                const isGreen = news.isMarketPositive;

                return (
                  <div
                    key={news.id}
                    onClick={() => setSelectedNewsItem(news)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 hover:shadow-xs ${
                      isGreen
                        ? "bg-emerald-50/50 border-emerald-200/80 hover:border-emerald-400"
                        : "bg-rose-50/50 border-rose-200/80 hover:border-rose-400"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-lg">{news.flagEmoji}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isGreen
                              ? "bg-emerald-200 text-emerald-900 border border-emerald-300"
                              : "bg-rose-200 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {news.outcomeType.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {news.releasedTimeCest}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold flex items-center space-x-1">
                        {isGreen ? (
                          <span className="text-emerald-700 flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{news.marketReactionNasdaq}</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center space-x-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>{news.marketReactionNasdaq}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm font-sans">
                      {news.headline}
                    </h4>

                    {/* Actual vs Forecast vs Previous Data Values */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white/90 border border-slate-200/70 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Actual:</span>
                        <span
                          className={`font-bold text-sm ${
                            isGreen ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {news.actualValue}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Expected:</span>
                        <span className="font-bold text-slate-700 text-sm">
                          {news.consensusValue}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Previous:</span>
                        <span className="font-bold text-slate-500 text-sm">
                          {news.previousValue}
                        </span>
                      </div>
                    </div>

                    {/* Target Price Reaction */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-xs">
                      <div className="font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{news.predictedTargetRange}</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-semibold hover:underline">
                        Details & Social Media Buzz &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: CORPORATE BIG DEALS & PARTNERSHIPS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Corporate Contracts & Strategic Partnerships (Big Deals)
                </h3>
                <p className="text-xs text-slate-500">
                  High-value defense contracts, hyperscaler AI infrastructure partnerships, and enterprise awards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CORPORATE_BIG_DEALS_FEED.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-mono font-bold">
                      {deal.ticker} &bull; {deal.dealValueBillions}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {deal.announcementDate}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs font-sans">
                    {deal.dealTitle}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    {deal.summary}
                  </p>

                  <div className="pt-1 text-[10px] font-mono font-bold text-emerald-800">
                    Impact: {deal.expectedPriceImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. MODALS */}
      <NewsEventDetailModal
        event={selectedCalendarEvent}
        newsItem={selectedNewsItem}
        onClose={() => {
          setSelectedCalendarEvent(null);
          setSelectedNewsItem(null);
        }}
      />

      <StockSearchDetailModal
        asset={selectedStockAsset}
        onClose={() => setSelectedStockAsset(null)}
      />

      <PlainLanguageJargonExplainerModal
        isOpen={isJargonModalOpen}
        onClose={() => setIsJargonModalOpen(false)}
      />
    </div>
  );
};
