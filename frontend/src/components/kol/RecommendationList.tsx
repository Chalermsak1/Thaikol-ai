import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import {
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

interface RecommendationListProps {
  creators: KOLRecommendation[];
  comparisonList: string[];
  shortlist?: Record<string, any>;
  onToggleCompare: (username: string) => void;
  onToggleShortlist?: (creator: KOLRecommendation) => void;
  onOpenDetail: (creator: KOLRecommendation) => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  creators,
  comparisonList,
  onToggleCompare,
  onOpenDetail,
}) => {
  if (creators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {creators.map((creator) => {
        const isCompared = comparisonList.includes(creator.username);
        return (
          <div
            key={creator.username}
            className="saas-card p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all group"
          >
            {/* Top Row: Rank, Identity, Scores */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shrink-0">
                  #{creator.rank}
                </span>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {creator.display_name}
                    </h3>
                    {(() => {
                      const linkStatus = getProfileLinkStatus(creator);
                      if (linkStatus.isClickable && linkStatus.url) {
                        return (
                          <a
                            href={linkStatus.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-mono text-indigo-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>@{creator.username}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      }
                      return (
                        <span
                          title={linkStatus.tooltip}
                          className="text-xs font-mono text-slate-500 inline-flex items-center gap-1 cursor-default"
                        >
                          <span>@{creator.username}</span>
                        </span>
                      );
                    })()}
                    {creator.brand_safety_risk_level === 'safe' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Safe
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {creator.matching_topics && creator.matching_topics.length > 0 ? (
                      creator.matching_topics.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">General</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Score Box */}
              <div className="flex items-center gap-4 shrink-0 sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Match Score
                  </div>
                  <div className="font-mono font-extrabold text-xl text-slate-900">
                    {creator.final_score.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400"> / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 5-Score Summary Strip */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Semantic (45%)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {creator.semantic_relevance_score.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Engagement (25%)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {creator.engagement_quality_score.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Local (15%)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {creator.local_content_relevance_score.toFixed(1)}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-slate-400">Safety (10%)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {creator.brand_safety_score.toFixed(0)}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-slate-400">Data (5%)</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {creator.data_quality_score.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Rationale snippet */}
            {creator.reasons && creator.reasons.length > 0 && (
              <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                "{creator.reasons[0]}"
              </p>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDetail(creator)}
                  className="btn-primary text-xs px-3.5 py-1.5 gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <TikTokProfileCTA creator={creator} variant="inline" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleCompare(creator.username)}
                  className={`btn-secondary text-xs px-3 py-1.5 gap-1.5 cursor-pointer ${
                    isCompared ? 'bg-slate-900 text-white border-slate-900' : ''
                  }`}
                >
                  {isCompared ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In Compare</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Compare</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
