import React, { useState } from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import { ScoreBreakdown } from './ScoreBreakdown';
import { VideoPreviewModal } from './VideoPreviewModal';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  Sliders,
  Sparkles,
  Clock,
  AlertTriangle,
  Info,
  Play,
} from 'lucide-react';
import { formatCompactNumber, formatPercent } from '../../lib/format';
import { CreatorAvatar, getCreatorCover, isSamplePortrait } from '../../lib/creatorMedia';

interface CreatorDetailDrawerProps {
  creator: KOLRecommendation | null;
  onClose: () => void;
}

export const CreatorDetailDrawer: React.FC<CreatorDetailDrawerProps> = ({
  creator,
  onClose,
}) => {
  const [previewClip, setPreviewClip] = useState<{ caption: string; index: number } | null>(null);

  if (!creator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full sm:max-w-xl bg-white h-[92vh] sm:h-full shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200 overflow-hidden">
        {/* Mobile Drag Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <CreatorAvatar creator={creator} size="lg" showVerified={true} />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {creator.display_name}
                </h3>
                {creator.is_demo_fixture && (
                  <span className="badge badge-demo text-[9px] px-1.5 py-0.2">Demo</span>
                )}
                {isSamplePortrait(creator) && (
                  <span
                    className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60"
                    title="ภาพจำลองสำหรับการสาธิต ไม่ใช่ภาพบุคคลจริง"
                  >
                    รูปตัวอย่างจำลอง
                  </span>
                )}
              </div>
              {(() => {
                const linkStatus = getProfileLinkStatus(creator);
                if (linkStatus.isClickable && linkStatus.url) {
                  return (
                    <a
                      href={linkStatus.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#FF5A1F] hover:text-[#E24A12] hover:underline inline-flex items-center gap-1 font-mono font-semibold"
                    >
                      @{creator.username}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                }
                return (
                  <span
                    title={linkStatus.tooltip}
                    className="text-xs text-slate-500 inline-flex items-center gap-1 font-mono cursor-default"
                  >
                    @{creator.username}
                  </span>
                );
              })()}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 -mr-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition flex items-center justify-center cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
            aria-label="ปิดหน้าต่าง (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {/* Section 1: Hero Match Score Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border border-orange-200/90 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider flex items-center gap-1">
                <span>✦</span>
                <span>ความเข้ากันได้โดยรวม (Overall Fit)</span>
              </span>
              <div className="text-xs text-slate-600 font-medium">
                ประเมินผ่านแบบจำลอง 5 ปัจจัยสำหรับแบรนด์ไทย
              </div>
              <div className="pt-1">
                {creator.brand_safety_risk_level === 'safe' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    ปลอดภัยต่อภาพลักษณ์แบรนด์ (Brand Safe)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {creator.brand_safety_risk_level === 'review' ? 'ควรตรวจทานเนื้อหา (Review)' : 'ความเสี่ยงสูง (High Risk)'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#FF5A1F] tabular-nums leading-none">
                {creator.final_score.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 font-bold mt-1">คะแนนเต็ม 100</div>
            </div>
          </div>

          {/* Section 1b: Observed Public Profile Data */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>ข้อมูลสาธารณะจาก TikTok (Public Snapshot)</span>
            </div>
            {creator.bio && (
              <p className="text-xs text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                "{creator.bio}"
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'ผู้ติดตาม (Followers)', value: formatCompactNumber(creator.follower_count), tag: 'สังเกตจริง' },
                { label: 'ยอดวิวเฉลี่ย (Views)', value: formatCompactNumber(creator.average_views), tag: 'คำนวณจากตัวอย่าง' },
                { label: 'ยอดไลก์เฉลี่ย (Likes)', value: formatCompactNumber(creator.average_likes), tag: 'คำนวณจากตัวอย่าง' },
                { label: 'อัตรา Engagement', value: formatPercent(creator.estimated_engagement_rate), tag: 'ประเมินเบื้องต้น' },
              ].map((m) => (
                <div key={m.label} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium truncate">{m.label}</div>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {m.value ?? <span className="text-xs font-normal italic text-slate-400">N/A</span>}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">{m.tag}</div>
                </div>
              ))}
            </div>
            {/* Section 1c: Video Content & Portfolio Showcase */}
            {creator.sample_captions && creator.sample_captions.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#FF5A1F]">🎬</span>
                    <span>ตัวอย่างวิดีโอคอนเทนต์ (Sampled TikTok Videos)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {creator.sample_video_count ?? creator.sample_captions.length} คลิปตัวอย่าง
                  </span>
                </div>
                <div className="space-y-2">
                  {creator.sample_captions.slice(0, 4).map((cap, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewClip({ caption: cap, index: idx + 1 })}
                      className="p-3 rounded-2xl bg-orange-50/30 border border-orange-100/70 text-xs text-slate-700 leading-relaxed font-thai relative group hover:bg-orange-100/40 hover:border-orange-300 transition flex gap-3 items-start cursor-pointer shadow-2xs"
                    >
                      <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative shadow-2xs border border-orange-200/60 mt-0.5 group-hover:scale-105 transition-transform">
                        <img
                          src={getCreatorCover(creator)}
                          alt="ตัวอย่างคลิป"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 flex items-center justify-center transition">
                          <div className="w-5 h-5 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-xs group-hover:scale-110 transition">
                            <Play className="w-2.5 h-2.5 fill-slate-900 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#FF5A1F] uppercase font-mono tracking-wider flex items-center gap-1">
                            <span>▶ Clip #{idx + 1}</span>
                          </span>
                          <span className="text-[9px] text-[#FF5A1F] font-semibold bg-orange-100/60 px-1.5 py-0.5 rounded">แตะเพื่อเล่นคลิป</span>
                        </div>
                        <p className="text-slate-800 line-clamp-3 leading-relaxed">
                          "{cap}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Key Score Metrics Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">
                ดัชนีการมีส่วนร่วม (Engagement Index)
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {creator.engagement_quality_score.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
              <div className="text-[10px] text-slate-500">คุณภาพการมีส่วนร่วมเทียบเคียงในกลุ่ม</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">
                ความสอดคล้องบริบทไทย (Local Context)
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {creator.local_content_relevance_score.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
              <div className="text-[10px] text-slate-500">สัญญาณภาษาและวัฒนธรรมไทย</div>
            </div>
          </div>

          {/* Section 3: 5-Factor Score Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>แจกแจงคะแนน 5 ปัจจัย (Multi-Factor Breakdown)</span>
            </div>
            <ScoreBreakdown breakdown={creator.score_breakdown} />
          </div>

          {/* Section 4: Why this creator? Detailed Explanation */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>เหตุผลที่แนะนำ (Recommendation Rationale)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
              {creator.reasons && creator.reasons.length > 0 ? (
                creator.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{reason}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">ไม่มีข้อมูลเหตุผลเพิ่มเติม</p>
              )}

              {creator.cautions && creator.cautions.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    ข้อควรระวังในการตรวจสอบ (Review Notes)
                  </div>
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

          {/* Section 5: Matching Content Signals & Topics */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>สัญญาณเนื้อหาที่ตรงกัน (Content Signals)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.matching_topics && creator.matching_topics.length > 0 ? (
                creator.matching_topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                  >
                    #{t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">เนื้อหาครีเอเตอร์ทั่วไป</span>
              )}
            </div>
          </div>

          {/* Section 6: Data Nature & Governance Badges */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>ที่มาและความถูกต้องของข้อมูล (Data Provenance)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">การจำแนกข้อมูล</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    Observed (วิดีโอจริง)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                    Derived (คำนวณ)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">แหล่งที่มา (Source)</span>
                <span className="font-semibold text-slate-800">
                  {creator.data_source === 'apify'
                    ? 'Apify Live TikTok Scraper'
                    : creator.is_demo_fixture
                    ? 'ชุดทดสอบมาตรฐาน (Benchmark Fixture)'
                    : creator.data_source || 'Live Provider'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">ความสดใหม่ (Freshness)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <Clock className="w-3 h-3" />
                  <span>สดใหม่ (&lt; 6 ชม.)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">เวลาที่เก็บข้อมูล</span>
                <span className="font-mono text-[11px] text-slate-600">
                  {(() => {
                    try {
                      const d = new Date(creator.collected_at);
                      return isNaN(d.getTime()) ? creator.collected_at : d.toLocaleString('th-TH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    } catch {
                      return creator.collected_at;
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Safe-Area & Touch Targets */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))]">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2.5 text-xs cursor-pointer min-h-[44px]"
          >
            ปิดหน้าต่าง
          </button>
          <TikTokProfileCTA creator={creator} variant="hero" />
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={!!previewClip}
        onClose={() => setPreviewClip(null)}
        creator={creator}
        caption={previewClip?.caption}
        clipIndex={previewClip?.index}
      />
    </div>
  );
};
export default CreatorDetailDrawer;
