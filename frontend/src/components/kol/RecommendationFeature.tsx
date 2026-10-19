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
  Bookmark,
  Award,
  Clock,
  MapPin,
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
  isShortlisted,
  onToggleCompare,
  onToggleShortlist,
  onOpenDetail,
}) => {
  const breakdown = [
    {
      label: 'ความตรงประเด็น (Semantic Fit)',
      weight: '45%',
      score: creator.semantic_relevance_score,
      barClass: 'bg-[#FF5A1F]',
    },
    {
      label: 'คุณภาพการมีส่วนร่วม (Engagement)',
      weight: '25%',
      score: creator.engagement_quality_score,
      barClass: 'bg-emerald-500',
    },
    {
      label: 'บริบทวัฒนธรรมไทย (Thai Signals)',
      weight: '15%',
      score: creator.local_content_relevance_score,
      barClass: 'bg-amber-500',
    },
    {
      label: 'ความปลอดภัยแบรนด์ (Brand Safety)',
      weight: '10%',
      score: creator.brand_safety_score,
      barClass: 'bg-slate-700',
    },
    {
      label: 'ความสมบูรณ์ข้อมูล (Data Quality)',
      weight: '5%',
      score: creator.data_quality_score,
      barClass: 'bg-slate-400',
    },
  ];

  return (
    <div className="rounded-3xl overflow-hidden border border-orange-200/90 shadow-2xs bg-white font-thai relative">
      {/* Top Banner */}
      <div className="px-6 py-3 bg-gradient-to-r from-orange-50 via-white to-orange-50/60 border-b border-orange-100/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A1F] text-white font-black text-[11px] shadow-2xs flex items-center gap-1">
            <Award className="w-3 h-3 text-white" />
            #1 TOP MATCH
          </span>
          <span className="text-xs font-bold text-slate-700">
            ครีเอเตอร์ที่มีความเข้ากันได้สูงสุดในแคมเปญ
          </span>
        </div>
        <div className="text-[11px] text-[#C93B07] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>Explainable 5-Factor Scoring</span>
        </div>
      </div>

      {/* Main Feature Content */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Creator Identity & Match Score Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-slate-100">
          {/* Creator Profile */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200/90 text-[#FF5A1F] flex items-center justify-center font-black text-xl shadow-2xs">
                {creator.display_name.charAt(0).toUpperCase()}
              </div>
              {creator.is_profile_verified && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-xs ring-2 ring-white"
                  title="Verified TikTok Profile"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
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
                        className="font-mono text-xs text-[#FF5A1F] hover:text-[#E24A12] hover:underline inline-flex items-center gap-1 font-semibold"
                        title="เปิดโปรไฟล์ TikTok จริง"
                      >
                        <span>@{creator.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  }
                  return (
                    <span
                      title={linkStatus.tooltip}
                      className="font-mono text-xs text-slate-500 inline-flex items-center gap-1"
                    >
                      <span>@{creator.username}</span>
                    </span>
                  );
                })()}

                {creator.brand_safety_risk_level === 'safe' && (
                  <span className="badge badge-safe text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    ปลอดภัยต่อแบรนด์ (Safe)
                  </span>
                )}
              </div>

              {/* Provenance & Freshness Tags */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>สดใหม่ (&lt; 6 ชม.)</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>สัญญาณคอนเทนต์ไทย</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600">
                  {creator.is_demo_fixture ? 'Benchmark Fixture' : 'Live TikTok Scraper'}
                </span>
              </div>

              {/* Topics / Category */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {creator.matching_topics && creator.matching_topics.length > 0 ? (
                  creator.matching_topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-orange-50 text-[#C93B07] text-xs font-bold border border-orange-200/70"
                    >
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">คอนเทนต์ครีเอเตอร์ทั่วไป</span>
                )}
              </div>
            </div>
          </div>

          {/* Large Overall Match Score Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border border-orange-200/90 text-center shrink-0 min-w-[150px] shadow-2xs self-start">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F]">
              AI Match Score
            </div>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#FF5A1F] tracking-tight">
                {creator.final_score.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] text-orange-950 font-bold mt-1 bg-orange-100/80 py-0.5 px-2.5 rounded-full inline-block">
              คะแนนสูงสุดอันดับ 1
            </div>
          </div>
        </div>

        {/* 5-Factor Score Breakdown Progress Meters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              สัดส่วนคะแนน 5 ปัจจัย (Multi-Factor Breakdown)
            </span>
            <span className="text-slate-400 text-[11px] font-mono font-semibold">น้ำหนักรวม: 100%</span>
          </div>

          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">({item.weight})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                    {item.score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${item.barClass} transition-all duration-500`}
                    style={{ width: `${Math.min(item.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this creator? Section */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>เหตุผลที่ AI แนะนำครีเอเตอร์ท่านนี้</span>
          </div>
          <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100/80 space-y-2">
            {creator.reasons && creator.reasons.length > 0 ? (
              creator.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-thai">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">แนะนำตามการประเมินความสอดคล้อง 5 ปัจจัย</p>
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenDetail}
              className="btn-orange text-xs px-4 py-2.5 gap-1.5 shadow-2xs font-bold cursor-pointer min-h-[44px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ดูข้อมูลเชิงลึก & วิดีโอ</span>
            </button>
            <TikTokProfileCTA creator={creator} variant="inline" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleShortlist && (
              <button
                onClick={onToggleShortlist}
                className={`btn-secondary text-xs px-3.5 py-2.5 gap-1.5 cursor-pointer transition-all min-h-[44px] ${
                  isShortlisted
                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>{isShortlisted ? 'บันทึกแล้ว' : 'บันทึกลง Shortlist'}</span>
              </button>
            )}

            <button
              onClick={onToggleCompare}
              className={`btn-secondary text-xs px-3.5 py-2.5 gap-1.5 cursor-pointer transition-all min-h-[44px] ${
                isCompared ? 'bg-slate-900 text-white border-slate-900 font-semibold' : ''
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
    </div>
  );
};
