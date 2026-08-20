import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Clock,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { MarketEvent } from "../types";

interface MarketEventCalendarProps {
  events: MarketEvent[];
  selectedEvent: MarketEvent;
  onSelectEvent: (event: MarketEvent) => void;
}

export const MarketEventCalendar: React.FC<MarketEventCalendarProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
}) => {
  // Calendar month state - initialize with the selected event's year/month or June 2024
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedEvent && selectedEvent.scheduled_ts) {
      const d = new Date(selectedEvent.scheduled_ts);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2024, 5, 1); // June 2024
  });

  const [impactFilter, setImpactFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedDayEvents, setSelectedDayEvents] = useState<MarketEvent[] | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayEvents(null);
    setSelectedDateKey(null);
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayEvents(null);
    setSelectedDateKey(null);
  };

  const jumpToEventMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  // Extract categories available
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.event_type) set.add(e.event_type);
    });
    return ["ALL", ...Array.from(set)];
  }, [events]);

  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Impact score calculation
      const impactScore = e.importance === "Critical" ? 90 : Math.abs(e.standardized_surprise) * 35;
      if (impactFilter === "CRITICAL" && impactScore < 85 && Math.abs(e.standardized_surprise) < 1.4) {
        return false;
      }
      if (impactFilter === "HIGH" && impactScore < 65 && Math.abs(e.standardized_surprise) < 0.9) {
        return false;
      }
      if (impactFilter === "MEDIUM" && impactScore < 40) {
        return false;
      }
      if (categoryFilter !== "ALL" && e.event_type !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [events, impactFilter, categoryFilter]);

  // Group filtered events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, MarketEvent[]> = {};
    filteredEvents.forEach((ev) => {
      const dateKey = ev.scheduled_ts.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Calendar Grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create calendar cells (42 cells: 6 rows of 7 days)
  const calendarCells = useMemo(() => {
    const cells: {
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      events: MarketEvent[];
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, day);
      const dateKey = prevMonthDate.toISOString().slice(0, 10);
      cells.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentMonthDate = new Date(year, month, day);
      // Format YYYY-MM-DD manually to prevent UTC timezone shifts
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateKey = `${year}-${mm}-${dd}`;
      cells.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: true,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Trailing days for next month to fill grid to 35 or 42
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonthDate = new Date(year, month + 1, day);
      const dateKey = nextMonthDate.toISOString().slice(0, 10);
      cells.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    return cells;
  }, [year, month, firstDayIndex, daysInMonth, daysInPrevMonth, eventsByDate]);

  const handleCellClick = (cell: (typeof calendarCells)[0]) => {
    setSelectedDateKey(cell.dateKey);
    if (cell.events.length > 0) {
      setSelectedDayEvents(cell.events);
    } else {
      setSelectedDayEvents([]);
    }
  };

  return (
    <section
      id="ferrp-market-event-calendar"
      aria-label="Macroeconomic Event Calendar"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Calendar Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                Macroeconomic Event & Catalyst Calendar
              </h2>
              <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                {filteredEvents.length} Events Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Click any date node to inspect point-in-time releases, surprise standard deviations, and cross-asset reactions
            </p>
          </div>
        </div>

        {/* Month Navigation & Today Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={prevMonth}
              aria-label="Previous Month"
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-bold text-xs text-slate-800 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedEvent && (
            <button
              onClick={() => jumpToEventMonth(selectedEvent.scheduled_ts)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-all cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jump to Active ({selectedEvent.scheduled_ts.slice(0, 7)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
        {/* Impact Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-bold uppercase text-[10px] font-sans flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Impact:</span>
          </span>
          <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
            {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setImpactFilter(lvl)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  impactFilter === lvl
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lvl === "CRITICAL" ? "🔴 Critical" : lvl === "HIGH" ? "🟠 High" : lvl === "MEDIUM" ? "🟡 Medium" : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-bold uppercase text-[10px] font-sans">
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Event Types" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calendar Grid & Day Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Days Table (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-1">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-400 uppercase pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const isSelectedDate = selectedDateKey === cell.dateKey;
              const isActiveEventDate = selectedEvent && selectedEvent.scheduled_ts.startsWith(cell.dateKey);

              // Find maximum surprise on that date
              const maxSurprise = hasEvents
                ? Math.max(...cell.events.map((e) => Math.abs(e.standardized_surprise)))
                : 0;

              return (
                <div
                  key={`${cell.dateKey}-${idx}`}
                  onClick={() => handleCellClick(cell)}
                  className={`min-h-[84px] sm:min-h-[96px] p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/40 border-slate-100 text-slate-400 opacity-60"
                      : isSelectedDate
                      ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 shadow-sm"
                      : isActiveEventDate
                      ? "bg-amber-50/70 border-amber-400 ring-1 ring-amber-300"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top row: day number & indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-1 rounded ${
                        isActiveEventDate
                          ? "bg-amber-500 text-white font-black"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasEvents && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1 rounded ${
                          maxSurprise >= 1.4
                            ? "bg-rose-100 text-rose-800"
                            : maxSurprise >= 0.8
                            ? "bg-amber-100 text-amber-900"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {cell.events.length} {cell.events.length === 1 ? "ev" : "evs"}
                      </span>
                    )}
                  </div>

                  {/* Event Badges List inside cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {cell.events.slice(0, 2).map((ev) => {
                      const isHighSurprise = Math.abs(ev.standardized_surprise) >= 1.2;
                      const isEventActive = selectedEvent?.event_id === ev.event_id;

                      return (
                        <div
                          key={ev.event_id}
                          className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded truncate border leading-tight ${
                            isEventActive
                              ? "bg-indigo-600 text-white font-bold border-indigo-700 shadow-xs"
                              : isHighSurprise
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                          title={`${ev.event_type} (${ev.actual} vs ${ev.consensus})`}
                        >
                          {ev.event_type}
                        </div>
                      );
                    })}

                    {cell.events.length > 2 && (
                      <div className="text-[9px] font-mono text-slate-400 text-right pr-0.5">
                        +{cell.events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Inspector & Selected Event Details (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Date Node Inspector
                </span>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  {selectedDateKey || "Select Any Calendar Date"}
                </h3>
              </div>

              {selectedDayEvents && selectedDayEvents.length > 0 && (
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {selectedDayEvents.length} Catalyst{selectedDayEvents.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Events List for that day */}
            {selectedDayEvents === null ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p>Click on any date in the calendar grid to inspect macroeconomic releases and market moves.</p>
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <Info className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No events found on {selectedDateKey}</p>
                <p className="text-[11px]">No filtered economic catalysts or tier-1 macro benchmarks.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {selectedDayEvents.map((ev) => {
                  const isSelected = selectedEvent?.event_id === ev.event_id;
                  const isHawkish = ev.standardized_surprise > 0;
                  const nqReaction = ev.reactions?.NQ?.["60m"] ?? 0;

                  return (
                    <div
                      key={ev.event_id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-200 shadow-xs"
                          : "bg-white border-slate-200 hover:border-indigo-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="font-bold text-slate-900 font-sans block text-xs">
                            {ev.event_type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {ev.scheduled_ts.slice(11, 16)} ET &bull; {ev.importance}
                          </span>
                        </div>

                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                            Math.abs(ev.standardized_surprise) >= 1.2
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ev.standardized_surprise > 0 ? "+" : ""}
                          {ev.standardized_surprise.toFixed(1)}&sigma;
                        </span>
                      </div>

                      {/* Actual vs Consensus */}
                      <div className="mt-2 grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-lg text-[11px] font-mono border border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Actual</span>
                          <strong className="text-slate-900 font-bold">{ev.actual}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">Consensus</span>
                          <span className="text-slate-600">{ev.consensus}</span>
                        </div>
                      </div>

                      {/* Market Reaction & Action Button */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] font-mono">
                          <span className="text-slate-400">NQ 60m: </span>
                          <strong className={nqReaction >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {nqReaction > 0 ? "+" : ""}{nqReaction.toFixed(2)}%
                          </strong>
                        </div>

                        <button
                          onClick={() => onSelectEvent(ev)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-800 hover:bg-slate-900 text-white"
                          }`}
                        >
                          <span>{isSelected ? "Active Focus" : "Load in Radar"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom helper footnote */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Historical Bureau Feeds</span>
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Point-In-Time Integrity</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
