import React, { useState } from "react";
import {
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  Zap,
  Target,
  BarChart3,
  Filter,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface VisualEventCompassItem {
  id: string;
  eventName: string;
  country: string;
  flagEmoji: string;
  releaseDate: string;
  timeCest: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  actual: string;
  consensus: string;
  previous: string;
  unit: string;
  outcomeType: "BEAT" | "MISS" | "IN_LINE";
  deviationScore: number; // e.g. +1.4 or -0.9 sigma
  marketResponse: "BULLISH_UP" | "BEARISH_DOWN" | "CHOPPY_NEUTRAL";
  immediatePriceMoveNasdaq: string;
  immediatePriceMoveSP500: string;
  immediateYieldMove10Y: string;
  immediateGoldMove: string;
  targetZoneHit: string;
  grandpaExplanation: string;
  compassAngleDegrees: number; // e.g. 45 for Northeast (Up), 225 for Southwest (Down)
}

export const VISUAL_EVENT_COMPASS_DATA: VisualEventCompassItem[] = [
  {
    id: "comp-1",
    eventName: "US Core CPI (Consumer Price Index)",
    country: "US",
    flagEmoji: "🇺🇸",
    releaseDate: "Wednesday, Aug 14",
    timeCest: "14:30 CEST",
    importance: "HIGH",
    actual: "0.17%",
    consensus: "0.20%",
    previous: "0.06%",
    unit: "MoM",
    outcomeType: "BEAT",
    deviationScore: 1.4,
    marketResponse: "BULLISH_UP",
    immediatePriceMoveNasdaq: "+1.65% (Rally to 19,840)",
    immediatePriceMoveSP500: "+1.10%",
    immediateYieldMove10Y: "-7.4 bps (3.84%)",
    immediateGoldMove: "+0.95% ($2,485)",
    targetZoneHit: "Target Coordinate Hit: TP1 $138.50 on Tech",
    grandpaExplanation: "Inflation cooled down nicely! Prices aren't climbing as fast, so the Fed can lower interest rates — stocks flashed green and skyrocketed like a green traffic light!",
    compassAngleDegrees: 35 // Up-Right (Bullish Beat)
  },
  {
    id: "comp-2",
    eventName: "US Retail Sales (Control Group)",
    country: "US",
    flagEmoji: "🇺🇸",
    releaseDate: "Thursday, Aug 15",
    timeCest: "14:30 CEST",
    importance: "HIGH",
    actual: "+1.0%",
    consensus: "+0.3%",
    previous: "-0.2%",
    unit: "%",
    outcomeType: "BEAT",
    deviationScore: 2.1,
    marketResponse: "BULLISH_UP",
    immediatePriceMoveNasdaq: "+2.40% (Surge +460 pts)",
    immediatePriceMoveSP500: "+1.61%",
    immediateYieldMove10Y: "+12.2 bps (3.92%)",
    immediateGoldMove: "+0.45% ($2,468)",
    targetZoneHit: "Target Coordinate Hit: Massive Buy Zone Confirmation",
    grandpaExplanation: "People are still spending lots of money at stores and online! This proved the economy is NOT in a recession, triggering massive green buying across every single stock.",
    compassAngleDegrees: 25 // Very Bullish Upward
  },
  {
    id: "comp-3",
    eventName: "US Non-Farm Payrolls (NFP Employment)",
    country: "US",
    flagEmoji: "🇺🇸",
    releaseDate: "Friday, Aug 02",
    timeCest: "14:30 CEST",
    importance: "HIGH",
    actual: "114k",
    consensus: "175k",
    previous: "179k",
    unit: "Jobs",
    outcomeType: "MISS",
    deviationScore: -2.3,
    marketResponse: "BEARISH_DOWN",
    immediatePriceMoveNasdaq: "-2.85% (Sell-off)",
    immediatePriceMoveSP500: "-1.84%",
    immediateYieldMove10Y: "-18.5 bps (3.79%)",
    immediateGoldMove: "+1.20% ($2,440)",
    targetZoneHit: "Target Coordinate Hit: SL Protected at Put Exit Zone",
    grandpaExplanation: "Companies hired way fewer workers than expected and unemployment ticked up. Investors got scared of a recession, flashing red and triggering a rapid algorithmic sell-off.",
    compassAngleDegrees: 215 // South-West (Downside Miss)
  },
  {
    id: "comp-4",
    eventName: "German ZEW Economic Sentiment",
    country: "Germany",
    flagEmoji: "🇩🇪",
    releaseDate: "Tuesday, Aug 13",
    timeCest: "11:00 CEST",
    importance: "MEDIUM",
    actual: "19.2",
    consensus: "32.0",
    previous: "41.8",
    unit: "Pts",
    outcomeType: "MISS",
    deviationScore: -1.8,
    marketResponse: "BEARISH_DOWN",
    immediatePriceMoveNasdaq: "-0.40%",
    immediatePriceMoveSP500: "-0.32%",
    immediateYieldMove10Y: "-4.1 bps (2.18% Bund)",
    immediateGoldMove: "+0.30%",
    targetZoneHit: "DAX Pullback into 18,300 Support Floor",
    grandpaExplanation: "German business leaders felt worried about exports and manufacturing. The German DAX slipped lower into its support zone.",
    compassAngleDegrees: 200 // Down
  },
  {
    id: "comp-5",
    eventName: "UK CPI Inflation Rate",
    country: "UK",
    flagEmoji: "🇬🇧",
    releaseDate: "Wednesday, Aug 14",
    timeCest: "08:00 CEST",
    importance: "HIGH",
    actual: "2.2%",
    consensus: "2.3%",
    previous: "2.0%",
    unit: "YoY",
    outcomeType: "BEAT",
    deviationScore: 0.8,
    marketResponse: "BULLISH_UP",
    immediatePriceMoveNasdaq: "+0.55%",
    immediatePriceMoveSP500: "+0.45%",
    immediateYieldMove10Y: "-5.2 bps Gilt",
    immediateGoldMove: "+0.40%",
    targetZoneHit: "FTSE 100 8,300 Breakout Tested",
    grandpaExplanation: "British inflation stayed low and contained. Lower inflation makes money worth more and gives the Bank of England green light to cut borrowing rates.",
    compassAngleDegrees: 40 // Up
  },
  {
    id: "comp-6",
    eventName: "NVIDIA Q2 AI Hardware Earnings",
    country: "US",
    flagEmoji: "🇺🇸",
    releaseDate: "Wednesday, Aug 28",
    timeCest: "22:20 CEST",
    importance: "HIGH",
    actual: "$30.04B vs $28.7B",
    consensus: "$28.70B",
    previous: "$26.04B",
    unit: "USD",
    outcomeType: "BEAT",
    deviationScore: 1.9,
    marketResponse: "BULLISH_UP",
    immediatePriceMoveNasdaq: "+3.20% (Futures +620 pts)",
    immediatePriceMoveSP500: "+1.85%",
    immediateYieldMove10Y: "+2.0 bps",
    immediateGoldMove: "+0.20%",
    targetZoneHit: "Target Coordinate Hit: $138.50 - $144.00 Call Zone",
    grandpaExplanation: "Nvidia sold huge amounts of computer chips for AI and crushed sales forecasts! Tech stocks rallied with green upward momentum.",
    compassAngleDegrees: 15 // Strong Northeast Bullish
  }
];

export const VisualEventCompass: React.FC = () => {
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "BEAT" | "MISS" | "IN_LINE">("ALL");
  const [selectedCompassItem, setSelectedCompassItem] = useState<VisualEventCompassItem>(VISUAL_EVENT_COMPASS_DATA[0]);
  const [showGrandpaMode, setShowGrandpaMode] = useState<boolean>(true);

  const filteredItems = VISUAL_EVENT_COMPASS_DATA.filter((item) => {
    if (outcomeFilter === "ALL") return true;
    return item.outcomeType === outcomeFilter;
  });

  return (
    <div id="visual-event-compass-module" className="bg-white border border-slate-200 rounded-3xl shadow-lg p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Visual Event Compass
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                DIRECTIONAL READOUT
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Color-coded green/red indicators & directional arrows showing immediate expectation beats vs misses
            </p>
          </div>
        </div>

        {/* Filters & Mode toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Grandpa explanation toggle */}
          <button
            onClick={() => setShowGrandpaMode(!showGrandpaMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
              showGrandpaMode
                ? "bg-amber-50 text-amber-800 border-amber-300 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Grandpa Mode: {showGrandpaMode ? "ON" : "OFF"}</span>
          </button>

          {/* Beat / Miss / In-line filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(["ALL", "BEAT", "MISS"] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setOutcomeFilter(filterKey)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  outcomeFilter === filterKey
                    ? filterKey === "BEAT"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : filterKey === "MISS"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filterKey === "ALL" && "All Events"}
                {filterKey === "BEAT" && "🟢 Beats (Upside)"}
                {filterKey === "MISS" && "🔴 Misses (Downside)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visual Display: Interactive Compass Dial + Event Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Compass Needle Gauge (4 cols) */}
        <div className="lg:col-span-5 bg-radial from-slate-900 to-slate-950 rounded-3xl p-6 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-xl border border-slate-800">
          {/* Subtle radar circular rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
            <div className="w-64 h-64 rounded-full border-2 border-indigo-400"></div>
            <div className="w-48 h-48 rounded-full border border-indigo-400 absolute"></div>
            <div className="w-32 h-32 rounded-full border border-indigo-400 absolute"></div>
          </div>

          <div className="text-center mb-3 z-10">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Reaction Sensitivity Compass
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {selectedCompassItem.eventName}
            </div>
          </div>

          {/* Circular Compass Dial Graphic with Rotating Needle */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2 z-10">
            {/* North, South, East, West Cardinal Markers */}
            <div className="absolute top-1 text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> BEAT / SURGE (+σ)
            </div>
            <div className="absolute bottom-1 text-[11px] font-mono font-bold text-rose-400 flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3" /> MISS / DROP (-σ)
            </div>
            <div className="absolute right-1 text-[10px] font-mono text-slate-400">IN-LINE</div>
            <div className="absolute left-1 text-[10px] font-mono text-slate-400">VOLATILE</div>

            {/* Rotating Arrow / Needle */}
            <div
              className="w-40 h-40 absolute flex items-center justify-center transition-transform duration-700 ease-out"
              style={{
                transform: `rotate(${
                  selectedCompassItem.outcomeType === "BEAT"
                    ? -45
                    : selectedCompassItem.outcomeType === "MISS"
                    ? 135
                    : 0
                }deg)`
              }}
            >
              <div className="relative h-full w-2 flex flex-col items-center justify-between">
                {/* Arrow head */}
                <div
                  className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] ${
                    selectedCompassItem.outcomeType === "BEAT"
                      ? "border-b-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : "border-b-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]"
                  }`}
                ></div>
                {/* Center Pivot Pin */}
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedCompassItem.outcomeType === "BEAT" ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  ></div>
                </div>
                {/* Arrow tail */}
                <div className="w-1 h-12 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Compass Outcome Readout Pill */}
          <div className="z-10 mt-3 flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 border ${
                selectedCompassItem.outcomeType === "BEAT"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs"
              }`}
            >
              {selectedCompassItem.outcomeType === "BEAT" ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>
                {selectedCompassItem.outcomeType} (Dev: {selectedCompassItem.deviationScore > 0 ? "+" : ""}
                {selectedCompassItem.deviationScore}σ)
              </span>
            </span>
          </div>
        </div>

        {/* Right Details Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header of selected event */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">{selectedCompassItem.flagEmoji}</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCompassItem.eventName}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                  <span>{selectedCompassItem.releaseDate}</span>
                  <span>&bull;</span>
                  <span>{selectedCompassItem.timeCest}</span>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-xl text-xs font-bold font-mono flex items-center space-x-1 border ${
                  selectedCompassItem.outcomeType === "BEAT"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
                }`}
              >
                {selectedCompassItem.outcomeType === "BEAT" ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-emerald-700" />
                    <span>UPSIDE BEAT</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-rose-700" />
                    <span>DOWNSIDE MISS</span>
                  </>
                )}
              </div>
            </div>

            {/* Numbers Print: Actual vs Expected vs Previous */}
            <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-200 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Actual Print</div>
                <div
                  className={`text-base font-bold font-mono ${
                    selectedCompassItem.outcomeType === "BEAT" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {selectedCompassItem.actual}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Consensus Expected</div>
                <div className="text-base font-bold font-mono text-slate-800">
                  {selectedCompassItem.consensus}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Previous</div>
                <div className="text-base font-bold font-mono text-slate-500">
                  {selectedCompassItem.previous}
                </div>
              </div>
            </div>
          </div>

          {/* Asset Price Response Vector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-indigo-700 font-bold uppercase block">Nasdaq 100</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedCompassItem.immediatePriceMoveNasdaq}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">S&P 500</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedCompassItem.immediatePriceMoveSP500}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">10Y US Yield</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedCompassItem.immediateYieldMove10Y}
              </span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">Gold Spot</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedCompassItem.immediateGoldMove}
              </span>
            </div>
          </div>

          {/* Grandpa Mode Explanation Banner */}
          {showGrandpaMode && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-950">
              <div className="w-7 h-7 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                👴
              </div>
              <div className="space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <span>Grandpa's Simple Translation:</span>
                </div>
                <p className="text-amber-900 leading-relaxed font-sans">
                  {selectedCompassItem.grandpaExplanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Compass Event Selector Bar */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span>Click Any Event to Align the Visual Compass:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredItems.map((item) => {
            const isSelected = selectedCompassItem.id === item.id;
            const isBeat = item.outcomeType === "BEAT";

            return (
              <button
                key={item.id}
                onClick={() => setSelectedCompassItem(item)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      isBeat ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isBeat ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <span>{item.flagEmoji}</span>
                      <span className="truncate max-w-[160px]">{item.eventName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Actual: <strong className={isBeat ? "text-emerald-700" : "text-rose-700"}>{item.actual}</strong> vs {item.consensus}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isBeat ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {item.outcomeType}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
