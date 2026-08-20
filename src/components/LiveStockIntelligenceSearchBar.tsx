import React, { useState, useRef, useEffect } from "react";
import {
  SEARCHABLE_ASSETS_DATABASE,
  POLITICIAN_TRADING_LEDGER,
  CORPORATE_BIG_DEALS_FEED,
  TODAY_RELEASED_NEWS_FEED,
  SearchableAssetItem
} from "../data/marketIntelligenceData";
import { STOCK_CATALYST_WATCHLIST_DATA } from "../data/stockCatalystWatchlistData";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Building,
  Twitter,
  Target,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  X,
  Compass,
  FileText,
  AlertCircle
} from "lucide-react";

interface LiveStockIntelligenceSearchBarProps {
  onSelectAsset?: (asset: SearchableAssetItem) => void;
  selectedAsset?: SearchableAssetItem | null;
}

export const LiveStockIntelligenceSearchBar: React.FC<LiveStockIntelligenceSearchBarProps> = ({
  onSelectAsset,
  selectedAsset: initialSelected
}) => {
  const [query, setQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [activeAsset, setActiveAsset] = useState<SearchableAssetItem | null>(
    initialSelected || SEARCHABLE_ASSETS_DATABASE[0] // Default to NVDA
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter assets by query
  const searchResults = SEARCHABLE_ASSETS_DATABASE.filter(
    (asset) =>
      asset.ticker.toLowerCase().includes(query.toLowerCase()) ||
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.sector.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (asset: SearchableAssetItem) => {
    setActiveAsset(asset);
    setIsDropdownOpen(false);
    setQuery("");
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  // Find related politician trades for active asset
  const relatedPoliticians = activeAsset
    ? POLITICIAN_TRADING_LEDGER.filter(
        (p) => p.ticker.toUpperCase() === activeAsset.ticker.toUpperCase()
      )
    : [];

  // Find related corporate deals
  const relatedDeals = activeAsset
    ? CORPORATE_BIG_DEALS_FEED.filter(
        (d) => d.ticker.toUpperCase() === activeAsset.ticker.toUpperCase()
      )
    : [];

  // Find catalyst watchlist item
  const catalystItem = activeAsset
    ? STOCK_CATALYST_WATCHLIST_DATA.find(
        (c) => c.ticker.toUpperCase() === activeAsset.ticker.toUpperCase()
      )
    : null;

  // Find latest news items
  const recentNews = activeAsset
    ? TODAY_RELEASED_NEWS_FEED.filter(
        (n) =>
          n.headline.toLowerCase().includes(activeAsset.ticker.toLowerCase()) ||
          n.headline.toLowerCase().includes(activeAsset.name.toLowerCase()) ||
          n.keyTakeaway.toLowerCase().includes(activeAsset.name.toLowerCase())
      )
    : [];

  const isPositive = activeAsset ? activeAsset.changePct >= 0 : true;

  // Quick ticker shortcut buttons
  const quickPills = [
    { ticker: "NVDA", label: "Nvidia" },
    { ticker: "NQ", label: "Nasdaq" },
    { ticker: "PLTR", label: "Palantir" },
    { ticker: "GOLD", label: "Gold" },
    { ticker: "SILVER", label: "Silver" },
    { ticker: "SPX", label: "S&P 500" },
    { ticker: "DAX", label: "DAX 40" },
    { ticker: "MSFT", label: "Microsoft" },
    { ticker: "AAPL", label: "Apple" },
    { ticker: "TSLA", label: "Tesla" },
    { ticker: "LMT", label: "Lockheed" }
  ];

  return (
    <div id="live-stock-intelligence-search-bar" className="space-y-4" ref={containerRef}>
      {/* Search Input Bar with autocomplete */}
      <div className="relative">
        <div className="bg-white border-2 border-indigo-500/30 hover:border-indigo-500 focus-within:border-indigo-600 rounded-2xl shadow-md p-2 flex items-center gap-2 transition-all">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Live Stock Intelligence: Search any ticker (NVDA, PLTR, GOLD, SILVER, DAX, MSFT)..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-500 font-semibold shrink-0">
            <span>LIVE CONSOLIDATED</span>
          </div>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase shrink-0">
            Popular:
          </span>
          {quickPills.map((pill) => {
            const found = SEARCHABLE_ASSETS_DATABASE.find(
              (a) => a.ticker.toUpperCase() === pill.ticker.toUpperCase()
            );
            const isCurrent = activeAsset?.ticker.toUpperCase() === pill.ticker.toUpperCase();
            return (
              <button
                key={pill.ticker}
                onClick={() => found && handleSelect(found)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {pill.ticker} ({pill.label})
              </button>
            );
          })}
        </div>

        {/* Dropdown Suggestions List */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {searchResults.map((asset) => {
              const isPos = asset.changePct >= 0;
              return (
                <div
                  key={asset.ticker}
                  onClick={() => handleSelect(asset)}
                  className="p-3 hover:bg-indigo-50/70 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{asset.flagEmoji}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {asset.ticker}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {asset.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {asset.exchange} &bull; {asset.sector}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900">
                      ${asset.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        isPos ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {asset.changePct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consolidated Live Stock Intelligence Card */}
      {activeAsset && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-200">
          {/* Top Banner Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-2xl">{activeAsset.flagEmoji}</span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                  {activeAsset.exchange} : {activeAsset.ticker}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                  {activeAsset.sector}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeAsset.name}
              </h3>
              <div className="text-xs text-slate-400">
                Consolidated Live Intelligence &bull; Politician Disclosures &bull; Social Sentiment &bull; Government Contracts
              </div>
            </div>

            {/* Price & Signal Block */}
            <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  ${activeAsset.price.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-mono font-bold flex items-center ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {activeAsset.changePct.toFixed(2)}% (24h)
                </div>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                  activeAsset.overallSignal === "STRONG_BUY"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : activeAsset.overallSignal === "BUY"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {activeAsset.overallSignal.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* 4-Quadrant Consolidated Intelligence Matrix */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* QUADRANT 1: News Sentiment & Analyst Consensus (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>News Sentiment & Analyst Target</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Score: {activeAsset.sentimentScore}/100
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">Analyst Consensus:</div>
                <div className="text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                  {activeAsset.analystConsensus} (Avg Target: ${activeAsset.targetPriceAvg.toFixed(2)})
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">Latest High-Impact Headline:</div>
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed font-sans">
                  "{activeAsset.latestHeadline}"
                </div>
              </div>
            </div>

            {/* QUADRANT 2: Social Media Mentions & Buzz (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <span>Social Media & Expert Buzz (X / Fintwit)</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  High Volume Viral
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-900">@MacroTechAlpha (Institutional Desk)</span>
                  <span className="font-mono text-emerald-600 font-bold">BULLISH &bull; 42k views</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  "${activeAsset.ticker} institutional orderbook depth confirms massive accumulation ahead of upcoming catalyst. Risk/Reward highly skewed to the upside."
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  1,420 Reposts &bull; 8,910 Likes &bull; 15 mins ago
                </div>
              </div>
            </div>

            {/* QUADRANT 3: Politician Trading Activity (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Congressional STOCK Act Filings</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {relatedPoliticians.length} Public Disclosures
                </span>
              </div>

              {relatedPoliticians.length > 0 ? (
                <div className="space-y-2">
                  {relatedPoliticians.map((pol) => (
                    <div
                      key={pol.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {pol.politicianName} ({pol.party === "DEMOCRAT" ? "Dem" : "Rep"}-{pol.state})
                        </span>
                        <span
                          className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md ${
                            pol.transactionType === "PURCHASE" || pol.transactionType === "OPTION_CALL"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {pol.transactionType.replace(/_/g, " ")} ({pol.amountRange})
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {pol.tradeRationaleContext}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                        Performance Since Filing: <strong className="text-emerald-600">{pol.subsequentPricePerformance}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No direct congressional trading disclosures recorded in the last 60 days.
                </div>
              )}
            </div>

            {/* QUADRANT 4: Major Deals & Government Contracts (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Major Deals & Government Defense Awards</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active Contracts
                </span>
              </div>

              {relatedDeals.length > 0 ? (
                <div className="space-y-2">
                  {relatedDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{deal.dealTitle}</span>
                        <span className="font-mono font-bold text-xs text-indigo-600">
                          {deal.dealValueBillions}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{deal.summary}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                        <span>Partner: {deal.counterpartyOrAgency}</span>
                        <span className="text-emerald-600 font-bold">{deal.expectedPriceImpact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Secured enterprise and commercial supply chain partnerships active.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
