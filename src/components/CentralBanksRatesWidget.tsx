import React from "react";
import { CENTRAL_BANKS_RATES_DATA, CentralBankRateRow } from "../data/portalCalendarData";
import { Landmark, Clock, ChevronRight, TrendingDown, TrendingUp, PauseCircle, Info } from "lucide-react";

interface Props {
  onSelectBank?: (bank: CentralBankRateRow) => void;
}

export const CentralBanksRatesWidget: React.FC<Props> = ({ onSelectBank }) => {
  return (
    <div
      id="central-banks-rates-widget"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Widget Header - Matching Image 4 */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-400" />
          <h3 className="font-extrabold text-sm tracking-tight">
            Central Banks Rates »
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
          Global Policy Rates
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600">
              <th className="py-2.5 px-3 font-semibold">Central Banks</th>
              <th className="py-2.5 px-3 text-right font-semibold">Interest Rates</th>
              <th className="py-2.5 px-3 text-right font-semibold">Next Meeting</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {CENTRAL_BANKS_RATES_DATA.map((bank) => {
              const isCutting = bank.policyBias === "CUTTING" || bank.policyBias === "EASING";
              const isHiking = bank.policyBias === "HIKING";

              return (
                <tr
                  key={bank.id}
                  onClick={() => onSelectBank && onSelectBank(bank)}
                  className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                >
                  {/* Central Bank Name & Flag */}
                  <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-base">{bank.countryFlag}</span>
                    <span className="font-mono text-xs text-blue-700 group-hover:text-blue-900 font-extrabold">
                      {bank.code}
                    </span>
                    <span className="hidden sm:inline text-[11px] text-slate-400 font-normal truncate max-w-[110px]">
                      {bank.name.replace("Central Bank of ", "").replace("Reserve Bank of ", "")}
                    </span>
                  </td>

                  {/* Interest Rate with visual bias indicator */}
                  <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                    <div className="flex items-center justify-end gap-1">
                      <span>{bank.interestRatePct.toFixed(2)}%</span>
                      {isCutting && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                      {isHiking && <TrendingUp className="w-3 h-3 text-rose-600" />}
                      {!isCutting && !isHiking && <PauseCircle className="w-3 h-3 text-slate-400" />}
                    </div>
                  </td>

                  {/* Next Meeting Date */}
                  <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{bank.nextMeetingDate}</span>
                    <span className="block text-[9px] text-slate-400">in {bank.daysUntilMeeting}d</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Widget Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Updated continuously with live central bank communiqués</span>
        </span>
      </div>
    </div>
  );
};
