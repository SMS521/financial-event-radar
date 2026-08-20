import React from "react";
import { MarketEvent } from "../types";
import { Clock, Globe, Calendar, Tag, ShieldCheck, AlertCircle, Database } from "lucide-react";

interface Level1Props {
  event: MarketEvent;
}

export const Level1LiveHorizon: React.FC<Level1Props> = ({ event }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-mono font-bold">
            LEVEL 1
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
            Live Event Horizon & Point-in-Time Metadata
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-sans flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scheduled: <strong className="text-slate-700 font-mono">{new Date(event.scheduled_ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}</strong></span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Event identity */}
        <div className="md:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60">
                  {event.country} / {event.market}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ID: {event.event_id}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans leading-snug">
                {event.event_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1">
                <span>Source:</span>
                <strong className="text-slate-700 font-medium">{event.source}</strong>
                <span className="text-slate-400 font-mono">({event.source_quality})</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center space-x-1.5">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>Category: <strong className="text-slate-900 font-semibold">{event.event_category}</strong></span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Data Quality: <strong>{event.data_quality}</strong></span>
            </span>
          </div>
        </div>

        {/* Expectations snapshot */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
          <span className="text-[11px] font-sans uppercase text-slate-500 block mb-2 font-bold tracking-wider">
            Consensus Expectations Snapshot
          </span>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Consensus (Median):</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {event.consensus} {event.unit}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Previous Release:</span>
              <span className="font-mono font-medium text-slate-700">
                {event.previous} {event.unit}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Historical Sigma (σ):</span>
              <span className="font-mono text-slate-600">
                {event.historical_sigma} {event.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Known-At Point-in-Time Barrier */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
          <span className="text-[11px] font-sans uppercase text-slate-500 block mb-2 font-bold tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Point-in-Time (PIT) Barrier</span>
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">publication_ts:</span>
              <span className="text-indigo-600 font-semibold">{event.publication_ts}</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-medium">known_ts (Microsecond):</span>
              <span className="text-emerald-600 font-bold">{event.known_ts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
