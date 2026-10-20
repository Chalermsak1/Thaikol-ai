import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA } from './TikTokProfileCTA';
import { ShieldCheck, Eye } from 'lucide-react';
import { formatCompactNumber } from '../../lib/format';

interface DiscoveryTableProps {
  creators: KOLRecommendation[];
  onSelectCreator?: (creator: KOLRecommendation) => void;
}

export const DiscoveryTable: React.FC<DiscoveryTableProps> = ({
  creators,
  onSelectCreator,
}) => {
  if (creators.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center space-y-2 font-thai shadow-2xs">
        <p className="text-sm font-black text-slate-800">ไม่พบคลิปหรือครีเอเตอร์ตามเงื่อนไข</p>
        <p className="text-xs text-slate-500">ลองปรับตัวกรองหรือค้นหาด้วยคีย์เวิร์ดอื่น</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden font-thai">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="py-4 px-4 w-12 text-center">อันดับ</th>
              <th className="py-4 px-4">ครีเอเตอร์</th>
              <th className="py-4 px-4">หมวดหมู่ & สัญญาณ</th>
              <th className="py-4 px-4 text-center">ผู้ติดตาม</th>
              <th className="py-4 px-4 text-right">Engagement</th>
              <th className="py-4 px-4 text-right">ความตรงประเด็น</th>
              <th className="py-4 px-4 text-right">AI Match</th>
              <th className="py-4 px-4 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {creators.map((creator) => (
              <tr
                key={creator.username}
                className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
                onClick={() => onSelectCreator?.(creator)}
              >
                {/* Rank */}
                <td className="py-4 px-4 text-center font-mono text-slate-400 font-black text-sm">
                  {String(creator.rank).padStart(2, '0')}
                </td>

                {/* Creator Identity */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/60 border border-orange-200/80 flex items-center justify-center font-black text-[#FF5A1F] text-sm shrink-0 shadow-2xs">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5 truncate group-hover:text-[#FF5A1F] transition-colors">
                        <span>{creator.display_name}</span>
                        {creator.brand_safety_risk_level === 'safe' && (
                          <span title="Screened Brand Safe" className="inline-flex">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate">
                        @{creator.username}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {creator.creator_tier && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 leading-none">
                            {creator.creator_tier}
                          </span>
                        )}
                        {creator.contact_line_id && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#06C755]/10 text-[#05963f] border border-[#06C755]/30 leading-none"
                            title={`LINE: ${creator.contact_line_id}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                            <span>LINE</span>
                          </span>
                        )}
                        {creator.has_tiktok_shop && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 leading-none"
                            title="มี TikTok Shop / เปิดตะกร้าสินค้า"
                          >
                            <span>🛒</span>
                            <span>Shop</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category & Topics */}
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {creator.matching_topics && creator.matching_topics.length > 0 ? (
                      creator.matching_topics.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-xs font-bold bg-orange-50 text-[#C93B07] border border-orange-200/60"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">ทั่วไป</span>
                    )}
                  </div>
                </td>

                {/* Followers & Rate Card */}
                <td className="py-4 px-4 text-center">
                  {formatCompactNumber(creator.follower_count) ? (
                    <div>
                      <span
                        title={`${creator.follower_count?.toLocaleString()} followers`}
                        className="font-mono font-bold text-slate-800 text-sm block"
                      >
                        {formatCompactNumber(creator.follower_count)}
                      </span>
                      {creator.rate_card_min && creator.rate_card_max && (
                        <span
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-mono mt-1 inline-block"
                          title="ประมาณการเรทการ์ดสปอนเซอร์ต่อคลิป"
                        >
                          ~{formatCompactNumber(creator.rate_card_min)}-{formatCompactNumber(creator.rate_card_max)}฿
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">ไม่ระบุ</span>
                  )}
                </td>

                {/* Engagement Quality */}
                <td className="py-4 px-4 text-right">
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {creator.engagement_quality_score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 ml-0.5">/100</span>
                </td>

                {/* Semantic Match */}
                <td className="py-4 px-4 text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {creator.semantic_relevance_score.toFixed(1)}
                    </span>
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-[#FF5A1F] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${creator.semantic_relevance_score}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Overall Score */}
                <td className="py-4 px-4 text-right">
                  <span className="font-mono font-black text-base text-[#FF5A1F]">
                    {creator.final_score.toFixed(1)}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSelectCreator?.(creator)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#FF5A1F] hover:bg-orange-50 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="ดูข้อมูลเชิงลึก"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <TikTokProfileCTA creator={creator} variant="table" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscoveryTable;
