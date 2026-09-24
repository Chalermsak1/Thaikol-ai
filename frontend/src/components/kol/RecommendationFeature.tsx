import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import {
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface RecommendationFeatureProps {
  creator: KOLRecommendation;
  isCompared: boolean;
  isShortlisted?: boolean;
  onToggleCompare: () => void;
  onToggleShortlist?: () => void;
  onOpenDetail: () => void;
}

export const RecommendationFeature: React.FC<RecommendationFeatureProps> = ({
  creator,
  isCompared,
  onToggleCompare,
  onOpenDetail,
}) => {
  const breakdown = [
    {
      label: 'Semantic Relevance',
      weight: '45%',
      score: creator.semantic_relevance_score,
      barClass: 'bg-indigo-600',
    },
    {
      label: 'Engagement Quality',
      weight: '25%',
      score: creator.engagement_quality_score,
      barClass: 'bg-emerald-600',
    },
    {
      label: 'Local Relevance',
      weight: '15%',
      score: creator.local_content_relevance_score,
      barClass: 'bg-teal-600',
    },
    {
      label: 'Brand Safety',
      weight: '10%',
      score: creator.brand_safety_score,
      barClass: 'bg-slate-700',
    },
    {
      label: 'Data Quality',
      weight: '5%',
      score: creator.data_quality_score,
      barClass: 'bg-slate-600',
    },
  ];

  return (
    <div className="saas-card overflow-hidden border-slate-300 shadow-md">
      {/* Top Banner */}
      <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono font-bold text-xs">
            #1
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            Top match in this candidate set
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          5-Factor Weighted Score
        </div>
      </div>

      {/* Main Feature Content */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Creator Identity & Match Score Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Creator Profile */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xl shrink-0 shadow-xs">
              {creator.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {creator.display_name}
                </h2>
                {(() => {
                  const linkStatus = getProfileLinkStatus(creator);
                  if (linkStatus.isClickable && linkStatus.url) {
                    return (
                      <a
                        href={linkStatus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>@{creator.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  }
                  return (
                    <span
                      title={linkStatus.tooltip}
                      className="font-mono text-xs text-slate-500 inline-flex items-center gap-1 cursor-default"
                    >
                      <span>@{creator.username}</span>
                    </span>
                  );
                })()}
                {creator.brand_safety_risk_level === 'safe' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Brand Safe
                  </span>
                )}
              </div>

              {/* Topics / Category */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {creator.matching_topics && creator.matching_topics.length > 0 ? (
                  creator.matching_topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">General Creator</span>
                )}
              </div>
            </div>
          </div>

          {/* Large Overall Match Score Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[140px] sm:self-start">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overall Match
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                {creator.final_score.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
              Highest in candidate pool
            </div>
          </div>
        </div>

        {/* 5-Factor Score Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Multi-Factor Score Breakdown
            </span>
            <span className="text-slate-400 text-[11px]">Linear weighted composition</span>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">({item.weight})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                    {item.score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${item.barClass} transition-all duration-500`}
                    style={{ width: `${Math.min(item.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this creator? */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Why this creator?</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            {creator.reasons && creator.reasons.length > 0 ? (
              creator.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No specific rationale provided.</p>
            )}

            {creator.cautions && creator.cautions.length > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-200/80 space-y-1.5">
                {creator.cautions.map((caution, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{caution}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDetail}
              className="btn-primary text-xs px-4 py-2 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Creator Details</span>
            </button>
            <TikTokProfileCTA creator={creator} variant="inline" />
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={onToggleCompare}
              className={`btn-secondary text-xs px-3 py-2 gap-1.5 ${
                isCompared ? 'bg-slate-900 text-white border-slate-900' : ''
              }`}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>In Comparison List</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Add to Compare</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
