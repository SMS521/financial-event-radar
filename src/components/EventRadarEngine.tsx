import React, { useState } from "react";
import {
  Radar,
  Radio,
  AlertTriangle,
  Flame,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  MessageSquare,
  BarChart3,
  Cpu,
  Search,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronRight,
  Compass,
  Bell,
  Settings2,
  Calculator,
  Volume2,
  X,
} from "lucide-react";
import { RADAR_EVENTS_DATABASE, REVERSE_EVENT_SAMPLES } from "../data/radarDataset";
import { RadarEventItem } from "../types";
import {
  RadarThresholdConfigModal,
  RadarThresholdSettings,
  DEFAULT_THRESHOLD_SETTINGS,
} from "./RadarThresholdConfigModal";
import { MathematicalModelLab } from "./MathematicalModelLab";

export function EventRadarEngine() {
  const [radarEvents, setRadarEvents] = useState<RadarEventItem[]>(RADAR_EVENTS_DATABASE);
  const [selectedEventId, setSelectedEventId] = useState<string>(RADAR_EVENTS_DATABASE[0].id);
  const [streamFilter, setStreamFilter] = useState<"ALL" | "SCHEDULED" | "UNEXPECTED" | "MATH_LAB" | "REVERSE_DETECTOR">("ALL");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedReverseCase, setSelectedReverseCase] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Custom User-Defined Threshold Settings
  const [thresholdSettings, setThresholdSettings] = useState<RadarThresholdSettings>(DEFAULT_THRESHOLD_SETTINGS);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [activeAlertNotification, setActiveAlertNotification] = useState<{ title: string; score: number; verdict: string; move: string } | null>(null);

  const activeEvent = radarEvents.find((e) => e.id === selectedEventId) || radarEvents[0];

  // Synthesize Web Audio chime for alerts
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.12); // B5

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (e) {
      console.warn("Web audio context restricted", e);
    }
  };

  // Check if an event matches the custom user-configured thresholds
  const isEventAlertTriggered = (ev: RadarEventItem): boolean => {
    const eis = ev.impact_score.total_impact_score;
    const prob = ev.impact_score.probability_exceeds_25bps;
    const cred = ev.impact_score.news_credibility.score;
    const yields = ev.impact_score.treasury_confirmation.score >= 80;

    const passEis = eis >= thresholdSettings.minImpactScore;
    const passProb = prob >= thresholdSettings.minProbability25bps;
    const passCred = cred >= thresholdSettings.minSourceCredibility;
    const passYield = !thresholdSettings.requireYieldConfirmation || yields;

    return passEis && passProb && passCred && passYield;
  };

  // Filtered radar events based on active tab & search
  const filteredEvents = radarEvents.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (streamFilter === "SCHEDULED") return ev.is_scheduled;
    if (streamFilter === "UNEXPECTED") return !ev.is_scheduled;
    return true;
  });

  // Simulated live event trigger
  const handleTriggerSimulatedEvent = (preset: "CPI_BULLISH" | "BOJ_BEARISH" | "NVDA_TECH" | "GEO_OIL") => {
    setIsSimulating(true);
    setTimeout(() => {
      let targetId = "RADAR-CPI-2024-06";
      if (preset === "BOJ_BEARISH") targetId = "RADAR-BOJ-CARRY-SHOCK";
      if (preset === "NVDA_TECH") targetId = "RADAR-NVDA-8K-BREAKING";
      if (preset === "GEO_OIL") targetId = "RADAR-GEOPOLITICAL-OIL-FLASH";

      setSelectedEventId(targetId);
      const targetEv = radarEvents.find((e) => e.id === targetId) || radarEvents[0];

      if (isEventAlertTriggered(targetEv)) {
        if (thresholdSettings.soundEnabled) playAlertChime();
        setActiveAlertNotification({
          title: targetEv.title,
          score: targetEv.impact_score.total_impact_score,
          verdict: targetEv.impact_score.signal_verdict,
          move: targetEv.impact_score.expected_nq_move_60m,
        });
        setTimeout(() => setActiveAlertNotification(null), 5000);
      }

      setIsSimulating(false);
    }, 500);
  };

  const handleTestAlertFromModal = (simulatedEvent: RadarEventItem) => {
    setSelectedEventId(simulatedEvent.id);
    setActiveAlertNotification({
      title: simulatedEvent.title,
      score: simulatedEvent.impact_score.total_impact_score,
      verdict: simulatedEvent.impact_score.signal_verdict,
      move: simulatedEvent.impact_score.expected_nq_move_60m,
    });
    setTimeout(() => setActiveAlertNotification(null), 5000);
  };

  const reverseCase = REVERSE_EVENT_SAMPLES[selectedReverseCase] || REVERSE_EVENT_SAMPLES[0];
  const activeAlertsCount = radarEvents.filter(isEventAlertTriggered).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Event Radar & Cross-Asset Market Impact Engine */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Radar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                  Financial Event Radar & Real-Time Impact Engine
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE DUAL RADAR</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Continuously scanning Macro Schedules, SEC 8-Ks, Central Banks, Social Velocity, and Sudden Market Anomalies
              </p>
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 font-sans">Simulate Live Wire:</span>
            <button
              onClick={() => handleTriggerSimulatedEvent("CPI_BULLISH")}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CPI Soft Print</span>
            </button>
            <button
              onClick={() => handleTriggerSimulatedEvent("BOJ_BEARISH")}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>BOJ Carry Shock</span>
            </button>
            <button
              onClick={() => handleTriggerSimulatedEvent("NVDA_TECH")}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>NVDA 8-K Filing</span>
            </button>
            <button
              onClick={() => handleTriggerSimulatedEvent("GEO_OIL")}
              className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Geopolitical Flash</span>
            </button>
          </div>
        </div>

        {/* Radar Modes & Tabs */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => setStreamFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                streamFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Signals ({radarEvents.length})
            </button>
            <button
              onClick={() => setStreamFilter("SCHEDULED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                streamFilter === "SCHEDULED"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. Scheduled Radar (Macro/CB/Earnings)</span>
            </button>
            <button
              onClick={() => setStreamFilter("UNEXPECTED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                streamFilter === "UNEXPECTED"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>2. Unexpected Radar (Wires/8-K/Geopolitics)</span>
            </button>
            <button
              onClick={() => setStreamFilter("REVERSE_DETECTOR")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                streamFilter === "REVERSE_DETECTOR"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. "Did Something Just Happen?" Detector</span>
            </button>
            <button
              onClick={() => setStreamFilter("MATH_LAB")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                streamFilter === "MATH_LAB"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50/80"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>4. Mathematical Model &amp; QC Backtest Lab</span>
            </button>
          </div>

          {/* Alert Threshold Configuration Panel Trigger */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center space-x-2 text-xs font-sans text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold">Thresholds:</span>
            <span className="font-mono font-bold text-indigo-700">
              EIS ≥ {thresholdSettings.minImpactScore} | P ≥ {thresholdSettings.minProbability25bps}%
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
              {activeAlertsCount} Active
            </span>
          </button>
        </div>
      </div>

      {/* Floating Active Visual Alert Toast */}
      {activeAlertNotification && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-indigo-500 shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-600 text-white rounded">
                  QUANTITATIVE IMPACT THRESHOLD TRIGGERED
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  EIS {activeAlertNotification.score}/100
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mt-0.5 font-sans">
                {activeAlertNotification.title} &bull;{" "}
                <span className="text-indigo-300">{activeAlertNotification.verdict}</span> ({activeAlertNotification.move})
              </h4>
            </div>
          </div>
          <button
            onClick={() => setActiveAlertNotification(null)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Threshold Configuration Modal */}
      <RadarThresholdConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={thresholdSettings}
        onSaveSettings={(newSettings) => setThresholdSettings(newSettings)}
        eventsPool={radarEvents}
        onTriggerTestAlert={handleTestAlertFromModal}
      />

      {/* Main Dual Radar Work Area */}
      {streamFilter === "MATH_LAB" ? (
        /* MATHEMATICAL MODEL & QC BACKTEST LAB */
        <MathematicalModelLab />
      ) : streamFilter === "REVERSE_DETECTOR" ? (
        /* REVERSE EVENT DETECTOR ("Did something just happen?") */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                  "Did Something Just Happen?" Reverse Market Anomaly Detector
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Detecting abnormal price/yield/volatility velocity and identifying the driving root cause
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedReverseCase(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedReverseCase === 0 ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                Case A: NQ -0.68% Flash Drop
              </button>
              <button
                onClick={() => setSelectedReverseCase(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedReverseCase === 1 ? "bg-indigo-100 text-indigo-800 border border-indigo-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                Case B: US 10Y -12.4bp Plunge
              </button>
            </div>
          </div>

          {/* Anomaly Readout Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold px-2 py-0.5">
                  ANOMALY DETECTED
                </span>
                <span className="text-xs text-slate-300 font-mono">{reverseCase.detected_market_move.timestamp}</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                Z-Score: {reverseCase.detected_market_move.z_score}σ (Significant Tail Event)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-sans">Target Asset</span>
                <div className="text-lg font-bold font-mono text-slate-100">{reverseCase.detected_market_move.asset}</div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-sans">Detection Window</span>
                <div className="text-lg font-bold font-mono text-cyan-300">{reverseCase.detected_market_move.timeframe}</div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-sans">Observed Velocity</span>
                <div className="text-lg font-bold font-mono text-rose-400">{reverseCase.detected_market_move.magnitude}</div>
              </div>
            </div>
          </div>

          {/* Candidate Causes Matrix */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans mb-3 flex items-center space-x-1.5">
              <span>Candidate Catalysts & Entity Attribution Ranking</span>
            </h3>

            <div className="space-y-3">
              {reverseCase.candidate_causes.map((cause, idx) => (
                <div
                  key={cause.event_id}
                  className={`p-4 rounded-xl border transition-all ${
                    cause.verification_status === "Confirmed Driver"
                      ? "bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <h4 className="font-bold text-slate-900 text-sm font-sans">{cause.title}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-500">Source: {cause.source}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cause.verification_status === "Confirmed Driver"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : cause.verification_status === "Probable Catalyst"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {cause.verification_status} ({cause.likelihood_score}%)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 font-sans shadow-xs flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 shrink-0">Transmission Channel:</span>
                    <span className="font-mono text-indigo-700 font-semibold">{cause.transmission_channel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Causal Verdict */}
            <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-sans text-indigo-950 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Automated Causality Synthesis:</strong>
                <span>{reverseCase.causal_verdict}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD DUAL RADAR VIEW: EVENT LIST + 7-FACTOR SCORECARD + IMPACT ALERT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Radar Event Feeds (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                    Radar Stream Feed ({filteredEvents.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Sort: Highest Impact</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by keyword, CPI, Fed, NVDA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-sans text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Event List Items */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredEvents.map((ev) => {
                  const isSelected = ev.id === activeEvent.id;
                  const isHighImpact = isEventAlertTriggered(ev);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/30 border-indigo-500 ring-2 ring-indigo-100 shadow-xs"
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md border ${
                            ev.is_scheduled
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-purple-100 text-purple-800 border-purple-200"
                          }`}
                        >
                          {ev.is_scheduled ? "SCHEDULED" : "UNEXPECTED BREAKING"}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {isHighImpact && (
                            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[9px] border border-rose-200">
                              <Flame className="w-2.5 h-2.5" />
                              <span>ALERT</span>
                            </span>
                          )}
                          <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {ev.impact_score.total_impact_score}/100
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 font-sans leading-snug line-clamp-2 mb-2">
                        {ev.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans border-t border-slate-100 pt-2">
                        <span className="truncate max-w-[150px]">{ev.source}</span>
                        <span className="font-mono font-bold text-slate-700">{ev.surprise || "Event"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 7-Factor Impact Scorecard & High Impact Alert Banner (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 🚨 HIGH IMPACT RADAR ALERT BANNER */}
            <div
              className={`rounded-2xl p-6 border shadow-sm transition-all ${
                isEventAlertTriggered(activeEvent)
                  ? activeEvent.impact_score.signal_color === "emerald"
                    ? "bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 border-emerald-300 ring-2 ring-emerald-100"
                    : "bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 border-rose-300 ring-2 ring-rose-100"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-xl text-white font-bold ${
                      activeEvent.impact_score.signal_color === "emerald"
                        ? "bg-emerald-600 shadow-emerald-200 shadow-md"
                        : "bg-rose-600 shadow-rose-200 shadow-md"
                    }`}
                  >
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 font-sans">
                        🚨 NQ RADAR &bull; HIGH IMPACT RADAR ALERT
                      </span>
                      <span className="text-[10px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
                        P(NQ &gt; &plusmn;0.25%): {activeEvent.impact_score.probability_exceeds_25bps}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span
                        className={`text-base font-extrabold font-sans tracking-tight ${
                          activeEvent.impact_score.signal_color === "emerald" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {activeEvent.impact_score.signal_verdict}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-bold text-slate-700 font-sans">
                        Confidence: {activeEvent.impact_score.confidence}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compound Impact Score Dial */}
                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Compound Score
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Threshold: ≥ {thresholdSettings.minImpactScore}</span>
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-indigo-700">
                    {activeEvent.impact_score.total_impact_score}
                    <span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Alert Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1 font-sans">
                    Expected 60m NQ Move
                  </span>
                  <div
                    className={`text-lg font-mono font-extrabold ${
                      activeEvent.impact_score.signal_color === "emerald" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {activeEvent.impact_score.expected_nq_move_60m}
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans">Empirically Grounded</span>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1 font-sans">
                    Key Invalidation Level
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 leading-snug">
                    {activeEvent.impact_score.key_invalidation_level}
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">Structural Stop Threshold</span>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1 font-sans">
                    Strategy Recommendation
                  </span>
                  <p className="text-xs font-sans text-slate-700 font-medium leading-tight">
                    {activeEvent.impact_score.recommended_strategy}
                  </p>
                </div>
              </div>
            </div>

            {/* 7-FACTOR IMPACT SCORECARD BREAKDOWN */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                    7-Factor Event Impact Scorecard Breakdown
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  Total: {activeEvent.impact_score.total_impact_score}/100
                </span>
              </div>

              {/* 7 Factor Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  activeEvent.impact_score.macro_importance,
                  activeEvent.impact_score.surprise_score,
                  activeEvent.impact_score.news_credibility,
                  activeEvent.impact_score.social_acceleration,
                  activeEvent.impact_score.treasury_confirmation,
                  activeEvent.impact_score.nq_reaction,
                  activeEvent.impact_score.cross_asset_confirmation,
                ].map((factor) => (
                  <div key={factor.name} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 font-sans">{factor.name}</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            factor.status === "Bullish" || factor.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : factor.status === "Bearish"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {factor.status}
                        </span>
                        <span className="font-mono font-extrabold text-slate-900">{factor.score}/100</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          factor.score >= 85
                            ? "bg-indigo-600"
                            : factor.score >= 70
                            ? "bg-indigo-500"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CROSS-ASSET MARKET REACTION DETECTOR */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                      Continuous Cross-Asset Market Reaction Detector
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Expected vs Actual Market Reaction Alignment
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross Asset Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {activeEvent.cross_assets.map((asset) => (
                  <div key={asset.symbol} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-xs text-slate-900">{asset.symbol}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          asset.is_aligned
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {asset.is_aligned ? "Aligned" : "Divergent"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Actual Move</span>
                      <div
                        className={`text-base font-mono font-extrabold ${
                          asset.direction === "up"
                            ? "text-emerald-600"
                            : asset.direction === "down"
                            ? "text-rose-600"
                            : "text-slate-700"
                        }`}
                      >
                        {asset.actual_delta}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-sans pt-1 border-t border-slate-200/60">
                      <span>Expected: </span>
                      <strong className="font-mono text-slate-700">{asset.expected_delta}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOOMBERG-STYLE ENTITY RESOLUTION GRAPH */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                    Entity Resolution & Causal Metadata Pipeline
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Tracking transmission from Raw Ingestion to Target Security
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-mono text-xs font-bold border border-indigo-200">
                    Origin: {activeEvent.entity_graph.origin_entity}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 font-sans">Transmission Pathway</span>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-indigo-200">
                  {activeEvent.entity_graph.chain.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-sans text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-700 shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 font-sans">Terminal Target:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                    {activeEvent.entity_graph.terminal_asset}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
