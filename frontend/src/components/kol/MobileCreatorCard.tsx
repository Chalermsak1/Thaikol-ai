import React, { useState } from 'react';
import { KOLRecommendation } from '../../types';
import { formatCompactNumber, formatPercent } from '../../lib/format';
import { getProfileLinkStatus } from './TikTokProfileCTA';
import {
  ExternalLink,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Play,
} from 'lucide-react';
import { CreatorAvatar, getCreatorCover, isSamplePortrait } from '../../lib/creatorMedia';

interface MobileCreatorCardProps {
  creator: KOLRecommendation;
  isShortlisted?: boolean;
  onToggleShortlist?: () => void;
  onOpenDetail?: () => void;
  showScore?: boolean;
}

export const MobileCreatorCard: React.FC<MobileCreatorCardProps> = ({
  creator,
  isShortlisted = false,
  onToggleShortlist,
  onOpenDetail,
  showScore = true,
}) => {
  const [justBookmarked, setJustBookmarked] = useState(false);
  const linkStatus = getProfileLinkStatus(creator);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleShortlist) {
      onToggleShortlist();
      setJustBookmarked(true);
      setTimeout(() => setJustBookmarked(false), 1200);
    }
  };

  const followersStr = formatCompactNumber(creator.follower_count);
  const viewsStr = formatCompactNumber(creator.average_views);
  const erStr = formatPercent(creator.estimated_engagement_rate);
  const hasNumericalMetrics = !!(followersStr || viewsStr || erStr);

  const isTopMatch = creator.rank === 1;

  return (
    <article
      onClick={onOpenDetail}
      className={`group relative rounded-3xl bg-white border transition-all duration-200 cursor-pointer overflow-hidden p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-card-hover ${
        isTopMatch
          ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/15'
          : 'border-slate-200/90 hover:border-orange-300'
      }`}
    >
      {/* Top Row: Avatar, Identity, Score Badge & Bookmark */}
      <div className="flex items-start justify-between gap-2.5">
        {/* Creator Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <CreatorAvatar creator={creator} size="md" showVerified={true} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {creator.rank > 0 && (
                <span className="font-mono text-[10px] font-bold text-slate-400">
                  #{creator.rank}
                </span>
              )}
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-[#FF5A1F] transition-colors">
                {creator.display_name}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-mono text-slate-500 truncate">
                @{creator.username}
              </span>

              {creator.brand_safety_risk_level === 'safe' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Safe</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action & Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {showScore && creator.final_score > 0 && (
            <div
              className={`px-2.5 py-1 rounded-xl text-center border shadow-2xs ${
                creator.final_score >= 80
                  ? 'bg-orange-50/80 text-[#FF5A1F] border-orange-200'
                  : creator.final_score >= 65
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-orange-900/60 leading-none">
                AI Match
              </div>
              <div className="text-sm font-extrabold font-mono leading-tight mt-0.5">
                {creator.final_score.toFixed(1)}
              </div>
            </div>
          )}

          {/* Bookmark Button */}
          {onToggleShortlist && (
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isShortlisted ? 'ลบออกจากรายการบันทึก' : 'บันทึกลงในรายการ'}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all touch-manipulation cursor-pointer ${
                isShortlisted
                  ? 'bg-orange-50 text-[#FF5A1F] border-orange-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              {isShortlisted ? (
                <BookmarkCheck className="w-5 h-5 fill-[#FF5A1F] text-[#FF5A1F]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row: Rendered gracefully (No ugly 3-box 'ไม่ระบุ') */}
      {hasNumericalMetrics ? (
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-orange-50/30 border border-orange-100/60 text-center">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              ผู้ติดตาม
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-800 font-mono mt-0.5">
              {followersStr || <span className="text-slate-400 font-normal text-xs">-</span>}
            </div>
          </div>

          <div className="border-x border-slate-200/60">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              เฉลี่ยวิว
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-800 font-mono mt-0.5">
              {viewsStr || <span className="text-slate-400 font-normal text-xs">-</span>}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              ER คุณภาพ
            </div>
            <div className="text-xs sm:text-sm font-black text-[#FF5A1F] font-mono mt-0.5">
              {erStr || <span className="text-slate-400 font-normal text-xs">-</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-500">
          <span className="text-orange-500 font-bold">✦</span>
          <span className="truncate">
            {creator.sample_captions?.length
              ? `ตรวจพบ ${creator.sample_captions.length} วิดีโอตัวอย่างบน TikTok`
              : 'สัญญาณคอนเทนต์ตรงกับคำค้นหาของแคมเปญ'}
          </span>
        </div>
      )}

      {/* Content Context with Video Thumbnail Preview */}
      <div className="flex gap-2.5 items-center bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
        <div className="w-10 h-13 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative shadow-2xs border border-slate-200/90 group-hover:border-orange-300 transition">
          <img
            src={getCreatorCover(creator)}
            alt="ตัวอย่างคอนเทนต์"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-xs">
              <Play className="w-2 h-2 fill-slate-900 ml-0.5" />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-thai min-w-0">
          <span className="font-bold text-slate-500">
            {creator.sample_captions && creator.sample_captions.length > 0 ? 'คลิปตัวอย่าง: ' : 'คอนเทนต์: '}
          </span>
          {creator.sample_captions?.[0] || creator.bio || 'สัญญาณคอนเทนต์ตรงกับแนวทางของแคมเปญ'}
        </p>
      </div>

      {/* Tags Row: Locality, Hashtags, Data Source */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
        {/* Thai Content Signal */}
        {creator.local_content_relevance_score >= 40 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200/70 font-semibold">
            <span>🇹🇭</span>
            <span>สัญญาณคอนเทนต์ไทย</span>
          </span>
        )}

        {/* Matching Topics */}
        {creator.matching_topics &&
          creator.matching_topics.slice(0, 2).map((topic, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 font-medium"
            >
              <Sparkles className="w-2.5 h-2.5 text-orange-500" />
              <span>{topic}</span>
            </span>
          ))}

        {/* Hashtags */}
        {creator.hashtags &&
          creator.hashtags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-mono text-[10px] border border-slate-100"
            >
              #{tag.replace(/^#/, '')}
            </span>
          ))}

        {/* Sample Portrait Disclosure */}
        {isSamplePortrait(creator) && (
          <span
            className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60"
            title="ภาพจำลองเพื่อการสาธิต ไม่ใช่ภาพบุคคลจริง"
          >
            รูปตัวอย่างจำลอง
          </span>
        )}

        {/* Provenance Tag */}
        <span
          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
            creator.is_demo_fixture
              ? 'bg-amber-100/70 text-amber-800'
              : 'bg-emerald-100/70 text-emerald-800'
          }`}
        >
          {creator.is_demo_fixture ? 'Demo' : 'Live'}
        </span>
      </div>

      {/* Bottom Action Footer (Reference: View Profile pill & Open TikTok) */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="btn-pill-view font-bold group-hover:border-orange-400 group-hover:text-[#FF5A1F] transition-all">
          ดูข้อมูลครีเอเตอร์
        </span>

        {linkStatus.isClickable && linkStatus.url ? (
          <a
            href={linkStatus.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5A1F] hover:bg-[#E24A12] text-white font-bold transition-all cursor-pointer text-xs min-h-[36px] shadow-xs hover:shadow-orange-200"
          >
            <span>เปิด TikTok</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">
            @{creator.username}
          </span>
        )}
      </div>

      {/* Micro-Feedback Toast on Bookmark */}
      {justBookmarked && (
        <div className="absolute inset-x-0 bottom-2 mx-auto w-fit px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-md transition-all animate-bounce">
          {isShortlisted ? 'บันทึกลงใน Shortlist แล้ว ✓' : 'ลบออกจาก Shortlist แล้ว'}
        </div>
      )}
    </article>
  );
};
