import React, { useState } from "react";
import {
  POLITICIAN_TRADING_LEDGER,
  CORPORATE_BIG_DEALS_FEED
} from "../data/marketIntelligenceData";
import {
  PoliticianTradeRecord,
  CorporateBigDealItem
} from "../types/marketIntelligenceTypes";
import {
  UserCheck,
  Building,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Zap,
  Tag,
  Briefcase,
  ShieldCheck,
  Info
} from "lucide-react";

interface PoliticalInsiderTrackingModuleProps {
  onSelectTicker?: (ticker: string) => void;
}

export const PoliticalInsiderTrackingModule: React.FC<PoliticalInsiderTrackingModuleProps> = ({
  onSelectTicker
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [partyFilter, setPartyFilter] = useState<"ALL" | "DEMOCRAT" | "REPUBLICAN">("ALL");
  const [chamberFilter, setChamberFilter] = useState<"ALL" | "HOUSE" | "SENATE">("ALL");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"ALL" | "PURCHASE" | "SALE" | "OPTION_CALL">("ALL");
  const [selectedRecord, setSelectedRecord] = useState<PoliticianTradeRecord | null>(POLITICIAN_TRADING_LEDGER[0]);

  // Computed dynamic metrics calculated directly from the active ledger array
  const computedStats = React.useMemo(() => {
    const totalCount = POLITICIAN_TRADING_LEDGER.length;
    const totalEstValue = POLITICIAN_TRADING_LEDGER.reduce((acc, r) => acc + (r.estimatedAmountValue || 0), 0);
    const avgFilingDelayDays = totalCount > 0
      ? Math.round(POLITICIAN_TRADING_LEDGER.reduce((acc, r) => acc + (r.filingDelayDays || 0), 0) / totalCount)
      : 0;
    const buyCount = POLITICIAN_TRADING_LEDGER.filter(r => r.transactionType === "PURCHASE" || r.transactionType === "OPTION_CALL").length;

    return {
      totalCount,
      totalEstValueFormatted: `$${(totalEstValue / 1000000).toFixed(2)}M`,
      avgFilingDelayDays,
      buyRatioPct: Math.round((buyCount / (totalCount || 1)) * 100)
    };
  }, []);

  // Filter records
  const filteredRecords = POLITICIAN_TRADING_LEDGER.filter((rec) => {
    const matchesSearch =
      rec.politicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.committeeAssignments.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesParty = partyFilter === "ALL" || rec.party === partyFilter;
    const matchesChamber = chamberFilter === "ALL" || rec.chamber === chamberFilter;
    const matchesType = transactionTypeFilter === "ALL" || rec.transactionType === transactionTypeFilter;

    return matchesSearch && matchesParty && matchesChamber && matchesType;
  });

  // Find associated big deals / government contracts for a given ticker
  const getAssociatedDeals = (ticker: string): CorporateBigDealItem[] => {
    return CORPORATE_BIG_DEALS_FEED.filter(
      (deal) => deal.ticker.toUpperCase() === ticker.toUpperCase()
    );
  };

  return (
    <div id="political-insider-tracking-module" className="bg-white border border-slate-200 rounded-3xl shadow-lg p-5 sm:p-6 space-y-6">
      {/* Prominent Simulated Research Demonstration Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900 text-sm tracking-tight">
              Illustrative Research Simulation & Policy Transmission Model
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold">
              SYNTHETIC PERSONAS ONLY
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            All records, names (e.g. "Rep. Alex Vance"), transactions, and commentary displayed below are <strong>fictional, synthetic simulation data</strong> engineered purely to demonstrate quantitative modeling of legislative calendar overlaps, committee jurisdiction flows, and government procurement cycles. None of these records represent actual real-world individuals or transactions.
          </p>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Policy Transmission & Committee Oversight Case Studies
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                POLICY SIMULATION FRAMEWORK
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quantitative modeling of legislative calendar timelines cross-referenced with enterprise contracts and supply chain dependencies
            </p>
          </div>
        </div>

        {/* Top metrics badges computed dynamically */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center space-x-1.5 shadow-xs">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulated Volume: {computedStats.totalEstValueFormatted}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center space-x-1.5 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{computedStats.buyRatioPct}% Buys / Calls ({computedStats.totalCount} Cases)</span>
          </div>
          <div className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center space-x-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Avg Filing Delay: {computedStats.avgFilingDelayDays} Days</span>
          </div>
        </div>
      </div>

      {/* Legal & Regulatory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Simulation Disclosure:</strong> All listed profiles represent synthetic, illustrative personas ("Rep. Alex Vance", "Sen. Robert Sterling", etc.) modeled for market research and policy transmission workflow testing. FERRP provides this interactive scenario tool strictly for educational and algorithmic simulation modeling. Data does not represent real transactions, real public officials, or investment advice.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search persona, committee, ticker (e.g. NVDA, MSFT)..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Chamber */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5">
            {[
              { id: "ALL", label: "All Chambers" },
              { id: "SENATE", label: "Senate" },
              { id: "HOUSE", label: "House" }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setChamberFilter(c.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  chamberFilter === c.id
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Party */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5">
            {[
              { id: "ALL", label: "All Parties" },
              { id: "DEMOCRAT", label: "Dem" },
              { id: "REPUBLICAN", label: "Rep" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPartyFilter(p.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  partyFilter === p.id
                    ? "bg-slate-900 text-white font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split: Left Table + Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction List Table */}
        <div className="lg:col-span-7 space-y-3 overflow-y-auto max-h-[520px] pr-1">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No matching political disclosures found for this filter.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              const isPurchase = rec.transactionType === "PURCHASE" || rec.transactionType === "OPTION_CALL";

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400"
                      : "bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {rec.politicianName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            rec.party === "DEMOCRAT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {rec.party === "DEMOCRAT" ? "D" : "R"}-{rec.state}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {rec.chamber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Committees: {rec.committeeAssignments.slice(0, 2).join(", ")}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          isPurchase
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {rec.transactionType.replace(/_/g, " ")}
                      </span>
                      <div className="text-[11px] font-mono text-slate-600 font-bold mt-1">
                        {rec.amountRange}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {rec.ticker}
                      </span>
                      <span className="text-slate-600 font-medium">{rec.companyName}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono">
                      <span>Filed: {rec.disclosureFilingDate}</span>
                      <span className="text-emerald-700 font-bold">
                        {rec.subsequentPricePerformance}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Record Inspector & Correlated Deals */}
        <div className="lg:col-span-5">
          {selectedRecord ? (
            <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl sticky top-24">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                      {selectedRecord.chamber} &bull; {selectedRecord.party}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedRecord.politicianName}
                  </h3>
                  <div className="text-xs text-slate-400">
                    State: {selectedRecord.state} &bull; Committees: {selectedRecord.committeeAssignments.join(", ")}
                  </div>
                </div>

                <button
                  onClick={() => onSelectTicker && onSelectTicker(selectedRecord.ticker)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                >
                  <span>Inspect {selectedRecord.ticker}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trade Details Box */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Asset:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    {selectedRecord.ticker} &bull; {selectedRecord.companyName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Transaction Type:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedRecord.transactionType.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Value Range:</span>
                  <span className="font-mono font-bold text-white font-mono">
                    {selectedRecord.amountRange}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Performance Since Filing:</span>
                  <span className="font-mono font-bold text-emerald-400 font-mono">
                    {selectedRecord.subsequentPricePerformance}
                  </span>
                </div>
              </div>

              {/* Legislative & Contract Context */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulated Policy Transmission & Committee Oversight Context</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                  {selectedRecord.tradeRationaleContext}
                </p>
              </div>

              {/* Highlight Major Corporate Deals / Contracts */}
              {getAssociatedDeals(selectedRecord.ticker).map((deal) => (
                <div
                  key={deal.id}
                  className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                      {deal.dealType.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-white font-mono">{deal.dealValueBillions}</span>
                  </div>
                  <h4 className="text-sm font-bold text-indigo-200">{deal.dealTitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{deal.summary}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-indigo-400">
                    <span>Counterparty: {deal.counterpartyOrAgency}</span>
                    <span className="font-bold text-emerald-400 font-mono">{deal.expectedPriceImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs">
              Select a simulated record to inspect policy timeline models and associated corporate contract developments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
