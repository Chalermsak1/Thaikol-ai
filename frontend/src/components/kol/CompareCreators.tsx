import React from 'react';
import { KOLRecommendation } from '../../types';
import { getProfileLinkStatus } from './TikTokProfileCTA';
import { X, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface CompareCreatorsProps {
  creators: KOLRecommendation[];
  onRemoveCreator: (username: string) => void;
  onClearAll: () => void;
}

export const CompareCreators: React.FC<CompareCreatorsProps> = ({
  creators,
  onRemoveCreator,
  onClearAll,
}) => {
  if (creators.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center space-y-3 font-thai shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5A1F] flex items-center justify-center mx-auto shadow-2xs">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <h4 className="text-base font-black text-slate-900">ยังไม่ได้เลือกครีเอเตอร์เพื่อเปรียบเทียบ</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          แตะปุ่ม "เปรียบเทียบ" บนการ์ดครีเอเตอร์ในหน้าค้นหาหรือหน้าแนะนำ เพื่อนำมาเปรียบเทียบคะแนน 5 มิติแบบคู่ขนานสูงสุด 3 ท่าน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-thai">
      {/* ─── Header bar ─── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">ตารางเปรียบเทียบคะแนนคู่ขนาน (Side-by-Side Comparison)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ประเมินคะแนนเชิงเปรียบเทียบ 5 มิติอย่างเป็นกลาง ({creators.length}/3 ครีเอเตอร์)
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-[#FF5A1F] font-bold cursor-pointer transition min-h-[44px] px-3 flex items-center"
        >
          ล้างทั้งหมด (Clear)
        </button>
      </div>

      {/* ─── Mobile Card Comparison View (< md) ─── */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {creators.map((c) => {
          const linkStatus = getProfileLinkStatus(c);
          return (
            <div
              key={c.username}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200/80 text-[#FF5A1F] flex items-center justify-center font-black text-lg shadow-2xs">
                    {c.display_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{c.display_name}</h4>
                    {linkStatus.isClickable && linkStatus.url ? (
                      <a
                        href={linkStatus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#FF5A1F] font-mono font-semibold inline-flex items-center gap-1"
                      >
                        @{c.username}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">@{c.username}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="text-[9px] uppercase font-bold text-[#FF5A1F]">Match</div>
                    <div className="text-base font-black font-mono text-[#FF5A1F] leading-tight">
                      {c.final_score.toFixed(1)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveCreator(c.username)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                    title="ลบออกจากการเปรียบเทียบ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5-Score Metrics on Mobile */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">ความตรงประเด็น (Semantic 45%)</span>
                  <span className="font-mono font-bold text-slate-900">{c.score_breakdown.semantic_relevance.score.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF5A1F]" style={{ width: `${c.score_breakdown.semantic_relevance.score}%` }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">คุณภาพการมีส่วนร่วม (Engagement 25%)</span>
                  <span className="font-mono font-bold text-slate-900">{c.score_breakdown.engagement_quality.score.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.score_breakdown.engagement_quality.score}%` }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">บริบทไทย (Local 15%)</span>
                  <span className="font-mono font-bold text-slate-900">{c.score_breakdown.local_content_relevance.score.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${c.score_breakdown.local_content_relevance.score}%` }} />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">ความปลอดภัยแบรนด์ (Safety 10%)</span>
                  <span className="font-mono font-bold text-slate-900">{c.score_breakdown.brand_safety.score.toFixed(0)}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-700" style={{ width: `${c.score_breakdown.brand_safety.score}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Desktop Table Comparison View (>= md) ─── */}
      <div className="hidden md:block rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-4 px-5 font-bold text-slate-500 text-[11px] uppercase tracking-wider w-1/4">
                  มิติการประเมิน (Metrics)
                </th>
                {creators.map((c) => {
                  const linkStatus = getProfileLinkStatus(c);
                  return (
                    <th key={c.username} className="py-4 px-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{c.display_name}</span>
                          <button
                            onClick={() => onRemoveCreator(c.username)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                            title="ลบออกจากการเปรียบเทียบ"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {linkStatus.isClickable && linkStatus.url ? (
                          <a
                            href={linkStatus.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#FF5A1F] hover:underline font-mono font-semibold inline-flex items-center gap-1"
                          >
                            <span>@{c.username}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">@{c.username}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* Overall Match Score */}
              <tr className="bg-orange-50/40">
                <td className="py-4 px-5 font-sans font-black text-slate-900">
                  คะแนนความเข้ากันได้รวม (Overall Match)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-4 px-5 text-center">
                    <span className="text-lg font-black text-[#FF5A1F] font-mono">
                      {c.final_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / 100</span>
                    <div className="mt-2 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-[#FF5A1F] transition-all duration-500"
                        style={{ width: `${c.final_score}%` }}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Semantic Relevance */}
              <tr>
                <td className="py-3.5 px-5 font-sans text-slate-700 font-semibold">
                  ความตรงประเด็น (Semantic Match 45%)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-800">
                    <span className="font-bold">{c.score_breakdown.semantic_relevance.score.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                      +{c.score_breakdown.semantic_relevance.weighted_contribution.toFixed(1)} คะแนน
                    </span>
                  </td>
                ))}
              </tr>

              {/* Engagement Quality */}
              <tr>
                <td className="py-3.5 px-5 font-sans text-slate-700 font-semibold">
                  คุณภาพการมีส่วนร่วม (Engagement Quality 25%)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-800">
                    <span className="font-bold">{c.score_breakdown.engagement_quality.score.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                      +{c.score_breakdown.engagement_quality.weighted_contribution.toFixed(1)} คะแนน
                    </span>
                  </td>
                ))}
              </tr>

              {/* Local Content Relevance */}
              <tr>
                <td className="py-3.5 px-5 font-sans text-slate-700 font-semibold">
                  บริบทภาษาและวัฒนธรรมไทย (Local 15%)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-800">
                    <span className="font-bold">{c.score_breakdown.local_content_relevance.score.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                      +{c.score_breakdown.local_content_relevance.weighted_contribution.toFixed(1)} คะแนน
                    </span>
                  </td>
                ))}
              </tr>

              {/* Brand Safety */}
              <tr>
                <td className="py-3.5 px-5 font-sans text-slate-700 font-semibold">
                  ความปลอดภัยต่อภาพลักษณ์ (Brand Safety 10%)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-800">
                    <span className="font-bold">{c.score_breakdown.brand_safety.score.toFixed(0)}</span>
                    <span className="text-[10px] text-slate-400 ml-0.5"> / 100</span>
                  </td>
                ))}
              </tr>

              {/* Data Quality */}
              <tr>
                <td className="py-3.5 px-5 font-sans text-slate-700 font-semibold">
                  ความสมบูรณ์ของข้อมูล (Data Completeness 5%)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-800">
                    <span className="font-bold">{c.score_breakdown.data_quality.score.toFixed(1)}</span>
                  </td>
                ))}
              </tr>

              {/* Audience Fit Proxy */}
              <tr className="bg-slate-50/50">
                <td className="py-3.5 px-5 font-sans text-slate-500 italic">
                  ดัชนีกลุ่มเป้าหมาย (Audience Fit Proxy - ข้อมูลอ้างอิง)
                </td>
                {creators.map((c) => (
                  <td key={c.username} className="py-3.5 px-5 text-center text-slate-500">
                    {c.audience_fit_proxy !== null && c.audience_fit_proxy !== undefined
                      ? `${c.audience_fit_proxy.toFixed(1)}/100`
                      : 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareCreators;
