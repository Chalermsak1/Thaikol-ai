import React, { useState, useMemo } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { RecommendationFeature } from '../components/kol/RecommendationFeature';
import { RecommendationList } from '../components/kol/RecommendationList';
import { EmptyState } from '../components/common/EmptyState';
import { getProfileLinkStatus } from '../components/kol/TikTokProfileCTA';
import {
  Award,
  Copy,
  Download,
  Check,
  Filter,
  Info,
  Search,
} from 'lucide-react';

interface RecommendationsViewProps {
  result: RecommendationResponse | null;
  comparisonList: string[];
  shortlist?: Record<string, any>;
  onToggleCompare: (username: string) => void;
  onToggleShortlist?: (creator: KOLRecommendation) => void;
  onOpenCreatorDetail: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
  onGoToShortlist?: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  result,
  comparisonList,
  shortlist = {},
  onToggleCompare,
  onToggleShortlist,
  onOpenCreatorDetail,
  onGoToDashboard,
  onGoToAnalyze,
}) => {
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [safetyFilter, setSafetyFilter] = useState<'all' | 'safe' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limit, setLimit] = useState<5 | 10>(5);
  const [copied, setCopied] = useState(false);

  // Audited Multi-Factor Standard Recommendations
  const scoredRecommendations = useMemo(() => {
    return result?.recommendations ?? [];
  }, [result?.recommendations]);

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Run brand analysis to rank candidate creators using the 5-factor weighted model."
        actionLabel="Analyze a Brand"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<Award className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const allTopics = Array.from(
    new Set(result.recommendations.flatMap((r) => r.matching_topics))
  );

  const query = searchQuery.trim().toLowerCase();
  const filtered = scoredRecommendations
    .filter((r) => r.final_score >= minScore)
    .filter((r) => (selectedTopic === 'all' ? true : r.matching_topics.includes(selectedTopic)))
    .filter((r) => {
      if (safetyFilter === 'safe') return r.brand_safety_risk_level === 'safe';
      if (safetyFilter === 'review') return r.brand_safety_risk_level === 'review';
      return true;
    })
    .filter((r) => {
      if (!query) return true;
      return (
        r.display_name.toLowerCase().includes(query) ||
        r.username.toLowerCase().includes(query) ||
        r.matching_topics.some((t) => t.toLowerCase().includes(query))
      );
    })
    .slice(0, limit);

  const topMatch = filtered[0];
  const remainingMatches = filtered.slice(1);

  // Copy summary
  const handleCopySummary = () => {
    const brandName = result.brand_profile?.brand_name || 'Brand';
    const topRecs = filtered
      .map((r) => {
        const linkStatus = getProfileLinkStatus(r);
        const tiktokLine = linkStatus.isClickable
          ? `   TikTok: ${linkStatus.url}`
          : `   TikTok: Profile unavailable (${linkStatus.label})`;
        return `#${r.rank} ${r.display_name} (@${r.username}) — Match: ${r.final_score.toFixed(1)}/100\n${tiktokLine}\n   Reasons: ${r.reasons.join('; ')}`;
      })
      .join('\n\n');

    const summaryText = `🎯 ThaiKOL AI · Recommended Creators for ${brandName}\nCandidate Set Provenance: ${result.provenance || 'curated_demo_fixture'}\nWeights: Semantic 45% · Engagement 25% · Local 15% · Safety 10% · Data 5%\n\n${topRecs}\n\n* Note: Audience Fit Proxy is informational proxy only. Curated demo creators are non-verified fixtures.`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      'rank', 'username', 'display_name', 'profile_url', 'profile_status', 'final_score',
      'semantic_relevance_score', 'engagement_quality_score',
      'local_content_relevance_score', 'brand_safety_score', 'data_quality_score',
    ];
    const rows = filtered.map((r) => {
      const linkStatus = getProfileLinkStatus(r);
      const urlCol = linkStatus.isClickable ? (r.profile_url ?? '') : 'Profile unavailable';
      return [
        r.rank, `"${r.username}"`, `"${r.display_name.replace(/"/g, '""')}"`,
        `"${urlCol}"`, `"${linkStatus.label}"`, r.final_score.toFixed(1),
        r.semantic_relevance_score.toFixed(1), r.engagement_quality_score.toFixed(1),
        r.local_content_relevance_score.toFixed(1), r.brand_safety_score.toFixed(0),
        r.data_quality_score.toFixed(1),
      ];
    });
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
    <div className="space-y-6">
      {/* Header as Specified:
          Recommended Creators
          Based on the current brand profile and candidate set.
          X creators analyzed · X recommendations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Recommended Creators
          </h1>
          <p className="text-xs text-slate-500">
            Based on the current brand profile and candidate set.
          </p>
        </div>

        {/* Stats Pill & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-lg shadow-2xs">
            <span className="font-mono font-bold text-slate-900">
              {result.candidate_pool_count || result.recommendation_count || 0}
            </span>
            <span>creators analyzed</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono font-bold text-slate-900">
              {filtered.length}
            </span>
            <span>recommendations</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="btn-secondary px-3 py-1.5 text-xs gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="btn-secondary px-3 py-1.5 text-xs gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transparent Audited 5-Factor Scoring Banner */}
      <div className="saas-card p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Candidate Pool Ranking Criteria</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            These creators are ranked within the current candidate pool using the defined matching criteria.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1 border-t border-slate-100">
          {[
            { pct: '45%', label: 'Semantic Match', desc: 'Bilingual dense vectors' },
            { pct: '25%', label: 'Engagement Quality', desc: 'Pool relative percentile' },
            { pct: '15%', label: 'Local Relevance', desc: 'Thai language & signals' },
            { pct: '10%', label: 'Brand Safety', desc: 'Content-level audit' },
            { pct: '5%', label: 'Data Quality', desc: 'Profile completeness' },
          ].map((f) => (
            <div key={f.label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="font-bold text-slate-900 text-sm font-mono">{f.pct}</div>
              <div className="text-[11px] font-semibold text-slate-800 mt-0.5">{f.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="saas-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {/* Quick Search */}
          <div className="relative min-w-[190px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, @handle, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Min Score */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value={0}>All Scores</option>
            <option value={75}>Min 75+</option>
            <option value={80}>Min 80+</option>
            <option value={85}>Min 85+</option>
          </select>

          {/* Topic Filter */}
          {allTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer max-w-[160px]"
            >
              <option value="all">All Topics</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          )}

          {/* Safety Filter */}
          <select
            value={safetyFilter}
            onChange={(e) => setSafetyFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Safety Status</option>
            <option value="safe">Screened Brand Safe</option>
            <option value="review">Needs Review</option>
          </select>
        </div>

        {/* Limit Toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {([5, 10] as const).map((n) => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                limit === n
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Top Match Hero Section */}
      {topMatch && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Featured Primary Match
          </div>
          <RecommendationFeature
            creator={topMatch}
            isCompared={comparisonList.includes(topMatch.username)}
            isShortlisted={Boolean(shortlist[topMatch.username])}
            onToggleCompare={() => onToggleCompare(topMatch.username)}
            onToggleShortlist={() => onToggleShortlist?.(topMatch)}
            onOpenDetail={() => onOpenCreatorDetail(topMatch)}
          />
        </div>
      )}

      {/* Structured Recommendation List for Remaining Ranked Creators */}
      {remainingMatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Additional Ranked Matches in Candidate Pool ({remainingMatches.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Descending composite rank order
            </span>
          </div>

          <RecommendationList
            creators={remainingMatches}
            comparisonList={comparisonList}
            shortlist={shortlist}
            onToggleCompare={onToggleCompare}
            onToggleShortlist={onToggleShortlist}
            onOpenDetail={onOpenCreatorDetail}
          />
        </div>
      )}
    </div>
  );
};
