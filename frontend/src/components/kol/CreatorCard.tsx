import React, { useState } from 'react';
import { KOLRecommendation } from '../../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import { WhyThisCreator } from './WhyThisCreator';
import { ExternalLink, ChevronDown, ChevronUp, Check, Plus, ShieldCheck } from 'lucide-react';
import { CreatorAvatar } from '../../lib/creatorMedia';
import { estimateCreatorRateCard, formatTHBCurrency } from '../../lib/rateCardCalculator';

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
  const rateCard = estimateCreatorRateCard(recommendation.follower_count, recommendation.average_views);

  return (
    <article
      className={`overflow-hidden transition-all duration-200 bg-white rounded-3xl font-thai ${
        isTopRank
          ? 'border border-orange-300 shadow-xs ring-1 ring-orange-500/20'
          : 'border border-slate-200/90 shadow-2xs hover:border-orange-200 hover:shadow-xs'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Row 1: Rank + Identity + Match Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Avatar with rank & verified mark */}
            <CreatorAvatar creator={recommendation} size="md" showVerified={true} />

            {/* Identity block */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{recommendation.rank}
                </span>

                <button
                  onClick={onOpenDetail}
                  className="font-black text-sm sm:text-base text-slate-900 hover:text-[#FF5A1F] transition text-left cursor-pointer truncate"
                >
                  {recommendation.display_name}
                </button>

                {(() => {
                  const linkStatus = getProfileLinkStatus(recommendation);
                  if (linkStatus.isClickable && linkStatus.url) {
                    return (
                      <a
                        href={linkStatus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-[#FF5A1F] hover:text-[#E24A12] hover:underline font-mono font-semibold"
                        title="เปิดโปรไฟล์ TikTok"
                      >
                        @{recommendation.username}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    );
                  }
                  return (
                    <span className="text-xs text-slate-400 font-mono inline-flex items-center gap-1">
                      @{recommendation.username}
                    </span>
                  );
                })()}

                {recommendation.brand_safety_risk_level === 'safe' && (
                  <span className="badge badge-safe text-[10px]">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Safe
                  </span>
                )}
              </div>

              {/* Tags row & Rate Card */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/70"
                  title={`เรทการ์ดประมาณการ ${rateCard.tierLabel}`}
                >
                  <span>💰</span>
                  <span>~{formatTHBCurrency(rateCard.avgRateTHB)} / คลิป</span>
                  <span className="text-[10px] text-emerald-600 font-normal">({rateCard.tier})</span>
                </span>

                {recommendation.matching_topics.slice(0, 3).map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-orange-50 text-[#C93B07] text-[11px] font-bold border border-orange-200/60"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div className="shrink-0 text-right px-3.5 py-2 rounded-2xl bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border border-orange-200/90 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F]">
              AI Match
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#FF5A1F] leading-none tabular-nums mt-0.5">
              {recommendation.final_score.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Row 2: Score Breakdown Bars */}
        <div className="pt-1">
          <ScoreBreakdown breakdown={recommendation.score_breakdown} />
        </div>

        {/* Row 3: Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn-secondary px-3.5 py-2 text-xs gap-1 cursor-pointer min-h-[44px]"
            >
              <span>เหตุผลที่ AI แนะนำ</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {onToggleCompare && (
              <button
                onClick={onToggleCompare}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1 min-h-[44px] ${
                  isCompared
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'btn-secondary'
                }`}
              >
                {isCompared ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-slate-400" />}
                {isCompared ? 'ในตารางเปรียบเทียบ' : 'เปรียบเทียบ'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenDetail && (
              <button
                onClick={onOpenDetail}
                className="btn-orange text-xs px-4 py-2 cursor-pointer shadow-2xs font-bold min-h-[44px]"
              >
                ดูข้อมูลเชิงลึก
              </button>
            )}
            <TikTokProfileCTA creator={recommendation} variant="inline" />
          </div>
        </div>

        {/* Expandable Rationale */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <WhyThisCreator recommendation={recommendation} />
          </div>
        )}
      </div>
    </article>
  );
};

export default CreatorCard;
