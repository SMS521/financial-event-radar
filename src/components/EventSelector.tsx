import React, { useState, useMemo } from "react";
import { MarketEvent, EventType } from "../types";
import { Play, Sliders, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, Sparkles, ShieldCheck, ShieldAlert, FlaskConical, Info } from "lucide-react";
import { calculateStandardizedSurprise } from "../lib/quantEngine";
import { validateEventIntegrity } from "../lib/eventValidator";

interface EventSelectorProps {
  events: MarketEvent[];
  selectedEvent: MarketEvent;
  onSelectEvent: (event: MarketEvent) => void;
  onRunCouncil: () => void;
  isLoadingCouncil: boolean;
}

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onRunCouncil,
  isLoadingCouncil,
}) => {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [showIntegrityDetails, setShowIntegrityDetails] = useState(false);
  const [simType, setSimType] = useState<EventType>("CPI");
  const [simActual, setSimActual] = useState(3.1);
  const [simConsensus, setSimConsensus] = useState(3.4);
  const [simPrevious, setSimPrevious] = useState(3.4);
  const [simFedRegime, setSimFedRegime] = useState<any>("Higher for Longer");
  const [simVixRegime, setSimVixRegime] = useState<any>("Normal (14-20)");
  const [sim10yTrend, setSim10yTrend] = useState<any>("Falling (-10bp 5d)");
  const [simNqTrend, setSimNqTrend] = useState<any>("Strong Uptrend (+3% 20d)");
  const [simContaminated, setSimContaminated] = useState(false);

  // Validation layer
  const validation = useMemo(() => validateEventIntegrity(selectedEvent), [selectedEvent]);

  const handleApplySimulator = () => {
    const { rawSurprise, zScore, sigma } = calculateStandardizedSurprise(simActual, simConsensus, simType);
    const isHawkish = zScore > 0;
    const mag = Math.abs(zScore) * 0.8;
    const mult = isHawkish ? -1 : 1;

    const customEvent: MarketEvent = {
      event_id: `SIM-${Date.now()}-${simType}`,
      event_type: simType,
      event_name: `Simulated ${simType} Shock (${simActual} vs ${simConsensus} est)`,
      country: "US",
      market: "Simulated Market Event",
      source: "User Point-in-Time Simulator",
      origin_type: "user_simulation",
      is_verified: false,
      validation_status: "valid",
      scheduled_ts: new Date().toISOString(),
      publication_ts: new Date().toISOString(),
      known_ts: new Date().toISOString(),
      actual: simActual,
      consensus: simConsensus,
      previous: simPrevious,
      unit: simType === "NFP" ? "k jobs" : simType === "JOBLESS_CLAIMS" ? "k claims" : "% YoY",
      surprise: +rawSurprise.toFixed(2),
      standardized_surprise: +zScore.toFixed(2),
      historical_sigma: sigma,
      revision: null,
      revision_ts: null,
      importance: "Critical",
      event_category: simType === "NFP" ? "Labor" : "Inflation",
      source_quality: "Simulated Input",
      data_quality: "Simulated",
      multidimensional_vector: {
        headline_surprise: +rawSurprise.toFixed(2),
        core_surprise: +(rawSurprise * 0.9).toFixed(2),
        shelter_surprise: +(rawSurprise * 0.4).toFixed(2),
        services_surprise: +(rawSurprise * 0.5).toFixed(2),
        sentiment_tone: isHawkish ? -0.85 : 0.85,
      },
      confounding: {
        is_contaminated: simContaminated,
        confidence: simContaminated ? "Contaminated" : "Pure",
        events_within_60s: simContaminated ? ["Simultaneous Jobless Claims (+18k surprise)", "PPI Revision"] : [],
        events_within_5m: simContaminated ? ["Fed Governor Speech at +2min"] : [],
        contamination_notes: simContaminated
          ? "Contaminated release window. High probability of confounded price transmission."
          : "Statistically clean single-variable release.",
      },
      market_state: {
        fed_regime: simFedRegime,
        vix_regime: simVixRegime,
        yield_10y_trend: sim10yTrend,
        nq_trend: simNqTrend,
        usd_trend: isHawkish ? "Bullish Breakout" : "Weakening",
        market_positioning: "Neutral",
        vix_level: simVixRegime === "Low Vol (<14)" ? 12.8 : simVixRegime === "Elevated (20-30)" ? 22.4 : 16.5,
        yield_10y_level: sim10yTrend === "Surging (+15bp 5d)" ? 4.55 : 4.10,
        fed_funds_rate: 5.33,
      },
      reactions: {
        event_id: `SIM-${Date.now()}-${simType}`,
        NQ: {
          "1m": +(mult * mag * 0.38).toFixed(2),
          "5m": +(mult * mag * 0.72).toFixed(2),
          "15m": +(mult * mag * 1.05).toFixed(2),
          "30m": +(mult * mag * 1.35).toFixed(2),
          "60m": +(mult * mag * 1.62).toFixed(2),
          "1d": +(mult * mag * 1.95).toFixed(2),
        },
        SPX: {
          "1m": +(mult * mag * 0.28).toFixed(2),
          "5m": +(mult * mag * 0.52).toFixed(2),
          "15m": +(mult * mag * 0.78).toFixed(2),
          "30m": +(mult * mag * 0.98).toFixed(2),
          "60m": +(mult * mag * 1.18).toFixed(2),
          "1d": +(mult * mag * 1.40).toFixed(2),
        },
        DAX: {
          "1m": +(mult * mag * 0.20).toFixed(2),
          "5m": +(mult * mag * 0.40).toFixed(2),
          "15m": +(mult * mag * 0.60).toFixed(2),
          "30m": +(mult * mag * 0.75).toFixed(2),
          "60m": +(mult * mag * 0.88).toFixed(2),
          "1d": +(mult * mag * 1.05).toFixed(2),
        },
        NIKKEI: {
          "1m": +(mult * mag * 0.18).toFixed(2),
          "5m": +(mult * mag * 0.35).toFixed(2),
          "15m": +(mult * mag * 0.55).toFixed(2),
          "30m": +(mult * mag * 0.72).toFixed(2),
          "60m": +(mult * mag * 0.85).toFixed(2),
          "1d": +(mult * mag * 1.10).toFixed(2),
        },
        HSI: {
          "1m": +(mult * mag * 0.12).toFixed(2),
          "5m": +(mult * mag * 0.28).toFixed(2),
          "15m": +(mult * mag * 0.42).toFixed(2),
          "30m": +(mult * mag * 0.58).toFixed(2),
          "60m": +(mult * mag * 0.70).toFixed(2),
          "1d": +(mult * mag * 0.88).toFixed(2),
        },
        KOSPI: {
          "1m": +(mult * mag * 0.16).toFixed(2),
          "5m": +(mult * mag * 0.34).toFixed(2),
          "15m": +(mult * mag * 0.52).toFixed(2),
          "30m": +(mult * mag * 0.68).toFixed(2),
          "60m": +(mult * mag * 0.82).toFixed(2),
          "1d": +(mult * mag * 1.02).toFixed(2),
        },
        TREASURY_2Y: {
          "1m": +(-mult * mag * 6.5).toFixed(1),
          "5m": +(-mult * mag * 10.5).toFixed(1),
          "15m": +(-mult * mag * 13.2).toFixed(1),
          "30m": +(-mult * mag * 15.0).toFixed(1),
          "60m": +(-mult * mag * 16.5).toFixed(1),
          "1d": +(-mult * mag * 18.2).toFixed(1),
        },
        TREASURY_10Y: {
          "1m": +(-mult * mag * 4.5).toFixed(1),
          "5m": +(-mult * mag * 7.8).toFixed(1),
          "15m": +(-mult * mag * 9.8).toFixed(1),
          "30m": +(-mult * mag * 11.2).toFixed(1),
          "60m": +(-mult * mag * 12.5).toFixed(1),
          "1d": +(-mult * mag * 13.8).toFixed(1),
        },
        USD_DXY: {
          "1m": +(-mult * mag * 0.32).toFixed(2),
          "5m": +(-mult * mag * 0.55).toFixed(2),
          "15m": +(-mult * mag * 0.72).toFixed(2),
          "30m": +(-mult * mag * 0.85).toFixed(2),
          "60m": +(-mult * mag * 0.95).toFixed(2),
          "1d": +(-mult * mag * 1.10).toFixed(2),
        },
        VIX: {
          "1m": +(-mult * mag * 0.55).toFixed(2),
          "5m": +(-mult * mag * 0.95).toFixed(2),
          "15m": +(-mult * mag * 1.30).toFixed(2),
          "30m": +(-mult * mag * 1.60).toFixed(2),
          "60m": +(-mult * mag * 1.85).toFixed(2),
          "1d": +(-mult * mag * 2.15).toFixed(2),
        },
        WTI_OIL: {
          "1m": +(mult * mag * 0.18).toFixed(2),
          "5m": +(mult * mag * 0.38).toFixed(2),
          "15m": +(mult * mag * 0.55).toFixed(2),
          "30m": +(mult * mag * 0.70).toFixed(2),
          "60m": +(mult * mag * 0.82).toFixed(2),
          "1d": +(mult * mag * 0.95).toFixed(2),
        },
        GOLD: {
          "1m": +(mult * mag * 0.40).toFixed(2),
          "5m": +(mult * mag * 0.75).toFixed(2),
          "15m": +(mult * mag * 1.05).toFixed(2),
          "30m": +(mult * mag * 1.25).toFixed(2),
          "60m": +(mult * mag * 1.42).toFixed(2),
          "1d": +(mult * mag * 1.65).toFixed(2),
        },
      },
      news_feed: [
        {
          id: `sim-news-1`,
          timestamp: new Date().toISOString(),
          latency_seconds: 1,
          headline: `SIMULATED ${simType} PRINTS ${simActual} VS ${simConsensus} EXPECTED (${zScore > 0 ? "+" : ""}${zScore.toFixed(2)}σ)`,
          source: "Simulator Wire",
          sentiment_score: isHawkish ? -0.85 : 0.85,
          key_entity: simType,
          event_extracted: isHawkish ? "Hawkish Impulse" : "Dovish Relief",
        },
      ],
    };

    onSelectEvent(customEvent);
    setIsSimulatorOpen(false);
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Quick Landmark Event Selection */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
              Active Market Event under Investigation:
            </label>

            {/* Validation Layer Status Indicator */}
            <div className="flex items-center space-x-2">
              <span
                id="event-validation-badge"
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 shadow-2xs ${validation.badgeClass}`}
              >
                {validation.status === "verified" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : validation.status === "simulated" ? (
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{validation.badgeLabel}</span>
              </span>

              <button
                id="btn-toggle-integrity-audit"
                onClick={() => setShowIntegrityDetails(!showIntegrityDetails)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>Audit</span>
                <Info className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {events.slice(0, 6).map((evt) => {
              const isSelected = selectedEvent.event_id === evt.event_id;
              const isZNegative = evt.standardized_surprise < 0;
              const isSim = evt.origin_type === "user_simulation" || evt.event_id.startsWith("SIM-");
              return (
                <button
                  key={evt.event_id}
                  id={`btn-event-${evt.event_id}`}
                  onClick={() => onSelectEvent(evt)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-2 border cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-900 border-indigo-300 shadow-xs ring-2 ring-indigo-100 font-bold"
                      : "bg-slate-50/90 text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSim
                        ? "bg-indigo-500"
                        : evt.confounding.is_contaminated
                        ? "bg-amber-500"
                        : isZNegative
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="font-bold">{evt.event_type}</span>
                  <span className="text-slate-500 text-[11px]">
                    {evt.event_id.replace("EVENT-", "").slice(0, 10)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      evt.standardized_surprise < 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {evt.standardized_surprise > 0 ? "+" : ""}
                    {evt.standardized_surprise.toFixed(1)}σ
                  </span>
                  {isSim && (
                    <span className="text-[9px] font-sans uppercase font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">
                      Sim
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions (Simulate Custom Event & Run Multi-Agent Council) */}
        <div className="flex items-center space-x-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            id="btn-toggle-simulator"
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              isSimulatorOpen
                ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100 shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Event Simulator</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSimulatorOpen ? "rotate-180" : ""}`} />
          </button>

          <button
            id="btn-run-ai-council"
            onClick={onRunCouncil}
            disabled={isLoadingCouncil}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm shadow-indigo-200 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoadingCouncil ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Convening Council...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Run Agent Council Debate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Data Integrity & Verification Audit Panel */}
      {showIntegrityDetails && (
        <div
          id="event-integrity-details-panel"
          className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/90 rounded-xl p-4 text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900">FERRP Data Integrity & Provenance Verification</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Source: {selectedEvent.source || "Official Bureau Feed"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {validation.checks.map((check, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                  check.passed
                    ? "bg-white border-emerald-200 text-slate-800"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  {check.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span>{check.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-tight">{check.detail}</div>
              </div>
            ))}
          </div>

          {validation.errors.length > 0 && (
            <div className="mt-2.5 p-2 bg-rose-100/80 border border-rose-200 rounded-lg text-rose-900 font-mono text-[11px]">
              ⚠️ Integrity Errors Detected: {validation.errors.join("; ")}
            </div>
          )}
        </div>
      )}

      {/* Expandable Live Event Simulator Panel */}
      {isSimulatorOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Point-in-Time Event Simulator & Shock Generator
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-sans">
              Adjust parameters to simulate live market reaction and statistical analogues
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">Event Type</label>
              <select
                id="sim-event-type"
                value={simType}
                onChange={(e) => setSimType(e.target.value as EventType)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              >
                <option value="CPI">US CPI (Inflation)</option>
                <option value="PCE">US Core PCE (Inflation)</option>
                <option value="NFP">US Non-Farm Payrolls (Labor)</option>
                <option value="JOBLESS_CLAIMS">Initial Jobless Claims</option>
                <option value="PPI">US PPI (Wholesale)</option>
                <option value="FOMC_DECISION">FOMC Rate Decision</option>
                <option value="BOJ_DECISION">BOJ Policy Decision</option>
                <option value="NVIDIA_EARNINGS">NVIDIA Earnings</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">
                Actual Value: <strong className="text-indigo-600 font-mono">{simActual}</strong>
              </label>
              <input
                id="sim-actual-slider"
                type="range"
                step="0.1"
                min="2.0"
                max="5.0"
                value={simActual}
                onChange={(e) => setSimActual(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">
                Consensus Expected: <strong className="text-slate-800 font-mono">{simConsensus}</strong>
              </label>
              <input
                id="sim-consensus-slider"
                type="range"
                step="0.1"
                min="2.0"
                max="5.0"
                value={simConsensus}
                onChange={(e) => setSimConsensus(parseFloat(e.target.value))}
                className="w-full accent-slate-600 mt-2"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">Fed Monetary Regime</label>
              <select
                id="sim-fed-regime"
                value={simFedRegime}
                onChange={(e) => setSimFedRegime(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              >
                <option value="Higher for Longer">Higher for Longer</option>
                <option value="Hawkish Tightening">Hawkish Tightening</option>
                <option value="Easing Cycle">Easing Cycle</option>
                <option value="Dovish Pause">Dovish Pause</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">VIX Volatility Regime</label>
              <select
                id="sim-vix-regime"
                value={simVixRegime}
                onChange={(e) => setSimVixRegime(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              >
                <option value="Low Vol (<14)">Low Vol (&lt;14)</option>
                <option value="Normal (14-20)">Normal (14-20)</option>
                <option value="Elevated (20-30)">Elevated (20-30)</option>
                <option value="Crisis (>30)">Crisis (&gt;30)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">10Y Yield 5-Day Trend</label>
              <select
                id="sim-yield-trend"
                value={sim10yTrend}
                onChange={(e) => setSim10yTrend(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              >
                <option value="Falling (-10bp 5d)">Falling (-10bp 5d)</option>
                <option value="Rangebound">Rangebound</option>
                <option value="Surging (+15bp 5d)">Surging (+15bp 5d)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5 font-medium">NQ Trend Context</label>
              <select
                id="sim-nq-trend"
                value={simNqTrend}
                onChange={(e) => setSimNqTrend(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              >
                <option value="Strong Uptrend (+3% 20d)">Strong Uptrend (+3% 20d)</option>
                <option value="Chop / Consolidating">Chop / Consolidating</option>
                <option value="Oversold Pullback">Oversold Pullback</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  id="sim-contamination-check"
                  type="checkbox"
                  checked={simContaminated}
                  onChange={(e) => setSimContaminated(e.target.checked)}
                  className="rounded-md border-slate-300 text-amber-500 focus:ring-amber-400/30 h-4 w-4"
                />
                <span className="text-slate-700 font-medium">Inject Confounding Event (±60s)</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/80">
            <div className="text-xs text-slate-600 font-sans">
              Computed Z-Score:{" "}
              <strong className={simActual < simConsensus ? "text-emerald-600 font-mono font-bold" : "text-rose-600 font-mono font-bold"}>
                {calculateStandardizedSurprise(simActual, simConsensus, simType).zScore > 0 ? "+" : ""}
                {calculateStandardizedSurprise(simActual, simConsensus, simType).zScore.toFixed(2)}σ
              </strong>
            </div>
            <button
              id="btn-apply-simulated-event"
              onClick={handleApplySimulator}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-xs flex items-center space-x-1.5 shadow-sm shadow-indigo-100 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate & Recalculate Engine</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
