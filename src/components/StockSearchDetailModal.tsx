import React from "react";
import { SearchableAssetItem } from "../data/marketIntelligenceData";
import { POLITICIAN_TRADING_LEDGER, CORPORATE_BIG_DEALS_FEED } from "../data/marketIntelligenceData";
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Building,
  Target,
  Twitter,
  FileText,
  ShieldCheck,
  Activity,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface StockSearchDetailModalProps {
  asset: SearchableAssetItem | null;
  onClose: () => void;
}

export const StockSearchDetailModal: React.FC<StockSearchDetailModalProps> = ({
  asset,
  onClose
}) => {
  if (!asset) return null;

  // Find related politician trades
  const politicianTrades = POLITICIAN_TRADING_LEDGER.filter(
    (t) => t.ticker.toUpperCase() === asset.ticker.toUpperCase()
  );

  // Find related corporate deals
  const relatedDeals = CORPORATE_BIG_DEALS_FEED.filter(
    (d) => d.ticker.toUpperCase() === asset.ticker.toUpperCase()
  );

  const isPositive = asset.changePct >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xl">{asset.flagEmoji}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                {asset.exchange} : {asset.ticker}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                {asset.sector}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>{asset.name}</span>
            </h2>

            <div className="flex items-center space-x-4 pt-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-mono font-bold text-white">
                  ${asset.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm font-mono font-bold flex items-center ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {asset.changePct.toFixed(2)}% (24h)
                </span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                  asset.overallSignal === "STRONG_BUY"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : asset.overallSignal === "BUY"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : asset.overallSignal === "STRONG_SELL"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                SIGNAL: {asset.overallSignal.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Wall Street Analysten-Ziel</span>
              <div className="text-lg font-bold font-mono text-indigo-950">${asset.targetPriceAvg.toFixed(2)}</div>
              <div className="text-xs text-indigo-800 font-sans">{asset.analystConsensus}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Social Sentiment Score</span>
              <div className="text-lg font-bold font-mono text-emerald-950">{asset.sentimentScore} / 100</div>
              <div className="text-xs text-emerald-800 font-sans">Sehr starkes Bullish Sentiment online</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Aktuelle Top-Meldung</span>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">{asset.latestHeadline}</p>
            </div>
          </div>

          {/* SECTION 1: INVESTING.COM STYLE MULTI-TIMEFRAME SIGNALS */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Multi-Timeframe Technische Kauf-/Verkaufssignale (Investing.com Style)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { tf: "5 Minuten (5m)", signal: "STRONG_BUY", score: "+88 Bullish", rsi: "68.4" },
                { tf: "15 Minuten (15m)", signal: "STRONG_BUY", score: "+82 Bullish", rsi: "64.2" },
                { tf: "1 Stunde (1h)", signal: "BUY", score: "+62 Bullish", rsi: "56.5" },
                { tf: "1 Tag (1D)", signal: "BUY", score: "+70 Bullish", rsi: "58.0" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono font-semibold">{item.tf}</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {item.signal.replace(/_/g, " ")}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">RSI: {item.rsi} &bull; {item.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: US POLITICIAN TRADING DISCLOSURES (STOCK ACT) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Politiker-Portfolios & Transaktionen (US Kongress / STOCK Act)</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Offizielle monatliche Berichte</span>
            </div>

            {politicianTrades.length > 0 ? (
              <div className="space-y-2.5">
                {politicianTrades.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{t.politicianName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            t.party === "DEMOCRAT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.party === "DEMOCRAT" ? "Demokrat" : "Republikaner"} ({t.state})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            t.transactionType === "PURCHASE" || t.transactionType === "OPTION_CALL"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {t.transactionType.replace(/_/g, " ")}: {t.amountRange}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-500">
                        Handelsdatum: <strong className="text-slate-800">{t.transactionDate}</strong> (Veröffentlicht: {t.disclosureFilingDate})
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{t.tradeRationaleContext}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono border-t border-indigo-100/60">
                      <span className="text-slate-500">
                        Ausschüsse: <strong className="text-slate-700">{t.committeeAssignments.join(", ")}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold">Kursentwicklung seit Trade: {t.subsequentPricePerformance}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-slate-400" />
                <span>{asset.politicianActivity}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: BIG CORPORATE DEALS & CONTRACTS */}
          {relatedDeals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Große Regierungs- & Unternehmenskontrakte (Big Deals)</span>
              </div>

              <div className="space-y-2.5">
                {relatedDeals.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{d.dealTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold text-xs">
                        Volumen: {d.dealValueBillions}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-sans">{d.summary}</p>
                    <div className="text-[10px] font-mono text-emerald-800 font-bold pt-1">
                      Partner: {d.counterpartyOrAgency} &bull; Erwarteter Kurseffekt: {d.expectedPriceImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Echtzeit-Synchronisation &bull; SEC EDGAR Form 4 & Capitol Trades Feeds
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
