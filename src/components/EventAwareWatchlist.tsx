import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Flame,
  Clock,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Filter,
  CheckCircle2,
} from "lucide-react";

export interface WatchlistStockItem {
  ticker: string;
  name: string;
  price: string;
  changePct: string;
  isPositive: boolean;
  eventStatus: "EVENT" | "EARNINGS" | "HEADLINE" | "QUIET";
  eventLabel: string;
  eventTime: string;
  impactScore: number;
}

const DEFAULT_WATCHLIST: WatchlistStockItem[] = [
  {
    ticker: "NQ / QQQ",
    name: "Invesco QQQ Trust",
    price: "$482.10",
    changePct: "-0.62%",
    isPositive: false,
    eventStatus: "EVENT",
    eventLabel: "CPI Rate Transmission",
    eventTime: "08:30 ET",
    impactScore: 94,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: "$128.40",
    changePct: "+1.25%",
    isPositive: true,
    eventStatus: "EVENT",
    eventLabel: "Blackwell Supply Scale 8-K",
    eventTime: "09:05 ET",
    impactScore: 91,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: "$448.20",
    changePct: "-0.35%",
    isPositive: false,
    eventStatus: "EARNINGS",
    eventLabel: "Azure AI Earnings in 2d",
    eventTime: "Post-Market",
    impactScore: 86,
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    price: "$156.80",
    changePct: "-2.10%",
    isPositive: false,
    eventStatus: "HEADLINE",
    eventLabel: "Competitor AI Cluster Benchmark",
    eventTime: "10:15 ET",
    impactScore: 78,
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: "$218.60",
    changePct: "-1.85%",
    isPositive: false,
    eventStatus: "EARNINGS",
    eventLabel: "Quarterly Deliveries Report",
    eventTime: "Tomorrow",
    impactScore: 82,
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: "$224.50",
    changePct: "+0.18%",
    isPositive: true,
    eventStatus: "QUIET",
    eventLabel: "Normal Market Drift (No Shock)",
    eventTime: "Calm",
    impactScore: 24,
  },
];

interface EventAwareWatchlistProps {
  onOpenWhyModal?: (item: WatchlistStockItem) => void;
}

export const EventAwareWatchlist: React.FC<EventAwareWatchlistProps> = ({
  onOpenWhyModal,
}) => {
  const [items, setItems] = useState<WatchlistStockItem[]>(DEFAULT_WATCHLIST);
  const [filterMode, setFilterMode] = useState<"ALL" | "ACTIVE_EVENTS">("ALL");
  const [newTicker, setNewTicker] = useState("");

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;
    const tickerUpper = newTicker.trim().toUpperCase();
    const newItem: WatchlistStockItem = {
      ticker: tickerUpper,
      name: `${tickerUpper} Holding`,
      price: "$195.00",
      changePct: "+0.45%",
      isPositive: true,
      eventStatus: "QUIET",
      eventLabel: "No Active Macro Shock",
      eventTime: "Calm",
      impactScore: 20,
    };
    setItems([newItem, ...items]);
    setNewTicker("");
  };

  const handleRemoveTicker = (ticker: string) => {
    setItems(items.filter((i) => i.ticker !== ticker));
  };

  const filteredItems = items.filter((i) => {
    if (filterMode === "ACTIVE_EVENTS") return i.eventStatus !== "QUIET";
    return true;
  });

  return (
    <section
      id="ferrp-event-watchlist"
      aria-label="Event-Aware Watchlist"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Event-Aware Portfolio Watchlist
              </h3>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                {items.length} Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Not just price: instantly see <em>what macroeconomic catalyst is hitting your holdings</em>
            </p>
          </div>
        </div>

        {/* Quick Filter & Add */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode("ACTIVE_EVENTS")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                filterMode === "ACTIVE_EVENTS" ? "bg-white text-rose-700 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flame className="w-3 h-3 text-rose-500" />
              <span>Active Shocks Only</span>
            </button>
          </div>

          <form onSubmit={handleAddTicker} className="flex items-center space-x-1">
            <input
              type="text"
              placeholder="+ Symbol (e.g. SPY)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-28 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-mono text-slate-400 uppercase">
              <th className="pb-2 pl-2">Holding</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">24h Chg</th>
              <th className="pb-2 pl-4">Macro / Catalyst Event State</th>
              <th className="pb-2 text-right">Impact</th>
              <th className="pb-2 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isEvent = item.eventStatus === "EVENT";
              const isEarnings = item.eventStatus === "EARNINGS";
              const isHeadline = item.eventStatus === "HEADLINE";
              const isQuiet = item.eventStatus === "QUIET";

              return (
                <tr
                  key={item.ticker}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Symbol & Name */}
                  <td className="py-3 pl-2">
                    <div className="font-bold text-slate-900 font-sans text-xs flex items-center space-x-1.5">
                      <span>{item.ticker}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.name}</div>
                  </td>

                  {/* Price */}
                  <td className="py-3 text-right font-mono text-xs">
                    <div className="font-bold text-slate-900">{item.price}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      €{(parseFloat(item.price.replace(/[^0-9.]/g, "") || "0") * 0.9258).toFixed(2)} EUR
                    </div>
                  </td>

                  {/* Change % */}
                  <td className="py-3 text-right">
                    <span
                      className={`font-mono font-bold text-xs inline-flex items-center ${
                        item.isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {item.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {item.changePct}
                    </span>
                  </td>

                  {/* Event State Badge & Label */}
                  <td className="py-3 pl-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isEvent
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : isEarnings
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : isHeadline
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isEvent ? "🔴 EVENT" : isEarnings ? "🟡 EARNINGS" : isHeadline ? "🟣 HEADLINE" : "⚪ QUIET"}
                      </span>
                      <span className="text-xs text-slate-700 font-medium truncate max-w-[240px]">
                        {item.eventLabel}
                      </span>
                    </div>
                  </td>

                  {/* Impact Score */}
                  <td className="py-3 text-right font-mono font-bold">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded ${
                        item.impactScore >= 80
                          ? "text-rose-700 bg-rose-50 border border-rose-200"
                          : item.impactScore >= 50
                          ? "text-amber-700 bg-amber-50 border border-amber-200"
                          : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {item.impactScore}
                    </span>
                  </td>

                  {/* Action [Why?] */}
                  <td className="py-3 text-right pr-2">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onOpenWhyModal && onOpenWhyModal(item)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center space-x-0.5"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Why?</span>
                      </button>
                      <button
                        onClick={() => handleRemoveTicker(item.ticker)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
