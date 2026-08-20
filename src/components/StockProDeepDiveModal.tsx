import React, { useState } from "react";
import { STOCK_PRO_PROFILES, StockProProfileData } from "../data/portalCalendarData";
import {
  X,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  FileText,
  Sliders,
  Sparkles,
  Search
} from "lucide-react";

interface Props {
  ticker: string | null;
  onClose: () => void;
}

export const StockProDeepDiveModal: React.FC<Props> = ({ ticker, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "Overview" | "News" | "Dividends" | "Earnings" | "Models" | "Financials" | "Compare" | "Health" | "Charts"
  >("Overview");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("1 Year");

  if (!ticker) return null;

  const profile: StockProProfileData = STOCK_PRO_PROFILES[ticker] || STOCK_PRO_PROFILES["AAPL"];

  const tabs: ("Overview" | "News" | "Dividends" | "Earnings" | "Models" | "Financials" | "Compare" | "Health" | "Charts")[] = [
    "Overview",
    "News",
    "Dividends",
    "Earnings",
    "Models",
    "Financials",
    "Compare",
    "Health",
    "Charts"
  ];

  return (
    <div
      id="stock-pro-deep-dive-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Ribbon - Matching Image 6 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-black text-slate-800 text-lg">
              {profile.ticker.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-200 text-slate-700">
                  {profile.exchange}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                United States / {profile.sector} / {profile.industry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{profile.ticker} Pro Research</span>
            </button>

            <button className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>Add to Watchlist</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar (Overview, News, Dividends, Earnings, Models...) */}
        <div className="px-4 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Modal Body - 2 Column Layout (Matching Image 6) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Exchange Data, Company Profile, Key Highlights, Peers, Price History) */}
            <div className="lg:col-span-6 space-y-6">
              {/* 1. Exchange Data Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Exchange Data
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">3:59 PM • Closed</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Price</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">
                      {profile.priceUsd.toFixed(2)} USD
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Day Change</span>
                    <span
                      className={`text-sm font-extrabold font-mono flex items-center gap-0.5 ${
                        profile.dayChangePct >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {profile.dayChangeUsd >= 0 ? "+" : ""}
                      {profile.dayChangeUsd.toFixed(2)} ({profile.dayChangePct.toFixed(2)}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">52-Week Range</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {profile.range52WeekLow} - {profile.range52WeekHigh}
                    </span>
                  </div>
                </div>

                {/* After Hours Quote */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 font-sans">After Hours:</span>
                  <span className="font-bold text-slate-800">${profile.afterHoursPrice.toFixed(2)}</span>
                  <span className="text-rose-600 font-bold">
                    {profile.afterHoursChangeUsd.toFixed(2)} ({profile.afterHoursChangePct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* 2. Company Profile & Bullish/Bearish Highlights */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Company Profile
                  </h4>
                  <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                    View More
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {profile.description}
                </p>

                {/* Dates & Filings Mini Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Latest Report</span>
                    <span className="font-bold text-slate-800">{profile.latestReportDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Next Earnings</span>
                    <span className="font-bold text-slate-800">{profile.nextEarningsDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SEC Filings</span>
                    <div className="flex gap-1 text-blue-600 font-bold">
                      {profile.secFilings.map((f) => (
                        <span key={f.label} className="hover:underline cursor-pointer">
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bullish & Bearish Highlight Cards (Matching Image 6 with green up & red down arrows) */}
                <div className="space-y-2 pt-2">
                  {profile.keyHighlights.map((hl, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        hl.isPositive
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-rose-50/70 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{hl.isPositive ? "🌱" : "🚨"}</span>
                        <span className="font-medium leading-snug">{hl.text}</span>
                      </div>
                      <span className="text-slate-400 font-bold shrink-0">›</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Peer Group Quick Compare */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Peer Group Comparison
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.peers.map((peer) => (
                      <span
                        key={peer}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold hover:bg-blue-100 cursor-pointer"
                      >
                        {peer}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors">
                  Quick Compare
                </button>
              </div>

              {/* 4. Price History Range Selector */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Price History
                  </h4>
                  <span className="text-xs text-blue-600 font-bold">Chart Gallery</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-100 p-1 rounded-xl">
                  {["1 Week", "1 Month", "3 Months", "1 Year", "5 Years", "10 Years"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedTimeRange === range
                          ? "bg-white text-blue-700 shadow-xs font-extrabold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Fair Value, Financial Health Score 1-5, Prebuilt Financial Models) */}
            <div className="lg:col-span-6 space-y-6">
              {/* 1. Fair Value Valuation Card (Matching Image 6) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Investing Fair Value Valuation
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">14 DCF & Multiple Models</span>
                </div>

                {/* Average / Downside / Uncertainty / Spread */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Average</span>
                    <span className="text-lg font-black text-rose-600 font-mono">
                      ${profile.fairValue.averageValueUsd.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Downside</span>
                    <span className="text-lg font-black text-rose-600 font-mono">
                      {profile.fairValue.downsidePct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Uncertainty</span>
                    <span className="text-sm font-black text-emerald-700 mt-1 block">
                      {profile.fairValue.uncertainty}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Spread</span>
                    <span className="text-xs font-mono font-bold text-slate-700 mt-1 block">
                      ${profile.fairValue.spreadLowUsd.toFixed(0)} - ${profile.fairValue.spreadHighUsd.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Target Sliders (Market Range vs Analyst Targets vs Investing Models) */}
                <div className="space-y-3 text-xs">
                  {/* 52-Week Range Slider */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 w-28">Market Range:</span>
                    <div className="flex-1 mx-3 h-2 bg-slate-200 rounded-full relative">
                      <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-blue-500 rounded-full" />
                      <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-xs" />
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      ${profile.priceUsd}
                    </span>
                  </div>

                  {/* Analyst Targets Slider */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 w-28">Analyst Targets (41):</span>
                    <div className="flex-1 mx-3 h-2 bg-slate-200 rounded-full relative">
                      <div className="absolute top-0 bottom-0 left-1/3 right-1/5 bg-emerald-500 rounded-full" />
                      <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-700 border-2 border-white shadow-xs" />
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      ${profile.fairValue.analystTarget.average}
                    </span>
                  </div>

                  {/* Investing Models Slider */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 w-28">14 Models:</span>
                    <div className="flex-1 mx-3 h-2 bg-slate-200 rounded-full relative">
                      <div className="absolute top-0 bottom-0 left-1/5 right-1/2 bg-rose-500 rounded-full" />
                      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-700 border-2 border-white shadow-xs" />
                    </div>
                    <span className="font-mono font-bold text-rose-600">
                      ${profile.fairValue.investingModels.average}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Financial Health Score Meter (1 to 5) (Matching Image 6) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Financial Health: {profile.financialHealth.overallRating}
                    </h4>
                  </div>
                  <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                    Health Details »
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  {profile.financialHealth.description}
                </p>

                {/* 1 to 5 Benchmark Score Gradient Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
                    <span>1 (Weak)</span>
                    <span>2</span>
                    <span className="text-blue-700 font-extrabold">3 (Good Performance)</span>
                    <span>4</span>
                    <span>5 (Great)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500" />
                    <div className="bg-amber-400" />
                    <div className="bg-blue-500 ring-2 ring-blue-700" />
                    <div className="bg-emerald-400" />
                    <div className="bg-emerald-600" />
                  </div>
                </div>

                {/* 5 Financial Health Pillar Boxes (Cash Flow, Growth, Momentum, Profitability, Relative Value) */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-base font-black text-amber-700 block">
                      {profile.financialHealth.cashFlowHealth}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                      Cash Flow
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-base font-black text-amber-700 block">
                      {profile.financialHealth.growthHealth}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                      Growth
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-base font-black text-amber-700 block">
                      {profile.financialHealth.priceMomentum}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                      Momentum
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-base font-black text-emerald-700 block">
                      {profile.financialHealth.profitabilityHealth}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                      Profitability
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-base font-black text-rose-700 block">
                      {profile.financialHealth.relativeValue}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                      Relative Value
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Prebuilt Financial Models (DCF EBITDA / Revenue Exit) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Prebuilt Financial Models
                    </h4>
                  </div>
                  <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                    Model Gallery »
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {profile.prebuiltModels.map((model) => (
                    <div
                      key={model.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-200/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">☑</span>
                        <span className="font-bold text-slate-800">{model.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          {model.fairValueResult}
                        </span>
                        <span className="text-[10px] text-slate-400">{model.updatedTimeAgo}</span>
                        <span className="text-blue-600 font-bold cursor-pointer hover:underline">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Source: Fundamental Financial Data & Institutional Consensus Model Fabric
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
