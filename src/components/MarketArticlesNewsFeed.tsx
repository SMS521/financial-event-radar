import React, { useState } from "react";
import { MARKET_ARTICLES_DATA, MarketArticleRow } from "../data/portalCalendarData";
import {
  Newspaper,
  MessageSquare,
  Clock,
  User,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Flame,
  ArrowUpRight
} from "lucide-react";

interface Props {
  onSelectTicker?: (ticker: string) => void;
}

export const MarketArticlesNewsFeed: React.FC<Props> = ({ onSelectTicker }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeArticleModal, setActiveArticleModal] = useState<MarketArticleRow | null>(null);

  const categories = [
    "All",
    "Most Popular",
    "Editor's Picks",
    "Market Overview",
    "Commodities",
    "Currencies",
    "Cryptocurrency",
    "Bonds",
    "ETFs"
  ];

  const filteredArticles = MARKET_ARTICLES_DATA.filter((art) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Most Popular") return art.isPopular;
    if (selectedCategory === "Editor's Picks") return art.category === "Editor's Picks";
    if (selectedCategory === "Commodities") return art.category === "Commodities" || art.relatedTickers.includes("CL") || art.relatedTickers.includes("GLD");
    return true;
  });

  return (
    <div id="market-overview-portal-feed" className="space-y-6">
      {/* Category Pills Navigation (Matching Image 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Articles on Left, Live Mini Indices on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Articles Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <span>Market Overview & Analysis</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Real-time Institutional Opinions
            </span>
          </div>

          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticleModal(article)}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start gap-4 group"
              >
                {/* Author Avatar */}
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                      {article.category}
                    </span>
                    {article.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Most Popular
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium ml-auto">
                      {article.readTimeMin} min read
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Footer metadata */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">By {article.authorName}</span>
                      <span>•</span>
                      <span>{article.timestampAgo}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Related Tickers */}
                      <div className="flex items-center gap-1">
                        {article.relatedTickers.map((t) => (
                          <button
                            key={t}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectTicker) onSelectTicker(t);
                            }}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded text-[10px] font-mono font-bold text-slate-700 transition-colors"
                          >
                            ${t}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">{article.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Live Mini Index Table + Chart (Matching Image 3 & Image 5 sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Major Market Indices
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </div>

            {/* Time range selector for mini index chart */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 p-1 rounded-xl">
              {["1D", "1W", "1M", "6M", "1Y", "5Y", "Max"].map((range, i) => (
                <button
                  key={range}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    i === 0 ? "bg-white text-blue-700 shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Index Quotes Table */}
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { name: "US 30", price: "53,459.7", change: "-0.3", changePct: "0.00%", isUp: false },
                { name: "US 500", price: "7,747.3", change: "+1.9", changePct: "+0.02%", isUp: true },
                { name: "Dow Jones", price: "53,459.78", change: "-272.63", changePct: "-0.51%", isUp: false },
                { name: "S&P 500", price: "7,745.39", change: "-40.37", changePct: "-0.52%", isUp: false },
                { name: "Nasdaq 100", price: "26,644.91", change: "-84.25", changePct: "-0.32%", isUp: false },
                { name: "S&P 500 VIX", price: "15.19", change: "+0.94", changePct: "+6.60%", isUp: true, isVix: true },
                { name: "Dollar Index (DXY)", price: "99.47", change: "-0.09", changePct: "-0.09%", isUp: false }
              ].map((row) => (
                <div key={row.name} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-800">{row.name}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{row.price}</span>
                    <span
                      className={`ml-2 font-mono font-bold text-[11px] ${
                        row.isVix
                          ? "text-amber-600"
                          : row.isUp
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {row.changePct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investing Challenge Promo Box (Matching Image 5) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white shadow-md space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase block">
              Skill Benchmarking
            </span>
            <h4 className="text-base font-extrabold leading-snug">
              Investing Challenges & Trade Simulation
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Test your reaction-coordinate strategies with risk-free simulated knockouts and earn ranking points.
            </p>
            <button className="w-full py-2 bg-white text-blue-900 font-extrabold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-sm mt-1">
              Take the Challenge »
            </button>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {activeArticleModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeArticleModal.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">By {activeArticleModal.authorName}</span>
                  <span>•</span>
                  <span>{activeArticleModal.timestampAgo}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveArticleModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <p className="font-medium text-slate-900 text-sm sm:text-base border-l-4 border-blue-600 pl-3 italic">
                {activeArticleModal.summary}
              </p>

              <div className="space-y-3 pt-2">
                <p>
                  Institutional flows across futures and options markets are pricing in a conditional reaction matrix.
                  With macro volatility indices elevating before upcoming central bank decisions, market participants are
                  focusing heavily on pre-calculated breakout thresholds.
                </p>
                <p>
                  Investors are recommended to maintain disciplined position sizing, prioritizing defined-risk parameters
                  and monitoring real yield deviations.
                </p>
              </div>

              {/* Related Tickers Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Related Assets:</span>
                <div className="flex items-center gap-1.5">
                  {activeArticleModal.relatedTickers.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-blue-600 text-white rounded font-mono font-bold">
                      ${t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setActiveArticleModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
