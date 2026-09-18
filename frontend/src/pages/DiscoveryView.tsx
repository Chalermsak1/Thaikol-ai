import React, { useState } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { CreatorTable } from '../components/kol/CreatorTable';
import { SearchStrategy } from '../components/brand/SearchStrategy';
import { EmptyState } from '../components/common/EmptyState';
import { Users, Filter } from 'lucide-react';

interface DiscoveryViewProps {
  result: RecommendationResponse | null;
  onSelectCreator: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  result,
  onSelectCreator,
  onGoToDashboard,
}) => {
  const [minSemantic, setMinSemantic] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="Candidate pool is empty"
        description="Run brand analysis from the Dashboard to discover Thai TikTok creators matching the generated search strategy."
        actionLabel="Go to Dashboard"
        onAction={onGoToDashboard}
        icon={<Users className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const allTopics = Array.from(
    new Set(result.recommendations.flatMap((r) => r.matching_topics))
  );

  const filtered = result.recommendations.filter((c) => {
    if (c.semantic_relevance_score < minSemantic) return false;
    if (selectedTopic !== 'all' && !c.matching_topics.includes(selectedTopic)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">KOL Discovery</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Discovered Thai TikTok creators evaluated against brand signals and search queries
        </p>
      </div>

      {/* Search strategy */}
      {result.search_queries && (
        <SearchStrategy queries={result.search_queries} candidateCount={result.candidate_pool_count} />
      )}

      {/* Filter toolbar */}
      <div className="saas-card px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Filters</span>
        </div>

        <select
          value={minSemantic}
          onChange={(e) => setMinSemantic(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          <option value={0}>All semantic scores</option>
          <option value={70}>Semantic ≥ 70</option>
          <option value={80}>Semantic ≥ 80</option>
          <option value={85}>Semantic ≥ 85</option>
        </select>

        {allTopics.length > 0 && (
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer max-w-[180px]"
          >
            <option value="all">All topics</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>#{t}</option>
            ))}
          </select>
        )}

        <span className="text-[11px] text-slate-400 font-mono ml-auto">
          {filtered.length} of {result.recommendations.length} creators
        </span>
      </div>

      {/* Creator table */}
      <CreatorTable creators={filtered} onSelectCreator={onSelectCreator} />
    </div>
  );
};
