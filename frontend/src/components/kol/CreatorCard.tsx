import React, { useState } from 'react';
import { KOLRecommendation } from '../../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { WhyThisCreator } from './WhyThisCreator';
import { ExternalLink, ChevronDown, ChevronUp, Check, Plus, ShieldCheck } from 'lucide-react';

interface CreatorCardProps {
  recommendation: KOLRecommendation;
  isCompared?: boolean;
  onToggleCompare?: () => void;
  onOpenDetail?: () => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  recommendation,
  isCompared = false,
  onToggleCompare,
  onOpenDetail,
}) => {
  const [isExpanded, setIsExpanded] = useState(recommendation.rank === 1);
  const isTopRank = recommendation.rank === 1;

  return (
    <article
      className={`overflow-hidden transition-all duration-150 ${
        isTopRank ? 'top-match-card' : 'saas-card-interactive'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* ── Row 1: Rank + Identity ── */}
        <div className="flex items-start gap-3.5 mb-4">
          {/* Rank */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
              isTopRank
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {recommendation.rank}
          </div>

          {/* Identity block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <button
                onClick={onOpenDetail}
                className="font-semibold text-[15px] text-slate-900 hover:text-slate-700 transition text-left cursor-pointer leading-tight"
              >
                {recommendation.display_name}
              </button>
              <a
                href={recommendation.profile_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-xs text-slate-400 hover:text-slate-700 transition font-mono"
                title="Open TikTok Profile"
              >
                @{recommendation.username}
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {recommendation.matching_topics.slice(0, 3).map((topic, i) => (
                <span
                  key={i}
                  className="badge badge-neutral"
                >
                  {topic}
                </span>
              ))}
              {recommendation.brand_safety_risk_level === 'safe' && (
                <span className="badge badge-safe">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Safe
                </span>
              )}
              {isTopRank && (
                <span className="badge badge-neutral text-slate-500 font-medium">
                  Top match in pool
                </span>
              )}
            </div>
          </div>

          {/* Overall score — right-aligned */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-mono font-bold text-slate-900 leading-none tabular-nums">
              {recommendation.final_score.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</div>
          </div>
        </div>

        {/* ── Row 2: Score Breakdown ── */}
        <div className="mb-4">
          <ScoreBreakdown breakdown={recommendation.score_breakdown} />
        </div>

        {/* ── Row 3: Actions ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary px-3 py-1.5 text-[11px] gap-1"
            >
              <span>Why this creator?</span>
              {isExpanded
                ? <ChevronUp className="w-3 h-3 text-slate-400" />
                : <ChevronDown className="w-3 h-3 text-slate-400" />
              }
            </button>

            {onToggleCompare && (
              <button
                onClick={onToggleCompare}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                  isCompared
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'btn-secondary'
                }`}
              >
                {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {isCompared ? 'In Compare' : 'Compare'}
              </button>
            )}
          </div>

          <a
            href={recommendation.profile_url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-4 py-1.5 text-[11px] gap-1.5"
          >
            View TikTok
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {/* ── Expandable Rationale ── */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <WhyThisCreator recommendation={recommendation} />
          </div>
        )}
      </div>
    </article>
  );
};
