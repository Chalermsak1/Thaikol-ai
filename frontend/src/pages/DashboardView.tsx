import React, { useState } from 'react';
import { RecommendationResponse, KOLRecommendation, ActiveNavPage } from '../types';
import {
  Search,
  ArrowRight,
  Users,
  Sparkles,
  Plus,
  Building2,
  BookmarkCheck,
  Bookmark,
  Check,
  Play,
  Flame,
  Star,
} from 'lucide-react';
import { formatCompactNumber, formatPercent } from '../lib/format';
import {
  getCreatorCover,
  isSamplePortrait,
  CreatorAvatar,
} from '../lib/creatorMedia';
import { VideoPreviewModal } from '../components/kol/VideoPreviewModal';
import { estimateCreatorRateCard, formatTHBCurrency } from '../lib/rateCardCalculator';

interface DashboardViewProps {
  result: RecommendationResponse | null;
  onSelectPage: (page: ActiveNavPage) => void;
  onRunDemo: () => void;
  onAnalyzePreset?: (web: string, fb: string) => void;
  onOpenEvidence?: () => void;
  onResetSession?: () => void;
  onSearchKOL?: (query: string) => void;
  onSelectCreator?: (creator: KOLRecommendation) => void;
  shortlist?: Record<string, any>;
  onToggleShortlist?: (creator: KOLRecommendation) => void;
}

const BENCHMARK_PRESETS = [
  {
    id: 'khaokho',
    name: 'เขาค้อทะเลภู',
    enName: 'Khaokho Talaypu',
    category: '🌿 สมุนไพร & ผม',
    websiteUrl: 'https://khaokhotalaypu.com',
    facebookUrl: 'https://facebook.com/KhaokhoTalaypu',
  },
  {
    id: 'smooth-e',
    name: 'สมูทอี',
    enName: 'Smooth E',
    category: '🌸 เวชสำอาง & ผิว',
    websiteUrl: 'https://smooth-e.com',
    facebookUrl: 'https://facebook.com/SmoothEThailand',
  },
  {
    id: 'chatramue',
    name: 'ชาตรามือ',
    enName: 'ChaTraMue',
    category: '🍵 เครื่องดื่ม & ชาไทย',
    websiteUrl: 'https://chatramue.com',
    facebookUrl: 'https://facebook.com/ChaTraMue',
  },
];

const QUICK_CATEGORIES = [
  { label: 'ทั้งหมด', query: '' },
  { label: '🌸 สกินแคร์ & บิวตี้', query: 'สกินแคร์' },
  { label: '🌿 สมุนไพร & สุขภาพ', query: 'สมุนไพร' },
  { label: '🍜 อาหาร & คาเฟ่', query: 'อาหาร' },
  { label: '👗 แฟชั่น & ไลฟ์สไตล์', query: 'แฟชั่น' },
  { label: '📱 เทคโนโลยี & ไอที', query: 'ไอที' },
];

// Curated benchmark fallback creators when recommendations are still empty
const FALLBACK_BENCHMARK_CREATORS: any[] = [
  {
    rank: 1,
    username: 'mayyr_official',
    display_name: 'Mayy R',
    final_score: 96.4,
    follower_count: 1450000,
    average_views: 185000,
    estimated_engagement_rate: 0.052,
    is_profile_verified: true,
    matching_topics: ['สกินแคร์', 'บิวตี้'],
    is_demo_fixture: true,
    bio: 'รีวิวสกินแคร์กู้ผิวแพ้ง่าย ทริคดูแลผิวใส และไอเทมบิวตี้ใช้จริง 🌸✨',
  },
  {
    rank: 2,
    username: 'archita_station',
    display_name: 'Archita Station',
    final_score: 94.2,
    follower_count: 890000,
    average_views: 112000,
    estimated_engagement_rate: 0.046,
    is_profile_verified: true,
    matching_topics: ['ดูแลผิว', 'แต่งหน้า'],
    is_demo_fixture: true,
    bio: 'แชร์เทคนิคเมคอัพและสกินแคร์คนผิวแพ้ง่าย สไตล์สาวเอเชีย 🌿',
  },
  {
    rank: 3,
    username: 'soundtiss_st',
    display_name: 'Ingck Soundtiss',
    final_score: 92.8,
    follower_count: 1200000,
    average_views: 145000,
    estimated_engagement_rate: 0.041,
    is_profile_verified: true,
    matching_topics: ['ผิวแพ้ง่าย', 'ธรรมชาติ'],
    is_demo_fixture: true,
    bio: 'รีวิวเครื่องสำอางและสมุนไพรไทย เน้นปลอดภัยไม่แพ้ 🍃',
  },
  {
    rank: 4,
    username: 'nurseryus_review',
    display_name: 'Nurseryus',
    final_score: 89.5,
    follower_count: 620000,
    average_views: 68000,
    estimated_engagement_rate: 0.038,
    is_profile_verified: false,
    matching_topics: ['ผมร่วง', 'แชมพูสมุนไพร'],
    is_demo_fixture: true,
    bio: 'กู้ผมบาง ลดผมร่วงด้วยแชมพูสมุนไพรธรรมชาติ ปลอดสารเคมี 💆‍♀️',
  },
  {
    rank: 5,
    username: 'khunnu_beauty',
    display_name: 'Khun Nu Beauty',
    final_score: 88.0,
    follower_count: 450000,
    average_views: 52000,
    estimated_engagement_rate: 0.035,
    is_profile_verified: false,
    matching_topics: ['รีวิวของใช้', 'สมุนไพรไทย'],
    is_demo_fixture: true,
    bio: 'เปิดกรุสมุนไพรไทยกู้ผิวและผม รีวิวตรงไปตรงมา 🌿',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  onSelectPage,
  onRunDemo,
  onAnalyzePreset,
  onResetSession: _onResetSession,
  onSearchKOL,
  onSelectCreator,
  shortlist = {},
  onToggleShortlist,
}) => {
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [previewCreator, setPreviewCreator] = useState<KOLRecommendation | null>(null);

  const brand = result?.brand_profile;
  const brandName = brand?.brand_name || 'เขาค้อทะเลภู (Khaokho Talaypu)';
  const industry = brand?.industry || 'Herbal Personal Care & Sensitive Skincare';
  const recommendations = result?.recommendations || [];

  const displayCreators =
    recommendations.length > 0
      ? recommendations.slice(0, 6)
      : FALLBACK_BENCHMARK_CREATORS;

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      if (onSearchKOL) {
        onSearchKOL(quickSearchInput.trim());
      } else {
        onSelectPage('discovery');
      }
    } else {
      onSelectPage('discovery');
    }
  };

  const handleLaunchPreset = (web: string, fb: string) => {
    if (onAnalyzePreset) {
      onAnalyzePreset(web, fb);
    } else {
      onRunDemo();
    }
  };

  const handleCreatorClick = (creator: any) => {
    if (onSelectCreator && 'score_breakdown' in creator) {
      onSelectCreator(creator as KOLRecommendation);
    } else if (onSearchKOL) {
      onSearchKOL(creator.display_name || creator.username);
    } else {
      onSelectPage('discovery');
    }
  };

  return (
    <div className="space-y-5 max-w-[1240px] mx-auto overflow-x-hidden pb-8 font-thai">
      {/* ─── 1. Brand Spotlight Hero Card (Mobile-First Touch Ergonomics) ── */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Orange Brand Icon with Glow */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#E24A12] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-orange-500/20 select-none">
              ✦
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                  Active Brand
                </span>
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                  {brandName}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                🇹🇭 ประเทศไทย · {industry}
              </p>
            </div>
          </div>

          {/* Action CTAs: Touch-friendly on 390px iPhone */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectPage('analyze')}
              className="btn-secondary text-xs px-3.5 py-2.5 rounded-full cursor-pointer min-h-[44px] font-semibold flex items-center gap-1.5 flex-1 sm:flex-none justify-center touch-manipulation"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>เปลี่ยนแบรนด์</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPage('discovery')}
              className="btn-orange text-xs px-4 py-2.5 rounded-full cursor-pointer min-h-[44px] font-bold shadow-xs flex items-center gap-1.5 flex-1 sm:flex-none justify-center touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ค้นหา KOL ทันที</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Benchmark Switcher: Smooth Horizontal Pill Scroll */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#FF5A1F]" />
            แบรนด์ตัวอย่าง:
          </span>
          {BENCHMARK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLaunchPreset(preset.websiteUrl, preset.facebookUrl)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF5A1F] border border-slate-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0 min-h-[38px] touch-manipulation active:scale-95"
            >
              <span>{preset.category}</span>
              <span className="text-slate-900 font-bold">{preset.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 2. Prominent Mobile Search Bar & Category Chips ────────── */}
      <section className="space-y-3">
        <form onSubmit={handleQuickSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={quickSearchInput}
            onChange={(e) => setQuickSearchInput(e.target.value)}
            placeholder="ค้นหาชื่อครีเอเตอร์ TikTok, @username หรือคีย์เวิร์ด..."
            className="w-full pl-11 pr-24 sm:pr-28 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5A1F] transition-all placeholder:text-slate-400 font-sans"
          />
          <button
            type="submit"
            className="btn-orange absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 text-xs font-bold shadow-xs cursor-pointer min-h-[36px] touch-manipulation"
          >
            ค้นหา
          </button>
        </form>

        {/* Quick Horizontal Categories with Active State */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {QUICK_CATEGORIES.map((cat, idx) => {
            const isSelected = activeCategory === cat.query;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.query);
                  if (cat.query) {
                    onSearchKOL?.(cat.query);
                  } else {
                    onSelectPage('discovery');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 min-h-[38px] touch-manipulation active:scale-95 ${
                  isSelected
                    ? 'bg-[#FF5A1F] text-white border border-[#FF5A1F] shadow-xs'
                    : 'bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF5A1F] border border-slate-200/90 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 3. Top Creators Showcase (Hero Carousel + Media Feed) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Top Creator Matches (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 text-[#FF5A1F] flex items-center justify-center font-bold text-sm shadow-2xs">
                  <Star className="w-4 h-4 fill-[#FF5A1F]" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    ครีเอเตอร์ที่เหมาะสมสูงสุด (Top Matches)
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    คัดเลือกจากสัญญาณคอนเทนต์และแบบจำลองความเข้ากันได้
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPage('discovery')}
                className="text-xs font-bold text-[#FF5A1F] hover:text-[#E24A12] flex items-center gap-1 cursor-pointer shrink-0 min-h-[40px] px-2 touch-manipulation"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── FEATURE 1: Swipeable Hero Creator Carousel (iPhone 390px Optimized) ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                  <span>ไฮไลท์ครีเอเตอร์ยอดนิยม (Swipe to Explore)</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {displayCreators.length} รายการ
                </span>
              </div>

              {/* Horizontal Scroll Deck */}
              <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {displayCreators.map((creator: any, idx: number) => {
                  const coverUrl = getCreatorCover(creator);
                  const isTop = idx === 0;
                  const isBookmarked = Boolean(shortlist[creator.username]);
                  const samplePortrait = isSamplePortrait(creator);
                  const rateCard = estimateCreatorRateCard(creator.follower_count, creator.average_views);

                  return (
                    <article
                      key={creator.username || idx}
                      onClick={() => handleCreatorClick(creator)}
                      className="w-[230px] sm:w-[250px] h-[350px] sm:h-[370px] shrink-0 snap-start relative rounded-3xl overflow-hidden group cursor-pointer border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all duration-300 select-none bg-slate-900"
                    >
                      {/* Full-bleed Portrait Cover Image */}
                      <img
                        src={coverUrl}
                        alt={creator.display_name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Dark Gradient Vignettes for Perfect Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

                      {/* Top Bar: Badges & Shortlist Toggle */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
                        {/* Rank Badge + Disclosure */}
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                              isTop
                                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#E24A12] text-white ring-2 ring-white/30'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-900 ring-1 ring-white/40'
                                : idx === 2
                                ? 'bg-amber-100 text-amber-900 ring-1 ring-white/40'
                                : 'bg-black/50 backdrop-blur-md text-white border border-white/20'
                            }`}
                          >
                            <span>#{idx + 1}</span>
                            <span>{isTop ? 'Top Match' : 'Match'}</span>
                          </span>

                          {/* Sample Portrait Disclosure Badge (100% Ethical & Truthful) */}
                          {samplePortrait && (
                            <span className="text-[9px] font-bold text-white/80 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/15">
                              รูปตัวอย่างจำลอง
                            </span>
                          )}
                        </div>

                        {/* Right: Fit Score + Shortlist Button */}
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#FF7A3D] border border-orange-400/40 font-mono font-black text-xs shadow-sm">
                            {Number(creator.final_score).toFixed(1)} Fit
                          </span>

                          {onToggleShortlist && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleShortlist(creator);
                              }}
                              aria-label="บันทึกครีเอเตอร์"
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer ${
                                isBookmarked
                                  ? 'bg-[#FF5A1F] text-white shadow-md shadow-orange-500/30'
                                  : 'bg-black/50 text-white/90 hover:bg-black/70 border border-white/20'
                              }`}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 fill-white" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Overlay: Identity, Stats & CTA */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2.5">
                        {/* Creator Mini Identity */}
                        <div className="flex items-center gap-2">
                          <CreatorAvatar creator={creator} size="sm" showVerified={false} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="text-sm font-black text-white truncate drop-shadow-sm">
                                {creator.display_name}
                              </h3>
                              {creator.is_profile_verified && (
                                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-2 h-2 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-white/75 truncate">
                              @{creator.username}
                            </div>
                          </div>
                        </div>

                        {/* Quick Metrics Bar with Rate Card */}
                        <div className="grid grid-cols-3 gap-1 text-[11px] bg-white/10 backdrop-blur-md rounded-xl px-2 py-1.5 border border-white/15 text-white/90 text-center">
                          <div>
                            <span className="text-[9px] uppercase text-white/60 block leading-none">
                              ผู้ติดตาม
                            </span>
                            <span className="font-mono font-bold text-xs">
                              {creator.follower_count
                                ? formatCompactNumber(creator.follower_count)
                                : '100K+'}
                            </span>
                          </div>

                          <div className="border-x border-white/15">
                            <span className="text-[9px] uppercase text-white/60 block leading-none">
                              เรทการ์ด
                            </span>
                            <span className="font-mono font-bold text-xs text-emerald-300">
                              ~{formatCompactNumber(rateCard.avgRateTHB)}฿
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase text-white/60 block leading-none">
                              Engagement
                            </span>
                            <span className="font-mono font-bold text-xs text-[#FF9E66]">
                              {creator.estimated_engagement_rate
                                ? formatPercent(creator.estimated_engagement_rate)
                                : '4.5%'}
                            </span>
                          </div>
                        </div>

                        {/* Content Topics */}
                        {creator.matching_topics && creator.matching_topics.length > 0 && (
                          <div className="flex items-center gap-1 overflow-hidden">
                            {creator.matching_topics.slice(0, 2).map((t: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-white/15 text-white text-[10px] font-medium truncate backdrop-blur-xs"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action CTA Button */}
                        <button
                          type="button"
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#E24A12] text-white text-xs font-black shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 group-hover:brightness-110 active:scale-95 transition-all touch-manipulation cursor-pointer"
                        >
                          <span>ดูโปรไฟล์เชิงลึก</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ── FEATURE 2: Image-Rich Vertical Creator Feed ── */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  รายการจัดอันดับครีเอเตอร์เด่น (Ranked Creator Feed)
                </span>
                <span className="text-[11px] text-slate-400">รูปภาพจริง & วิดีโอพรีวิว</span>
              </div>

              <div className="divide-y divide-slate-100">
                {displayCreators.map((creator: any, idx: number) => {
                  const coverUrl = getCreatorCover(creator);
                  const isBookmarked = Boolean(shortlist[creator.username]);
                  const rateCard = estimateCreatorRateCard(creator.follower_count, creator.average_views);

                  return (
                    <div
                      key={creator.username || idx}
                      onClick={() => handleCreatorClick(creator)}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-2xl px-2.5 -mx-2.5 transition cursor-pointer"
                    >
                      {/* Left: Avatar + Identity + Thumbnail */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* High-Resolution Portrait Photo */}
                        <CreatorAvatar creator={creator} size="md" showVerified={true} />

                        {/* Mini Video Preview Thumbnail Badge */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCreator(creator);
                          }}
                          className="w-10 h-13 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shrink-0 relative hidden xs:block shadow-2xs group-hover:border-[#FF5A1F] hover:scale-105 transition cursor-pointer"
                          title="แตะเพื่อเปิดพรีวิวคลิปตัวอย่าง 9:16"
                        >
                          <img
                            src={coverUrl}
                            alt="วิดีโอตัวอย่าง"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                              <Play className="w-2 h-2 fill-slate-900 ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Name & Metric Signals */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#FF5A1F] transition-colors truncate">
                              {creator.display_name}
                            </span>
                            {idx < 3 && (
                              <span className="text-[9px] font-black uppercase text-[#FF5A1F] bg-orange-50 px-1.5 py-0.2 rounded">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            @{creator.username}
                            {creator.follower_count ? (
                              <span className="text-slate-600 font-medium">
                                {' '}
                                · {formatCompactNumber(creator.follower_count)} ผู้ติดตาม
                              </span>
                            ) : (
                              ''
                            )}
                          </div>

                          {/* Content Theme & Rate Card Chips */}
                          <div className="flex items-center gap-1.5 mt-1 overflow-hidden flex-wrap">
                            <span
                              className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md font-bold"
                              title={`เรทการ์ดประมาณการ ${rateCard.tierLabel}`}
                            >
                              💰 ~{formatTHBCurrency(rateCard.avgRateTHB)} ({rateCard.tier})
                            </span>
                            {creator.matching_topics && creator.matching_topics.length > 0 && (
                              creator.matching_topics.slice(0, 1).map((t: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md font-medium"
                                >
                                  #{t}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Match Score + Action Pill */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Score Pill */}
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5A1F] border border-orange-200/70 font-mono font-black text-xs block">
                            {Number(creator.final_score).toFixed(1)} Fit
                          </span>
                        </div>

                        {/* Action Buttons */}
                        {onToggleShortlist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleShortlist(creator);
                            }}
                            aria-label="บันทึกครีเอเตอร์"
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isBookmarked
                                ? 'bg-orange-50 text-[#FF5A1F] border border-orange-200'
                                : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 fill-[#FF5A1F]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatorClick(creator);
                          }}
                          className="btn-pill-view shrink-0 font-bold hidden sm:inline-flex"
                        >
                          ดูข้อมูล
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom View All Link */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => onSelectPage('discovery')}
                className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-orange-50 hover:text-[#FF5A1F] text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation min-h-[44px]"
              >
                <span>สำรวจฐานข้อมูลครีเอเตอร์ทั้งหมด ({recommendations.length || 11}+ รายการ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Strategy & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Campaign Strategy Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  กลยุทธ์คอนเทนต์ (Campaign Strategy)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF5A1F] text-[10px] font-bold border border-orange-200/60">
                UGC Style
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-thai">
              {brand?.summary ||
                'เน้นการรีวิวจากประสบการณ์จริง (Real User Experience) สื่อสารถึงจุดเด่นของสารสกัดธรรมชาติ ปราศจากสารเคมีรุนแรง เหมาะสำหรับผู้ที่มีผิวและหนังศีรษะแพ้ง่าย ตอบโจทย์กลุ่มวัยทำงานและคนรุ่นใหม่ที่มองหาการดูแลอย่างปลอดภัย'}
            </p>

            {/* Content Hashtags */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                แฮชแท็กแนะนำบน TikTok
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '#รีวิวบิวตี้',
                  '#ใช้ดีบอกต่อ',
                  '#ผิวแพ้ง่าย',
                  '#สมุนไพรไทย',
                  '#ลดผมร่วง',
                  '#tiktoklooks',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Signals */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                กลุ่มเป้าหมายผู้บริโภค
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(brand?.target_audience?.length
                  ? brand.target_audience
                  : [
                      'ผู้มีปัญหาผมร่วง/รังแค',
                      'ผู้ที่มีผิวแพ้ง่าย',
                      'คนทำงานออฟฟิศ 22-38 ปี',
                      'ผู้บริโภคสายคลีน/ธรรมชาติ',
                    ]
                ).map((aud, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-orange-50/70 text-orange-950 border border-orange-200/60 text-[11px] font-medium"
                  >
                    ✓ {aud}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts: Touch-Friendly Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSelectPage('discovery')}
              className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 transition text-left cursor-pointer group touch-manipulation min-h-[90px]"
            >
              <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#FF5A1F] transition-colors">
                ค้นหา TikTok KOL
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                คัดเลือกตามหมวดหมู่
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectPage('shortlist')}
              className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 transition text-left cursor-pointer group touch-manipulation min-h-[90px]"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                รายการที่บันทึก
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                พอร์ตโฟลิโอ & งบประมาณ
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 9:16 Vertical Video Preview Modal */}
      {previewCreator && (
        <VideoPreviewModal
          creator={previewCreator}
          isOpen={Boolean(previewCreator)}
          onClose={() => setPreviewCreator(null)}
        />
      )}
    </div>
  );
};

export default DashboardView;
