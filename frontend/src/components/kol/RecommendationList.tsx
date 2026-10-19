import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import {
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Check,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { CreatorAvatar } from '../../lib/creatorMedia';

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
  shortlist = {},
  onToggleCompare,
  onToggleShortlist,
  onOpenDetail,
}) => {
  if (creators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 font-thai">
      {creators.map((creator) => {
        const isCompared = comparisonList.includes(creator.username);
        const isShortlisted = Boolean(shortlist[creator.username]);

        // Rank styling
        let rankBadgeClass = 'bg-slate-100 border-slate-200 text-slate-700';
        let rankLabel = `#${creator.rank}`;
        if (creator.rank === 2) {
          rankBadgeClass = 'bg-slate-200/90 border-slate-300 text-slate-900 font-bold';
          rankLabel = '#2 Silver';
        } else if (creator.rank === 3) {
          rankBadgeClass = 'bg-orange-100/80 border-orange-200 text-[#C93B07] font-bold';
          rankLabel = '#3 Bronze';
        }

        return (
          <div
            key={creator.username}
            className="p-5 sm:p-6 space-y-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs group relative overflow-hidden transition-all duration-200 hover:border-orange-200/90 hover:shadow-xs"
          >
            {/* Top Row: Rank, Identity, Verified Status, Match Score */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Avatar with Rank Badge & Verification */}
                <CreatorAvatar creator={creator} size="md" showVerified={true} />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono shrink-0 ${rankBadgeClass}`}
                    >
                      {rankLabel}
                    </span>

                    <h3 className="font-black text-slate-900 text-base group-hover:text-[#FF5A1F] transition-colors truncate">
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
                            className="text-xs font-mono text-[#FF5A1F] hover:text-[#E24A12] hover:underline inline-flex items-center gap-1 font-semibold"
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
                      <span className="badge badge-safe text-[10px]">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Safe
                      </span>
                    )}

                    {isShortlisted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <BookmarkCheck className="w-3 h-3 text-amber-600" />
                        บันทึกแล้ว
                      </span>
                    )}
                  </div>

                  {/* Provenance & Local Signal line */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>สดใหม่ (&lt; 6 ชม.)</span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>คอนเทนต์ไทย</span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600">
                      {creator.is_demo_fixture ? 'Benchmark Fixture' : 'Live TikTok Data'}
                    </span>
                  </div>

                  {/* Topics Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {creator.matching_topics && creator.matching_topics.length > 0 ? (
                      creator.matching_topics.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-orange-50/70 text-[#C93B07] text-[11px] font-bold border border-orange-200/60"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">ครีเอเตอร์ทั่วไป</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Match Score Box */}
              <div className="shrink-0 self-start sm:self-center">
                <div className="text-right px-4 py-2.5 rounded-2xl bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border border-orange-200/90 shadow-2xs">
                  <div className="text-[10px] uppercase font-black text-[#FF5A1F] tracking-wider">
                    AI Match
                  </div>
                  <div className="font-mono font-black text-2xl text-[#FF5A1F] leading-tight">
                    {creator.final_score.toFixed(1)}
                    <span className="text-xs font-bold text-slate-400 font-sans"> / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 5-Score Summary Meter Strip */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center text-xs">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold truncate">Semantic (45%)</div>
                <div className="font-mono font-bold text-slate-900">
                  {creator.semantic_relevance_score.toFixed(1)}
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF5A1F] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, creator.semantic_relevance_score)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold truncate">Engagement (25%)</div>
                <div className="font-mono font-bold text-slate-900">
                  {creator.engagement_quality_score.toFixed(1)}
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, creator.engagement_quality_score)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold truncate">Local Thai (15%)</div>
                <div className="font-mono font-bold text-slate-900">
                  {creator.local_content_relevance_score.toFixed(1)}
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, creator.local_content_relevance_score)}%` }}
                  />
                </div>
              </div>

              <div className="hidden sm:block space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold truncate">Safety (10%)</div>
                <div className="font-mono font-bold text-slate-900">
                  {creator.brand_safety_score.toFixed(0)}
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, creator.brand_safety_score)}%` }}
                  />
                </div>
              </div>

              <div className="hidden sm:block space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold truncate">Data Quality (5%)</div>
                <div className="font-mono font-bold text-slate-900">
                  {creator.data_quality_score.toFixed(0)}
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, creator.data_quality_score)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Compact "Why this creator?" Rationale */}
            {creator.reasons && creator.reasons.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-orange-50/30 p-3 rounded-2xl border border-orange-100/70">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  <strong className="text-slate-900">เหตุผลที่แมตช์: </strong>
                  {creator.reasons[0]}
                </span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenDetail(creator)}
                  className="btn-orange text-xs px-3.5 py-2 gap-1.5 cursor-pointer shadow-2xs font-bold min-h-[44px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูข้อมูลเชิงลึก & คลิป</span>
                </button>
                <TikTokProfileCTA creator={creator} variant="inline" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onToggleShortlist && (
                  <button
                    onClick={() => onToggleShortlist(creator)}
                    className={`btn-secondary text-xs px-3.5 py-2 gap-1.5 cursor-pointer transition-all min-h-[44px] ${
                      isShortlisted
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs'
                        : 'hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{isShortlisted ? 'บันทึกแล้ว' : 'บันทึกลง Shortlist'}</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleCompare(creator.username)}
                  className={`btn-secondary text-xs px-3.5 py-2 gap-1.5 cursor-pointer transition-all min-h-[44px] ${
                    isCompared
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                      : 'hover:border-slate-400'
                  }`}
                >
                  {isCompared ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ในตารางเปรียบเทียบ</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      <span>เปรียบเทียบ</span>
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
