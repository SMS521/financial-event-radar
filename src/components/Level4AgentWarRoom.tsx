import React, { useState } from "react";
import { AgentCouncilResult, AgentScorecard, MarketEvent } from "../types";
import { Sparkles, ShieldAlert, TrendingUp, TrendingDown, Users, Award, CheckCircle, Scale, AlertTriangle, RefreshCw } from "lucide-react";

interface Level4Props {
  council: AgentCouncilResult | null;
  scorecards: AgentScorecard[];
  isLoading: boolean;
  onRefresh: () => void;
  event: MarketEvent;
}

export const Level4AgentWarRoom: React.FC<Level4Props> = ({
  council,
  scorecards,
  isLoading,
  onRefresh,
  event,
}) => {
  const [activeTab, setActiveTab] = useState<"debate" | "synthesis" | "scorecards">("debate");

  if (!council && !isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm">
        <Users className="w-12 h-12 text-indigo-600 mx-auto mb-3 opacity-80" />
        <h3 className="text-base font-bold text-slate-900 font-sans">
          Research Intelligence Layer (Multi-Agent Council)
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
          Convene the LangGraph-style Multi-Agent Council to debate the deterministic Data Truth and statistical Historical Evidence.
        </p>
        <button
          onClick={onRefresh}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-2 shadow-sm shadow-indigo-100 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Multi-Agent Research Debate</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-mono font-bold">
            LEVEL 4
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
            Research Intelligence Council (TradingAgents Orchestration)
          </h2>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 border border-slate-200/60">
            <button
              onClick={() => setActiveTab("debate")}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "debate"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Agent Debate
            </button>
            <button
              onClick={() => setActiveTab("synthesis")}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "synthesis"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Manager & Risk
            </button>
            <button
              onClick={() => setActiveTab("scorecards")}
              className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "scorecards"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Scorecards & Brier
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="Re-run Council"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-900 font-sans">
            Council in Active Deliberation...
          </div>
          <div className="text-xs text-slate-500 mt-1 font-sans">
            Synthesizing Macro, Rates, Global, News, Historical Scientist, Skeptic, Bull vs Bear, and Risk Officer...
          </div>
        </div>
      )}

      {council && !isLoading && (
        <>
          {/* TAB 1: FULL AGENT COUNCIL DEBATE */}
          {activeTab === "debate" && (
            <div className="space-y-5">
              {/* Bull vs Bear Split Debate Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-sans font-bold text-emerald-800 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>BULL RESEARCH CASE</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                      NQ Target: {council.bull_case.target_nq_60m}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans mb-2">
                    {council.bull_case.headline}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {council.bull_case.core_arguments.map((arg, i) => (
                      <li key={i}>{arg}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-sans font-bold text-rose-800 flex items-center space-x-1.5">
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                      <span>BEAR RESEARCH CASE</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-xs">
                      NQ Target: {council.bear_case.target_nq_60m}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans mb-2">
                    {council.bear_case.headline}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {council.bear_case.core_arguments.map((arg, i) => (
                      <li key={i}>{arg}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specialized Specialist Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Macro Agent */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-slate-900">
                      Macro & Policy Agent
                    </span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full uppercase font-bold ${
                      council.macro_agent.stance === "bullish"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : council.macro_agent.stance === "bearish"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {council.macro_agent.stance} ({(council.macro_agent.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                    {council.macro_agent.thesis}
                  </p>
                  <div className="text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200/70 pt-2">
                    {council.macro_agent.key_drivers.map((d, i) => (
                      <div key={i} className="truncate font-sans">&bull; {d}</div>
                    ))}
                  </div>
                </div>

                {/* Rates Agent */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-slate-900">
                      Rates & Yield Curve Agent
                    </span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full uppercase font-bold ${
                      council.rates_agent.stance === "bullish"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {council.rates_agent.stance}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                    {council.rates_agent.yield_curve_view}
                  </p>
                  <div className="text-[10px] text-indigo-600 font-mono font-medium border-t border-slate-200/70 pt-2">
                    Duration: {council.rates_agent.duration_impact}
                  </div>
                </div>

                {/* Historical Event Scientist */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-slate-900">
                      Historical Event Scientist
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      N={council.historical_scientist.analogue_count}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                    {council.historical_scientist.statistical_takeaway}
                  </p>
                  <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200/70 pt-2 flex justify-between">
                    <span>Median: <strong className="text-slate-800 font-mono">{council.historical_scientist.median_response}</strong></span>
                    <span>Win Rate: <strong className="text-emerald-600 font-mono">{council.historical_scientist.win_rate}</strong></span>
                  </div>
                </div>

                {/* Global & Transmission Agent */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-slate-900">
                      Global & FX Transmission
                    </span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase">
                      {council.global_agent.stance}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                    {council.global_agent.currency_transmission}
                  </p>
                  <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200/70 pt-2">
                    Spillover: {council.global_agent.global_spillover}
                  </div>
                </div>

                {/* News & Narrative Agent */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-slate-900">
                      News & Narrative Agent
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Latency &lt;200ms
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2.5 leading-relaxed">
                    {council.news_agent.narrative_framing}
                  </p>
                  <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200/70 pt-2">
                    Wire Latency: {council.news_agent.algorithmic_latency}
                  </div>
                </div>

                {/* Skeptic Agent (Crucial Anti-Hallucination & Confounding Guard) */}
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-bold text-amber-900 flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Skeptic Agent (Audit)</span>
                    </span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      Confounding Check
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] mb-2.5 leading-relaxed">
                    {council.skeptic_agent.contamination_critique}
                  </p>
                  <div className="text-[10px] text-amber-800 font-sans border-t border-amber-200/60 pt-2">
                    Drift Warning: {council.skeptic_agent.regime_drift_warning}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNTHESIS & RISK OFFICER */}
          {activeTab === "synthesis" && (
            <div className="space-y-5">
              <div className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-indigo-100 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-sans">
                      Research Manager Executive Synthesis
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-sans">
                    <span className="text-slate-500">Consensus Bias:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      council.research_manager.consensus_bias === "bullish"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : council.research_manager.consensus_bias === "bearish"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {council.research_manager.consensus_bias}
                    </span>
                    <span className="text-slate-500">Confidence: <strong className="text-slate-800">{(council.research_manager.overall_confidence * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-5 font-sans">
                  {council.research_manager.executive_summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-indigo-100 text-xs font-mono">
                  <div className="bg-white p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                    <span className="text-slate-500 text-[11px] font-sans block mb-1 font-medium">Synthesized Probability Up (&gt;0.0%):</span>
                    <div className="text-2xl font-bold text-emerald-600">
                      {(council.research_manager.synthesized_probability_up * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                    <span className="text-slate-500 text-[11px] font-sans block mb-1 font-medium">Synthesized Probability Down (&lt;0.0%):</span>
                    <div className="text-2xl font-bold text-rose-600">
                      {(council.research_manager.synthesized_probability_down * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white p-3.5 rounded-xl border border-indigo-100 text-xs font-sans text-indigo-900 shadow-xs">
                  <strong className="text-indigo-700 font-semibold">Transmission Vector:</strong> {council.research_manager.why_graph_summary}
                </div>
              </div>

              {/* Risk Officer Panel */}
              <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Chief Risk Officer (Mandates & Invalidation Rules)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] font-sans block mb-1">Recommended Action:</span>
                    <span className="font-bold text-indigo-700 font-mono text-sm">
                      {council.risk_officer.recommended_action}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] font-sans block mb-1">Max 15m Drawdown Risk:</span>
                    <span className="font-bold text-rose-600 font-mono text-sm">
                      {council.risk_officer.max_drawdown_risk}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 text-[11px] font-sans block mb-1">Invalidation Trigger:</span>
                    <span className="font-bold text-amber-600 font-mono text-sm">
                      {council.risk_officer.key_invalidation_level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4 font-sans flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Warning: {council.risk_officer.tail_risk_warning}</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AGENT SCORECARDS & CALIBRATION */}
          {activeTab === "scorecards" && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 overflow-x-auto shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-sans font-bold text-slate-900 flex items-center space-x-2">
                  <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Agent Historical Calibration & Brier Score System</span>
                </span>
                <span className="text-[11px] font-sans text-slate-500">
                  Tracked over {scorecards[0]?.events_scored || 42} verified macro events
                </span>
              </div>

              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-2.5 px-3">Agent Role</th>
                    <th className="py-2.5 px-3">Directional Hit Rate</th>
                    <th className="py-2.5 px-3">Brier Score (Lower=Better)</th>
                    <th className="py-2.5 px-3">Log Loss</th>
                    <th className="py-2.5 px-3">Calibration</th>
                    <th className="py-2.5 px-3">EVA (Alpha bps)</th>
                    <th className="py-2.5 px-3">Regime Specialty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {scorecards.map((sc) => (
                    <tr key={sc.agent_name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 font-sans">
                        {sc.agent_name}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {(sc.directional_accuracy * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-indigo-600 font-semibold">
                        {sc.brier_score.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {sc.log_loss.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                          {sc.calibration_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-indigo-600 font-bold">
                        +{sc.economic_value_added_bps} bps
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] font-sans">
                        {sc.regime_specialty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
