import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  X,
  Radio,
  Sliders
} from "lucide-react";

export interface WatchlistMarketItem {
  id: string;
  ticker: string;
  name: string;
  category: "INDEX" | "COMMODITY" | "CRYPTO" | "EUROPEAN";
  flagEmoji: string;
  currentPrice: number;
  priceFormatted: string;
  change24hPct: number;
  change24hVal: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  exchangeName: string;
  localTimezone: string;
  // Session hours in German Time (CEST - UTC+2)
  germanOpenHour: number; // e.g. 15 for 15:30 (15.5)
  germanOpenMin: number;
  germanCloseHour: number;
  germanCloseMin: number;
  preMarketOpenHour?: number;
  preMarketOpenMin?: number;
  is24hMarket?: boolean;
  keyCatalystNote: string;
}

const GLOBAL_WATCHLIST_DATA: WatchlistMarketItem[] = [
  {
    id: "NQ",
    ticker: "NQ / QQQ",
    name: "Nasdaq 100",
    category: "INDEX",
    flagEmoji: "🇺🇸",
    currentPrice: 19842.50,
    priceFormatted: "19,842.50",
    change24hPct: 1.48,
    change24hVal: 289.50,
    high24h: 19910.00,
    low24h: 19580.00,
    sparkline: [19580, 19620, 19690, 19650, 19740, 19810, 19790, 19842.50],
    exchangeName: "NASDAQ / CME Futures",
    localTimezone: "America/New_York",
    germanOpenHour: 15,
    germanOpenMin: 30,
    germanCloseHour: 22,
    germanCloseMin: 0,
    preMarketOpenHour: 10,
    preMarketOpenMin: 0,
    keyCatalystNote: "Leading mega-cap semiconductor surge post-Retail Sales beat"
  },
  {
    id: "SPX",
    ticker: "ES / SPY",
    name: "S&P 500 Index",
    category: "INDEX",
    flagEmoji: "🇺🇸",
    currentPrice: 5584.20,
    priceFormatted: "5,584.20",
    change24hPct: 0.92,
    change24hVal: 50.80,
    high24h: 5596.50,
    low24h: 5520.00,
    sparkline: [5520, 5535, 5550, 5542, 5565, 5578, 5570, 5584.20],
    exchangeName: "CBOE / NYSE",
    localTimezone: "America/New_York",
    germanOpenHour: 15,
    germanOpenMin: 30,
    germanCloseHour: 22,
    germanCloseMin: 0,
    preMarketOpenHour: 10,
    preMarketOpenMin: 0,
    keyCatalystNote: "Broad market participation breaking above 5,550 resistance"
  },
  {
    id: "GOLD",
    ticker: "XAU / USD",
    name: "Gold Spot",
    category: "COMMODITY",
    flagEmoji: "🟡",
    currentPrice: 2498.40,
    priceFormatted: "$2,498.40",
    change24hPct: 0.85,
    change24hVal: 21.10,
    high24h: 2508.00,
    low24h: 2472.00,
    sparkline: [2472, 2480, 2478, 2488, 2492, 2490, 2495, 2498.40],
    exchangeName: "COMEX / Global Spot",
    localTimezone: "Europe/London",
    germanOpenHour: 0,
    germanOpenMin: 0,
    germanCloseHour: 23,
    germanCloseMin: 59,
    is24hMarket: true,
    keyCatalystNote: "Real yield compression fueling all-time high consolidation"
  },
  {
    id: "SILVER",
    ticker: "XAG / USD",
    name: "Silver Spot",
    category: "COMMODITY",
    flagEmoji: "⚪",
    currentPrice: 29.85,
    priceFormatted: "$29.85",
    change24hPct: 1.95,
    change24hVal: 0.57,
    high24h: 30.15,
    low24h: 29.10,
    sparkline: [29.10, 29.25, 29.40, 29.35, 29.60, 29.75, 29.70, 29.85],
    exchangeName: "COMEX / Global Spot",
    localTimezone: "Europe/London",
    germanOpenHour: 0,
    germanOpenMin: 0,
    germanCloseHour: 23,
    germanCloseMin: 59,
    is24hMarket: true,
    keyCatalystNote: "Industrial photovoltaic demand & clean energy silver deficit"
  },
  {
    id: "DAX",
    ticker: "DAX 40",
    name: "German DAX Index",
    category: "EUROPEAN",
    flagEmoji: "🇩🇪",
    currentPrice: 18485.20,
    priceFormatted: "18,485.20",
    change24hPct: 0.76,
    change24hVal: 139.40,
    high24h: 18520.00,
    low24h: 18340.00,
    sparkline: [18340, 18380, 18420, 18400, 18450, 18475, 18460, 18485.20],
    exchangeName: "Frankfurt XETRA",
    localTimezone: "Europe/Berlin",
    germanOpenHour: 9,
    germanOpenMin: 0,
    germanCloseHour: 17,
    germanCloseMin: 30,
    keyCatalystNote: "ECB rate cut signaling lifts industrial exporters & SAP"
  },
  {
    id: "FTSE",
    ticker: "FTSE 100",
    name: "London FTSE",
    category: "EUROPEAN",
    flagEmoji: "🇬🇧",
    currentPrice: 8325.80,
    priceFormatted: "8,325.80",
    change24hPct: 0.62,
    change24hVal: 51.30,
    high24h: 8345.00,
    low24h: 8270.00,
    sparkline: [8270, 8285, 8305, 8295, 8315, 8320, 8318, 8325.80],
    exchangeName: "London Stock Exchange",
    localTimezone: "Europe/London",
    germanOpenHour: 9,
    germanOpenMin: 0,
    germanCloseHour: 17,
    germanCloseMin: 30,
    keyCatalystNote: "UK CPI disinflation print clears runway for Autumn BoE rate easing"
  },
  {
    id: "N225",
    ticker: "Nikkei 225",
    name: "Tokyo Nikkei",
    category: "INDEX",
    flagEmoji: "🇯🇵",
    currentPrice: 38062.50,
    priceFormatted: "38,062.50",
    change24hPct: 0.78,
    change24hVal: 294.00,
    high24h: 38250.00,
    low24h: 37600.00,
    sparkline: [37600, 37750, 37900, 37850, 38020, 38150, 38000, 38062.50],
    exchangeName: "Tokyo Stock Exchange",
    localTimezone: "Asia/Tokyo",
    germanOpenHour: 2,
    germanOpenMin: 0,
    germanCloseHour: 8,
    germanCloseMin: 30,
    keyCatalystNote: "Japan Q2 GDP surge (+3.1%) reaffirms wage-price expansion"
  },
  {
    id: "BTC",
    ticker: "BTC / USD",
    name: "Bitcoin Spot",
    category: "CRYPTO",
    flagEmoji: "⚡",
    currentPrice: 59420.00,
    priceFormatted: "$59,420.00",
    change24hPct: 2.35,
    change24hVal: 1365.00,
    high24h: 60200.00,
    low24h: 57800.00,
    sparkline: [57800, 58200, 58600, 58400, 59100, 59700, 59300, 59420],
    exchangeName: "Global 24/7 Spot",
    localTimezone: "UTC",
    germanOpenHour: 0,
    germanOpenMin: 0,
    germanCloseHour: 23,
    germanCloseMin: 59,
    is24hMarket: true,
    keyCatalystNote: "US institutional ETF accumulation & liquidity expansion"
  }
];

interface GlobalMarketWatchlistSidebarProps {
  onSelectTicker?: (ticker: string) => void;
}

export const GlobalMarketWatchlistSidebar: React.FC<GlobalMarketWatchlistSidebarProps> = ({
  onSelectTicker
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<"ALL" | "INDEX" | "COMMODITY" | "EUROPEAN" | "CRYPTO">("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [nowDate, setNowDate] = useState<Date>(new Date());

  // Clock tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute live German CEST Time
  const germanTimeDisplay = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(nowDate);
  }, [nowDate]);

  // Compute live ET Time
  const usEtTimeDisplay = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(nowDate);
  }, [nowDate]);

  // Helper to determine status and remaining time based on current German time
  const getMarketSessionState = (item: WatchlistMarketItem) => {
    if (item.is24hMarket) {
      return {
        status: "24H ACTIVE",
        statusColor: "bg-emerald-500 text-emerald-100 border-emerald-400",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500 animate-pulse",
        subtext: "Continuous 24/7 Global Trading"
      };
    }

    // Convert current time to German CEST decimal hour
    const berlinFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    });
    const parts = berlinFormatter.formatToParts(nowDate);
    const hourPart = parts.find((p) => p.type === "hour");
    const minPart = parts.find((p) => p.type === "minute");
    const currentHour = hourPart ? parseInt(hourPart.value, 10) : 15;
    const currentMin = minPart ? parseInt(minPart.value, 10) : 30;
    const currentMinutesOfDay = currentHour * 60 + currentMin;

    const openMinutes = item.germanOpenHour * 60 + item.germanOpenMin;
    const closeMinutes = item.germanCloseHour * 60 + item.germanCloseMin;
    const preOpenMinutes = item.preMarketOpenHour !== undefined
      ? item.preMarketOpenHour * 60 + (item.preMarketOpenMin || 0)
      : undefined;

    if (currentMinutesOfDay >= openMinutes && currentMinutesOfDay < closeMinutes) {
      const remainingMins = closeMinutes - currentMinutesOfDay;
      const h = Math.floor(remainingMins / 60);
      const m = remainingMins % 60;
      return {
        status: "OPEN",
        statusColor: "bg-emerald-600 text-white",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500 animate-pulse",
        subtext: `Closes in ${h > 0 ? `${h}h ` : ""}${m}m (at ${item.germanCloseHour.toString().padStart(2, "0")}:${item.germanCloseMin.toString().padStart(2, "0")} CEST)`
      };
    }

    if (preOpenMinutes !== undefined && currentMinutesOfDay >= preOpenMinutes && currentMinutesOfDay < openMinutes) {
      const remainingMins = openMinutes - currentMinutesOfDay;
      const h = Math.floor(remainingMins / 60);
      const m = remainingMins % 60;
      return {
        status: "PRE-MARKET",
        statusColor: "bg-amber-500 text-white",
        badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        dotColor: "bg-amber-500 animate-ping",
        subtext: `Regular Open in ${h > 0 ? `${h}h ` : ""}${m}m (15:30 CEST)`
      };
    }

    // Post Market or Closed
    if (item.category === "INDEX" && item.flagEmoji === "🇺🇸" && currentMinutesOfDay >= closeMinutes && currentMinutesOfDay < (closeMinutes + 240)) {
      return {
        status: "AFTER-HOURS",
        statusColor: "bg-indigo-600 text-white",
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dotColor: "bg-indigo-500",
        subtext: "US After-hours session active until 02:00 CEST"
      };
    }

    return {
      status: "CLOSED",
      statusColor: "bg-slate-500 text-white",
      badgeBg: "bg-slate-100 text-slate-600 border-slate-200",
      dotColor: "bg-slate-400",
      subtext: `Opens at ${item.germanOpenHour.toString().padStart(2, "0")}:${item.germanOpenMin.toString().padStart(2, "0")} CEST`
    };
  };

  const filteredItems = GLOBAL_WATCHLIST_DATA.filter((item) => {
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.ticker.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <aside
      id="global-market-watchlist-sidebar"
      className={`transition-all duration-300 ease-in-out bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden flex flex-col ${
        isOpen ? "w-full" : "w-full"
      }`}
    >
      {/* Header section */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Global Market Watchlist
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                LIVE GERMAN TIMELINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live operating status (Open / Closed / Pre-market) calibrated to CEST (Berlin)
            </p>
          </div>
        </div>

        {/* Live dual clocks */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 font-mono shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 font-sans font-medium">CEST (Local):</span>
            <span className="text-emerald-400 font-bold">{germanTimeDisplay}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 font-mono shadow-xs">
            <span className="text-slate-400 font-sans font-medium">New York:</span>
            <span className="text-indigo-300 font-bold">{usEtTimeDisplay} ET</span>
          </div>
        </div>
      </div>

      {/* Control bar: search & category pills */}
      <div className="bg-slate-50/90 p-3 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All Assets" },
            { id: "INDEX", label: "🇺🇸 US Indices (NQ, S&P)" },
            { id: "COMMODITY", label: "🟡 Precious Metals (Gold, Silver)" },
            { id: "EUROPEAN", label: "🇩🇪 European (DAX, FTSE)" },
            { id: "CRYPTO", label: "⚡ Crypto (24/7)" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search index, gold, silver..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Watchlist Grid / Table Cards */}
      <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {filteredItems.map((item) => {
          const session = getMarketSessionState(item);
          const isPositive = item.change24hPct >= 0;
          const rangeProgress = Math.max(
            0,
            Math.min(100, ((item.currentPrice - item.low24h) / (item.high24h - item.low24h || 1)) * 100)
          );

          return (
            <div
              key={item.id}
              onClick={() => onSelectTicker && onSelectTicker(item.id)}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Top card row: Ticker + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.flagEmoji}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{item.name}</span>
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        {item.ticker} &bull; {item.exchangeName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 border shrink-0 ${session.badgeBg}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${session.dotColor}`}></span>
                    <span>{session.status}</span>
                  </span>
                </div>

                {/* Subtext Operating Schedule */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mb-3">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{session.subtext}</span>
                </div>

                {/* Price and 24h Change */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {item.priceFormatted}
                    </div>
                    <div className="text-[10px] text-slate-400">Live Spot / Continuous Feed</div>
                  </div>

                  <div
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                      isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{isPositive ? "+" : ""}{item.change24hPct.toFixed(2)}%</span>
                  </div>
                </div>

                {/* 24h High / Low Range progress bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>L: {item.low24h.toLocaleString()}</span>
                    <span>H: {item.high24h.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${rangeProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Mini SVG Sparkline */}
                <div className="h-8 w-full flex items-end gap-1 mb-2">
                  {item.sparkline.map((val, idx) => {
                    const min = Math.min(...item.sparkline);
                    const max = Math.max(...item.sparkline);
                    const heightPct = Math.max(15, Math.min(100, ((val - min) / (max - min || 1)) * 100));
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t transition-all ${
                          isPositive ? "bg-emerald-400/50 group-hover:bg-emerald-500" : "bg-rose-400/50 group-hover:bg-rose-500"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom catalyst note */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-600">
                <span className="truncate pr-1">{item.keyCatalystNote}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
