import React, { useState } from "react";
import {
  Sliders,
  Bell,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
  ShieldCheck,
  Percent,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";
import { RadarEventItem } from "../types";

export interface RadarThresholdSettings {
  minImpactScore: number; // e.g. 75 (0-100)
  minSurpriseZ: number; // e.g. 1.8 (1.0 - 3.5)
  minProbability25bps: number; // e.g. 80 (50 - 95%)
  requireFdrSignificance: boolean; // q < 0.05
  requireYieldConfirmation: boolean;
  minSourceCredibility: number; // 70, 90, 99
  soundEnabled: boolean;
  visualFlashEnabled: boolean;
  autoOpenCard: boolean;
}

export const DEFAULT_THRESHOLD_SETTINGS: RadarThresholdSettings = {
  minImpactScore: 75,
  minSurpriseZ: 1.5,
  minProbability25bps: 80,
  requireFdrSignificance: true,
  requireYieldConfirmation: true,
  minSourceCredibility: 90,
  soundEnabled: true,
  visualFlashEnabled: true,
  autoOpenCard: true,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: RadarThresholdSettings;
  onSaveSettings: (newSettings: RadarThresholdSettings) => void;
  eventsPool: RadarEventItem[];
  onTriggerTestAlert: (simulatedEvent: RadarEventItem) => void;
}

export function RadarThresholdConfigModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  eventsPool,
  onTriggerTestAlert,
}: Props) {
  const [localSettings, setLocalSettings] = useState<RadarThresholdSettings>(settings);
  const [testFired, setTestFired] = useState<boolean>(false);

  if (!isOpen) return null;

  // Synthesize Web Audio chime for test alert
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context not allowed without interaction", e);
    }
  };

  // Compute how many events in the current database would trigger an alert with these settings
  const matchingEventsCount = eventsPool.filter((ev) => {
    const eis = ev.impact_score.total_impact_score;
    const prob = ev.impact_score.probability_exceeds_25bps;
    const cred = ev.impact_score.news_credibility.score;
    const yields = ev.impact_score.treasury_confirmation.score >= 80;

    const passEis = eis >= localSettings.minImpactScore;
    const passProb = prob >= localSettings.minProbability25bps;
    const passCred = cred >= localSettings.minSourceCredibility;
    const passYield = !localSettings.requireYieldConfirmation || yields;

    return passEis && passProb && passCred && passYield;
  }).length;

  const handleFireTest = () => {
    if (localSettings.soundEnabled) {
      playAlertSound();
    }
    setTestFired(true);
    const target = eventsPool[0];
    onTriggerTestAlert(target);
    setTimeout(() => setTestFired(false), 2500);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_THRESHOLD_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans tracking-tight">
                Event Radar Alert & Impact Threshold Settings
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Set quantitative criteria required to trigger high-conviction UI visual notifications & audio chimes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Live Matching Summary Badge */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-indigo-950 font-sans">
                  Active Filter Sensitivity Impact
                </div>
                <div className="text-[11px] text-indigo-700 font-sans">
                  {matchingEventsCount} of {eventsPool.length} historical radar events trigger this threshold
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white text-indigo-700 border border-indigo-200">
              {((matchingEventsCount / eventsPool.length) * 100).toFixed(0)}% Trigger Rate
            </span>
          </div>

          {/* Section 1: Quantitative Thresholds */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              1. Quantitative Impact & Probability Criteria
            </h3>

            {/* Threshold 1: Min EIS Score */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 font-sans">
                    Minimum Event Impact Score (EIS)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Compound 10-factor score combining surprise, Fed sensitivity & liquidity
                  </p>
                </div>
                <span className="text-sm font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-indigo-600">
                  {localSettings.minImpactScore}/100
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={localSettings.minImpactScore}
                onChange={(e) => setLocalSettings({ ...localSettings, minImpactScore: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50 (Permissive)</span>
                <span>75 (Default Baseline)</span>
                <span>95 (Ultra High Conviction)</span>
              </div>
            </div>

            {/* Threshold 2: Standardized Surprise Z */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 font-sans">
                    Minimum Standardized Surprise Magnitude (|Z|)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Standard deviations from consensus survey median (|Actual - Consensus| / σ)
                  </p>
                </div>
                <span className="text-sm font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700">
                  ≥ {localSettings.minSurpriseZ.toFixed(1)}σ
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={localSettings.minSurpriseZ}
                onChange={(e) => setLocalSettings({ ...localSettings, minSurpriseZ: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5σ (Minor)</span>
                <span>1.5σ (Significant)</span>
                <span>3.0σ (Extreme Outlier)</span>
              </div>
            </div>

            {/* Threshold 3: Probability P(|NQ_60m| >= 0.25%) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 font-sans">
                    Target Probability: P(|NQ 60m| ≥ 0.25%)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Calibrated econometric likelihood that NQ futures will move at least ±0.25% in 60m
                  </p>
                </div>
                <span className="text-sm font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-indigo-700">
                  ≥ {localSettings.minProbability25bps}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={localSettings.minProbability25bps}
                onChange={(e) => setLocalSettings({ ...localSettings, minProbability25bps: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50% (Base Odds)</span>
                <span>80% (High Confidence)</span>
                <span>95% (Extreme Probability)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Quality Control & Statistical Filters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              2. Statistical QC & Quality Filters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Toggle 1: Multi-Testing FDR Correction */}
              <label className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-start space-x-3 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.requireFdrSignificance}
                  onChange={(e) => setLocalSettings({ ...localSettings, requireFdrSignificance: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 font-sans flex items-center space-x-1.5">
                    <span>Benjamini-Hochberg FDR (q &lt; 0.05)</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      QC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Filter out false discovery rate noise across the 7 multi-testing factors.
                  </p>
                </div>
              </label>

              {/* Toggle 2: Treasury Yield Alignment */}
              <label className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-start space-x-3 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.requireYieldConfirmation}
                  onChange={(e) => setLocalSettings({ ...localSettings, requireYieldConfirmation: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 font-sans flex items-center space-x-1.5">
                    <span>Require 2Y/10Y Yield Confirmation</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Suppresses false breakouts if bond yields do not confirm the macro shock direction.
                  </p>
                </div>
              </label>
            </div>

            {/* Minimum Source Credibility */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 font-sans">
                  Minimum Source Credibility Tier
                </div>
                <div className="text-[11px] text-slate-500">
                  Reject unverified social rumors or third-party blog posts
                </div>
              </div>
              <select
                value={localSettings.minSourceCredibility}
                onChange={(e) => setLocalSettings({ ...localSettings, minSourceCredibility: Number(e.target.value) })}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 cursor-pointer"
              >
                <option value={90}>Tier 1 (BLS/Fed/SEC &gt;= 90)</option>
                <option value={80}>Tier 1 + Verified Wires (&gt;= 80)</option>
                <option value={60}>All Known Financial Sources (&gt;= 60)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Notification Modality */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              3. Visual & Audio Delivery Modality
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  {localSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-semibold text-slate-800">Synthesized Sonic Chime</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
              </label>

              <label className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-800">Visual Pulse Flash Banner</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.visualFlashEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, visualFlashEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleFireTest}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{testFired ? "🔔 Alert Fired!" : "Test Trigger"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Apply Thresholds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
