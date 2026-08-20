import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Flame,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Filter,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export interface TimelineEventItem {
  id: string;
  time: string;
  relativeTime: string;
  title: string;
  country: string;
  category: "Inflation" | "Labor" | "Central Bank" | "Earnings" | "Auction";
  impactScore: number; // 0 - 100
  consensus: string;
  previous: string;
  unit: string;
  expectedMoveNQ: string;
  historicalWinRate: string;
  transmissionPreview: string;
  isAlertSet?: boolean;
}

const UPCOMING_24H_EVENTS: TimelineEventItem[] = [
  {
    id: "evt-cpi-today",
    time: "14:30 CET (08:30 ET)",
    relativeTime: "in 1h 42m",
    title: "US Core CPI Inflation (MoM & YoY)",
    country: "US",
    category: "Inflation",
    impactScore: 94,
    consensus: "3.1% YoY",
    previous: "3.4% YoY",
    unit: "% YoY",
    expectedMoveNQ: "±0.85%",
    historicalWinRate: "88% Move > 0.25%",
    transmissionPreview: "Surprise > 0.1% triggers immediate 2Y Yield spike (+9bp) and tech multiple compression.",
    isAlertSet: true,
  },
  {
    id: "evt-claims-today",
    time: "14:30 CET (08:30 ET)",
    relativeTime: "in 1h 42m",
    title: "US Initial Jobless Claims",
    country: "US",
    category: "Labor",
    impactScore: 78,
    consensus: "215k",
    previous: "222k",
    unit: "k claims",
    expectedMoveNQ: "±0.35%",
    historicalWinRate: "62% Move > 0.25%",
    transmissionPreview: "High print (>230k) signals labor cooling, supporting dovish Fed easing bets.",
    isAlertSet: false,
  },
  {
    id: "evt-treasury-30y",
    time: "19:00 CET (13:00 ET)",
    relativeTime: "in 6h 15m",
    title: "US 30-Year Bond Auction",
    country: "US",
    category: "Auction",
    impactScore: 72,
    consensus: "4.350% High Yield",
    previous: "4.410%",
    unit: "% Yield",
    expectedMoveNQ: "±0.40%",
    historicalWinRate: "58% Move > 0.25%",
    transmissionPreview: "Tail in auction yield signals weak primary dealer absorption and term-premium surge.",
    isAlertSet: false,
  },
  {
    id: "evt-fomc-speaker",
    time: "20:30 CET (14:30 ET)",
    relativeTime: "in 7h 45m",
    title: "Fed Governor Waller Keynote Speech",
    country: "US",
    category: "Central Bank",
    impactScore: 82,
    consensus: "Hawkish Guidance",
    previous: "Neutral",
    unit: "Speech",
    expectedMoveNQ: "±0.50%",
    historicalWinRate: "71% Move > 0.25%",
    transmissionPreview: "Comments on post-CPI rate trajectory directly set short-rate expectations.",
    isAlertSet: false,
  },
  {
    id: "evt-boj-governor",
    time: "03:30 CET (Tomorrow)",
    relativeTime: "in 14h 45m",
    title: "Bank of Japan Policy Assessment",
    country: "JP",
    category: "Central Bank",
    impactScore: 89,
    consensus: "Rate Hike Prob: 42%",
    previous: "0.25%",
    unit: "% Policy",
    expectedMoveNQ: "±1.10%",
    historicalWinRate: "82% Move > 0.50%",
    transmissionPreview: "Yen carry unwind risk directly impacts global equity beta and liquidity.",
    isAlertSet: false,
  },
  {
    id: "evt-nvda-earnings",
    time: "22:15 CET (Tomorrow AMC)",
    relativeTime: "in 22h 30m",
    title: "NVIDIA Q2 Fiscal Earnings Release",
    country: "US",
    category: "Earnings",
    impactScore: 98,
    consensus: "$0.65 EPS / $28.5B Rev",
    previous: "$0.61 EPS",
    unit: "USD",
    expectedMoveNQ: "±1.65%",
    historicalWinRate: "94% Move > 0.50%",
    transmissionPreview: "Data center revenue and Blackwell guidance dictates high-beta tech multiple regime.",
    isAlertSet: true,
  },
];

export const Next24hEventTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEventItem[]>(UPCOMING_24H_EVENTS);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventItem>(UPCOMING_24H_EVENTS[0]);

  const toggleAlert = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, isAlertSet: !evt.isAlertSet } : evt))
    );
  };

  const filteredEvents = events.filter((e) => {
    if (filterCategory === "ALL") return true;
    if (filterCategory === "HIGH_IMPACT") return e.impactScore >= 80;
    return e.category === filterCategory;
  });

  return (
    <section
      id="ferrp-next-24h-timeline"
      aria-label="Next 24h Macro Event Timeline"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center space-x-2">
              <span>Next 24h Macro Event Timeline</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                {filteredEvents.length} Catalysts
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Chronological countdown, impact quantification (0–100), and automated alert triggers
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: "ALL", label: "All Events" },
            { id: "HIGH_IMPACT", label: "🔥 Critical (EIS &ge; 80)" },
            { id: "Inflation", label: "Inflation" },
            { id: "Central Bank", label: "Central Bank" },
            { id: "Earnings", label: "Earnings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all border cursor-pointer ${
                filterCategory === tab.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: tab.label }} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => {
          const isSelected = selectedEvent.id === evt.id;
          const isCritical = evt.impactScore >= 90;
          const isHigh = evt.impactScore >= 75 && evt.impactScore < 90;

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-100 shadow-xs"
                  : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80"
              }`}
            >
              {/* Left Column: Timing & Country */}
              <div className="flex items-start sm:items-center space-x-3">
                <div className="text-center min-w-[70px] bg-white p-2 rounded-lg border border-slate-200/80 shrink-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{evt.country}</div>
                  <div className="font-mono font-black text-slate-900 text-xs mt-0.5">{evt.time.split(" ")[0]}</div>
                  <div className="text-[10px] font-mono text-indigo-600 font-bold">{evt.relativeTime}</div>
                </div>

                {/* Event Name & Category */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        evt.category === "Inflation"
                          ? "bg-rose-100 text-rose-800"
                          : evt.category === "Central Bank"
                          ? "bg-purple-100 text-purple-800"
                          : evt.category === "Earnings"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {evt.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{evt.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Consensus: <strong className="text-slate-800 font-mono">{evt.consensus}</strong></span>
                    <span>Previous: <strong className="text-slate-600 font-mono">{evt.previous}</strong></span>
                    <span>Est Move: <strong className="text-indigo-700 font-mono">{evt.expectedMoveNQ}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Impact Score (0-100) & Actions */}
              <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                {/* Impact Score Bar */}
                <div className="text-right space-y-1 min-w-[100px]">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Impact Score</span>
                    <span
                      className={`font-mono font-black text-xs px-1.5 py-0.5 rounded ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : isHigh
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      {evt.impactScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical ? "bg-rose-500" : isHigh ? "bg-amber-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${evt.impactScore}%` }}
                    />
                  </div>
                </div>

                {/* Alert Notification Bell */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAlert(evt.id);
                  }}
                  title={evt.isAlertSet ? "Alert armed (T-60m, T-15m, T-1m)" : "Arm push alert"}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    evt.isAlertSet
                      ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                      : "bg-white text-slate-400 hover:text-slate-700 border-slate-200"
                  }`}
                >
                  <Bell className={`w-4 h-4 ${evt.isAlertSet ? "fill-amber-500 text-amber-600" : ""}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Catalyst Deep Dive Brief */}
      {selectedEvent && (
        <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-950 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Event Transmission Brief &bull; {selectedEvent.title}</span>
            </span>
            <span className="font-mono text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              Empirical Win-Rate: {selectedEvent.historicalWinRate}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {selectedEvent.transmissionPreview}
          </p>
        </div>
      )}
    </section>
  );
};
