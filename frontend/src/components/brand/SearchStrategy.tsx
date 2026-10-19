import React from 'react';
import { Search } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
          <h3 className="text-xs font-bold text-slate-800">กลยุทธ์การค้นหา (Search Strategy)</h3>
          <span className="text-[11px] text-slate-400">
            — สังเคราะห์จากสัญญาณของแบรนด์
          </span>
        </div>
        {candidateCount ? (
          <span className="text-[11px] text-slate-500 font-mono">
            พบครีเอเตอร์ในพูล <strong className="text-slate-900 font-bold">{candidateCount}</strong> คน
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {queries.map((query, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/60 border border-orange-200/60 text-xs text-orange-950 font-medium hover:bg-orange-100/60 transition"
          >
            <Search className="w-3 h-3 text-[#FF5A1F]" />
            {query}
          </span>
        ))}
      </div>
    </div>
  );
};
