import React, { useState, useMemo } from "react";
import { StockPreMarketProfile, StockIntradayPoint } from "../data/stockPreMarketData";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Maximize2,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Layers
} from "lucide-react";

interface StockPreMarketChartProps {
  profile: StockPreMarketProfile;
  selectedTimeframe: "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All";
  onSelectTimeframe: (tf: "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All") => void;
  timezoneDisplay: "CET" | "ET" | "DUAL";
  showEuroValues: boolean;
}

export const StockPreMarketChart: React.FC<StockPreMarketChartProps> = ({
  profile,
  selectedTimeframe,
  onSelectTimeframe,
  timezoneDisplay,
  showEuroValues,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Timeframe tabs
  const timeframes: ("1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All")[] = [
    "1D",
    "5D",
    "1M",
    "6M",
    "YTD",
    "1Y",
    "5Y",
    "All",
  ];

  // Resolve dataset based on timeframe
  const chartData = useMemo(() => {
    if (!profile) return [];
    const eurRate = profile.eurExchangeRate || 0.9258;

    switch (selectedTimeframe) {
      case "1D":
        return (profile.intraday1D || []).map((pt) => ({
          labelET: pt.timeET,
          labelCET: pt.timeCET,
          priceUSD: pt.priceUSD,
          priceEUR: Number((pt.priceUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: pt.isPreMarket,
          isAfterHours: pt.isAfterHours,
        }));
      case "5D":
        return (profile.historical5D || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "1M":
        return (profile.historical1M || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "6M":
        return (profile.historical6M || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "YTD":
        return (profile.historicalYTD || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "1Y":
        return (profile.historical1Y || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "5Y":
        return (profile.historical5Y || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      case "All":
        return (profile.historicalAll || []).map((pt) => ({
          labelET: pt.date,
          labelCET: pt.date,
          priceUSD: pt.closeUSD,
          priceEUR: pt.closeEUR || Number((pt.closeUSD * eurRate).toFixed(2)),
          volume: pt.volume,
          isPreMarket: false,
        }));
      default:
        return [];
    }
  }, [selectedTimeframe, profile]);

  // Min and max for chart bounds
  const prices = chartData.map((d) => d.priceUSD);
  const baseline = profile?.prevCloseUSD || 100;
  const minPrice = prices.length > 0 ? Math.min(...prices, baseline) * 0.995 : baseline * 0.98;
  const maxPrice = prices.length > 0 ? Math.max(...prices, baseline) * 1.005 : baseline * 1.02;
  const priceRange = maxPrice - minPrice || 1;

  // Chart dimensions in SVG coords
  const svgWidth = 800;
  const svgHeight = 320;
  const paddingLeft = 10;
  const paddingRight = 65;
  const paddingTop = 25;
  const paddingBottom = 40;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return paddingTop + usableHeight - ((val - minPrice) / priceRange) * usableHeight;
  };

  const getX = (idx: number) => {
    if (chartData.length <= 1) return paddingLeft;
    return paddingLeft + (idx / (chartData.length - 1)) * usableWidth;
  };

  // Pre-market boundary for 1D chart (04:00 to 09:30 ET)
  const preMarketEndIdx = chartData.findIndex((d) => !d.isPreMarket);
  const preMarketEndX = preMarketEndIdx > 0 ? getX(preMarketEndIdx) : 0;

  // Build SVG path
  const linePoints = chartData.map((d, i) => `${getX(i)},${getY(d.priceUSD)}`).join(" ");
  const areaPath = `M ${getX(0)},${getY(chartData[0].priceUSD)} ${chartData
    .map((d, i) => `L ${getX(i)},${getY(d.priceUSD)}`)
    .join(" ")} L ${getX(chartData.length - 1)},${paddingTop + usableHeight} L ${getX(
    0
  )},${paddingTop + usableHeight} Z`;

  // Previous close Y line
  const prevCloseY = getY(profile.prevCloseUSD);

  // Active hover point or latest
  const activePt = hoverIndex !== null ? chartData[hoverIndex] : chartData[chartData.length - 1];
  const activePtPriceDiff = activePt ? activePt.priceUSD - profile.prevCloseUSD : 0;
  const activePtPctDiff = (activePtPriceDiff / (profile.prevCloseUSD || 1)) * 100;
  const isPositiveActive = activePtPriceDiff >= 0;

  // Y Axis ticks (4 levels)
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minPrice + ratio * priceRange;
    return {
      valUSD: val,
      valEUR: val * profile.eurExchangeRate,
      y: getY(val),
    };
  });

  return (
    <div className="bg-[#0b1120] text-slate-100 rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl flex flex-col">
      {/* Header bar: Timeframe selector + Session indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              id={`timeframe-btn-${tf}`}
              onClick={() => onSelectTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                selectedTimeframe === tf
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Pre-Market Zone Legend */}
        {selectedTimeframe === "1D" && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-950/80 border border-indigo-500/40 inline-block" />
              <span className="text-indigo-300 font-medium">Pre-Market (10:00 - 15:30 MESZ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#0b1120] border border-slate-600 inline-block" />
              <span className="text-slate-300 font-medium">Regular (15:30 - 22:00 MESZ)</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Chart Container */}
      <div className="relative mt-3 select-none">
        {/* Hover readout banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Selected Point:</span>
            <span className="font-bold text-white">
              {timezoneDisplay === "CET"
                ? activePt?.labelCET
                : timezoneDisplay === "ET"
                ? activePt?.labelET
                : `${activePt?.labelET} / ${activePt?.labelCET}`}
            </span>
            {activePt?.isPreMarket && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 text-[10px] font-bold border border-indigo-700/50">
                PRE-MARKET
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">${activePt?.priceUSD.toFixed(2)}</span>
            <span className="text-xs font-bold text-emerald-400">
              (€{activePt?.priceEUR.toFixed(2)})
            </span>
            <span
              className={`font-bold ${
                isPositiveActive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositiveActive ? "+" : ""}
              {activePtPriceDiff.toFixed(2)} ({isPositiveActive ? "+" : ""}
              {activePtPctDiff.toFixed(2)}%)
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 sm:h-72 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            const boundedX = Math.max(paddingLeft, Math.min(paddingLeft + usableWidth, mouseX));
            const ratio = (boundedX - paddingLeft) / usableWidth;
            const idx = Math.min(
              chartData.length - 1,
              Math.max(0, Math.round(ratio * (chartData.length - 1)))
            );
            setHoverIndex(idx);
          }}
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008170" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#008170" stopOpacity="0.0" />
            </linearGradient>

            {/* Dotted pattern for Pre-Market shaded background (Matching Screenshot 1) */}
            <pattern id="preMarketDottedPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#3b82f6" opacity="0.35" />
            </pattern>
          </defs>

          {/* 1. Pre-Market Shaded Zone Background (for 1D chart) */}
          {selectedTimeframe === "1D" && preMarketEndX > paddingLeft && (
            <g>
              <rect
                x={paddingLeft}
                y={paddingTop}
                width={preMarketEndX - paddingLeft}
                height={usableHeight}
                fill="#1e1b4b"
                opacity="0.4"
              />
              <rect
                x={paddingLeft}
                y={paddingTop}
                width={preMarketEndX - paddingLeft}
                height={usableHeight}
                fill="url(#preMarketDottedPattern)"
              />
              <line
                x1={preMarketEndX}
                y1={paddingTop}
                x2={preMarketEndX}
                y2={paddingTop + usableHeight}
                stroke="#6366f1"
                strokeDasharray="4 3"
                strokeWidth="1.2"
                opacity="0.7"
              />
              <text
                x={paddingLeft + 6}
                y={paddingTop + 14}
                fill="#818cf8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PRE-MARKET (MESZ 10:00 - 15:30)
              </text>
            </g>
          )}

          {/* 2. Grid lines & Right Y-Axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={paddingLeft + usableWidth}
                y2={tick.y}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft + usableWidth + 6}
                y={tick.y + 3}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                ${tick.valUSD.toFixed(2)}
              </text>
              {showEuroValues && (
                <text
                  x={paddingLeft + usableWidth + 6}
                  y={tick.y + 13}
                  fill="#10b981"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  €{tick.valEUR.toFixed(2)}
                </text>
              )}
            </g>
          ))}

          {/* 3. Previous Close Reference Line (Dashed) */}
          {prevCloseY >= paddingTop && prevCloseY <= paddingTop + usableHeight && (
            <g>
              <line
                x1={paddingLeft}
                y1={prevCloseY}
                x2={paddingLeft + usableWidth}
                y2={prevCloseY}
                stroke="#64748b"
                strokeDasharray="5 4"
                strokeWidth="1.2"
              />
              <text
                x={paddingLeft + usableWidth - 10}
                y={prevCloseY - 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="9.5"
                fontFamily="monospace"
              >
                Prev Close ${profile.prevCloseUSD.toFixed(2)} (€{profile.prevCloseEUR.toFixed(2)})
              </text>
            </g>
          )}

          {/* 4. Chart Area & Line */}
          <path d={areaPath} fill="url(#areaGradient)" />
          <path
            d={`M ${linePoints.split(" ")[0]} ${linePoints
              .split(" ")
              .map((p) => `L ${p}`)
              .join(" ")}`}
            fill="none"
            stroke="#00a892"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 5. Live Price Current Badge on Right Edge */}
          {chartData.length > 0 && (
            <g>
              <rect
                x={paddingLeft + usableWidth + 2}
                y={getY(profile.preMarketPrice || profile.regularPrice) - 9}
                width={56}
                height={18}
                rx={4}
                fill={profile.preMarketChange >= 0 ? "#059669" : "#e11d48"}
              />
              <text
                x={paddingLeft + usableWidth + 30}
                y={getY(profile.preMarketPrice || profile.regularPrice) + 3}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ${(profile.preMarketPrice || profile.regularPrice).toFixed(2)}
              </text>
            </g>
          )}

          {/* 6. Hover Crosshair */}
          {hoverIndex !== null && chartData[hoverIndex] && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + usableHeight}
                stroke="#cbd5e1"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(chartData[hoverIndex].priceUSD)}
                r="4.5"
                fill="#ffffff"
                stroke="#00a892"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* 7. Bottom X-Axis Time Ticks */}
          {chartData.map((d, idx) => {
            const step = Math.max(1, Math.floor(chartData.length / 6));
            if (idx % step !== 0 && idx !== chartData.length - 1) return null;
            const x = getX(idx);
            const label = timezoneDisplay === "CET" ? d.labelCET : d.labelET;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={paddingTop + usableHeight}
                  x2={x}
                  y2={paddingTop + usableHeight + 5}
                  stroke="#475569"
                />
                <text
                  x={x}
                  y={paddingTop + usableHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {label.split(" ")[0]}
                </text>
                {timezoneDisplay === "DUAL" && (
                  <text
                    x={x}
                    y={paddingTop + usableHeight + 28}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {d.labelCET.split(" ")[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
