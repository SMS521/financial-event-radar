import React, { useState } from "react";
import {
  ECONOMIC_CALENDAR_DATA,
  EARNINGS_CALENDAR_DATA,
  DIVIDEND_CALENDAR_DATA,
  EconomicCalendarRow,
  EarningsCalendarRow,
  DividendCalendarRow,
  CentralBankRateRow
} from "../data/portalCalendarData";
import { CentralBanksRatesWidget } from "./CentralBanksRatesWidget";
import { MarketArticlesNewsFeed } from "./MarketArticlesNewsFeed";
import { StockProDeepDiveModal } from "./StockProDeepDiveModal";
import { VisualEventCompass } from "./VisualEventCompass";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Search,
  SlidersHorizontal,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  Volume2,
  Filter,
  CheckCircle2,
  Compass,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export const EconomicAndEarningsPortalView: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<
    "Economic Calendar" | "Visual Event Compass" | "Earnings" | "Dividends" | "Central Banks Rates" | "Market Overview" | "Holidays" | "Splits" | "IPO" | "Expiration"
  >("Economic Calendar");

  const [dateFilter, setDateFilter] = useState<string>("Today");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [importanceFilter, setImportanceFilter] = useState<number | "ALL">("ALL");
  const [expandedEconEventId, setExpandedEconEventId] = useState<string | null>("econ-14");
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);

  const mainTabs = [
    { id: "Economic Calendar", label: "📅 Economic Calendar" },
    { id: "Visual Event Compass", label: "🧭 Visual Event Compass (Beat/Miss)" },
    { id: "Earnings", label: "Earnings" },
    { id: "Dividends", label: "Dividends" },
    { id: "Central Banks Rates", label: "Central Banks Rates" },
    { id: "Market Overview", label: "Market Overview & News" },
    { id: "Holidays", label: "Holidays" },
    { id: "Splits", label: "Splits" },
    { id: "IPO", label: "IPO" },
    { id: "Expiration", label: "Expiration" }
  ];

  const dateFilterOptions = ["Yesterday", "Today", "Tomorrow", "This Week", "Next Week", "Custom dates"];

  // Filtered Economic Events
  const filteredEconomicEvents = ECONOMIC_CALENDAR_DATA.filter((e) => {
    const matchesSearch =
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.countryIso.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = importanceFilter === "ALL" || e.importanceStars >= importanceFilter;
    return matchesSearch && matchesImportance;
  });

  // Filtered Earnings
  const filteredEarnings = EARNINGS_CALENDAR_DATA.filter((earn) => {
    return (
      earn.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      earn.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      earn.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered Dividends
  const filteredDividends = DIVIDEND_CALENDAR_DATA.filter((div) => {
    return (
      div.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div id="investing-economic-calendar-portal" className="space-y-6">
      {/* Top Portal Navigation Tabs - Matching Images 1, 2, 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {mainTabs.map((tab) => {
          const isSelected = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date Filters Bar + Search Input - Matching Images 1 & 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Quick Date Selectors (Yesterday, Today, Tomorrow, This Week, Next Week...) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {dateFilterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setDateFilter(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === opt
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Search & Importance Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for event, ticker, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px] font-bold">Imp:</span>
            <button
              onClick={() => setImportanceFilter("ALL")}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                importanceFilter === "ALL" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setImportanceFilter(2)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                importanceFilter === 2 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              ⭐⭐+
            </button>
            <button
              onClick={() => setImportanceFilter(3)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                importanceFilter === 3 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              ⭐⭐⭐
            </button>
          </div>
        </div>
      </div>

      {/* Streaming Status Sub-Header Bar (Matching Image 1) */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Current Time: <strong className="text-slate-800 font-mono">00:09 (GMT+2:00 / CEST)</strong></span>
          </span>
          <span>•</span>
          <span>Display Time: <strong className="text-slate-700">remaining</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All data are streaming and updated automatically</span>
        </div>
      </div>

      {/* VIEW 0: DEDICATED VISUAL EVENT COMPASS */}
      {activeMainTab === "Visual Event Compass" && (
        <VisualEventCompass />
      )}

      {/* VIEW 1: ECONOMIC CALENDAR TABLE (Matching Image 1) */}
      {activeMainTab === "Economic Calendar" && (
        <div className="space-y-6">
          {/* Top Visual Event Compass Quick Widget */}
          <VisualEventCompass />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 8 Cols: Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Day Header Banner */}
              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-extrabold text-xs text-slate-800 flex items-center justify-between">
                <span>Tuesday, August 18, 2026</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {filteredEconomicEvents.length} Events Scheduled
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3 w-16">Time</th>
                      <th className="py-2.5 px-2 w-14">Cur.</th>
                      <th className="py-2.5 px-3">Event</th>
                      <th className="py-2.5 px-2 text-center w-14">Imp.</th>
                      <th className="py-2.5 px-3 text-right">Actual</th>
                      <th className="py-2.5 px-3 text-right">Forecast</th>
                      <th className="py-2.5 px-3 text-right">Previous</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredEconomicEvents.map((evt) => {
                      const isExpanded = expandedEconEventId === evt.id;
                      const hasActual = evt.actual && evt.actual !== "-";
                      const isHighImp = evt.importanceStars === 3;

                      return (
                        <React.Fragment key={evt.id}>
                          <tr
                            onClick={() => setExpandedEconEventId(isExpanded ? null : evt.id)}
                            className={`hover:bg-blue-50/70 transition-colors cursor-pointer ${
                              isHighImp ? "bg-amber-50/30" : ""
                            } ${isExpanded ? "bg-blue-50/90" : ""}`}
                          >
                            {/* Time */}
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                              {evt.time}
                            </td>

                            {/* Flag & Currency ISO */}
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700">
                                <span>{evt.countryFlag}</span>
                                <span>{evt.countryIso}</span>
                              </span>
                            </td>

                            {/* Event Title */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                  {evt.eventName}
                                </span>
                                {evt.isSpeech && (
                                  <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                              </div>
                            </td>

                            {/* Importance Stars (⭐, ⭐⭐, ⭐⭐⭐) */}
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <span className="text-amber-500 font-mono tracking-tighter text-xs">
                                {"★".repeat(evt.importanceStars)}
                                <span className="text-slate-300">
                                  {"★".repeat(3 - evt.importanceStars)}
                                </span>
                              </span>
                            </td>

                            {/* Actual */}
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                              {hasActual ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">
                                  {evt.actual}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Forecast */}
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {evt.forecast}
                            </td>

                            {/* Previous */}
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                              {evt.previous}
                            </td>
                          </tr>

                          {/* Expandable Drill-down Explanation & Market Reaction Coordinates */}
                          {isExpanded && (
                            <tr className="bg-blue-50/50">
                              <td colSpan={7} className="p-4 border-b border-blue-100">
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                                        Category: {evt.category}
                                      </span>
                                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                                        {evt.eventName} — Comprehensive Analysis
                                      </h4>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-500">
                                      Currency: {evt.currency}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                      <span className="font-bold text-slate-700 block">
                                        👵 Plain Explanation (For Beginners & Grandpa):
                                      </span>
                                      <p className="text-slate-600 leading-relaxed">
                                        {evt.grandpaExplanation}
                                      </p>
                                    </div>

                                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                                      <span className="font-bold text-indigo-950 block">
                                        🎯 Market Reaction & Knockout Coordinate:
                                      </span>
                                      <p className="text-indigo-800 leading-relaxed">
                                        {evt.impactOnMarket}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Central Banks Rates Widget (Matching Image 4) */}
          <div className="lg:col-span-4 space-y-6">
            <CentralBanksRatesWidget />
          </div>
        </div>
        </div>
      )}

      {/* VIEW 2: EARNINGS CALENDAR TABLE (Matching Image 2) */}
      {activeMainTab === "Earnings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day Header Banner */}
          <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-extrabold text-xs text-slate-800 flex items-center justify-between">
            <span>Tuesday, August 18, 2026 Earnings Releases</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Click any stock to open comprehensive Pro Valuation & Model Report
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3 text-right">EPS / Forecast</th>
                  <th className="py-2.5 px-3 text-right">Revenue / Forecast</th>
                  <th className="py-2.5 px-3 text-right">Market Cap</th>
                  <th className="py-2.5 px-2 text-center w-14">Time</th>
                  <th className="py-2.5 px-3 text-right">Last</th>
                  <th className="py-2.5 px-3 text-right">Extended Hours</th>
                  <th className="py-2.5 px-3 text-center">EPS Revisions</th>
                  <th className="py-2.5 px-3 text-right">Surprise %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredEarnings.map((earn) => {
                  const isPreMarket = earn.timeOfDay === "PRE_MARKET";
                  const isAfterHours = earn.timeOfDay === "AFTER_HOURS";

                  return (
                    <tr
                      key={earn.id}
                      onClick={() => setSelectedStockTicker(earn.ticker)}
                      className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Company Name & Ticker */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{earn.countryFlag}</span>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {earn.companyName}
                            </span>
                            <span className="ml-1 text-slate-500 font-mono text-[11px]">
                              ({earn.ticker})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* EPS / Forecast */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {earn.epsActual ? (
                          <span className="font-bold text-slate-900">{earn.epsActual}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400"> / </span>
                        <span className="text-slate-600 font-medium">{earn.epsForecast}</span>
                      </td>

                      {/* Revenue / Forecast */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {earn.revenueActual ? (
                          <span className="font-bold text-slate-900">{earn.revenueActual}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400"> / </span>
                        <span className="text-slate-600 font-medium">{earn.revenueForecast}</span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                        {earn.marketCap}
                      </td>

                      {/* Time (☀️ Before Market Open / 🌙 After Market Close) */}
                      <td className="py-2.5 px-2 text-center">
                        {isPreMarket && (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-amber-100 text-amber-700" title="Pre-Market">
                            <Sun className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {isAfterHours && (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-indigo-100 text-indigo-700" title="After-Hours">
                            <Moon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Last Price */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className="font-bold text-slate-900">{earn.lastPrice}</span>
                        <span
                          className={`ml-1 text-[11px] font-bold ${
                            earn.priceChangePct >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {earn.priceChangePct >= 0 ? "+" : ""}
                          {earn.priceChangePct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Extended Hours */}
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        {earn.extendedHoursPrice ? (
                          <span>
                            <span className="font-bold text-slate-700">{earn.extendedHoursPrice}</span>{" "}
                            <span
                              className={
                                (earn.extendedHoursChangePct || 0) >= 0
                                  ? "text-emerald-600 font-bold"
                                  : "text-rose-600 font-bold"
                              }
                            >
                              {(earn.extendedHoursChangePct || 0) >= 0 ? "+" : ""}
                              {earn.extendedHoursChangePct?.toFixed(2)}%
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* EPS Revisions (↑11 ↓17) */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                        <span className="text-emerald-600 font-bold">↑{earn.revisionsUp}</span>{" "}
                        <span className="text-rose-600 font-bold">↓{earn.revisionsDown}</span>
                      </td>

                      {/* Surprise % */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {earn.epsSurprisePct ? (
                          <span className="text-emerald-600">{earn.epsSurprisePct}</span>
                        ) : (
                          <span className="text-slate-300">- / -</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DIVIDEND CALENDAR TABLE (Matching Image 3) */}
      {activeMainTab === "Dividends" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 font-extrabold text-xs text-slate-800 flex items-center justify-between">
                <span>Monday, August 17, 2026 Dividend Ex-Dates</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  High Yield & Aristocrat Cash Payouts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Ex-Dividend Date</th>
                      <th className="py-2.5 px-3 text-right">Dividend</th>
                      <th className="py-2.5 px-2 text-center">Type</th>
                      <th className="py-2.5 px-3 text-right">Payment Date</th>
                      <th className="py-2.5 px-3 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredDividends.map((div) => (
                      <tr
                        key={div.id}
                        onClick={() => setSelectedStockTicker(div.ticker)}
                        className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Company Name & Ticker */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{div.countryFlag}</span>
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {div.companyName}
                              </span>
                              <span className="ml-1 text-slate-500 font-mono text-[11px]">
                                ({div.ticker})
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Ex-Dividend Date */}
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {div.exDividendDate}
                        </td>

                        {/* Dividend Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ${div.dividendAmount.toFixed(4)}
                        </td>

                        {/* Type (1M / 3M) */}
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                            {div.frequencyType}
                          </span>
                        </td>

                        {/* Payment Date */}
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {div.paymentDate}
                        </td>

                        {/* Yield % */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              div.dividendYieldPct > 8.0
                                ? "text-amber-600 font-extrabold"
                                : "text-emerald-700 font-bold"
                            }
                          >
                            {div.dividendYieldPct.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <CentralBanksRatesWidget />
          </div>
        </div>
      )}

      {/* VIEW 4: CENTRAL BANKS RATES DEDICATED (Matching Image 4) */}
      {activeMainTab === "Central Banks Rates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <CentralBanksRatesWidget />
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">
                Central Bank Policy Transmission
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Central bank interest rates determine borrowing costs, currency valuations, and equity multiple ceilings.
                When central banks adopt a <strong>Dovish</strong> policy (cutting rates), risk assets such as Nasdaq 100,
                Bitcoin, and Gold generally experience liquidity expansion.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">🕊️ Dovish Signal:</span>
                <span>Lowers discount rate → Expands Tech forward P/E multiples.</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-bold block">🦅 Hawkish Signal:</span>
                <span>Raises real yields → Compresses tech valuations & tightens financial conditions.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: MARKET OVERVIEW & ARTICLES FEED (Matching Image 5) */}
      {activeMainTab === "Market Overview" && (
        <MarketArticlesNewsFeed onSelectTicker={(t) => setSelectedStockTicker(t)} />
      )}

      {/* Other tabs placeholder fallback */}
      {["Holidays", "Splits", "IPO", "Expiration"].includes(activeMainTab) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">{activeMainTab} Schedule</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Live institutional feeds synchronized for upcoming {activeMainTab.toLowerCase()} dates across Frankfurt, Xetra, NYSE, and London.
          </p>
        </div>
      )}

      {/* Detailed Stock Pro Deep-Dive Modal (Matching Image 6) */}
      {selectedStockTicker && (
        <StockProDeepDiveModal
          ticker={selectedStockTicker}
          onClose={() => setSelectedStockTicker(null)}
        />
      )}
    </div>
  );
};
