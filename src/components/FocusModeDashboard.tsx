import React, { useState } from "react";
import {
  Flame,
  Clock,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Radio,
  ArrowRight,
  Bell,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  Database,
} from "lucide-react";
import { EventAwareWatchlist, WatchlistStockItem } from "./EventAwareWatchlist";
import { Next24hEventTimeline } from "./Next24hEventTimeline";
import { CausalWhyDrawer } from "./CausalWhyDrawer";

interface FocusModeDashboardProps {
  onOpenAlertModal: () => void;
  onSelectEventId?: (id: string) => void;
  onSwitchToProMode?: () => void;
}

export const FocusModeDashboard: React.FC<FocusModeDashboardProps> = ({
  onOpenAlertModal,
  onSelectEventId,
  onSwitchToProMode,
}) => {
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState<boolean>(false);
  const [whyDrawerParams, setWhyDrawerParams] = useState({
    eventTitle: "US Core CPI Inflation Print",
    surpriseZ: "+1.4σ",
    actualVsConsensus: "0.4% MoM vs 0.3% expected",
    movePct: "-0.62%",
    asset: "NQ (Nasdaq-100)",
  });

  const handleOpenWhy = (
    title = "US Core CPI Inflation Print",
    surprise = "+1.4σ",
    consensus = "0.4% MoM vs 0.3% expected",
    move = "-0.62%",
    assetName = "NQ (Nasdaq-100)"
  ) => {
    setWhyDrawerParams({
      eventTitle: title,
      surpriseZ: surprise,
      actualVsConsensus: consensus,
      movePct: move,
      asset: assetName,
    });
    setIsWhyDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="ferrp-focus-mode-view">
      {/* ========================================================================= */}
      {/* 1. HERO FOCUS CARD: WHAT MATTERS RIGHT NOW (Answered in 5 Seconds)      */}
      {/* ========================================================================= */}
      <section
        aria-label="What Matters Right Now"
        className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden"
      >
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Micro Status Line */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono font-bold uppercase tracking-wider text-rose-400">
                🔴 HIGH IMPACT EVENT DETECTED
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="font-mono text-slate-300">08:31:14 ET</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono text-slate-400">Provenance: <strong className="text-emerald-400">BLS Direct Bureau Feed</strong></span>
              <button
                onClick={onOpenAlertModal}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>3 Active Alerts</span>
              </button>
            </div>
          </div>

          {/* Level 1: Huge Focal Headline & Core Numbers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Event Title & Surprise (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  US Core CPI Inflation
                </span>
                <span className="text-xs text-slate-400 font-mono">Actual 0.4% vs Consensus 0.3%</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans">
                CPI &mdash; HOTTER THAN EXPECTED
              </h2>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm">
                  Surprise: <strong className="text-rose-400 font-black">+1.4&sigma;</strong>
                </div>
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm">
                  Impact Score: <strong className="text-amber-400 font-black">94 / 100</strong>
                </div>
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm">
                  P(|&Delta;NQ| &gt; 0.25%): <strong className="text-emerald-400 font-black">84%</strong>
                </div>
              </div>
            </div>

            {/* Right: Instant Asset Reaction Strip (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="font-bold text-slate-200">CROSS-ASSET RESPONSE</span>
                <span>T+60s Snapshot</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">NQ (Nasdaq)</span>
                  <span className="text-sm font-bold text-rose-400 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                    -0.62%
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">US 2Y Yield</span>
                  <span className="text-sm font-bold text-rose-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +9.2 bp
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">USD (DXY)</span>
                  <span className="text-sm font-bold text-rose-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +0.37%
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">VIX Index</span>
                  <span className="text-sm font-bold text-rose-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +8.4%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Level 2: Plain-English Why This Matters & Action Controls */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>WHY THIS MATTERS</span>
              </span>
              <p className="text-sm text-slate-200 font-medium">
                Higher inflation &rarr; stronger Fed terminal pricing &rarr; yields higher (+9bp) &rarr; immediate multiple compression on Nasdaq-100.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="btn-focus-why-drawer"
                onClick={() => handleOpenWhy()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-900/50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>[Why?] Causal Tree</span>
              </button>

              <button
                onClick={() => onSelectEventId && onSelectEventId("EVENT-2024-06-CPI")}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                Historical Cases (8)
              </button>

              {onSwitchToProMode && (
                <button
                  onClick={onSwitchToProMode}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  Pro Mode &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. VISIBLE NOISE SUPPRESSION FUNNEL                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                Point-in-Time Noise Suppression Funnel
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              FERRP is quiet because it filtered out 98% of the noise &mdash; showing only statistically significant market-moving shocks.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
              <span className="block text-[10px] text-slate-400 uppercase">1. Ingested</span>
              <strong className="text-slate-800 font-bold">124 Sources</strong>
            </div>
            <span className="text-slate-400">&rarr;</span>
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
              <span className="block text-[10px] text-slate-400 uppercase">2. Clustered</span>
              <strong className="text-slate-800 font-bold">17 Stories</strong>
            </div>
            <span className="text-slate-400">&rarr;</span>
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-center">
              <span className="block text-[10px] text-slate-400 uppercase">3. Filtered</span>
              <strong className="text-slate-800 font-bold">5 Events</strong>
            </div>
            <span className="text-slate-400">&rarr;</span>
            <div className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-center">
              <span className="block text-[10px] text-rose-500 uppercase font-bold">4. Actionable</span>
              <strong className="text-rose-700 font-bold">2 Alerts</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MARKET PULSE (Semantic Event Stream & Not A Noisy Feed)                */}
      {/* ========================================================================= */}
      <section
        aria-label="Market Pulse"
        className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Market Pulse &bull; Filtered Event Stream
              </h3>
              <p className="text-xs text-slate-500">
                Categorized by semantic impact rather than raw noise
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Latency: &lt;140ms
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Item 1 */}
          <div
            onClick={() => handleOpenWhy("US Core CPI MoM", "+1.4σ", "0.4% vs 0.3%", "-0.62%", "NQ")}
            className="p-3 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-400 text-[11px]">08:30</span>
              <span className="font-bold text-rose-700 flex items-center space-x-1">
                <span>🔴 CPI (US Core)</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-700 font-medium">Hotter than expected (+1.4&sigma;) &bull; Rate pricing hawkish</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                NQ &darr; -0.62%
              </span>
              <span className="text-indigo-600 font-bold hover:underline">[Why?]</span>
            </div>
          </div>

          {/* Item 2 */}
          <div
            onClick={() => handleOpenWhy("US 30Y Treasury Auction", "+0.8σ", "Tail in bid-to-cover", "-0.31%", "NQ")}
            className="p-3 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-400 text-[11px]">08:42</span>
              <span className="font-bold text-amber-800 flex items-center space-x-1">
                <span>🟠 30Y Bond Auction</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-700 font-medium">Tail detected &bull; Primary dealer absorption weak</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                Yields &uarr; +4.2bp
              </span>
              <span className="text-indigo-600 font-bold hover:underline">[Why?]</span>
            </div>
          </div>

          {/* Item 3 */}
          <div
            onClick={() => handleOpenWhy("NVIDIA Blackwell Scale 8-K", "+2.1σ", "Guidance raised", "+1.25%", "NVDA")}
            className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-400 text-[11px]">09:05</span>
              <span className="font-bold text-emerald-800 flex items-center space-x-1">
                <span>🟢 NVDA 8-K Filing</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-700 font-medium">Blackwell server shipment acceleration verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                NVDA &uarr; +1.3%
              </span>
              <span className="text-indigo-600 font-bold hover:underline">[Why?]</span>
            </div>
          </div>

          {/* Item 4 */}
          <div
            onClick={() => handleOpenWhy("Bank of Japan Ueda Speech", "+1.1σ", "Hawkish hint", "-0.85%", "Nikkei")}
            className="p-3 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-400 text-[11px]">03:30</span>
              <span className="font-bold text-purple-800 flex items-center space-x-1">
                <span>🟣 BOJ Keynote</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-700 font-medium">Ueda speech leaves door open for autumn rate hike</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                JPY &uarr; +1.2%
              </span>
              <span className="text-indigo-600 font-bold hover:underline">[Why?]</span>
            </div>
          </div>

          {/* Item 5 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-400 text-[11px]">14:30</span>
              <span className="font-bold text-slate-700">⚪ Jobless Claims</span>
              <span className="text-slate-500">&bull; In-line (215k vs 216k) &bull; Noise filtered</span>
            </div>
            <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              Neutral (&plusmn;0.0%)
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EVENT-AWARE WATCHLIST SECTION                                         */}
      {/* ========================================================================= */}
      <EventAwareWatchlist
        onOpenWhyModal={(item) =>
          handleOpenWhy(
            item.eventLabel,
            item.impactScore > 80 ? "+1.4σ" : "In-line",
            item.eventTime,
            item.changePct,
            item.ticker
          )
        }
      />

      {/* ========================================================================= */}
      {/* 5. NEXT 24H MACRO TIMELINE                                                */}
      {/* ========================================================================= */}
      <Next24hEventTimeline />

      {/* Causal Why Popover Drawer */}
      <CausalWhyDrawer
        isOpen={isWhyDrawerOpen}
        onClose={() => setIsWhyDrawerOpen(false)}
        eventTitle={whyDrawerParams.eventTitle}
        surpriseZ={whyDrawerParams.surpriseZ}
        actualVsConsensus={whyDrawerParams.actualVsConsensus}
        movePct={whyDrawerParams.movePct}
        asset={whyDrawerParams.asset}
      />
    </div>
  );
};
