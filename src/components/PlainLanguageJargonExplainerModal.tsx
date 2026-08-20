import React, { useState } from "react";
import { PLAIN_LANGUAGE_JARGON_DICTIONARY } from "../data/plainLanguageJargonData";
import { JargonExplanation } from "../types/marketIntelligenceTypes";
import {
  X,
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  HelpCircle,
  Clock,
  ArrowRight,
  Flame,
  Scale,
  FileText
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlainLanguageJargonExplainerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedTermKey, setSelectedTermKey] = useState<string>("STOCK_PRINT");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const filteredTerms = PLAIN_LANGUAGE_JARGON_DICTIONARY.filter(
    (item) =>
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.grandpaSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.termKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeItem =
    PLAIN_LANGUAGE_JARGON_DICTIONARY.find((item) => item.termKey === selectedTermKey) ||
    PLAIN_LANGUAGE_JARGON_DICTIONARY[0];

  return (
    <div
      id="jargon-explainer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-600 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  FERRP Financial Jargon & Education Lexicon
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-400 text-slate-950">
                  100% Plain English
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Understand what "Print", "Dovish", "Hawkish", and "Reaction Coordinates" mean for markets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Terms Navigation */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/80 flex flex-col p-3 sm:p-4 overflow-y-auto">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search term (e.g. Dovish, Print)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* List of Terms */}
            <div className="space-y-1.5 flex-1">
              {filteredTerms.map((term) => {
                const isSelected = term.termKey === selectedTermKey;
                return (
                  <button
                    key={term.termKey}
                    onClick={() => setSelectedTermKey(term.termKey)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-100"
                    }`}
                  >
                    <div className="flex-1">
                      <span className="block truncate font-semibold">
                        {term.headline.split("(")[0].replace("What is a ", "").replace("What is an ", "").replace("What does ", "").replace(" mean?", "")}
                      </span>
                      <span
                        className={`text-[10px] block truncate mt-0.5 ${
                          isSelected ? "text-indigo-200" : "text-slate-500"
                        }`}
                      >
                        {term.grandpaSummary.substring(0, 48)}...
                      </span>
                    </div>
                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 mt-1 ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Selected Term Detail */}
          <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                Term: {activeItem.termKey}
              </span>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                {activeItem.headline}
              </h4>
            </div>

            {/* Plain English & Simple Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Simple Everyday Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {activeItem.grandpaSummary}
              </p>
            </div>

            {/* Everyday Analogy */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Everyday Real-World Analogy</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                "{activeItem.kidAnalogy}"
              </p>
            </div>

            {/* Bull / Bear Market Reactions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Bullish Market Reaction</span>
                </div>
                <p className="text-xs text-emerald-950 font-medium">
                  {activeItem.bullishReaction}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Bearish Market Reaction</span>
                </div>
                <p className="text-xs text-rose-950 font-medium">
                  {activeItem.bearishReaction}
                </p>
              </div>
            </div>

            {/* Technical / Institutional Definition */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
                <span>Institutional Market Definition</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeItem.technicalMeaning}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">
            FERRP &bull; Financial Event Risk & Reaction Platform Lexicon
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
