import React, { useState } from "react";
import { MarketEvent } from "../types";
import { Cpu, ArrowRight, Info, Zap, Layers, RefreshCw } from "lucide-react";

interface CausalWhyGraphProps {
  event: MarketEvent;
}

interface MechanismNode {
  id: string;
  title: string;
  category: "shock" | "rates" | "fx" | "valuation" | "equities" | "global";
  delta: string;
  direction: "up" | "down" | "neutral";
  mechanismText: string;
  formula: string;
  x: number;
  y: number;
}

export const CausalWhyGraph: React.FC<CausalWhyGraphProps> = ({ event }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("shock");
  const [graphMode, setGraphMode] = useState<"cpi_rates" | "boj_carry" | "nvda_tech">("cpi_rates");

  const zScore = event.standardized_surprise;
  const isDovish = zScore < 0;

  // Nodes for CPI -> Rates -> FX -> Equity Transmission
  const cpiNodes: MechanismNode[] = [
    {
      id: "shock",
      title: `${event.event_type} Information Shock`,
      category: "shock",
      delta: `${zScore > 0 ? "+" : ""}${zScore.toFixed(2)}σ Surprise`,
      direction: zScore > 0 ? "up" : "down",
      mechanismText: "Publication of macro data creates an instantaneous revision to the market's joint expectations set.",
      formula: "S_t = (Actual - Consensus) / \\sigma",
      x: 50,
      y: 120,
    },
    {
      id: "rates_2y",
      title: "Front-End Yields (2Y)",
      category: "rates",
      delta: `${event.reactions.TREASURY_2Y["5m"]} bps`,
      direction: event.reactions.TREASURY_2Y["5m"] > 0 ? "up" : "down",
      mechanismText: "Front-end yields immediately reprice the expected path of central bank policy rates and terminal rate expectations.",
      formula: "\\Delta y_2 = \\beta_1 S_t + \\epsilon",
      x: 240,
      y: 60,
    },
    {
      id: "rates_10y",
      title: "Long-End Yields (10Y)",
      category: "rates",
      delta: `${event.reactions.TREASURY_10Y["5m"]} bps`,
      direction: event.reactions.TREASURY_10Y["5m"] > 0 ? "up" : "down",
      mechanismText: "10Y benchmark yield reprices both real interest rates and term premium, shifting the risk-free baseline.",
      formula: "\\Delta y_{10} = \\Delta r_{real} + \\Delta \\pi_{exp} + \\Delta TP",
      x: 240,
      y: 180,
    },
    {
      id: "fx_usd",
      title: "USD Index (DXY)",
      category: "fx",
      delta: `${event.reactions.USD_DXY["5m"] > 0 ? "+" : ""}${event.reactions.USD_DXY["5m"]}%`,
      direction: event.reactions.USD_DXY["5m"] > 0 ? "up" : "down",
      mechanismText: "Interest rate differentials shift global capital flows, driving dollar strength or weakness against G10 crosses.",
      formula: "FX_{USD} = f(\\Delta (y_{US} - y_{G10}))",
      x: 440,
      y: 60,
    },
    {
      id: "valuation_discount",
      title: "Equity Discount Rate / Multiple",
      category: "valuation",
      delta: isDovish ? "Multiple Expansion (+)" : "Discount Rate Shock (-)",
      direction: isDovish ? "up" : "down",
      mechanismText: "High-duration growth tech stocks are heavily sensitive to the discount factor $D = \\frac{1}{(1 + r_f + ERP)^t}$.",
      formula: "P_0 = \\sum \\frac{CF_t}{(1 + r_f + ERP)^t}",
      x: 440,
      y: 180,
    },
    {
      id: "target_nq",
      title: "Nasdaq-100 (NQ Futures)",
      category: "equities",
      delta: `${event.reactions.NQ["60m"] > 0 ? "+" : ""}${event.reactions.NQ["60m"]}% (60m)`,
      direction: event.reactions.NQ["60m"] > 0 ? "up" : "down",
      mechanismText: "Final cash market and algorithmic equilibrium pricing across tech equities and high-beta assets.",
      formula: "R_{NQ, 60m} = f(S_t, \\Delta y, \\Delta FX, VIX, X_t) + \\epsilon",
      x: 650,
      y: 120,
    },
  ];

  // BOJ Carry Trade Nodes
  const bojNodes: MechanismNode[] = [
    {
      id: "shock_boj",
      title: "BOJ Rate Hike Shock",
      category: "shock",
      delta: "+0.15% Rate (+2.15σ)",
      direction: "up",
      mechanismText: "Unexpected hawkish monetary tightening in Japan narrows US-Japan interest rate differential.",
      formula: "\\Delta i_{BOJ} = +15bp",
      x: 50,
      y: 120,
    },
    {
      id: "fx_jpy",
      title: "JPY Rapid Appreciation",
      category: "fx",
      delta: "-4.5% USD/JPY",
      direction: "down",
      mechanismText: "Yen rallies violently, compressing margin buffers on global leveraged borrow structures.",
      formula: "\\Delta S_{USDJPY} \\ll 0",
      x: 240,
      y: 60,
    },
    {
      id: "carry_unwind",
      title: "Global Carry Trade Liquidation",
      category: "global",
      delta: "Mass Margin Calls",
      direction: "down",
      mechanismText: "Macro hedge funds forced to liquidate long liquid assets (US Tech, Nikkei) to cover Yen borrowing obligations.",
      formula: "Leverage_{De-risk} = f(\\text{VaR Spike})",
      x: 240,
      y: 180,
    },
    {
      id: "vix_spike",
      title: "VIX Volatility Explosion",
      category: "valuation",
      delta: "+18.2 VIX Pts",
      direction: "up",
      mechanismText: "Systematic volatility-targeting and CTA funds trigger forced systematic deleveraging.",
      formula: "Weight_{Equity} \\propto \\frac{1}{\\sigma_{VIX}}",
      x: 440,
      y: 60,
    },
    {
      id: "nikkei_collapse",
      title: "Nikkei 225 Spillover",
      category: "global",
      delta: "-12.4% (Historical Extreme)",
      direction: "down",
      mechanismText: "Exporters hit by strong Yen and domestic financial contagion, accelerating cross-Pacific liquidation.",
      formula: "R_{Nikkei} = -12.4\\%",
      x: 440,
      y: 180,
    },
    {
      id: "target_nq_carry",
      title: "NQ Index Futures Flash Drop",
      category: "equities",
      delta: "-2.85% (1d)",
      direction: "down",
      mechanismText: "US tech stocks sold off not due to domestic fundamentals, but international liquidity cascade.",
      formula: "R_{NQ} = -2.85\\%",
      x: 650,
      y: 120,
    },
  ];

  const currentNodes = graphMode === "boj_carry" ? bojNodes : cpiNodes;
  const selectedNode = currentNodes.find((n) => n.id === selectedNodeId) || currentNodes[0];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              Economic Transmission Mechanism & "Why" Causal Graph
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Deterministic & Theoretical Causal DAG (Directed Acyclic Graph)
            </p>
          </div>
        </div>

        {/* Mechanism Mode Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-sans">
          <button
            onClick={() => {
              setGraphMode("cpi_rates");
              setSelectedNodeId("shock");
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              graphMode === "cpi_rates"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Inflation &rarr; Yields &rarr; Tech
          </button>
          <button
            onClick={() => {
              setGraphMode("boj_carry");
              setSelectedNodeId("shock_boj");
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              graphMode === "boj_carry"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            BOJ &rarr; JPY &rarr; Carry Unwind
          </button>
        </div>
      </div>

      {/* Visual Interactive SVG Graph Canvas */}
      <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 relative overflow-x-auto min-h-[300px]">
        <svg className="w-full min-w-[720px] h-[260px]">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
            </marker>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Render Connections / Directed Edges */}
          {graphMode === "cpi_rates" ? (
            <>
              {/* Shock -> 2Y */}
              <line x1="170" y1="120" x2="235" y2="70" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 2" />
              {/* Shock -> 10Y */}
              <line x1="170" y1="140" x2="235" y2="190" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 2" />
              {/* 2Y -> DXY */}
              <line x1="360" y1="70" x2="435" y2="70" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* 10Y -> Valuation */}
              <line x1="360" y1="190" x2="435" y2="190" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* DXY -> NQ */}
              <line x1="560" y1="75" x2="645" y2="125" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* Valuation -> NQ */}
              <line x1="560" y1="190" x2="645" y2="145" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            </>
          ) : (
            <>
              {/* Shock -> JPY */}
              <line x1="170" y1="120" x2="235" y2="70" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* Shock -> Carry Unwind */}
              <line x1="170" y1="140" x2="235" y2="190" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* JPY -> VIX */}
              <line x1="360" y1="70" x2="435" y2="70" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* Carry -> Nikkei */}
              <line x1="360" y1="190" x2="435" y2="190" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* VIX -> NQ */}
              <line x1="560" y1="75" x2="645" y2="125" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
              {/* Nikkei -> NQ */}
              <line x1="560" y1="190" x2="645" y2="145" stroke="url(#edgeGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            </>
          )}

          {/* Node Elements */}
          {currentNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y - 30})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer"
              >
                <rect
                  width="135"
                  height="64"
                  rx="10"
                  className={`transition-all ${
                    isSelected
                      ? "fill-white stroke-indigo-600 stroke-2 filter drop-shadow-md"
                      : "fill-white stroke-slate-200 hover:stroke-slate-300 stroke-1 shadow-xs"
                  }`}
                />
                <text x="10" y="20" className="text-[11px] font-sans font-bold fill-slate-900">
                  {node.title.slice(0, 16)}
                </text>
                <text
                  x="10"
                  y="40"
                  className={`text-[12px] font-mono font-extrabold ${
                    node.direction === "up" ? "fill-emerald-600" : "fill-rose-600"
                  }`}
                >
                  {node.delta}
                </text>
                <text x="10" y="54" className="text-[9px] font-sans font-semibold fill-slate-400 uppercase">
                  {node.category}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Deep Dive Inspector */}
      {selectedNode && (
        <div className="mt-5 bg-slate-50/70 rounded-xl p-4 border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
              <h3 className="font-bold text-slate-900 font-sans text-sm">
                {selectedNode.title} &bull; Causal Step Breakdown
              </h3>
            </div>
            <span className="font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 font-semibold">
              Delta: {selectedNode.delta}
            </span>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed mb-3 font-sans">
            {selectedNode.mechanismText}
          </p>

          <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] shadow-xs">
            <span className="text-slate-500 font-sans">Structural Equation:</span>
            <code className="text-emerald-700 font-bold">{selectedNode.formula}</code>
          </div>
        </div>
      )}
    </div>
  );
};
