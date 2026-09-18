import React from 'react';
import { Search, Target } from 'lucide-react';

interface SearchStrategyProps {
  queries: string[];
  candidateCount?: number | null;
}

export const SearchStrategy: React.FC<SearchStrategyProps> = ({
  queries,
  candidateCount,
}) => {
  if (!queries || queries.length === 0) return null;

  return (
    <div className="saas-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-800">Search Strategy</h3>
          <span className="text-[11px] text-slate-400">
            — synthesized from brand profile
          </span>
        </div>
        {candidateCount ? (
          <span className="text-[11px] text-slate-500 font-mono">
            <strong className="text-slate-800 font-semibold">{candidateCount}</strong> creators found
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {queries.map((query, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium hover:bg-slate-100 transition"
          >
            <Search className="w-2.5 h-2.5 text-slate-400" />
            {query}
          </span>
        ))}
      </div>
    </div>
  );
};
