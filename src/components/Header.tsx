import React from "react";
import {
  Activity,
  Database,
  Cpu,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Radar,
  Lock,
  Radio,
  Calendar,
  Globe,
  Bell,
  Eye,
  Zap,
  Sliders,
  TrendingUp,
  Search,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  eventCount: number;
  isAiLive: boolean;
  isFocusMode: boolean;
  setIsFocusMode: (val: boolean) => void;
  onOpenAlerts: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  eventCount,
  isAiLive,
  isFocusMode,
  setIsFocusMode,
  onOpenAlerts,
  onOpenSearch,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      {/* Top micro status bar */}
      <div className="bg-slate-50/90 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-200/70 text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800 tracking-wide">FERRP PLATFORM:</span>
            <span className="text-emerald-600 font-mono font-semibold">ACTIVE EVENT MONITORING</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-mono">GERMANY (MESZ/CEST) &bull; US/EASTERN (EDT)</span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5 text-slate-600">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-mono">{eventCount} BENCHMARK EVENTS</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg">
            <button
              id="toggle-focus-mode"
              onClick={() => setIsFocusMode(true)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                isFocusMode
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Focus Mode</span>
            </button>
            <button
              id="toggle-pro-mode"
              onClick={() => setIsFocusMode(false)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                !isFocusMode
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Pro Mode</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200/80 shadow-xs">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span className="text-[11px]">AI: <strong className={isAiLive ? "text-indigo-600 font-semibold" : "text-amber-600"}>{isAiLive ? "ONLINE" : "READY"}</strong></span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Radar className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-sans">
                FERRP
              </h1>
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">&bull;</span>
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                Financial Event Risk & Reaction Platform
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                {isFocusMode ? "Focus" : "Pro"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              US & Pre-Market Prices &bull; Instant Omnibox &bull; Euro Conversion &bull; Causal Transmissions
            </p>
          </div>
        </div>

        {/* Consolidated Core Navigation Tabs + Direct Alerts Button + Quick Search Trigger */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {/* Instant Search Bar Button (Matching Image 2 Omnibox) */}
          {onOpenSearch && (
            <button
              id="header-instant-search-btn"
              onClick={onOpenSearch}
              className="px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shrink-0 shadow-xs border border-slate-700"
              title="Instant Search (as soon as you type 'm' it searches everything)"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Instant Search</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-slate-600">
                🔍
              </span>
            </button>
          )}

          <nav className="flex items-center space-x-1.5" aria-label="Main Navigation">
            {[
              { id: "premarket", label: "US & Pre-Market", icon: TrendingUp },
              { id: "focus", label: "Focus / Now", icon: Zap },
              { id: "quotes", label: "Live Quotes", icon: Activity },
              { id: "radar", label: "Event Radar", icon: Radar },
              { id: "calendar", label: "Calendar", icon: Calendar },
              { id: "fred", label: "FRED Live Data", icon: Database },
              { id: "why-graph", label: "Causal Why", icon: Cpu },
              { id: "analogs", label: "Analogs & Replay", icon: Activity },
              { id: "live-bridge", label: "Backend Bridge", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = (isFocusMode && tab.id === "focus") || (!isFocusMode && activeTab === tab.id);

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    if (tab.id === "focus") {
                      setIsFocusMode(true);
                    } else {
                      setIsFocusMode(false);
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200"
                      : "bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-indigo-600"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Dedicated Primary Alerts Center Button */}
          <button
            id="nav-btn-alerts"
            onClick={onOpenAlerts}
            className="px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer shrink-0"
            title="Open Live Alert Center"
          >
            <Bell className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Alerts</span>
            <span className="bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
