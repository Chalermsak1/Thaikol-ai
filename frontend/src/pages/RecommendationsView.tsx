import React, { useState } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { CreatorCard } from '../components/kol/CreatorCard';
import { EmptyState } from '../components/common/EmptyState';
import { Award, Copy, Download, Check, Filter, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface RecommendationsViewProps {
  result: RecommendationResponse | null;
  comparisonList: string[];
  onToggleCompare: (username: string) => void;
  onOpenCreatorDetail: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  result,
  comparisonList,
  onToggleCompare,
  onOpenCreatorDetail,
  onGoToDashboard,
}) => {
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [safetyFilter, setSafetyFilter] = useState<'all' | 'safe' | 'review'>('all');
  const [limit, setLimit] = useState<5 | 10>(5);
  const [copied, setCopied] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Run brand analysis on the Dashboard to rank candidate creators using the 5-factor weighted model."
        actionLabel="Go to Dashboard"
        onAction={onGoToDashboard}
        icon={<Award className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const allTopics = Array.from(
    new Set(result.recommendations.flatMap((r) => r.matching_topics))
  );

  const filtered = result.recommendations
    .filter((r) => r.final_score >= minScore)
    .filter((r) => (selectedTopic === 'all' ? true : r.matching_topics.includes(selectedTopic)))
    .filter((r) => {
      if (safetyFilter === 'safe') return r.brand_safety_risk_level === 'safe';
      if (safetyFilter === 'review') return r.brand_safety_risk_level === 'review';
      return true;
    })
    .slice(0, limit);

  // Copy summary
  const handleCopySummary = () => {
    const brandName = result.brand_profile?.brand_name || 'Brand';
    const topRecs = filtered
      .map(
        (r) =>
          `#${r.rank} ${r.display_name} (@${r.username}) — Match: ${r.final_score.toFixed(1)}/100\n   TikTok: ${r.profile_url}\n   Reasons: ${r.reasons.join('; ')}`
      )
      .join('\n\n');

    const summaryText = `🎯 ThaiKOL AI · Creator Recommendations for ${brandName}\nWeights: Semantic 45% · Engagement 25% · Local 15% · Safety 10% · Data 5%\n\n${topRecs}\n\n* Audience Fit Proxy is informational — not verified follower demographics.`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      'rank', 'username', 'display_name', 'profile_url', 'final_score',
      'semantic_relevance_score', 'engagement_quality_score',
      'local_content_relevance_score', 'brand_safety_score', 'data_quality_score',
    ];
    const rows = filtered.map((r) => [
      r.rank, `"${r.username}"`, `"${r.display_name.replace(/"/g, '""')}"`,
      `"${r.profile_url}"`, r.final_score.toFixed(1),
      r.semantic_relevance_score.toFixed(1), r.engagement_quality_score.toFixed(1),
      r.local_content_relevance_score.toFixed(1), r.brand_safety_score.toFixed(0),
      r.data_quality_score.toFixed(1),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thaikol_recommendations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recommendations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked creators based on the brand profile and 5-factor evaluation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs self-start sm:self-auto">
          <span className="tabular-nums">{result.candidate_pool_count || 0} analyzed</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-800 tabular-nums">{filtered.length} shown</span>
        </div>
      </div>

      {/* Scoring formula (collapsible) */}
      <div className="saas-card px-4 py-3">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium">How is the Overall Match Score calculated?</span>
          </div>
          {showFormula
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          }
        </button>
        {showFormula && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">
              A transparent multi-factor linear composite — no hidden overrides:
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { pct: '45%', label: 'Semantic' },
                { pct: '25%', label: 'Engagement' },
                { pct: '15%', label: 'Local' },
                { pct: '10%', label: 'Safety' },
                { pct: '5%', label: 'Data' },
              ].map((f) => (
                <div key={f.label} className="p-2 rounded-md bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm font-mono">{f.pct}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter + export toolbar */}
      <div className="saas-card px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value={0}>All scores</option>
            <option value={75}>Min 75+</option>
            <option value={80}>Min 80+</option>
            <option value={85}>Min 85+</option>
          </select>

          {allTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer max-w-[160px]"
            >
              <option value="all">All topics</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          )}

          <select
            value={safetyFilter}
            onChange={(e) => setSafetyFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All safety</option>
            <option value="safe">Screened safe</option>
            <option value="review">Needs review</option>
          </select>

          {/* Limit toggle */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
            {([5, 10] as const).map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  limit === n ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        {/* Export actions */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={handleCopySummary}
            className="btn-secondary px-3 py-1.5 text-xs gap-1.5"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn-secondary px-3 py-1.5 text-xs gap-1.5"
          >
            <Download className="w-3 h-3 text-slate-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Creator cards */}
      <div className="space-y-4">
        {filtered.map((rec) => (
          <CreatorCard
            key={rec.username}
            recommendation={rec}
            isCompared={comparisonList.includes(rec.username)}
            onToggleCompare={() => onToggleCompare(rec.username)}
            onOpenDetail={() => onOpenCreatorDetail(rec)}
          />
        ))}
      </div>
    </div>
  );
};
