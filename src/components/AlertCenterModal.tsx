import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Flame,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sliders,
  Save,
  Volume2,
  VolumeX,
  Filter,
  Check,
} from "lucide-react";

export interface RadarAlertItem {
  id: string;
  time: string;
  level: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  asset: string;
  surpriseZ: number;
  impactScore: number;
  direction: "DOWN" | "UP" | "VOLATILITY";
  movePct: string;
  probability: number;
  expectedMoveRange: string;
  reason: string;
  leadTime: string;
  evidenceSource: string;
  isRead: boolean;
}

export interface AlertThresholdSettings {
  minSurpriseZ: number; // e.g. 1.0, 1.5, 2.0
  minImpactScore: number; // e.g. 60, 75, 90
  trackedAssets: string[]; // ['NQ', 'SPX', '2Y', 'DXY', 'VIX']
  enableAudioChime: boolean;
  enableCriticalPush: boolean;
}

const DEFAULT_THRESHOLD_SETTINGS: AlertThresholdSettings = {
  minSurpriseZ: 1.0,
  minImpactScore: 75,
  trackedAssets: ["NQ", "SPX", "2Y", "DXY", "VIX"],
  enableAudioChime: true,
  enableCriticalPush: true,
};

const STORAGE_KEY = "ferrp_custom_alert_thresholds_v2";

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
}

export const SAMPLE_RADAR_ALERTS: RadarAlertItem[] = [
  {
    id: "alt-001",
    time: "08:31:14 ET",
    level: "CRITICAL",
    title: "US Core CPI Hotter Than Expected (+1.4σ)",
    asset: "NQ",
    surpriseZ: 1.4,
    impactScore: 94,
    direction: "DOWN",
    movePct: "-0.62%",
    probability: 84,
    expectedMoveRange: "0.25% – 0.60%",
    reason: "+1.4σ CPI Surprise • +9bp 2Y Yield Shock • DXY Cross-Asset Confirmation",
    leadTime: "14 sec prior to equity cascade",
    evidenceSource: "Bureau of Labor Statistics (BLS) Direct Feed",
    isRead: false,
  },
  {
    id: "alt-002",
    time: "07:15:02 ET",
    level: "HIGH",
    title: "ECB Rate Cut Probability Repricing",
    asset: "EUR/USD",
    surpriseZ: 1.1,
    impactScore: 76,
    direction: "VOLATILITY",
    movePct: "-0.28%",
    probability: 76,
    expectedMoveRange: "0.20% – 0.45%",
    reason: "Lagarde Frankfurt Speech dovish tilt • Bund yields -6bps",
    leadTime: "32 sec terminal latency lead",
    evidenceSource: "European Central Bank Official Press Stream",
    isRead: false,
  },
  {
    id: "alt-003",
    time: "04:45:20 ET",
    level: "HIGH",
    title: "BOJ Ueda Comments on Policy Rate Hike Runway",
    asset: "Nikkei / NQ",
    surpriseZ: 1.2,
    impactScore: 81,
    direction: "DOWN",
    movePct: "-0.85%",
    probability: 81,
    expectedMoveRange: "0.50% – 1.10%",
    reason: "Carry trade unwind risk • JPY appreciation +1.2%",
    leadTime: "45 sec algorithmic news cluster",
    evidenceSource: "Bank of Japan / Nikkei News Wire",
    isRead: true,
  },
  {
    id: "alt-004",
    time: "09:05:30 ET",
    level: "MEDIUM",
    title: "Initial Jobless Claims In-Line Print",
    asset: "SPX",
    surpriseZ: 0.3,
    impactScore: 45,
    direction: "VOLATILITY",
    movePct: "+0.05%",
    probability: 52,
    expectedMoveRange: "0.05% – 0.15%",
    reason: "215k actual vs 216k consensus (Noise filtered)",
    leadTime: "Filtered from active alerts",
    evidenceSource: "Department of Labor Weekly Feed",
    isRead: true,
  },
];

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectEvent,
}) => {
  const [activeView, setActiveView] = useState<"FEED" | "SETTINGS">("FEED");
  const [filterMode, setFilterMode] = useState<"CUSTOM_THRESHOLDS" | "ALL">("CUSTOM_THRESHOLDS");

  // Load alert threshold settings from localStorage
  const [thresholds, setThresholds] = useState<AlertThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_THRESHOLD_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not read alert thresholds from localStorage", e);
    }
    return DEFAULT_THRESHOLD_SETTINGS;
  });

  const [hasSavedFeedback, setHasSavedFeedback] = useState<boolean>(false);

  // Save settings handler
  const handleSaveSettings = (newSettings: AlertThresholdSettings) => {
    setThresholds(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setHasSavedFeedback(true);
      setTimeout(() => setHasSavedFeedback(false), 2500);
    } catch (e) {
      console.error("Could not persist alert thresholds", e);
    }
  };

  const toggleAssetTracked = (asset: string) => {
    const next = thresholds.trackedAssets.includes(asset)
      ? thresholds.trackedAssets.filter((a) => a !== asset)
      : [...thresholds.trackedAssets, asset];
    handleSaveSettings({ ...thresholds, trackedAssets: next });
  };

  // Filter alerts based on thresholds
  const filteredAlerts = SAMPLE_RADAR_ALERTS.filter((alert) => {
    if (filterMode === "ALL") return true;
    const passesSurprise = alert.surpriseZ >= thresholds.minSurpriseZ;
    const passesImpact = alert.impactScore >= thresholds.minImpactScore;
    return passesSurprise && passesImpact;
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-center-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="alert-center-heading" className="text-base font-bold text-slate-900 font-sans">
                  FERRP Live Alert Center
                </h3>
                <span className="bg-rose-100 text-rose-800 font-mono text-[11px] font-black px-2 py-0.5 rounded-full border border-rose-200">
                  {filteredAlerts.length} Matching
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                High-conviction shock detection & custom quantitative threshold filters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* View Switcher: Feed vs Settings */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveView("FEED")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeView === "FEED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setActiveView("SETTINGS")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  activeView === "SETTINGS" ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Thresholds</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
              aria-label="Close Alert Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: LIVE ALERTS FEED                                                  */}
        {/* ========================================================================= */}
        {activeView === "FEED" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Sub-filter Bar */}
            <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium text-[11px]">Filter Stream:</span>
                <button
                  onClick={() => setFilterMode("CUSTOM_THRESHOLDS")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    filterMode === "CUSTOM_THRESHOLDS"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Custom Thresholds (&ge;{thresholds.minSurpriseZ}&sigma;, &ge;{thresholds.minImpactScore} Impact)
                </button>
                <button
                  onClick={() => setFilterMode("ALL")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    filterMode === "ALL"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  All ({SAMPLE_RADAR_ALERTS.length})
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Audio: {thresholds.enableAudioChime ? "ON" : "OFF"}
              </span>
            </div>

            {/* Modal Content / Alert Stream */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="font-semibold text-slate-700">No active alerts meet your strict threshold criteria</p>
                  <p className="text-[11px] text-slate-400">
                    Current rules: Surprise &ge; {thresholds.minSurpriseZ}&sigma; and Impact Score &ge; {thresholds.minImpactScore}.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCritical = alert.level === "CRITICAL";
                  const breachesCustom =
                    alert.surpriseZ >= thresholds.minSurpriseZ && alert.impactScore >= thresholds.minImpactScore;

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCritical
                          ? "bg-rose-50/60 border-rose-200 shadow-xs"
                          : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isCritical
                                ? "bg-rose-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {alert.level}
                          </span>
                          <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{alert.time}</span>
                          </span>

                          {breachesCustom && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-0.5">
                              <Check className="w-3 h-3" />
                              <span>Threshold Breached</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono font-black text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                          Lead: {alert.leadTime}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {alert.reason}
                        </p>
                      </div>

                      {/* Quantitative Impact Breakdown */}
                      <div className="mt-3 grid grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Surprise</span>
                          <strong className="text-rose-600 font-mono text-xs">+{alert.surpriseZ}&sigma;</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Impact Score</span>
                          <strong className="text-amber-700 font-mono text-xs">{alert.impactScore} / 100</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Asset Target</span>
                          <strong className="text-slate-900 font-mono text-xs">{alert.asset} ({alert.movePct})</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">Probability</span>
                          <strong className="text-emerald-700 font-mono text-xs">{alert.probability}%</strong>
                        </div>
                      </div>

                      {/* Footer / Evidence Link */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <span className="flex items-center space-x-1 font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Source: {alert.evidenceSource}</span>
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            if (onSelectEvent) onSelectEvent(alert.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Inspect Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CUSTOM ALERT THRESHOLD CONFIGURATION (Persisted in localStorage) */}
        {/* ========================================================================= */}
        {activeView === "SETTINGS" && (
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-indigo-900 block">
                  Custom Macro Alert Triggers & Noise Gate
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Configure statistical thresholds to prevent alert fatigue. Alerts will only trigger when macro surprises exceed your calibrated limits.
                </p>
              </div>
              {hasSavedFeedback && (
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Saved Locally</span>
                </span>
              )}
            </div>

            {/* Threshold 1: Minimum Standardized Surprise (Z-score) */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    1. Minimum Surprise Magnitude (|Z-Score|)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Standard deviations from consensus to trigger alert
                  </span>
                </div>
                <span className="text-base font-mono font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  &ge; {thresholds.minSurpriseZ.toFixed(1)}&sigma;
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[0.5, 1.0, 1.4, 2.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleSaveSettings({ ...thresholds, minSurpriseZ: val })}
                    className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                      thresholds.minSurpriseZ === val
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    &ge; {val.toFixed(1)}&sigma;
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold 2: Minimum Event Impact Score (0-100) */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    2. Minimum Event Impact Score (0 - 100)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tier-1 weighting + asset volatility potential
                  </span>
                </div>
                <span className="text-base font-mono font-black text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  &ge; {thresholds.minImpactScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[50, 70, 85, 95].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleSaveSettings({ ...thresholds, minImpactScore: score })}
                    className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                      thresholds.minImpactScore === score
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    &ge; {score} Impact
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold 3: Asset Filter Checklist */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 text-xs block">
                3. Subscribed Asset Shocks
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {["NQ", "SPX", "2Y", "10Y", "DXY", "VIX", "OIL"].map((sym) => {
                  const isTracked = thresholds.trackedAssets.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleAssetTracked(sym)}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isTracked
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      <Check className={`w-3 h-3 ${isTracked ? "opacity-100" : "opacity-0"}`} />
                      <span>{sym}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Chimes & Notification Settings */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleSaveSettings({ ...thresholds, enableAudioChime: !thresholds.enableAudioChime })
                }
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  thresholds.enableAudioChime
                    ? "bg-indigo-50/80 border-indigo-300 text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {thresholds.enableAudioChime ? (
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-bold text-xs">Audio Chime</span>
                </div>
                <span className="text-[11px] font-mono font-bold">
                  {thresholds.enableAudioChime ? "ON" : "MUTED"}
                </span>
              </button>

              <button
                onClick={() =>
                  handleSaveSettings({ ...thresholds, enableCriticalPush: !thresholds.enableCriticalPush })
                }
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                  thresholds.enableCriticalPush
                    ? "bg-rose-50/80 border-rose-300 text-rose-900"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-xs">Critical Shocks</span>
                </div>
                <span className="text-[11px] font-mono font-bold">
                  {thresholds.enableCriticalPush ? "ACTIVE" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            ⚡ Noise Gate: Filtered {SAMPLE_RADAR_ALERTS.length - filteredAlerts.length} sub-threshold shocks
          </span>
          <div className="flex items-center space-x-2">
            {activeView === "SETTINGS" && (
              <button
                onClick={() => setActiveView("FEED")}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                View Filtered Alerts
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
