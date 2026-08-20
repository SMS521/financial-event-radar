import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useDeferredValue,
  Component,
  ReactNode,
  ErrorInfo
} from "react";
import {
  Search,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  BookOpen,
  DollarSign,
  Clock,
  History,
  Zap,
  Trash2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import {
  QUICK_ALL_SYMBOLS_SEARCH_LIST,
  STOCK_PRE_MARKET_DATABASE,
  StockPreMarketProfile,
  getStockPreMarketProfile
} from "../data/stockPreMarketData";

interface YahooFinanceOmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (ticker: string) => void;
  initialQuery?: string;
}

interface SearchResultPayload {
  symbols: typeof QUICK_ALL_SYMBOLS_SEARCH_LIST;
  news: Array<{ id: string; ticker: string; title: string; source: string; time: string }>;
  research: Array<{ id: string; ticker: string; title: string; provider: string; time: string }>;
  fromCache?: boolean;
}

interface OmniSearchBoundaryProps {
  children: ReactNode;
  onClose: () => void;
}

interface OmniSearchBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Local Error Boundary specifically for OmniSearch modal to guarantee zero blank screens
class OmniSearchInternalBoundary extends React.Component<OmniSearchBoundaryProps, OmniSearchBoundaryState> {
  constructor(props: OmniSearchBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): OmniSearchBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("OmniSearch mounting / render error caught:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          id="yahoo-omni-search-error-fallback"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#0f172a] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg">OmniSearch Render Warning</h3>
            </div>
            <p className="text-xs text-slate-300">
              The search modal encountered a transient rendering event. You can safely close or reset the search cache.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("ferrp_recent_symbols");
                  } catch {
                    // ignore
                  }
                  this.setState({ hasError: false, error: null });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onClose();
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                Close Search
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ALL_NEWS_DATA = [
  {
    id: "news-1",
    ticker: "M",
    title: "Warren Buffett's Berkshire doubles down on undervalued retail stock",
    source: "TheStreet",
    time: "20 hours ago"
  },
  {
    id: "news-2",
    ticker: "GOOGL",
    title: "Berkshire Hathaway Boosts Alphabet Stake & Enterprise Cloud Exposure",
    source: "Bloomberg",
    time: "yesterday"
  },
  {
    id: "news-3",
    ticker: "MSFT",
    title: "Microsoft Azure AI Revenue Surges 34% with Enterprise Copilot Deployments",
    source: "The Wall Street Journal",
    time: "2 hours ago"
  },
  {
    id: "news-4",
    ticker: "NVDA",
    title: "Hyperscalers increase Blackwell AI chip cluster purchase orders by 30%",
    source: "Financial Times",
    time: "1 hour ago"
  },
  {
    id: "news-5",
    ticker: "DAX",
    title: "ECB Rate Cut Expectations Provide Support to German Industrial Champions",
    source: "Handelsblatt",
    time: "2 hours ago"
  },
  {
    id: "news-6",
    ticker: "AAPL",
    title: "Apple Intelligence rollout drives premium iPhone upgrade supercycle in EU",
    source: "Reuters",
    time: "4 hours ago"
  },
  {
    id: "news-7",
    ticker: "TSLA",
    title: "Robotaxi fleet homologation progresses with German regulatory authorities",
    source: "Automobilwoche",
    time: "6 hours ago"
  }
];

const ALL_RESEARCH_DATA = [
  {
    id: "res-1",
    ticker: "M",
    title: "Analyst Report: Macy's, Inc.",
    provider: "Morningstar",
    time: "2 months ago"
  },
  {
    id: "res-2",
    ticker: "MSFT",
    title: "Daily – Vickers Top Buyers & Sellers for 09/19/2025",
    provider: "Argus",
    time: "last year"
  },
  {
    id: "res-3",
    ticker: "MSFT",
    title: "Morningstar | A Weekly Summary of Stock Ideas and Developments in the Companies We Cover",
    provider: "Morningstar",
    time: "last year"
  },
  {
    id: "res-4",
    ticker: "DAX",
    title: "DAX 40 Earnings Multiples vs S&P 500 Historical Discount",
    provider: "Deutsche Bank",
    time: "4 days ago"
  },
  {
    id: "res-5",
    ticker: "NVDA",
    title: "Semiconductor CapEx Forecast & Data Center GPU TAM through 2028",
    provider: "Goldman Sachs",
    time: "3 days ago"
  }
];

const DEFAULT_RECENT_SYMBOLS = ["NVDA", "MSFT", "AAPL", "QQQ", "DAX", "M", "TSLA"];

const YahooFinanceOmniSearchInner: React.FC<YahooFinanceOmniSearchProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  initialQuery = ""
}) => {
  const [query, setQuery] = useState<string>(initialQuery || "");
  const deferredQuery = useDeferredValue(query);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery || "");
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const [isServedFromCache, setIsServedFromCache] = useState<boolean>(false);

  // Recent Symbols state initialized safely from localStorage
  const [recentSymbols, setRecentSymbols] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("ferrp_recent_symbols");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_RECENT_SYMBOLS;
  });

  // Local component cache: normalized query string -> SearchResultPayload
  const searchCacheRef = useRef<Map<string, SearchResultPayload>>(new Map());
  const [results, setResults] = useState<SearchResultPayload>({
    symbols: QUICK_ALL_SYMBOLS_SEARCH_LIST,
    news: ALL_NEWS_DATA,
    research: ALL_RESEARCH_DATA,
    fromCache: false
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Non-blocking smooth focus on mount using requestAnimationFrame
  useEffect(() => {
    if (isOpen) {
      let rafId: number;
      if (typeof requestAnimationFrame !== "undefined") {
        rafId = requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      } else {
        inputRef.current?.focus();
      }
      return () => {
        if (rafId && typeof cancelAnimationFrame !== "undefined") {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [isOpen]);

  // Debounce search function (150ms) to avoid unnecessary overhead while typing
  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(deferredQuery);
      setIsDebouncing(false);
    }, 150);

    return () => {
      clearTimeout(handler);
    };
  }, [deferredQuery]);

  // Execute Search with In-Memory Component State Caching
  useEffect(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();

    // Check if result is already cached in component state
    if (searchCacheRef.current.has(trimmed)) {
      const cached = searchCacheRef.current.get(trimmed)!;
      setResults({ ...cached, fromCache: true });
      setIsServedFromCache(true);
      return;
    }

    // Filter symbols by ticker OR full name OR asset type OR exchange
    const matchedSymbols = QUICK_ALL_SYMBOLS_SEARCH_LIST.filter((item) => {
      if (!trimmed) return true;
      return (
        item.ticker.toLowerCase().includes(trimmed) ||
        item.name.toLowerCase().includes(trimmed) ||
        item.assetType.toLowerCase().includes(trimmed) ||
        item.exchange.toLowerCase().includes(trimmed)
      );
    });

    const matchedNews = ALL_NEWS_DATA.filter(
      (n) =>
        !trimmed ||
        n.title.toLowerCase().includes(trimmed) ||
        n.source.toLowerCase().includes(trimmed) ||
        n.ticker.toLowerCase().includes(trimmed)
    );

    const matchedResearch = ALL_RESEARCH_DATA.filter(
      (r) =>
        !trimmed ||
        r.title.toLowerCase().includes(trimmed) ||
        r.provider.toLowerCase().includes(trimmed) ||
        r.ticker.toLowerCase().includes(trimmed)
    );

    const payload: SearchResultPayload = {
      symbols: matchedSymbols,
      news: matchedNews,
      research: matchedResearch,
      fromCache: false
    };

    // Cache locally
    searchCacheRef.current.set(trimmed, payload);
    setResults(payload);
    setIsServedFromCache(false);
  }, [debouncedQuery]);

  // Save symbol to recent searches
  const recordRecentSymbol = useCallback((ticker: string) => {
    const clean = ticker.toUpperCase().trim();
    setRecentSymbols((prev) => {
      const next = [clean, ...prev.filter((s) => s !== clean)].slice(0, 10);
      try {
        localStorage.setItem("ferrp_recent_symbols", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleRemoveRecent = (tickerToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSymbols((prev) => {
      const next = prev.filter((s) => s !== tickerToRemove);
      try {
        localStorage.setItem("ferrp_recent_symbols", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSymbols([]);
    try {
      localStorage.removeItem("ferrp_recent_symbols");
    } catch {
      // ignore
    }
  };

  const handleSelect = (ticker: string) => {
    recordRecentSymbol(ticker);
    onSelectSymbol(ticker);
    onClose();
  };

  // Close on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  return (
    <div
      id="yahoo-omni-search-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Search Modal Container - Styled to match Yahoo Finance Search */}
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Top Search Bar */}
        <div className="p-3 sm:p-4 bg-[#1e293b] border-b border-slate-700/70 flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              id="yahoo-omni-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbols, company names, futures, ETFs (e.g. 'm', 'microsoft', 'crude', 'dax')..."
              className="w-full bg-[#0f172a] text-white placeholder-slate-400 text-sm sm:text-base font-medium px-4 py-2.5 pl-10 pr-20 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

            <div className="absolute right-3 flex items-center space-x-1.5">
              {isDebouncing && (
                <span className="text-[10px] font-mono text-amber-400 animate-pulse">
                  searching...
                </span>
              )}
              {isServedFromCache && !isDebouncing && trimmed && (
                <span
                  title="Served instantly from in-memory component cache"
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-0.5"
                >
                  <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  cache
                </span>
              )}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (results.symbols.length > 0) {
                handleSelect(results.symbols[0].ticker);
              }
            }}
            className="px-4 py-2.5 bg-[#008170] hover:bg-[#00a892] text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Recent Symbols Carousel / Quick Bar */}
        {recentSymbols.length > 0 && (
          <div className="px-4 py-2 bg-[#0b1120] text-xs text-slate-400 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] shrink-0">
                <History className="w-3 h-3 text-indigo-400" />
                Recent Symbols:
              </span>
              {recentSymbols.map((sym) => {
                const profile = getStockPreMarketProfile(sym);
                const price = profile?.regularPrice ?? 100;
                return (
                  <div
                    key={sym}
                    onClick={() => handleSelect(sym)}
                    className="group/chip inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-indigo-950/80 hover:border-indigo-700 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <span>{sym}</span>
                    <span className="text-[10px] font-normal text-slate-400 group-hover/chip:text-indigo-200">
                      ${price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => handleRemoveRecent(sym, e)}
                      className="opacity-40 group-hover/chip:opacity-100 hover:text-rose-400 p-0.5 transition-opacity cursor-pointer"
                      title={`Remove ${sym} from recent`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearAllRecent}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear recent symbols history"
              >
                Clear
              </button>
              <span className="text-[11px] text-slate-600 hidden md:inline">| ESC</span>
            </div>
          </div>
        )}

        {/* Scrollable Results List */}
        <div className="overflow-y-auto p-2 sm:p-3 space-y-4">
          {/* 1. SYMBOLS SECTION */}
          <div>
            <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Symbols ({results.symbols.length})
              </span>
              <span className="text-[11px] text-indigo-400 font-normal hover:underline cursor-pointer">
                Screener for stocks & more &rarr;
              </span>
            </div>

            <div className="space-y-1">
              {results.symbols.map((item, idx) => {
                const isSelectedFirst = idx === 0 && trimmed.length > 0;
                const price = typeof item.price === "number" ? item.price : 100;
                const prePrice = typeof item.prePrice === "number" ? item.prePrice : price;
                const change = (item as any).change ?? Number((prePrice - price).toFixed(2));
                const changePct = typeof item.changePct === "number" ? item.changePct : 0;
                const euroPrice = (item as any).priceEUR ?? (item as any).euroPrice ?? Number((price * 0.9258).toFixed(2));
                const isPos = changePct >= 0;

                return (
                  <button
                    key={item.ticker}
                    id={`search-symbol-${item.ticker.replace(/[=]/g, "-")}`}
                    onClick={() => handleSelect(item.ticker)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isSelectedFirst
                        ? "bg-[#1e3a8a] text-white shadow-md border border-blue-500/40"
                        : "hover:bg-slate-800/80 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-lg shrink-0 mt-0.5">{item.flag || "🌐"}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm sm:text-base text-white tracking-wide">
                            {item.ticker}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-300">
                            {item.assetType}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {item.exchange}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
                          {item.name}
                        </div>
                      </div>
                    </div>

                    {/* Right Info: USD Price, Euro Converted, & Return */}
                    <div className="text-right space-y-0.5 shrink-0 ml-3">
                      <div className="font-mono font-bold text-xs sm:text-sm text-white">
                        ${price.toFixed(2)}
                      </div>
                      
                      {/* Small Euro Converted Price for Germany */}
                      <div className="text-[10px] font-mono text-emerald-400 font-medium">
                        €{euroPrice.toFixed(2)} EUR
                      </div>

                      <div
                        className={`text-[11px] font-mono font-bold flex items-center justify-end space-x-0.5 ${
                          isPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isPos ? "+" : ""}
                          {change.toFixed(2)} ({isPos ? "+" : ""}
                          {changePct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {results.symbols.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                  No symbols matching "{query}". Try typing a company name (e.g. "Apple", "Microsoft") or asset keyword ("Crude", "Gold").
                </div>
              )}
            </div>
          </div>

          {/* 2. NEWS SECTION */}
          {results.news.length > 0 && (
            <div className="border-t border-slate-800/80 pt-3">
              <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  News ({results.news.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {results.news.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.ticker)}
                    className="p-2.5 rounded-xl hover:bg-slate-800/70 border border-slate-800/40 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug">
                        {item.title}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span className="font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {item.ticker}
                        </span>
                        <span>•</span>
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 mt-1 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. RESEARCH REPORTS SECTION */}
          {results.research.length > 0 && (
            <div className="border-t border-slate-800/80 pt-3">
              <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Research Reports ({results.research.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {results.research.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.ticker)}
                    className="p-2.5 rounded-xl hover:bg-slate-800/70 border border-slate-800/40 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors leading-snug">
                        {item.title}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span className="font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {item.ticker}
                        </span>
                        <span>•</span>
                        <span>{item.provider}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 mt-1 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-[#0b1120] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Instant Global Symbol Index • Debounced & Cached</span>
          </div>
          <div className="font-mono text-slate-500">
            {results.symbols.length} Symbols | {results.news.length} News | {results.research.length} Reports
          </div>
        </div>
      </div>
    </div>
  );
};

export const YahooFinanceOmniSearch: React.FC<YahooFinanceOmniSearchProps> = (props) => {
  return (
    <OmniSearchInternalBoundary onClose={props.onClose}>
      <YahooFinanceOmniSearchInner {...props} />
    </OmniSearchInternalBoundary>
  );
};

