import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  STOCK_PRE_MARKET_DATABASE,
  StockPreMarketProfile,
  QUICK_ALL_SYMBOLS_SEARCH_LIST,
  EUR_USD_RATE,
  getStockPreMarketProfile
} from "../data/stockPreMarketData";
import { StockPreMarketChart } from "./StockPreMarketChart";
import { YahooFinanceOmniSearch } from "./YahooFinanceOmniSearch";
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Bell,
  Sliders,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Activity
} from "lucide-react";

interface StockPreMarketTerminalProps {
  initialTicker?: string;
}

export const StockPreMarketTerminal: React.FC<StockPreMarketTerminalProps> = ({
  initialTicker = "MSFT"
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPendingSearch, startSearchTransition] = useTransition();
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All"
  >("1D");
  const [timezoneDisplay, setTimezoneDisplay] = useState<"LOCAL" | "DUAL" | "CET" | "ET">("DUAL");
  const [showEuroValues, setShowEuroValues] = useState<boolean>(true);

  // Live Continuous Pre-Market Simulation State
  const [livePriceOffset, setLivePriceOffset] = useState<number>(0);
  const [liveVolumeAdded, setLiveVolumeAdded] = useState<number>(0);
  const [tickCounter, setTickCounter] = useState<number>(0);
  const [localClockTime, setLocalClockTime] = useState<string>("");
  const [germanClockTime, setGermanClockTime] = useState<string>("");
  const [usClockTime, setUsClockTime] = useState<string>("");

  // Detect and resolve user's local browser timezone
  const browserTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const browserTimeZoneAbbr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZoneName: "short"
      }).formatToParts(new Date());
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      return tzPart ? tzPart.value : browserTimeZone;
    } catch {
      return browserTimeZone;
    }
  }, [browserTimeZone]);

  // Sync with initialTicker prop when changed externally
  useEffect(() => {
    if (initialTicker) {
      setSelectedTicker(initialTicker.toUpperCase());
    }
  }, [initialTicker]);

  // Live ticking clocks for Browser Local Timezone, German/EU Time (Europe/Berlin), and US Time (America/New_York)
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      try {
        // 1. Browser Local Timezone (Intl.DateTimeFormat with resolved user locale)
        const localFormatter = new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        });
        setLocalClockTime(localFormatter.format(now));

        // 2. European / German Session Time (Europe/Berlin)
        const germanStr = new Intl.DateTimeFormat("de-DE", {
          timeZone: "Europe/Berlin",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }).format(now);
        setGermanClockTime(germanStr);

        // 3. US Session Time (America/New_York)
        const usStr = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short",
        }).format(now);
        setUsClockTime(usStr);
      } catch {
        const fallback = now.toLocaleTimeString();
        setLocalClockTime(fallback);
        setGermanClockTime(fallback);
        setUsClockTime(fallback);
      }
    };

    updateClocks();
    const clockInterval = setInterval(updateClocks, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Continuous 24/7 Global Pre-Open Market Simulation Tick Stream
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Small jitter simulating continuous institutional pre-market order flow
      const delta = (Math.random() - 0.48) * 0.15;
      setLivePriceOffset((prev) => Number((prev + delta).toFixed(2)));
      setLiveVolumeAdded((prev) => prev + Math.floor(Math.random() * 250 + 50));
      setTickCounter((c) => c + 1);
    }, 1500);

    return () => clearInterval(tickInterval);
  }, [selectedTicker]);

  // Safe Profile Getter (Guarantees zero crashes)
  const baseProfile: StockPreMarketProfile = useMemo(() => {
    return getStockPreMarketProfile(selectedTicker);
  }, [selectedTicker]);

  // Profile combined with live simulated stream & localized session times
  const profile: StockPreMarketProfile = useMemo(() => {
    const prePrice = Number((baseProfile.preMarketPrice + livePriceOffset).toFixed(2));
    const preChange = Number((prePrice - baseProfile.regularPrice).toFixed(2));
    const preChangePct = Number(((preChange / baseProfile.regularPrice) * 100).toFixed(2));
    const eurRate = baseProfile.eurExchangeRate;

    return {
      ...baseProfile,
      preMarketPrice: prePrice,
      preMarketChange: preChange,
      preMarketChangePct: preChangePct,
      preMarketPriceEUR: Number((prePrice * eurRate).toFixed(2)),
      volume: baseProfile.volume + liveVolumeAdded,
      dayHighUSD: Math.max(baseProfile.dayHighUSD, prePrice),
      dayLowUSD: Math.min(baseProfile.dayLowUSD, prePrice),
      dayHighEUR: Number((Math.max(baseProfile.dayHighUSD, prePrice) * eurRate).toFixed(2)),
      dayLowEUR: Number((Math.min(baseProfile.dayLowUSD, prePrice) * eurRate).toFixed(2)),
      bidUSD: Number((prePrice - 0.04).toFixed(2)),
      askUSD: Number((prePrice + 0.04).toFixed(2)),
      preMarketTimeCET: germanClockTime || baseProfile.preMarketTimeCET,
      preMarketTimeET: usClockTime || baseProfile.preMarketTimeET,
    };
  }, [baseProfile, livePriceOffset, liveVolumeAdded, germanClockTime, usClockTime]);

  const isRegularPositive = profile.regularChange >= 0;
  const isPreMarketPositive = profile.preMarketChange >= 0;

  const handleOpenSearchModal = () => {
    // Non-blocking transition check
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        startSearchTransition(() => {
          setIsSearchOpen(true);
        });
      });
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <div
      id="stock-pre-market-terminal"
      className="bg-[#0f172a] text-slate-100 min-h-screen p-3 sm:p-6 space-y-5 selection:bg-indigo-500 selection:text-white"
    >
      {/* Omni Search Modal */}
      <YahooFinanceOmniSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSymbol={(ticker) => {
          setSelectedTicker(ticker);
          setLivePriceOffset(0);
          setLiveVolumeAdded(0);
          setIsSearchOpen(false);
        }}
      />

      {/* Top Global Navigation / Search Bar Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e293b]/90 border border-slate-700/80 p-3 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            {profile.ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {profile.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                {profile.ticker}
              </span>
              <span className="text-lg">{profile.flag}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {profile.exchange} &bull; Currency in {profile.currency} &bull; Local & European Session Mode
            </p>
          </div>
        </div>

        {/* Search Omnibox Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            id="open-omni-search-trigger"
            onClick={handleOpenSearchModal}
            className="flex items-center gap-3 px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all shadow-inner group cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
            <span className="text-slate-400">Search symbols (e.g. 'm', 'microsoft', 'crude')...</span>
            <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono border border-slate-700">
              Press 🔍
            </kbd>
          </button>

          {/* Timezone Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setTimezoneDisplay("LOCAL")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timezoneDisplay === "LOCAL"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={`Browser Local Timezone (${browserTimeZone})`}
            >
              🌐 Local ({browserTimeZoneAbbr})
            </button>
            <button
              onClick={() => setTimezoneDisplay("DUAL")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timezoneDisplay === "DUAL"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Show Local/German and US EDT timestamps"
            >
              🇩🇪 EU + 🇺🇸 US
            </button>
            <button
              onClick={() => setTimezoneDisplay("CET")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timezoneDisplay === "CET"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇩🇪 CET/MESZ
            </button>
          </div>

          {/* Star Favorite Button */}
          <button
            onClick={() => setIsStarred(!isStarred)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isStarred
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
            }`}
            title="Add to Watchlist"
          >
            <Star className={`w-4 h-4 ${isStarred ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* European & Global Session Status Banner with Accurate Local Timestamps */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            24/7 GLOBAL PRE-OPEN SESSION ACTIVE
          </span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-indigo-300 font-semibold">
            🌐 Local: {localClockTime || "Synchronizing..."}
          </span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-emerald-300 font-medium">
            🇩🇪 Frankfurt/Berlin: {germanClockTime || "Synchronizing..."}
          </span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-slate-300">
            🇺🇸 New York: {usClockTime || "Synchronizing..."}
          </span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-slate-400 text-[11px]">
            Ticks: #{tickCounter}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>EUR/USD: 1 USD = 0.9258 EUR</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">1 EUR = 1.0801 USD</span>
        </div>
      </div>

      {/* Quick Switch Watchlist Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold shrink-0">Popular in Pre-Market:</span>
        {QUICK_ALL_SYMBOLS_SEARCH_LIST.slice(0, 9).map((item) => {
          const isSelected = item.ticker === selectedTicker;
          const isPos = item.changePct >= 0;
          return (
            <button
              key={item.ticker}
              onClick={() => setSelectedTicker(item.ticker)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600/30 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800"
              }`}
            >
              <span>{item.flag}</span>
              <span className="font-bold">{item.ticker}</span>
              <span className="text-slate-400">${item.prePrice.toFixed(2)}</span>
              <span className="text-emerald-400 text-[11px]">(€{item.priceEUR.toFixed(2)})</span>
              <span className={`font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                {isPos ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary Section: Dual Price Display + Dividend Notification Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Main Dual Price Display + Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Price Card */}
          <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Regular Market Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {profile.regularPrice.toFixed(2)}
                  </span>
                  <div
                    className={`flex items-center text-base sm:text-lg font-mono font-bold ${
                      isRegularPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isRegularPositive ? "+" : ""}
                    {profile.regularChange.toFixed(2)} ({isRegularPositive ? "+" : ""}
                    {profile.regularChangePct.toFixed(2)}%)
                  </div>
                </div>

                {/* Euro converted price in small font */}
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    €{profile.regularPriceEUR.toFixed(2)} EUR
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (German Base Rate @ {EUR_USD_RATE} EUR/$)
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-mono mt-1">
                  At close: {profile.regularCloseTimeET}
                  {timezoneDisplay !== "ET" && (
                    <span className="block text-slate-500 font-sans mt-0.5">
                      European session: {profile.regularCloseTimeCET}
                    </span>
                  )}
                </p>
              </div>

              {/* Pre-Market Price Highlight (Crucial for Germany & European Session) */}
              <div className="bg-[#0f172a]/90 border border-indigo-500/40 rounded-xl p-3.5 space-y-1 min-w-[240px]">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    PRE-MARKET (VORBÖRSE)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {germanClockTime ? `${germanClockTime.slice(0, 5)} EU` : "Active"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {profile.preMarketPrice.toFixed(2)}
                  </span>
                  <div
                    className={`flex items-center text-sm font-mono font-bold ${
                      isPreMarketPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPreMarketPositive ? "+" : ""}
                    {profile.preMarketChange.toFixed(2)} ({isPreMarketPositive ? "+" : ""}
                    {profile.preMarketChangePct.toFixed(2)}%)
                  </div>
                </div>

                {/* Pre-market Euro Price in small font */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    €{profile.preMarketPriceEUR.toFixed(2)} EUR
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    &bull; Session: {profile.preMarketTimeCET || profile.preMarketTimeET}
                  </span>
                </div>
              </div>
            </div>

            {/* Dividend & Corporate Action Notification Banner */}
            {profile.dividendAnnouncementBanner && (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="font-semibold text-amber-300">Dividend:</strong>{" "}
                    {profile.dividendAnnouncementBanner.text}{" "}
                    <span className="text-emerald-300 font-mono font-semibold">
                      (€{profile.dividendAnnouncementBanner.payoutAmountEUR.toFixed(2)} / Share)
                    </span>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-900/60 text-[11px] font-mono text-amber-300 font-bold shrink-0">
                  Ex-Date: {profile.dividendAnnouncementBanner.exDate}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Chart with Pre-Market & Regular Sessions */}
          <StockPreMarketChart
            profile={profile}
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
            timezoneDisplay={timezoneDisplay === "LOCAL" ? "CET" : timezoneDisplay}
            showEuroValues={showEuroValues}
          />
        </div>

        {/* Right 1 Col: Key Fundamentals Matrix */}
        <div className="space-y-4">
          <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Key Statistics & Fundamentals
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                EUR & USD View
              </span>
            </div>

            {/* Dual Column Stats Grid */}
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {/* Previous Close */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Previous Close</span>
                <div className="text-right">
                  <span className="font-bold text-white">${profile.prevCloseUSD.toFixed(2)}</span>
                  <span className="text-[11px] text-emerald-400 ml-1.5">
                    (€{profile.prevCloseEUR.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Open */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Open</span>
                <div className="text-right">
                  <span className="font-bold text-white">${profile.openUSD.toFixed(2)}</span>
                  <span className="text-[11px] text-emerald-400 ml-1.5">
                    (€{profile.openEUR.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Bid */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Bid</span>
                <span className="font-bold text-white">
                  ${profile.bidUSD.toFixed(2)} x {profile.bidSize}
                </span>
              </div>

              {/* Ask */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Ask</span>
                <span className="font-bold text-white">
                  ${profile.askUSD.toFixed(2)} x {profile.askSize}
                </span>
              </div>

              {/* Day's Range in USD and EUR */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Day's Range</span>
                <div className="text-right">
                  <div className="font-bold text-white">
                    ${profile.dayLowUSD.toFixed(2)} - ${profile.dayHighUSD.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    €{profile.dayLowEUR.toFixed(2)} - €{profile.dayHighEUR.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 52 Week Range in USD and EUR */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">52 Week Range</span>
                <div className="text-right">
                  <div className="font-bold text-white">
                    ${profile.fiftyTwoWeekLowUSD.toFixed(2)} - ${profile.fiftyTwoWeekHighUSD.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    €{profile.fiftyTwoWeekLowEUR.toFixed(2)} - €{profile.fiftyTwoWeekHighEUR.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Volume</span>
                <span className="font-bold text-white">{profile.volume.toLocaleString()}</span>
              </div>

              {/* Avg. Volume */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Avg. Volume</span>
                <span className="font-bold text-white">
                  {profile.avgVolume3Month.toLocaleString()}
                </span>
              </div>

              {/* Market Cap */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Market Cap</span>
                <div className="text-right">
                  <span className="font-bold text-white">{profile.marketCapUSD}</span>
                  <span className="text-[11px] text-emerald-400 ml-1.5">
                    ({profile.marketCapEUR})
                  </span>
                </div>
              </div>

              {/* Beta (5Y Monthly) */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Beta (5Y Monthly)</span>
                <span className="font-bold text-white">{profile.beta5Y.toFixed(2)}</span>
              </div>

              {/* PE Ratio (TTM) */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">PE Ratio (TTM)</span>
                <span className="font-bold text-white">
                  {profile.peRatioTTM > 0 ? profile.peRatioTTM.toFixed(2) : "N/A"}
                </span>
              </div>

              {/* EPS (TTM) */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">EPS (TTM)</span>
                <span className="font-bold text-white">
                  {profile.epsTTM > 0 ? `${profile.epsTTM.toFixed(2)}` : "N/A"}
                </span>
              </div>

              {/* Forward Dividend & Yield */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400">Forward Dividend & Yield</span>
                <div className="text-right">
                  <span className="font-bold text-white">
                    ${profile.forwardDividendRateUSD.toFixed(2)} (
                    {profile.forwardDividendYieldPct.toFixed(2)}%)
                  </span>
                  <span className="text-[10px] text-emerald-400 block">
                    €{profile.forwardDividendRateEUR.toFixed(2)} EUR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related News Card */}
          <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Latest Catalyst & Headlines
            </h4>
            <div className="space-y-2">
              {profile.news.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 transition-all"
                >
                  <h5 className="text-xs font-semibold text-slate-200 leading-snug">
                    {item.headline}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span className="text-indigo-300 font-medium">{item.source}</span>
                    <span>{item.publishedTime}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
