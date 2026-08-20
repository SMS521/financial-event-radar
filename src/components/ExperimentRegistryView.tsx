import React, { useState } from "react";
import { ExperimentRecord } from "../types";
import { FlaskConical, Search, CheckCircle2, ShieldCheck, Filter, ArrowUpRight } from "lucide-react";

interface ExperimentRegistryProps {
  experiments: ExperimentRecord[];
}

export const ExperimentRegistryView: React.FC<ExperimentRegistryProps> = ({ experiments }) => {
  const [selectedFamily, setSelectedFamily] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const families = [
    { id: "ALL", label: "All Families" },
    { id: "Phase 0 - Historical Feasibility Baseline", label: "Phase 0: Baseline" },
    { id: "Family A - Event Response", label: "Family A: Response" },
    { id: "Family E - News & Confounding", label: "Family E: Confounding" },
  ];

  const filteredExperiments = experiments.filter((exp) => {
    const matchesFamily = selectedFamily === "ALL" || exp.family === selectedFamily;
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              Empirical Research Experiment Registry (Phase 0 & Families A–F)
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Pre-Registered Hypotheses, Econometric Tests, and Empirical Verdicts
            </p>
          </div>
        </div>

        <span className="text-xs font-sans text-slate-500">
          Showing <strong className="text-purple-700 font-bold">{filteredExperiments.length}</strong> of {experiments.length} Experiments
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search experiments by hypothesis, title, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-sans text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          {families.map((fam) => (
            <button
              key={fam.id}
              onClick={() => setSelectedFamily(fam.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all font-semibold cursor-pointer ${
                selectedFamily === fam.id
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {fam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experiments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExperiments.map((exp) => (
          <div
            key={exp.id}
            className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/10 transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono font-bold text-purple-700 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200">
                  {exp.code} &bull; {exp.family}
                </span>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{exp.status}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 font-sans mb-2.5">
                {exp.title}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-sans uppercase text-slate-400 block font-bold mb-1">
                    Pre-Registered Hypothesis:
                  </span>
                  <p className="text-slate-700 italic font-serif">
                    "{exp.hypothesis}"
                  </p>
                </div>

                <div className="text-slate-500 text-[11px] font-sans">
                  <strong className="text-slate-800 font-semibold">Dataset:</strong> {exp.dataset} ({exp.target_asset})
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex-1 pr-3">
                <span className="text-slate-400 text-[10px] block font-sans">Key Empirical Finding:</span>
                <span className="text-indigo-900 font-semibold text-[11px] leading-tight block font-sans">{exp.key_finding}</span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-slate-400 text-[10px] block font-sans">Sample Size:</span>
                <span className="text-slate-900 font-extrabold">{exp.sample_size} N</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
