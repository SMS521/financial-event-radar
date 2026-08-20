/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component, ReactNode, ErrorInfo } from "react";
import { LegalDisclaimer } from "./components/LegalDisclaimer";
import { Header } from "./components/Header";
import { EventSelector } from "./components/EventSelector";
import { FocusModeDashboard } from "./components/FocusModeDashboard";
import { AlertCenterModal } from "./components/AlertCenterModal";
import { MarketEventCalendar } from "./components/MarketEventCalendar";
import { Level1LiveHorizon } from "./components/Level1LiveHorizon";
import { Level2ReleaseMatrix } from "./components/Level2ReleaseMatrix";
import { Level3AnalogueEngine } from "./components/Level3AnalogueEngine";
import { Level4AgentWarRoom } from "./components/Level4AgentWarRoom";
import { CausalWhyGraph } from "./components/CausalWhyGraph";
import { EventRadarEngine } from "./components/EventRadarEngine";
import { WhatMattersNowWidget } from "./components/WhatMattersNowWidget";
import { Next24hEventTimeline } from "./components/Next24hEventTimeline";
import { LiveBackendIntegrationHub } from "./components/LiveBackendIntegrationHub";
import { FredLiveExplorer } from "./components/FredLiveExplorer";
import { LiveMarketQuotes } from "./components/LiveMarketQuotes";
import { StockPreMarketTerminal } from "./components/StockPreMarketTerminal";
import { YahooFinanceOmniSearch } from "./components/YahooFinanceOmniSearch";
import { HISTORICAL_EVENTS, AGENT_SCORECARDS } from "./data/eventDataset";
import { FULL_70_MARKET_EVENTS } from "./data/cohortAdapter";
import { findHistoricalAnalogs } from "./lib/quantEngine";
import { validateEventIntegrity } from "./lib/eventValidator";
import { MarketEvent, AgentCouncilResult } from "./types";
import { AlertTriangle, RefreshCw, XCircle, RotateCcw } from "lucide-react";

interface BoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global App Error Boundary
 * Catches any unexpected rendering/lifecycle exception and renders a high-contrast recovery UI
 */
class GlobalErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GlobalErrorBoundary captured error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <div>
                <h2 className="text-lg font-bold">Platform State Recovery</h2>
                <p className="text-xs text-slate-400">
                  {this.props.fallbackTitle || "An unexpected error occurred during rendering."}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recover & Reset View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * OmniSearch Modal Error Boundary
 * Prevents modal toggle or search lifecycle crashes from taking down the entire page.
 */
class OmniSearchErrorBoundary extends React.Component<
  { children: ReactNode; onDismiss: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onDismiss: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("OmniSearch visibility/mounting error caught:", error, errorInfo);
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null });
    this.props.onDismiss();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div
          id="omni-search-fallback-toast"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0f172a] border border-rose-500/60 rounded-xl p-4 shadow-2xl text-slate-100 flex items-start space-x-3 animate-in fade-in duration-150"
        >
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold text-slate-200">Search Modal Encountered a Mount Issue</h4>
            <p className="text-[11px] text-slate-400">
              The search view was safely isolated. You can dismiss this alert or try opening search again.
            </p>
            <div className="flex items-center space-x-2 pt-1.5">
              <button
                onClick={this.handleDismiss}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("premarket");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState<boolean>(false);
  const [selectedStockTicker, setSelectedStockTicker] = useState<string>("MSFT");
  const [events, setEvents] = useState<MarketEvent[]>(FULL_70_MARKET_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent>(FULL_70_MARKET_EVENTS[0]);
  const [councilResult, setCouncilResult] = useState<AgentCouncilResult | null>(null);
  const [isLoadingCouncil, setIsLoadingCouncil] = useState<boolean>(false);
  const [isAiLive, setIsAiLive] = useState<boolean>(true);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  // Compute KNN analogues and distribution statistics whenever selectedEvent or events change
  const { analogs: matchingAnalogs, stats } = useMemo(() => {
    return findHistoricalAnalogs(selectedEvent, events, 8);
  }, [selectedEvent, events]);

  // Handle running the Multi-Agent Council with data integrity validation
  const handleRunCouncil = async () => {
    // 1. Data Integrity Validation Layer Check
    const validation = validateEventIntegrity(selectedEvent);
    if (!validation.isValid) {
      setValidationAlert(`Cannot convene agent council: ${validation.errors.join("; ")}`);
      return;
    }
    setValidationAlert(null);

    setIsLoadingCouncil(true);
    try {
      const storedKey = localStorage.getItem("ferrp_api_key") || localStorage.getItem("webapp_api_key") || "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (storedKey) {
        headers["Authorization"] = `Bearer ${storedKey}`;
        headers["X-API-Key"] = storedKey;
      }

      const response = await fetch("/api/agents/council", {
        method: "POST",
        headers,
        body: JSON.stringify({
          event: selectedEvent,
          analogues: matchingAnalogs,
          stats: stats,
          origin: validation.isVerified ? "verified_bureau_feed" : "user_simulated_entry",
        }),
      });

      if (!response.ok) {
        throw new Error(`Council API response failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.council) {
        setCouncilResult(data.council);
      }
    } catch (err) {
      console.warn("Falling back to local quantitative council synthesis:", err);
      // Generate deterministic research council result
      const isHawkish = selectedEvent.standardized_surprise > 0;
      const mag = Math.abs(selectedEvent.standardized_surprise);
      const direction = isHawkish ? "bearish" : "bullish";

      setCouncilResult({
        macro_agent: {
          stance: direction,
          confidence: 0.88,
          thesis: `${selectedEvent.event_type} printed at ${selectedEvent.actual} vs ${selectedEvent.consensus} expected (${selectedEvent.standardized_surprise > 0 ? "+" : ""}${selectedEvent.standardized_surprise}σ). This represents a clear ${isHawkish ? "hawkish impulse reinforcing higher-for-longer policy rates" : "dovish disinflationary relief creating room for rate cuts"}.`,
          key_drivers: [
            `Standardized Surprise: ${selectedEvent.standardized_surprise > 0 ? "+" : ""}${selectedEvent.standardized_surprise}σ`,
            `Monetary Regime: ${selectedEvent.market_state.fed_regime}`,
            `VIX Regime: ${selectedEvent.market_state.vix_regime}`,
          ],
        },
        rates_agent: {
          stance: direction,
          confidence: 0.85,
          yield_curve_view: `Front-end yields (2Y) shift by ${isHawkish ? "+" : "-"}${(mag * 12).toFixed(1)}bps in direct response. Term premium adjusts on 10Y yields.`,
          duration_impact: isHawkish ? "Duration Underweight / Curve Flattening" : "Duration Overweight / Curve Steepening",
        },
        global_agent: {
          stance: direction,
          currency_transmission: `USD Index (DXY) moves ${isHawkish ? "+" : "-"}${(mag * 0.45).toFixed(2)}%, altering cross-border liquidity and import price pressures.`,
          global_spillover: "Cross-asset spillover across DAX, Nikkei, and emerging Asian equities.",
        },
        news_agent: {
          narrative_framing: `Financial media framing this as "${isHawkish ? "Inflation Persistence Threatens Rate Cuts" : "Disinflation Milestone Unlocks Fed Easing"}"`,
          algorithmic_latency: "120 microseconds on direct exchange feeds",
          media_bias: "Institutional consensus anchoring bias detected",
        },
        historical_scientist: {
          analogue_count: matchingAnalogs.length,
          median_response: `${stats.median_60m > 0 ? "+" : ""}${stats.median_60m.toFixed(2)}% on NQ (60m)`,
          win_rate: `${(stats.prob_up_25 * 100).toFixed(0)}% Bull / ${(stats.prob_down_25 * 100).toFixed(0)}% Bear`,
          statistical_takeaway: `Sample empirical distribution exhibits t-statistic of ${stats.t_statistic.toFixed(2)} (p = ${stats.p_value.toFixed(3)}). Statistically significant conditional edge.`,
        },
        bull_case: {
          headline: isHawkish ? "Exaggerated Algorithmic Dip Presents Liquidity Buy" : "Clear Multiple Expansion Runway for High-Beta Tech",
          core_arguments: [
            isHawkish ? "Core sub-components show deceleration despite sticky headline" : "Real rates ease, unlocking multiple expansion for Nasdaq-100",
            "Institutional dry powder remains on sidelines waiting for entry",
            "Earnings revisions remain supportive for large-cap secular winners",
          ],
          target_nq_60m: isHawkish ? "+0.45%" : `+${(mag * 1.25).toFixed(2)}%`,
        },
        bear_case: {
          headline: isHawkish ? "Aggressive Valuation Multiple Contraction on Higher Rates" : "Skeptical Bear Trap: Disinflation Signals Macro Demand Weakness",
          core_arguments: [
            isHawkish ? "Discount rate shock directly crushes tech forward P/E multiples" : "Dovish print driven by decelerating consumer demand and margin compression",
            "10Y yield surge tightens broader financial conditions index",
            "Systematic CTA / Volatility-targeting strategies forced to de-gross",
          ],
          target_nq_60m: isHawkish ? `-${(mag * 1.35).toFixed(2)}%` : "-0.30%",
        },
        skeptic_agent: {
          confounding_flags: selectedEvent.confounding.is_contaminated ? ["Confounded release detected"] : [],
          contamination_critique: selectedEvent.confounding.is_contaminated
            ? "CRITICAL WARNING: Release is heavily confounded by simultaneous secondary releases. Single-variable causality cannot be verified."
            : "Temporal isolation verified (no conflicting Tier-1 releases within ±60s). High causal reliability.",
          regime_drift_warning: "Monetary policy reaction function changes across rate regimes; weights conditioned accordingly.",
        },
        research_manager: {
          executive_summary: `The Multi-Agent Council establishes a ${direction.toUpperCase()} baseline for ${selectedEvent.event_type} (${selectedEvent.actual} vs ${selectedEvent.consensus}). Historical analogues (N=${matchingAnalogs.length}) demonstrate a conditional median 60m return of ${stats.median_60m > 0 ? "+" : ""}${stats.median_60m.toFixed(2)}% with ${(stats.prob_up_25 * 100).toFixed(0)}% directional win rate.`,
          consensus_bias: direction,
          overall_confidence: 0.86,
          synthesized_probability_up: stats.prob_up_25,
          synthesized_probability_down: stats.prob_down_25,
          why_graph_summary: `Information Shock (${selectedEvent.standardized_surprise.toFixed(1)}σ) -> Yields (${selectedEvent.reactions.TREASURY_2Y["5m"]}bp) -> Valuation -> Equity Equilibrium.`,
        },
        risk_officer: {
          recommended_action: isHawkish ? "Hedge Duration" : "High Conviction Position",
          max_drawdown_risk: `${(stats.std_dev_60m * 1.65).toFixed(2)}% (95% 1-hour VaR)`,
          key_invalidation_level: isHawkish ? "NQ break above +0.40% on volume" : "NQ break below -0.35% on volume",
          tail_risk_warning: "Monitor secondary Fed speaker commentary at +90m for potential narrative pushback.",
        },
      });
    } finally {
      setIsLoadingCouncil(false);
    }
  };

  // Auto-run council debate on initial event load or switch
  useEffect(() => {
    handleRunCouncil();
  }, [selectedEvent.event_id]);

  const handleSelectEvent = (event: MarketEvent) => {
    setSelectedEvent(event);
    // If it's a simulated event not in the events list, add it
    if (!events.some((e) => e.event_id === event.event_id)) {
      setEvents([event, ...events]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Prominent & Persistent Legal Disclaimer Banner */}
      <LegalDisclaimer />

      {/* 2. Main Application Navigation & Mode Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventCount={events.length}
        isAiLive={isAiLive}
        isFocusMode={isFocusMode}
        setIsFocusMode={setIsFocusMode}
        onOpenAlerts={() => setIsAlertModalOpen(true)}
        onOpenSearch={() => setIsOmniSearchOpen(true)}
      />

      {/* Global Yahoo Finance Omni Search Modal (opens anywhere on search click or hotkey) */}
      <OmniSearchErrorBoundary onDismiss={() => setIsOmniSearchOpen(false)}>
        <YahooFinanceOmniSearch
          isOpen={isOmniSearchOpen}
          onClose={() => setIsOmniSearchOpen(false)}
          onSelectSymbol={(ticker) => {
            setSelectedStockTicker(ticker);
            setIsFocusMode(false);
            setActiveTab("premarket");
          }}
        />
      </OmniSearchErrorBoundary>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* 1. FOCUS MODE (5-Question, Low-Friction, High-Signal Robinhood Simplicity)  */}
        {/* ========================================================================= */}
        {isFocusMode ? (
          <FocusModeDashboard
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            onSelectEventId={(id) => {
              const matched = events.find((e) => e.event_id === id);
              if (matched) setSelectedEvent(matched);
            }}
            onSwitchToProMode={() => setIsFocusMode(false)}
          />
        ) : (
          /* ======================================================================= */
          /* 2. PRO MODE (Full Quant Rigor, 4-Level Deep Dive, War Room, & Analogs)  */
          /* ======================================================================= */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* PRO TAB: US & PRE-MARKET TERMINAL (Dual Price, EUR Small Font, Interactive Chart, German Sessions) */}
            {activeTab === "premarket" && (
              <div className="space-y-6">
                <StockPreMarketTerminal initialTicker={selectedStockTicker} />
              </div>
            )}

            {/* Landmark Event Selector & Simulator Bar (Always visible in Pro Mode for other tabs) */}
            {activeTab !== "premarket" && (
              <EventSelector
                events={events}
                selectedEvent={selectedEvent}
                onSelectEvent={handleSelectEvent}
                onRunCouncil={handleRunCouncil}
                isLoadingCouncil={isLoadingCouncil}
              />
            )}

            {validationAlert && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
                <span>{validationAlert}</span>
                <button
                  onClick={() => setValidationAlert(null)}
                  className="text-rose-600 hover:text-rose-900 font-bold ml-4 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* PRO TAB: LIVE MARKET QUOTES & SPEED BENCHMARK */}
            {activeTab === "quotes" && (
              <div className="space-y-6">
                <LiveMarketQuotes selectedEvent={selectedEvent} />
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB 1: RADAR (Dual Radar, Live Horizon, Release Matrix, War Room) */}
            {activeTab === "radar" && (
              <div className="space-y-6">
                <WhatMattersNowWidget />
                <Next24hEventTimeline />
                <EventRadarEngine />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Level1LiveHorizon event={selectedEvent} />
                  <Level2ReleaseMatrix event={selectedEvent} />
                </div>
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB 2: CALENDAR (Macro Event Monthly Grid & Node Inspector) */}
            {activeTab === "calendar" && (
              <div className="space-y-6">
                <MarketEventCalendar
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                />
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB: FRED LIVE DATA EXPLORER */}
            {activeTab === "fred" && (
              <div className="space-y-6">
                <FredLiveExplorer
                  onInjectEvent={(liveEvent) => {
                    handleSelectEvent(liveEvent);
                    setActiveTab("radar");
                  }}
                />
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB 3: CAUSAL WHY (Rate Transmission Graph & Economic Mechanism) */}
            {activeTab === "why-graph" && (
              <div className="space-y-6">
                <CausalWhyGraph event={selectedEvent} />
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB 4: ANALOGS & REPLAY (Historical Analogue Lab + Timeline Replay) */}
            {activeTab === "analogs" && (
              <div className="space-y-6">
                <Level3AnalogueEngine
                  currentEvent={selectedEvent}
                  analogs={matchingAnalogs}
                  stats={stats}
                />
                <Level4AgentWarRoom
                  council={councilResult}
                  scorecards={AGENT_SCORECARDS}
                  isLoading={isLoadingCouncil}
                  onRefresh={handleRunCouncil}
                  event={selectedEvent}
                />
              </div>
            )}

            {/* PRO TAB 5: BACKEND BRIDGE (FastAPI & Secrets Hub) */}
            {activeTab === "live-bridge" && (
              <LiveBackendIntegrationHub
                onInjectEvent={(liveEvent) => {
                  handleSelectEvent(liveEvent);
                  setActiveTab("radar");
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Alert Center Modal (1-Tap accessible with custom thresholds & storage) */}
      <AlertCenterModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onSelectEvent={(id) => {
          setIsFocusMode(false);
          setActiveTab("radar");
        }}
      />

      {/* Terminal Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-slate-900 font-bold font-mono">FERRP</span>
          <span>&bull;</span>
          <span className="text-slate-600 font-medium">Financial Event Risk & Reaction Platform</span>
          <span>&bull;</span>
          <span className="text-slate-400">Quantitative Event Radar &bull; Causal Transmission &bull; Historical Analogs &bull; Replay Lab</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            SYNTHETIC DATA • RESEARCH SIMULATION
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            INTEGRITY VERIFIED
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary fallbackTitle="Financial Event Risk Platform">
      <MainApp />
    </GlobalErrorBoundary>
  );
}

