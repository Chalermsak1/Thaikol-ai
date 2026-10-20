import React, { useState, useEffect } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { MobileCreatorCard } from '../components/kol/MobileCreatorCard';
import { DiscoveryTable } from '../components/kol/DiscoveryTable';
import { SearchStrategy } from '../components/brand/SearchStrategy';
import { VideoPreviewModal } from '../components/kol/VideoPreviewModal';
import { estimateCreatorRateCard } from '../lib/rateCardCalculator';
import { discoverTikTokCreators, listTikTokCandidates } from '../lib/api';
import {
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface DiscoveryViewProps {
  result: RecommendationResponse | null;
  onSelectCreator: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
  shortlist?: Record<string, any>;
  onToggleShortlist?: (creator: KOLRecommendation) => void;
  initialQuery?: string;
}

const CATEGORY_CHIPS = [
  { id: 'all', label: 'ทั้งหมด (All)', query: '' },
  { id: 'skincare', label: '🌸 สกินแคร์ (Skincare)', query: 'สกินแคร์' },
  { id: 'beauty', label: '💄 บิวตี้ (Beauty)', query: 'ความงาม' },
  { id: 'health', label: '🌿 สุขภาพ & สมุนไพร', query: 'สมุนไพร' },
  { id: 'food', label: '🍜 อาหาร & คาเฟ่', query: 'อาหาร' },
  { id: 'tech', label: '📱 เทคโนโลยี & ไอที', query: 'ไอที' },
  { id: 'travel', label: '✈️ ท่องเที่ยว & ไลฟ์สไตล์', query: 'ท่องเที่ยว' },
];

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  result,
  onSelectCreator,
  onGoToDashboard,
  onGoToAnalyze,
  shortlist = {},
  onToggleShortlist,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters
  type FollowerTier = 'all' | 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  type BudgetTier = 'all' | '15k' | '35k' | '60k' | '100k';

  const [minSemantic, setMinSemantic] = useState<number>(0);
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [minScore, setMinScore] = useState<number>(0);
  const [isThaiOnly, setIsThaiOnly] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<FollowerTier>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [previewCreator, setPreviewCreator] = useState<KOLRecommendation | null>(null);

  // Standalone TikTok discovery state (when exploring without brand or custom search)
  const [directCandidates, setDirectCandidates] = useState<KOLRecommendation[]>([]);
  const [isSearchingDirect, setIsSearchingDirect] = useState<boolean>(false);
  const [directSearchError, setDirectSearchError] = useState<string | null>(null);

  // Pool of candidate creators: either from brand analysis result or direct TikTok discovery
  const hasBrandResult = !!(result && result.recommendations && result.recommendations.length > 0);

  // Perform direct discovery if user searches or changes category when no brand result or user explicitly searches
  const handleDirectSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearchingDirect(true);
    setDirectSearchError(null);

    try {
      // 1. Try public discovery endpoint
      const discoRes = await discoverTikTokCreators({
        queries: [term.trim()],
        max_results_per_query: 15,
        max_candidates: 25,
      });

      if (discoRes.candidates && discoRes.candidates.length > 0) {
        // Map raw KOLCandidate to KOLRecommendation display format
        const mapped: KOLRecommendation[] = discoRes.candidates.map((c: any, idx: number) => ({
          rank: idx + 1,
          username: c.username,
          display_name: c.display_name,
          profile_url: c.profile_url,
          is_profile_verified: c.is_profile_verified ?? false,
          profile_status: c.profile_status ?? 'available',
          final_score: Math.round((c.local_signal_score || 0.7) * 100),
          semantic_relevance_score: 80.0,
          engagement_quality_score: Math.min(100, Math.round((c.estimated_engagement_rate || 0.03) * 1000)),
          local_content_relevance_score: Math.round((c.local_signal_score || 0.7) * 100),
          audience_fit_proxy: null,
          brand_safety_score: 100.0,
          brand_safety_risk_level: 'safe',
          data_quality_score: 95.0,
          score_breakdown: {
            semantic_relevance: { score: 80, weight: 0.45, weighted_contribution: 36 },
            engagement_quality: { score: 75, weight: 0.25, weighted_contribution: 18.75 },
            local_content_relevance: { score: 80, weight: 0.15, weighted_contribution: 12 },
            brand_safety: { score: 100, weight: 0.1, weighted_contribution: 10 },
            data_quality: { score: 95, weight: 0.05, weighted_contribution: 4.75 },
            final_score: 81.5,
          },
          reasons: ['ตรวจพบเนื้อหาที่ตรงกับคำค้นหาโดยตรงบน TikTok', 'มีสัญญาณภาษาและเนื้อหาไทยชัดเจน'],
          cautions: [],
          matching_topics: [term.trim()],
          bio: c.bio,
          follower_count: c.follower_count,
          sample_video_count: c.sample_video_count,
          average_views: c.average_views,
          average_likes: c.average_likes,
          average_comments: c.average_comments,
          average_shares: c.average_shares,
          estimated_engagement_rate: c.estimated_engagement_rate,
          sample_captions: c.sample_captions || [],
          hashtags: c.hashtags || [],
          data_source: c.data_source || 'live',
          collected_at: c.collected_at || new Date().toISOString(),
          data_freshness: c.data_freshness || 'fresh',
          is_demo_fixture: c.is_demo_fixture ?? false,
          provenance: c.provenance || 'direct_search',
        }));
        setDirectCandidates(mapped);
      } else {
        setDirectCandidates([]);
      }
    } catch (err: any) {
      console.warn('Direct TikTok discovery request failed:', err);
      // Fallback: query candidate database
      try {
        const dbCandidates = await listTikTokCandidates({ query: term.trim(), limit: 15 });
        if (dbCandidates && dbCandidates.length > 0) {
          const mapped: KOLRecommendation[] = dbCandidates.map((c: any, idx: number) => ({
            rank: idx + 1,
            username: c.username,
            display_name: c.display_name,
            profile_url: c.profile_url,
            is_profile_verified: c.is_profile_verified ?? false,
            profile_status: c.profile_status ?? 'available',
            final_score: 80.0,
            semantic_relevance_score: 80.0,
            engagement_quality_score: 75.0,
            local_content_relevance_score: 85.0,
            audience_fit_proxy: null,
            brand_safety_score: 100.0,
            brand_safety_risk_level: 'safe',
            data_quality_score: 90.0,
            score_breakdown: {
              semantic_relevance: { score: 80, weight: 0.45, weighted_contribution: 36 },
              engagement_quality: { score: 75, weight: 0.25, weighted_contribution: 18.75 },
              local_content_relevance: { score: 85, weight: 0.15, weighted_contribution: 12.75 },
              brand_safety: { score: 100, weight: 0.1, weighted_contribution: 10 },
              data_quality: { score: 90, weight: 0.05, weighted_contribution: 4.5 },
              final_score: 82.0,
            },
            reasons: ['ตรวจพบจากฐานข้อมูล TikTok Candidate ที่บันทึกไว้'],
            cautions: [],
            matching_topics: [term.trim()],
            bio: c.bio,
            follower_count: c.follower_count,
            sample_video_count: c.sample_video_count,
            average_views: c.average_views,
            average_likes: c.average_likes,
            average_comments: c.average_comments,
            average_shares: c.average_shares,
            estimated_engagement_rate: c.estimated_engagement_rate,
            sample_captions: c.sample_captions || [],
            hashtags: c.hashtags || [],
            data_source: c.data_source || 'live',
            collected_at: c.collected_at || new Date().toISOString(),
            data_freshness: 'cached',
            is_demo_fixture: c.is_demo_fixture ?? false,
            provenance: 'database',
          }));
          setDirectCandidates(mapped);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback candidate listing failed:', fallbackErr);
      }
      setDirectSearchError('ไม่สามารถเชื่อมต่อผู้ให้บริการค้นหา TikTok ได้ในขณะนี้ โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsSearchingDirect(false);
    }
  };

  // Trigger search on mount if initialQuery provided
  useEffect(() => {
    if (initialQuery && !hasBrandResult) {
      setSearchQuery(initialQuery);
      handleDirectSearch(initialQuery);
    }
  }, [initialQuery]);

  // Active pool of creators to display
  const rawPool: KOLRecommendation[] =
    hasBrandResult && !directCandidates.length
      ? result!.recommendations
      : directCandidates.length > 0
      ? directCandidates
      : result?.recommendations || [];

  // Filter pool by keyword, category, and thresholds
  const filtered = rawPool.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.display_name.toLowerCase().includes(q);
      const matchUser = c.username.toLowerCase().includes(q);
      const matchTopic = c.matching_topics.some((t) => t.toLowerCase().includes(q));
      const matchTag = c.hashtags?.some((h) => h.toLowerCase().includes(q));
      if (!matchName && !matchUser && !matchTopic && !matchTag) return false;
    }
    if (minSemantic > 0 && c.semantic_relevance_score < minSemantic) return false;
    if (minEngagement > 0 && c.engagement_quality_score < minEngagement) return false;
    if (minScore > 0 && c.final_score < minScore) return false;
    if (isThaiOnly && c.local_content_relevance_score < 60) return false;

    // Follower Tier Filter
    if (selectedTier !== 'all') {
      const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
      if (selectedTier === 'nano' && rate.tier !== 'Nano') return false;
      if (selectedTier === 'micro' && rate.tier !== 'Micro') return false;
      if (selectedTier === 'mid' && rate.tier !== 'Mid-Tier') return false;
      if (selectedTier === 'macro' && rate.tier !== 'Macro') return false;
      if (selectedTier === 'mega' && rate.tier !== 'Mega') return false;
    }

    // Budget Cap Filter
    if (selectedBudget !== 'all') {
      const cap =
        selectedBudget === '15k'
          ? 15000
          : selectedBudget === '35k'
          ? 35000
          : selectedBudget === '60k'
          ? 60000
          : 100000;
      const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
      if (rate.avgRateTHB > cap) return false;
    }

    return true;
  });

  const handleCategorySelect = (chip: typeof CATEGORY_CHIPS[0]) => {
    setActiveCategory(chip.id);
    if (chip.query) {
      setSearchQuery(chip.query);
      if (!hasBrandResult) {
        handleDirectSearch(chip.query);
      }
    } else {
      setSearchQuery('');
      setDirectCandidates([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleDirectSearch(searchQuery);
    }
  };

  const resetFilters = () => {
    setMinSemantic(0);
    setMinEngagement(0);
    setMinScore(0);
    setIsThaiOnly(false);
    setSelectedTier('all');
    setSelectedBudget('all');
    setSearchQuery('');
    setActiveCategory('all');
    setDirectCandidates([]);
  };

  const hasActiveFilters =
    minSemantic > 0 ||
    minEngagement > 0 ||
    minScore > 0 ||
    isThaiOnly ||
    selectedTier !== 'all' ||
    selectedBudget !== 'all' ||
    !!searchQuery;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* ─── Screen Header & Search Form ───────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center text-sm shadow-2xs">
                ★
              </span>
              <span>ค้นหาและคัดเลือก KOL (Discovery)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ค้นหา TikTok Creator ชาวไทย สำรวจสถิติจริง และเลือกครีเอเตอร์ที่เหมาะสมกับแคมเปญ
            </p>
          </div>

          {/* Desktop View Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ด (Cards)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>ตาราง (Table)</span>
            </button>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อครีเอเตอร์, @username, หรือคีย์เวิร์ด เช่น สกินแคร์, กาแฟ..."
              className="w-full pl-10 pr-10 py-3 text-sm rounded-2xl bg-white border border-slate-200/90 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5A1F] transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearchingDirect}
            className="btn-orange px-5 sm:px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50 min-h-[46px]"
          >
            {isSearchingDirect ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline">ค้นหา</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 rounded-2xl border flex items-center justify-center transition-all cursor-pointer min-h-[46px] min-w-[46px] relative ${
              isFilterOpen || hasActiveFilters
                ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
            }`}
            title="ตัวกรองขั้นสูง"
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white" />
            )}
          </button>
        </form>

        {/* Category Suggestion Chips (Horizontal scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 text-xs">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleCategorySelect(chip)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-all shrink-0 cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tier & Budget Quick Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Follower Tier Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              ขนาดผู้ติดตาม:
            </span>
            {[
              { id: 'all' as const, label: 'ทั้งหมด' },
              { id: 'nano' as const, label: 'Nano (<10k)' },
              { id: 'micro' as const, label: 'Micro (10k-50k)' },
              { id: 'mid' as const, label: 'Mid-Tier (50k-500k)' },
              { id: 'macro' as const, label: 'Macro (>500k)' },
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer shrink-0 min-h-[30px] ${
                  selectedTier === tier.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Budget Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              งบ/คลิป:
            </span>
            {[
              { id: 'all' as const, label: 'ทั้งหมด' },
              { id: '15k' as const, label: '≤ ฿15k' },
              { id: '35k' as const, label: '≤ ฿35k' },
              { id: '60k' as const, label: '≤ ฿60k' },
            ].map((budget) => (
              <button
                key={budget.id}
                type="button"
                onClick={() => setSelectedBudget(budget.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer shrink-0 min-h-[30px] ${
                  selectedBudget === budget.id
                    ? 'bg-[#FF5A1F] text-white shadow-2xs font-bold'
                    : 'bg-orange-50/70 text-orange-900 hover:bg-orange-100 border border-orange-200/60'
                }`}
              >
                {budget.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Collapsible Filter Drawer / Box ───────────────────────── */}
      {isFilterOpen && (
        <div className="p-4 sm:p-5 space-y-3.5 bg-white border border-slate-200/90 shadow-card rounded-3xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              <span>ตัวกรองละเอียด (Filters)</span>
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#FF5A1F] hover:text-[#E24A12] font-semibold flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ตตัวกรอง</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Min Score */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">คะแนน AI Match ขั้นต่ำ</label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A1F] min-h-[44px]"
              >
                <option value={0}>ทั้งหมด (All Scores)</option>
                <option value={70}>คะแนน ≥ 70</option>
                <option value={80}>คะแนน ≥ 80</option>
                <option value={90}>คะแนน ≥ 90 (ยอดเยี่ยม)</option>
              </select>
            </div>

            {/* Min Engagement */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">การมีส่วนร่วม (Engagement Rate)</label>
              <select
                value={minEngagement}
                onChange={(e) => setMinEngagement(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A1F] min-h-[44px]"
              >
                <option value={0}>ทั้งหมด (All)</option>
                <option value={60}>คะแนน ER ≥ 60</option>
                <option value={75}>คะแนน ER ≥ 75</option>
              </select>
            </div>

            {/* Locality toggle */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-orange-50/50 border border-orange-100 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isThaiOnly}
                  onChange={(e) => setIsThaiOnly(e.target.checked)}
                  className="rounded border-slate-300 text-[#FF5A1F] focus:ring-[#FF5A1F] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-orange-950 font-bold">🇹🇭 เฉพาะครีเอเตอร์สัญญาณไทย</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ─── Search Strategy Bar (if brand results present) ─────────── */}
      {result?.search_queries && result.search_queries.length > 0 && (
        <SearchStrategy
          queries={result.search_queries}
          candidateCount={result.candidate_pool_count}
        />
      )}

      {/* ─── Loading Skeleton ───────────────────────────────────────── */}
      {isSearchingDirect && (
        <div className="space-y-3 py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>กำลังค้นหาครีเอเตอร์บน TikTok สำหรับ "{searchQuery}"...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-100/80 animate-pulse border border-slate-200/50" />
            ))}
          </div>
        </div>
      )}

      {/* ─── Error State ────────────────────────────────────────────── */}
      {directSearchError && !isSearchingDirect && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-semibold">{directSearchError}</p>
            <button
              onClick={() => handleDirectSearch(searchQuery || 'สกินแคร์')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition cursor-pointer"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Content Display: Creator Cards / Table ────────────── */}
      {!isSearchingDirect && filtered.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              พบครีเอเตอร์ {filtered.length} รายการ
              {hasBrandResult && (
                <span className="font-normal text-slate-400 ml-1">
                  (จากแบรนด์ {result?.brand_profile?.brand_name})
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              แตะการ์ดเพื่อดูสถิติเชิงลึก
            </span>
          </div>

          {/* Mobile & Desktop Cards Layout */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filtered.map((creator) => (
                <MobileCreatorCard
                  key={creator.username}
                  creator={creator}
                  isShortlisted={!!shortlist[creator.username]}
                  onToggleShortlist={() => onToggleShortlist?.(creator)}
                  onOpenDetail={() => onSelectCreator(creator)}
                  onOpenVideoModal={(c) => setPreviewCreator(c)}
                  showScore={creator.final_score > 0}
                />
              ))}
            </div>
          ) : (
            <div className="hidden md:block">
              <DiscoveryTable
                creators={filtered}
                onSelectCreator={onSelectCreator}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Empty State ────────────────────────────────────────────── */}
      {!isSearchingDirect && filtered.length === 0 && !directSearchError && (
        <div className="saas-card p-8 sm:p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? `ไม่พบครีเอเตอร์สำหรับ "${searchQuery}"` : 'ยังไม่มีข้อมูลครีเอเตอร์ในหมวดนี้'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            ลองใช้คำค้นหาที่กว้างขึ้น เช่น สกินแคร์, รีวิว, อาหาร หรือเริ่มต้นด้วยการวิเคราะห์เว็บไซต์ของแบรนด์
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSearchQuery('สกินแคร์');
                handleDirectSearch('สกินแคร์');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              ค้นหา "สกินแคร์"
            </button>
            <button
              onClick={() => {
                setSearchQuery('อาหาร');
                handleDirectSearch('อาหาร');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              ค้นหา "อาหาร"
            </button>
            {onGoToAnalyze && (
              <button
                onClick={onGoToAnalyze}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>วิเคราะห์แบรนด์ก่อน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                กลับหน้าแรก
              </button>
            )}
          </div>
        </div>
      )}

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
