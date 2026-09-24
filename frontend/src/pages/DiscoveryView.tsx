import React, { useState } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { DiscoveryTable } from '../components/kol/DiscoveryTable';
import { SearchStrategy } from '../components/brand/SearchStrategy';
import { EmptyState } from '../components/common/EmptyState';
import { Users, Filter, RotateCcw } from 'lucide-react';

interface DiscoveryViewProps {
  result: RecommendationResponse | null;
  onSelectCreator: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  result,
  onSelectCreator,
  onGoToDashboard,
  onGoToAnalyze,
}) => {
  const [minSemantic, setMinSemantic] = useState<number>(0);
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="Candidate pool is empty"
        description="Run brand analysis to discover Thai TikTok creators matching the generated search strategy."
        actionLabel="Analyze a Brand"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<Users className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const allTopics = Array.from(
    new Set(result.recommendations.flatMap((r) => r.matching_topics))
  );

  const filtered = result.recommendations.filter((c) => {
    if (c.semantic_relevance_score < minSemantic) return false;
    if (c.engagement_quality_score < minEngagement) return false;
    if (c.final_score < minScore) return false;
    if (selectedTopic !== 'all' && !c.matching_topics.includes(selectedTopic)) return false;
    if (locationFilter === 'local' && c.local_content_relevance_score < 70) return false;
    return true;
  });

  const resetFilters = () => {
    setMinSemantic(0);
    setMinEngagement(0);
    setMinScore(0);
    setSelectedTopic('all');
    setLocationFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          KOL Discovery
        </h1>
        <p className="text-xs text-slate-500">
          Find Thai TikTok creators relevant to this brand.
        </p>
      </div>

      {/* Generated Search Strategy */}
      {result.search_queries && result.search_queries.length > 0 && (
        <SearchStrategy
          queries={result.search_queries}
          candidateCount={result.candidate_pool_count}
        />
      )}

      {/* Filter Toolbar as Specified: [Category] [Relevance] [Engagement] [Location] [Score] */}
      <div className="saas-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Candidate Filter Toolbar</span>
          </div>
          {(minSemantic > 0 || minEngagement > 0 || minScore > 0 || selectedTopic !== 'all' || locationFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Category / Topic */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          </div>

          {/* 2. Relevance (Semantic) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Relevance
            </label>
            <select
              value={minSemantic}
              onChange={(e) => setMinSemantic(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value={0}>All Relevance</option>
              <option value={75}>Semantic ≥ 75</option>
              <option value={80}>Semantic ≥ 80</option>
              <option value={85}>Semantic ≥ 85</option>
            </select>
          </div>

          {/* 3. Engagement */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Engagement
            </label>
            <select
              value={minEngagement}
              onChange={(e) => setMinEngagement(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value={0}>All Engagement</option>
              <option value={70}>Engagement ≥ 70</option>
              <option value={80}>Engagement ≥ 80</option>
            </select>
          </div>

          {/* 4. Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="all">All Locations (Thailand)</option>
              <option value="local">High Local Signal (≥70)</option>
            </select>
          </div>

          {/* 5. Score */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value={0}>All Scores</option>
              <option value={75}>Overall ≥ 75</option>
              <option value={80}>Overall ≥ 80</option>
              <option value={85}>Overall ≥ 85</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Creators Data Product Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Candidate Creators ({filtered.length} of {result.recommendations.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Sorted by rank & final composite score
          </span>
        </div>

        <DiscoveryTable
          creators={filtered}
          onSelectCreator={onSelectCreator}
        />
      </div>
    </div>
  );
};
