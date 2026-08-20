import React from "react";
import {
  UpcomingEconomicEvent,
  TodayReleasedNewsItem
} from "../types/marketIntelligenceTypes";
import {
  X,
  Calendar,
  Clock,
  Building2,
  Twitter,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BarChart2,
  ChevronRight,
  ExternalLink,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface NewsEventDetailModalProps {
  event: UpcomingEconomicEvent | null;
  newsItem: TodayReleasedNewsItem | null;
  onClose: () => void;
}

export const NewsEventDetailModal: React.FC<NewsEventDetailModalProps> = ({
  event,
  newsItem,
  onClose
}) => {
  if (!event && !newsItem) return null;

  const isUpcoming = Boolean(event);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xl">{isUpcoming ? event?.flagEmoji : newsItem?.flagEmoji}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                {isUpcoming ? "VORSCHAU • 2-WOCHEN KALENDER" : "HEUTIGE VERÖFFENTLICHUNG"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                {isUpcoming ? event?.category : newsItem?.category}
              </span>
              {isUpcoming && event?.impactLevel === "HIGH" && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>HIGH MARKET IMPACT</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {isUpcoming ? event?.eventName : newsItem?.headline}
            </h2>

            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono pt-1">
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{isUpcoming ? event?.germanDateTimeCest : newsItem?.releasedTimeCest}</span>
              </span>
              {isUpcoming && (
                <>
                  <span>&bull;</span>
                  <span className="text-slate-400">{event?.usDateTimeEt}</span>
                </>
              )}
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

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Key Metrics / Consensus Row */}
          {isUpcoming && event && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">Konsens-Prognose</span>
                <div className="text-base font-bold text-indigo-950">{event.consensusForecast}</div>
                <div className="text-[11px] text-slate-500">Erwartete Bandbreite: {event.forecastRange}</div>
              </div>

              <div className="space-y-0.5 sm:border-l sm:border-indigo-200 sm:pl-4">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">Vorheriger Wert</span>
                <div className="text-base font-bold text-slate-800">{event.previousValue}</div>
                <div className="text-[11px] text-slate-500">Letzte offizielle Veröffentlichung</div>
              </div>

              <div className="space-y-0.5 sm:border-l sm:border-indigo-200 sm:pl-4">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700">Geschätztes Kursziel</span>
                <div className="text-xs font-bold font-mono text-indigo-900 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{event.estimatedTargetDropOrGain}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">Basierend auf 70 historischen Events</div>
              </div>
            </div>
          )}

          {/* Today's Released Result Overview */}
          {!isUpcoming && newsItem && (
            <div className={`p-4 rounded-2xl border ${
              newsItem.isMarketPositive
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-rose-50/70 border-rose-200 text-rose-950"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                    newsItem.isMarketPositive ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                  }`}>
                    {newsItem.outcomeType.replace(/_/g, " ")}
                  </span>
                  <div className="text-base font-bold mt-1">
                    Tatsächlich: <span className="font-mono text-lg">{newsItem.actualValue}</span> vs. Erwartung: <span className="font-mono">{newsItem.consensusValue}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-slate-500 text-[10px]">Unmittelbare Marktreaktion</div>
                  <div className="font-bold text-slate-900">{newsItem.marketReactionNasdaq}</div>
                  <div className="text-slate-600">{newsItem.marketReactionDax}</div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div className="text-xs font-bold flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>{newsItem.predictedTargetRange}</span>
                </div>
                <div className="text-xs text-slate-600">{newsItem.keyTakeaway}</div>
              </div>
            </div>
          )}

          {/* SECTION 1: GLOBAL INVESTMENT BANK ANALYST FORECASTS */}
          {isUpcoming && event?.bankExpectations && event.bankExpectations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Analysen & Erwartungen der führenden Investmentbanken</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.bankExpectations.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{b.bankName}</span>
                        <span className="text-[11px] text-slate-500 block">{b.analyst}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-xs text-indigo-700">{b.forecastValue}</span>
                        <span
                          className={`block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                            b.stance === "BULLISH" || b.stance === "DOVISH"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.stance === "BEARISH" || b.stance === "HAWKISH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {b.stance}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{b.commentary}</p>

                    <div className="pt-2 border-t border-slate-200/80 text-[11px] font-mono text-indigo-900 flex items-center space-x-1 font-semibold">
                      <ChevronRight className="w-3 h-3 text-indigo-600" />
                      <span>Erwartete Marktwirkung: {b.targetPriceImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: HISTORICAL SCENARIOS & ACCURATE PRICE TARGET PLAYBOOK */}
          {isUpcoming && event?.historicalScenarios && event.historicalScenarios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>Historisches Kursreaktions-Playbook (Vergangenheits-Datenbank)</span>
              </div>

              <div className="space-y-2.5">
                {event.historicalScenarios.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        <span className="font-bold text-slate-900 text-xs">{s.outcomeCase}</span>
                        <span className="text-[10px] font-mono text-slate-500">({s.condition})</span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono">
                        <span className="text-slate-500">
                          Wahrscheinlichkeit: <strong className="text-slate-800">{s.historicalProbability}%</strong> (N={s.historicalSampleSize})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                          {s.primaryTargetZone}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">{s.playbookDescription}</p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans text-[10px]">Nasdaq 100 Ø:</span>
                        <span className={`font-bold ${s.expectedNasdaqMovePct.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>
                          {s.expectedNasdaqMovePct}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[10px]">DAX 40 Ø:</span>
                        <span className={`font-bold ${s.expectedDaxMovePct.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>
                          {s.expectedDaxMovePct}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[10px]">10Y Rendite:</span>
                        <span className="font-bold text-slate-800">{s.expectedYieldMoveBps}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: SOCIAL MEDIA / TWEETS & ANALYST SENTIMENT RADAR */}
          {((isUpcoming && event?.tweetExpectations && event.tweetExpectations.length > 0) ||
            (!isUpcoming && newsItem?.tweetReactions && newsItem.tweetReactions.length > 0)) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Twitter className="w-4 h-4 text-sky-500" />
                <span>Politiker- & Top-Analysten Tweets / Social Media Erwartungen</span>
              </div>

              <div className="space-y-2">
                {(isUpcoming ? event?.tweetExpectations : newsItem?.tweetReactions)?.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-sky-50/40 border border-sky-100 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{t.author}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{t.handle}</span>
                        <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
                          {t.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{t.timestamp}</span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed font-sans">{t.tweetText}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <span className="text-slate-500">Prognostiziertes Ziel: <strong className="text-indigo-700">{t.predictedTarget}</strong></span>
                      <span className="text-slate-400">{t.likesOrRetweets}</span>
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
            Deutsche Zeitzone (CEST • UTC+2) &bull; Bloomberg/EDGAR/Twitter Feeds
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
