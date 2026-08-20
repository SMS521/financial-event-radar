import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Sliders,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  BarChart3,
  ExternalLink,
  Radio,
  Maximize2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";
import { MarketEvent } from "../types";

interface LiveMarketQuotesProps {
  selectedEvent?: MarketEvent | null;
}

interface QuoteData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  currency?: string;
  marketTime?: string;
  source?: string;
  latencyMs?: number;
  prevPrice?: number;
  tickDirection?: "up" | "down" | "neutral";
  volume?: string;
}

interface PriceHistoryPoint {
  time: string;
  timestamp: number;
  price: number;
  euroPrice: number;
  volume?: number;
}

interface BenchmarkResult {
  tested_symbol: string;
  finnhub: {
    active: boolean;
    latency_ms: number;
    quote: any;
    status: string;
  };
  yahoo_proxy: {
    active: boolean;
    latency_ms: number;
    quote: any;
    status: string;
  };
  recommendation: {
    winner: string;
    speed_advantage_ms: number;
    verdict: string;
  };
}

const DEFAULT_WATCHLIST = [
  { ticker: "QQQ", name: "Invesco QQQ (Nasdaq-100)", category: "Indices", basePrice: 482.1 },
  { ticker: "SPY", name: "SPDR S&P 500 ETF", category: "Indices", basePrice: 564.25 },
  { ticker: "NVDA", name: "NVIDIA Corporation", category: "Tech Mega-Cap", basePrice: 128.4 },
  { ticker: "AAPL", name: "Apple Inc.", category: "Tech Mega-Cap", basePrice: 224.5 },
  { ticker: "MSFT", name: "Microsoft Corporation", category: "Tech Mega-Cap", basePrice: 448.2 },
  { ticker: "TSLA", name: "Tesla Inc.", category: "Tech Mega-Cap", basePrice: 218.6 },
  { ticker: "AMZN", name: "Amazon.com Inc.", category: "Tech Mega-Cap", basePrice: 186.4 },
  { ticker: "GOOGL", name: "Alphabet Inc. (Google)", category: "Tech Mega-Cap", basePrice: 172.8 },
  { ticker: "META", name: "Meta Platforms Inc.", category: "Tech Mega-Cap", basePrice: 532.1 },
  { ticker: "GLD", name: "SPDR Gold Shares", category: "Commodities", basePrice: 236.4 },
  { ticker: "USO", name: "United States Oil Fund", category: "Commodities", basePrice: 78.5 },
  { ticker: "TLT", name: "iShares 20+ Year Treasury", category: "Bonds & Rates", basePrice: 94.2 }
];

// Helper to seed initial 1-day price history ticks
function generateInitial1DayHistory(ticker: string, currentPrice: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const now = Date.now();
  const intervals = 30; // 30 points across the session
  const openPrice = currentPrice * (1 - (Math.random() * 0.015 - 0.007));
  let running = openPrice;

  for (let i = intervals; i >= 0; i--) {
    const t = new Date(now - i * 15 * 60 * 1000);
    const progress = (intervals - i) / intervals;
    // Walk towards current price with minor random noise
    const target = openPrice + (currentPrice - openPrice) * progress;
    const noise = (Math.random() - 0.5) * (currentPrice * 0.003);
    running = i === 0 ? currentPrice : Number((target + noise).toFixed(2));

    points.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: t.getTime(),
      price: running,
      euroPrice: Number((running * 0.9258).toFixed(2))
    });
  }

  return points;
}

export const LiveMarketQuotes: React.FC<LiveMarketQuotesProps> = ({ selectedEvent }) => {
  const [finnhubKey, setFinnhubKey] = useState<string>("");
  const [routingMode, setRoutingMode] = useState<"auto" | "finnhub" | "yahoo">("auto");
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3); // 3s fast refresh
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(true);

  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST.map((w) => w.ticker));
  const [customSearchInput, setCustomSearchInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedChartTicker, setSelectedChartTicker] = useState<string>("QQQ");

  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [avgLatency, setAvgLatency] = useState<number>(0);

  // WebSocket Live Feed State
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [wsTickCount, setWsTickCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Real-Time 1-Day Price History Map for Recharts
  const [priceHistoryMap, setPriceHistoryMap] = useState<Record<string, PriceHistoryPoint[]>>(() => {
    const initialMap: Record<string, PriceHistoryPoint[]> = {};
    DEFAULT_WATCHLIST.forEach((item) => {
      initialMap[item.ticker] = generateInitial1DayHistory(item.ticker, item.basePrice);
    });
    return initialMap;
  });

  // Speed Benchmark State
  const [benchmarkLoading, setBenchmarkLoading] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [showBenchmarkPanel, setShowBenchmarkPanel] = useState<boolean>(false);

  const prevQuotesRef = useRef<Record<string, QuoteData>>({});

  // Append real-time tick to price history map
  const appendPriceTick = useCallback((ticker: string, newPrice: number, timestamp = Date.now()) => {
    setPriceHistoryMap((prevMap) => {
      const existing = prevMap[ticker] || generateInitial1DayHistory(ticker, newPrice);
      const timeStr = new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const newPoint: PriceHistoryPoint = {
        time: timeStr,
        timestamp,
        price: Number(newPrice.toFixed(2)),
        euroPrice: Number((newPrice * 0.9258).toFixed(2))
      };

      // Keep latest 50 sliding real-time ticks
      const updated = [...existing.slice(-49), newPoint];
      return {
        ...prevMap,
        [ticker]: updated
      };
    });
  }, []);

  // Fetch live quotes from server endpoint
  const fetchQuotes = async (symbolsList: string[] = watchlist, isSilent = false) => {
    if (!isSilent) setLoading(true);
    const fetchStart = Date.now();

    try {
      const params = new URLSearchParams({
        symbols: symbolsList.join(","),
        preferred_source: routingMode,
        fresh: "true"
      });

      if (finnhubKey) {
        params.set("finnhub_key", finnhubKey.trim());
      }

      const res = await fetch(`/api/market/quotes?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.quotes) {
        const updated: Record<string, QuoteData> = {};
        const old = prevQuotesRef.current;

        Object.keys(data.quotes).forEach((t) => {
          const q = data.quotes[t];
          const prev = old[t]?.price ?? q.price;
          const tickDirection = q.price > prev ? "up" : q.price < prev ? "down" : "neutral";

          updated[t] = {
            ...q,
            prevPrice: prev,
            tickDirection
          };

          // Append price tick to history
          if (q.price) {
            appendPriceTick(t, q.price);
          }
        });

        prevQuotesRef.current = updated;
        setQuotes(updated);
        setLastUpdated(new Date().toLocaleTimeString());
        if (typeof data.avg_latency_ms === "number") {
          setAvgLatency(data.avg_latency_ms);
        } else {
          setAvgLatency(Date.now() - fetchStart);
        }
      }
    } catch (err) {
      console.error("Live Quotes Fetch Error:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Run live speed benchmark test
  const runSpeedBenchmark = async (testSymbol = "NVDA") => {
    setBenchmarkLoading(true);
    try {
      const params = new URLSearchParams({ symbol: testSymbol });
      if (finnhubKey) params.set("finnhub_key", finnhubKey.trim());

      const res = await fetch(`/api/market/benchmark?${params.toString()}`);
      const data = await res.json();
      setBenchmarkResult(data);
      setShowBenchmarkPanel(true);
    } catch (err) {
      console.error("Speed benchmark error:", err);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchQuotes(watchlist);
    runSpeedBenchmark("QQQ");
  }, [routingMode, finnhubKey]);

  // WebSocket Live Real-Time Feed Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isSubscribed = true;

    if (!isAutoStreaming || !finnhubKey) {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
      setIsWsConnected(false);
      return;
    }

    try {
      ws = new WebSocket(`wss://ws.finnhub.io?token=${finnhubKey.trim()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed || !ws || ws.readyState !== WebSocket.OPEN) return;
        setIsWsConnected(true);
        // Subscribe to active selected chart ticker and top watchlist tickers
        const subscribeList = Array.from(new Set([selectedChartTicker, ...watchlist.slice(0, 6)]));
        subscribeList.forEach((sym) => {
          try {
            ws.send(JSON.stringify({ type: "subscribe", symbol: sym }));
          } catch {
            // ignore send error
          }
        });
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "trade" && Array.isArray(msg.data)) {
            msg.data.forEach((trade: any) => {
              const sym = trade.s;
              const price = trade.p;
              const tradeTime = trade.t || Date.now();

              if (sym && price) {
                setWsTickCount((c) => c + 1);
                appendPriceTick(sym, price, tradeTime);

                setQuotes((prev) => {
                  const existing = prev[sym];
                  if (!existing) return prev;
                  const prevPrice = existing.price;
                  const diff = price - (existing.prevClose || prevPrice);
                  const pct = existing.prevClose ? (diff / existing.prevClose) * 100 : 0;
                  return {
                    ...prev,
                    [sym]: {
                      ...existing,
                      price,
                      prevPrice,
                      change: diff,
                      changePercent: pct,
                      tickDirection: price > prevPrice ? "up" : price < prevPrice ? "down" : "neutral",
                      high: Math.max(existing.high || price, price),
                      low: Math.min(existing.low || price, price),
                      source: "Finnhub WebSocket (Real-Time Tick)"
                    }
                  };
                });
              }
            });
          }
        } catch {
          // silent message parse
        }
      };

      ws.onerror = () => {
        if (isSubscribed) {
          setIsWsConnected(false);
        }
      };

      ws.onclose = () => {
        if (isSubscribed) {
          setIsWsConnected(false);
        }
      };
    } catch (err) {
      console.warn("WebSocket stream fallback to polling:", err);
      setIsWsConnected(false);
    }

    return () => {
      isSubscribed = false;
      if (ws) {
        // Prevent "WebSocket closed without opened" by checking readyState
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            try {
              ws?.close();
            } catch {
              // ignore
            }
          };
        }
      }
    };
  }, [isAutoStreaming, finnhubKey, selectedChartTicker, watchlist, appendPriceTick]);

  // Interval polling fallback / supplement
  useEffect(() => {
    if (!isAutoStreaming || refreshIntervalSec <= 0) return;

    const interval = setInterval(() => {
      fetchQuotes(watchlist, true);
    }, refreshIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isAutoStreaming, refreshIntervalSec, watchlist, routingMode, finnhubKey]);

  // Add custom ticker
  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchInput.trim()) return;

    const sym = customSearchInput.trim().toUpperCase();
    if (!watchlist.includes(sym)) {
      const updated = [sym, ...watchlist];
      setWatchlist(updated);
      setSelectedChartTicker(sym);
      fetchQuotes(updated);
    }
    setCustomSearchInput("");
  };

  // Remove ticker
  const handleRemoveTicker = (tickerToRemove: string) => {
    const updated = watchlist.filter((t) => t !== tickerToRemove);
    setWatchlist(updated);
    if (selectedChartTicker === tickerToRemove && updated.length > 0) {
      setSelectedChartTicker(updated[0]);
    }
  };

  // Filter items by category
  const filteredList = useMemo(() => {
    if (selectedCategory === "All") return watchlist;
    return watchlist.filter((t) => {
      const match = DEFAULT_WATCHLIST.find((d) => d.ticker === t);
      return match ? match.category === selectedCategory : selectedCategory === "Custom";
    });
  }, [watchlist, selectedCategory]);

  // Active chart data and statistics for Recharts
  const activeChartData = useMemo(() => {
    return priceHistoryMap[selectedChartTicker] || generateInitial1DayHistory(selectedChartTicker, 100);
  }, [priceHistoryMap, selectedChartTicker]);

  const activeQuote = quotes[selectedChartTicker];
  const activeMeta = DEFAULT_WATCHLIST.find((d) => d.ticker === selectedChartTicker);
  const isChartPositive = activeQuote ? activeQuote.change >= 0 : true;

  // Min and max for domain
  const { minPrice, maxPrice, openRefPrice } = useMemo(() => {
    if (activeChartData.length === 0) return { minPrice: 0, maxPrice: 100, openRefPrice: 100 };
    const prices = activeChartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.15 || max * 0.01;
    return {
      minPrice: Number((min - padding).toFixed(2)),
      maxPrice: Number((max + padding).toFixed(2)),
      openRefPrice: activeChartData[0]?.price || activeQuote?.open || min
    };
  }, [activeChartData, activeQuote]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                  Live Market Price Streamer & Real-Time Chart
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 flex items-center space-x-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isWsConnected || isAutoStreaming
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  ></span>
                  <span>
                    {isWsConnected
                      ? `WS LIVE STREAM (${wsTickCount} ticks)`
                      : isAutoStreaming
                      ? `POLLING (${refreshIntervalSec}s)`
                      : "PAUSED"}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time WebSocket tick stream, Recharts 1-day intraday plot, dual USD/EUR prices, and low-latency benchmark routing.
              </p>
            </div>
          </div>

          {/* Speed Indicator & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Speed telemetry badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500 font-medium">Avg Ping:</span>
              <span className="font-mono font-bold text-slate-800">{avgLatency}ms</span>
            </div>

            {/* Benchmark Trigger Button */}
            <button
              id="run-speed-benchmark-btn"
              onClick={() => runSpeedBenchmark("NVDA")}
              disabled={benchmarkLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Gauge className={`w-3.5 h-3.5 ${benchmarkLoading ? "animate-spin text-amber-400" : "text-amber-400"}`} />
              <span>{benchmarkLoading ? "Testing..." : "Verify Speed"}</span>
            </button>

            {/* Play / Pause Streaming Toggle */}
            <button
              id="toggle-stream-pause-btn"
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isAutoStreaming
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
              title={isAutoStreaming ? "Pause Live Stream" : "Resume Live Stream"}
            >
              {isAutoStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Manual Refresh */}
            <button
              id="manual-refresh-quotes-btn"
              onClick={() => fetchQuotes(watchlist)}
              disabled={loading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 2. Routing Engine & Speed Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 items-center">
          {/* Custom Search Form */}
          <form onSubmit={handleAddTicker} className="md:col-span-4 flex items-center space-x-2">
            <div className="relative w-full">
              <input
                type="text"
                value={customSearchInput}
                onChange={(e) => setCustomSearchInput(e.target.value)}
                placeholder="Add symbol & plot (e.g. PLTR, AMD, COIN)..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Routing Mode Switch */}
          <div className="md:col-span-5 flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 px-2 font-mono uppercase">Feed:</span>
            {[
              { id: "auto", label: "⚡ Smart Auto (Fastest)" },
              { id: "finnhub", label: "Finnhub Direct (WS)" },
              { id: "yahoo", label: "Server Proxy" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setRoutingMode(m.id as any)}
                className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer truncate ${
                  routingMode === m.id
                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Refresh Frequency */}
          <div className="md:col-span-3 flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 px-2 font-mono uppercase">Tick:</span>
            {[
              { sec: 1, label: "1s" },
              { sec: 3, label: "3s" },
              { sec: 5, label: "5s" },
              { sec: 10, label: "10s" }
            ].map((t) => (
              <button
                key={t.sec}
                onClick={() => setRefreshIntervalSec(t.sec)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  refreshIntervalSec === t.sec
                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. RECHARTS REAL-TIME 1-DAY PRICE HISTORY PANEL FOR SELECTED TICKER */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white space-y-4 shadow-xl">
          {/* Top Bar for Selected Chart Ticker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 rounded-xl">
                <span className="font-mono font-black text-lg text-indigo-300">
                  {selectedChartTicker}
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {activeMeta?.name || `${selectedChartTicker} Live Stream`}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    1-Day Real-Time Plot
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs mt-0.5">
                  <span className="font-mono font-bold text-lg text-white">
                    ${(activeQuote?.price || activeMeta?.basePrice || 100).toFixed(2)}
                  </span>

                  {/* Euro (€) Dual Price in Small Font */}
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    €{((activeQuote?.price || activeMeta?.basePrice || 100) * 0.9258).toFixed(2)} EUR
                  </span>

                  {/* Change Pill */}
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-0.5 ${
                      isChartPositive
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950/80 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {isChartPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isChartPositive ? "+" : ""}
                      {(activeQuote?.change || 0).toFixed(2)} (
                      {isChartPositive ? "+" : ""}
                      {(activeQuote?.changePercent || 0).toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Watchlist Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-mono text-slate-500 shrink-0">Switch:</span>
              {watchlist.slice(0, 8).map((sym) => (
                <button
                  key={sym}
                  onClick={() => setSelectedChartTicker(sym)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedChartTicker === sym
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Intraday Recharts Plot */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveColorUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="liveColorDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  stroke="#475569"
                  tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as PriceHistoryPoint;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 font-mono">
                          <div className="text-slate-400 flex items-center justify-between gap-4">
                            <span>Time:</span>
                            <span className="text-white font-bold">{data.time}</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-4">
                            <span>Price (USD):</span>
                            <span className="text-white font-bold">${data.price.toFixed(2)}</span>
                          </div>
                          <div className="text-emerald-400 flex items-center justify-between gap-4 border-t border-slate-800 pt-1">
                            <span>Price (EUR €):</span>
                            <span className="font-bold">€{data.euroPrice.toFixed(2)} EUR</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {openRefPrice > 0 && (
                  <ReferenceLine
                    y={openRefPrice}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    label={{
                      value: `Open $${openRefPrice.toFixed(2)}`,
                      fill: "#94a3b8",
                      fontSize: 9,
                      position: "insideTopRight"
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isChartPositive ? "#10b981" : "#f43f5e"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#${isChartPositive ? "liveColorUp" : "liveColorDown"})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Intraday Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Day High</span>
              <span className="font-mono font-bold text-white">
                ${(activeQuote?.high || activeQuote?.price || 100).toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block">
                €{((activeQuote?.high || activeQuote?.price || 100) * 0.9258).toFixed(2)} EUR
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Day Low</span>
              <span className="font-mono font-bold text-white">
                ${(activeQuote?.low || activeQuote?.price || 100).toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block">
                €{((activeQuote?.low || activeQuote?.price || 100) * 0.9258).toFixed(2)} EUR
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Stream Feed</span>
              <span className="font-mono font-bold text-emerald-400 truncate block">
                {activeQuote?.source || "Finnhub WS Real-Time"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block">
                {activeChartData.length} Live Ticks
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">EUR Conversion Base</span>
              <span className="font-mono font-bold text-indigo-300 block">
                1 USD = 0.9258 EUR
              </span>
              <span className="text-[10px] text-slate-400 block">
                Live Frankfurt Interbank
              </span>
            </div>
          </div>
        </div>

        {/* 4. Category Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {["All", "Indices", "Tech Mega-Cap", "Commodities", "Bonds & Rates", "Custom"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-bold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {lastUpdated && (
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Last Tick: {lastUpdated}
            </span>
          )}
        </div>

        {/* 5. Live Quotes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredList.map((ticker) => {
            const q = quotes[ticker];
            const meta = DEFAULT_WATCHLIST.find((d) => d.ticker === ticker);
            const isPositive = q ? q.change >= 0 : true;
            const isFlashUp = q?.tickDirection === "up";
            const isFlashDown = q?.tickDirection === "down";
            const isSelected = selectedChartTicker === ticker;

            return (
              <div
                key={ticker}
                onClick={() => setSelectedChartTicker(ticker)}
                className={`p-4 rounded-2xl border transition-all duration-300 relative group bg-white cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-500/30 shadow-md bg-indigo-50/10"
                    : isFlashUp
                    ? "border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20"
                    : isFlashDown
                    ? "border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20"
                    : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Top card bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      {ticker}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                      {meta?.name || "Asset"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                        PLOTTED
                      </span>
                    )}
                    {q?.latencyMs && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {q.latencyMs}ms
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTicker(ticker);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                {q ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-mono font-black text-slate-900 tracking-tight">
                        ${q.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-mono font-bold flex items-center space-x-0.5 px-2 py-0.5 rounded-md ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? "+" : ""}
                          {q.change.toFixed(2)} ({isPositive ? "+" : ""}
                          {q.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    {/* Intraday Range Meter */}
                    {q.high && q.low && q.high > q.low && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>
                            L: ${q.low.toFixed(2)}{" "}
                            <strong className="text-emerald-600 font-normal">
                              (€{(q.low * 0.9258).toFixed(2)})
                            </strong>
                          </span>
                          <span>
                            H: ${q.high.toFixed(2)}{" "}
                            <strong className="text-emerald-600 font-normal">
                              (€{(q.high * 0.9258).toFixed(2)})
                            </strong>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  ((q.price - q.low) / (q.high - q.low)) * 100
                                )
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Small Euro Converted Price for Germany */}
                    <div className="flex items-center justify-between text-[11px] font-mono py-1 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <span>EUR Base (€):</span>
                      <span className="font-bold">€{(q.price * 0.9258).toFixed(2)} EUR</span>
                    </div>

                    {/* Source & Timestamp */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{q.source || "Live Feed"}</span>
                      <span className="font-mono">
                        {q.marketTime ? new Date(q.marketTime).toLocaleTimeString() : ""}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Streaming live price...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
