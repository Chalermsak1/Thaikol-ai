import React, { useState, useMemo } from 'react';
import { RecommendationResponse, KOLRecommendation } from '../types';
import { RecommendationFeature } from '../components/kol/RecommendationFeature';
import { RecommendationList } from '../components/kol/RecommendationList';
import { EmptyState } from '../components/common/EmptyState';
import {
  ScoringWeightsTuner,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from '../components/kol/ScoringWeightsTuner';
import { getProfileLinkStatus } from '../components/kol/TikTokProfileCTA';
import { estimateCreatorRateCard } from '../lib/rateCardCalculator';
import {
  Award,
  Copy,
  Download,
  Check,
  Search,
  BookmarkCheck,
  Radio,
  Clock,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  Users,
} from 'lucide-react';

interface RecommendationsViewProps {
  result: RecommendationResponse | null;
  comparisonList: string[];
  shortlist?: Record<string, any>;
  onToggleCompare: (username: string) => void;
  onToggleShortlist?: (creator: KOLRecommendation) => void;
  onOpenCreatorDetail: (creator: KOLRecommendation) => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
  onGoToShortlist?: () => void;
}

type SortField = 'match' | 'relevance' | 'engagement' | 'local';

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  result,
  comparisonList,
  shortlist = {},
  onToggleCompare,
  onToggleShortlist,
  onOpenCreatorDetail,
  onGoToDashboard,
  onGoToAnalyze,
  onGoToShortlist,
}) => {
  type FollowerTier = 'all' | 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  type BudgetTier = 'all' | '15k' | '35k' | '60k' | '100k';

  const [sortBy, setSortBy] = useState<SortField>('match');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<FollowerTier>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limit, setLimit] = useState<5 | 10>(10);
  const [copied, setCopied] = useState(false);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);

  const weightsSum =
    weights.semantic_relevance +
    weights.engagement_quality +
    weights.local_content_relevance +
    weights.brand_safety +
    weights.data_quality;
  const isCustomWeights = (Object.keys(DEFAULT_SCORING_WEIGHTS) as (keyof ScoringWeights)[]).some(
    (k) => Math.abs(weights[k] - DEFAULT_SCORING_WEIGHTS[k]) > 0.0001
  );

  // Client-side re-scoring
  const rawRecommendations = useMemo<KOLRecommendation[]>(() => {
    const base = result?.recommendations ?? [];
    if (!isCustomWeights || weightsSum <= 0) return base;

    const norm = (w: number) => w / weightsSum;
    const rescored = base.map((r) => {
      const b = r.score_breakdown;
      const item = (score: number, w: number) => ({
        score,
        weight: Math.round(norm(w) * 1000) / 1000,
        weighted_contribution: Math.round(score * norm(w) * 100) / 100,
      });
      const sem = item(b.semantic_relevance.score, weights.semantic_relevance);
      const eng = item(b.engagement_quality.score, weights.engagement_quality);
      const loc = item(b.local_content_relevance.score, weights.local_content_relevance);
      const safe = item(b.brand_safety.score, weights.brand_safety);
      const data = item(b.data_quality.score, weights.data_quality);
      const final = Math.round(
        (sem.weighted_contribution + eng.weighted_contribution + loc.weighted_contribution +
          safe.weighted_contribution + data.weighted_contribution) * 10
      ) / 10;
      return {
        ...r,
        final_score: final,
        score_breakdown: {
          semantic_relevance: sem,
          engagement_quality: eng,
          local_content_relevance: loc,
          brand_safety: safe,
          data_quality: data,
          final_score: final,
        },
      };
    });

    rescored.sort(
      (a, b) =>
        b.final_score - a.final_score ||
        b.semantic_relevance_score - a.semantic_relevance_score ||
        b.engagement_quality_score - a.engagement_quality_score ||
        b.data_quality_score - a.data_quality_score ||
        a.username.localeCompare(b.username)
    );
    return rescored.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [result?.recommendations, weights, isCustomWeights, weightsSum]);

  const query = searchQuery.trim().toLowerCase();

  // Filter & Sort
  const processedRecommendations = useMemo(() => {
    let list = [...rawRecommendations];

    // Text & Topic filter
    if (query) {
      list = list.filter(
        (r) =>
          r.display_name.toLowerCase().includes(query) ||
          r.username.toLowerCase().includes(query) ||
          r.matching_topics.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedTopic !== 'all') {
      list = list.filter((r) => r.matching_topics.includes(selectedTopic));
    }

    // Follower Tier Filter
    if (selectedTier !== 'all') {
      list = list.filter((r) => {
        const rate = estimateCreatorRateCard(r.follower_count, r.average_views);
        if (selectedTier === 'nano') return rate.tier === 'Nano';
        if (selectedTier === 'micro') return rate.tier === 'Micro';
        if (selectedTier === 'mid') return rate.tier === 'Mid-Tier';
        if (selectedTier === 'macro') return rate.tier === 'Macro';
        if (selectedTier === 'mega') return rate.tier === 'Mega';
        return true;
      });
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
      list = list.filter((r) => {
        const rate = estimateCreatorRateCard(r.follower_count, r.average_views);
        return rate.avgRateTHB <= cap;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'match') return b.final_score - a.final_score;
      if (sortBy === 'relevance') return b.semantic_relevance_score - a.semantic_relevance_score;
      if (sortBy === 'engagement') return b.engagement_quality_score - a.engagement_quality_score;
      if (sortBy === 'local') return b.local_content_relevance_score - a.local_content_relevance_score;
      return 0;
    });

    return list.slice(0, limit);
  }, [rawRecommendations, query, selectedTopic, selectedTier, selectedBudget, sortBy, limit]);

  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีผลการจับคู่ครีเอเตอร์ (No Recommendations Yet)"
        description="เริ่มการวิเคราะห์แบรนด์เพื่อค้นหาและจัดอันดับ TikTok ครีเอเตอร์ที่ตรงกลุ่มเป้าหมายผ่านโมเดล 5 มิติ"
        actionLabel="เริ่มวิเคราะห์แบรนด์ (Analyze Brand)"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<Award className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const brand = result.brand_profile;
  const allTopics = Array.from(
    new Set(rawRecommendations.flatMap((r) => r.matching_topics))
  );

  const freshnessOrder = ['fresh', 'aging', 'stale', 'unknown'];
  const poolFreshness = rawRecommendations.reduce<string>((worst, r) => {
    const f = (r.data_freshness || 'unknown').toLowerCase();
    return freshnessOrder.indexOf(f) > freshnessOrder.indexOf(worst) ? f : worst;
  }, 'fresh');
  const freshnessLabel: Record<string, { text: string; cls: string }> = {
    fresh: { text: 'สดใหม่ (< 6 ชม.)', cls: 'text-emerald-700' },
    aging: { text: 'ปานกลาง (6–18 ชม.)', cls: 'text-amber-700' },
    stale: { text: 'เก่า (> 18 ชม.)', cls: 'text-rose-700' },
    unknown: { text: 'ไม่ระบุ', cls: 'text-slate-500' },
  };
  const weightsLabel = `Semantic ${Math.round((weights.semantic_relevance / (weightsSum || 1)) * 100)}% · Engagement ${Math.round((weights.engagement_quality / (weightsSum || 1)) * 100)}% · Local ${Math.round((weights.local_content_relevance / (weightsSum || 1)) * 100)}% · Safety ${Math.round((weights.brand_safety / (weightsSum || 1)) * 100)}% · Data ${Math.round((weights.data_quality / (weightsSum || 1)) * 100)}%`;

  const topMatch = processedRecommendations[0];
  const remainingMatches = processedRecommendations.slice(1);

  // Copy summary
  const handleCopySummary = () => {
    const brandName = brand?.brand_name || 'Brand';
    const topRecs = processedRecommendations
      .map((r) => {
        const linkStatus = getProfileLinkStatus(r);
        const tiktokLine = linkStatus.isClickable
          ? `   TikTok: ${linkStatus.url}`
          : `   TikTok: Profile unavailable (${linkStatus.label})`;
        return `#${r.rank} ${r.display_name} (@${r.username}) — Match: ${r.final_score.toFixed(1)}/100\n${tiktokLine}\n   Reasons: ${r.reasons.join('; ')}`;
      })
      .join('\n\n');

    const summaryText = `🎯 ThaiKOL AI · Recommended Creators for ${brandName}\nProvenance: ${result.provenance || 'live'}\nScoring: ${weightsLabel}${isCustomWeights ? ' (custom)' : ''}\n\n${topRecs}`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      'rank', 'username', 'display_name', 'profile_url', 'profile_status', 'final_score',
      'semantic_relevance_score', 'engagement_quality_score',
      'local_content_relevance_score', 'brand_safety_score', 'data_quality_score',
    ];
    const rows = processedRecommendations.map((r) => {
      const linkStatus = getProfileLinkStatus(r);
      const urlCol = linkStatus.isClickable ? (r.profile_url ?? '') : 'Profile unavailable';
      return [
        r.rank, `"${r.username}"`, `"${r.display_name.replace(/"/g, '""')}"`,
        `"${urlCol}"`, `"${linkStatus.label}"`, r.final_score.toFixed(1),
        r.semantic_relevance_score.toFixed(1), r.engagement_quality_score.toFixed(1),
        r.local_content_relevance_score.toFixed(1), r.brand_safety_score.toFixed(0),
        r.data_quality_score.toFixed(1),
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thaikol_creators_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-thai">
      {/* ─── Top Section: Brand Context, Search Summary & Actions ─── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Recommended Creators
              </span>
              {result.provenance === 'live' || result.data_source === 'apify' ? (
                <span className="badge badge-safe text-xs font-semibold">
                  <Radio className="w-3 h-3" />
                  Live TikTok Discovery
                </span>
              ) : (
                <span className="badge badge-demo text-xs font-semibold">
                  ชุดทดสอบมาตรฐาน (Benchmark)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              อันดับครีเอเตอร์แนะนำสำหรับ {brand?.brand_name || 'Campaign'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              จัดอันดับด้วยโมเดลความเข้ากันได้ 5 มิติ อธิบายผลลัพธ์ได้โปร่งใสสำหรับตลาดไทย
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onGoToShortlist && Object.keys(shortlist).length > 0 && (
              <button
                onClick={onGoToShortlist}
                className="btn-secondary text-xs sm:text-sm px-3.5 py-2.5 gap-1.5 bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-bold min-h-[44px] cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Shortlist ({Object.keys(shortlist).length})</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              className="btn-secondary text-xs sm:text-sm px-3.5 py-2.5 gap-1.5 min-h-[44px] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกสรุป'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="btn-secondary text-xs sm:text-sm px-3.5 py-2.5 gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip: Candidate Pool, Search Topics, Freshness, Provider */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Candidate Pool
            </span>
            <div className="font-mono font-black text-slate-900 text-sm sm:text-base">
              {result.candidate_pool_count || rawRecommendations.length} ครีเอเตอร์
            </div>
            <span className="text-xs text-slate-500">รวบรวมจาก TikTok</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Search Topics
            </span>
            <div className="font-mono font-black text-slate-900 text-sm sm:text-base truncate">
              {result.search_queries?.length || 0} หัวข้อค้นหา
            </div>
            <span className="text-xs text-slate-500 truncate block">
              {result.search_queries?.[0] || 'Brand topics'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>ความสดใหม่ข้อมูล</span>
            </span>
            <div className={`font-bold text-xs sm:text-sm mt-0.5 ${freshnessLabel[poolFreshness]?.cls ?? 'text-slate-500'}`}>
              {freshnessLabel[poolFreshness]?.text ?? 'ไม่ระบุ'}
            </div>
            <span className="text-xs text-slate-500">สแนปช็อตในระบบ</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-0.5">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              แหล่งที่มาข้อมูล
            </span>
            <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">
              {result.data_source === 'apify' ? 'Apify Live Scraper' : 'ชุดทดสอบมาตรฐาน'}
            </div>
            <span className="text-xs text-slate-500">
              {result.provenance === 'live' ? 'Live TikTok API' : 'Benchmark Set'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Interactive Scoring Weight Tuner ─── */}
      <ScoringWeightsTuner weights={weights} onChange={setWeights} />
      {isCustomWeights && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-[#C93B07]">
          <span>
            กำลังใช้งานน้ำหนักคะแนนกำหนดเอง ({weightsLabel}) คำนวณอันดับใหม่ทันที
          </span>
          <button
            onClick={() => setWeights(DEFAULT_SCORING_WEIGHTS)}
            className="font-bold underline underline-offset-2 cursor-pointer shrink-0"
          >
            รีเซ็ตเป็นค่าเริ่มต้น
          </button>
        </div>
      )}

      {/* ─── Clean Filter & Sort Controls ───────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>เรียงตาม:</span>
          </span>
          {[
            { id: 'match' as SortField, label: 'คะแนนรวม (Match)' },
            { id: 'relevance' as SortField, label: 'ความตรงประเด็น' },
            { id: 'engagement' as SortField, label: 'Engagement' },
            { id: 'local' as SortField, label: 'บริบทไทย' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 min-h-[44px] ${
                sortBy === tab.id
                  ? 'bg-[#FF5A1F] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Topic Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="กรองชื่อหรือหัวข้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition min-h-[44px]"
            />
          </div>

          {/* Topic Dropdown */}
          {allTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#FF5A1F] cursor-pointer max-w-[150px] min-h-[44px] font-semibold"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {allTopics.map((t) => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          )}

          {/* Limit Toggle */}
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {([5, 10] as const).map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer min-h-[36px] ${
                  limit === n
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-bar: Follower Tier & Budget Filter Chips */}
        <div className="w-full pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Follower Tier Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>ขนาดผู้ติดตาม:</span>
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
                onClick={() => setSelectedTier(tier.id)}
                className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[32px] ${
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>เพดานงบ/คลิป:</span>
            </span>
            {[
              { id: 'all' as const, label: 'ทั้งหมด' },
              { id: '15k' as const, label: '≤ ฿15k' },
              { id: '35k' as const, label: '≤ ฿35k' },
              { id: '60k' as const, label: '≤ ฿60k' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBudget(b.id)}
                className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[32px] ${
                  selectedBudget === b.id
                    ? 'bg-[#FF5A1F] text-white shadow-2xs font-bold'
                    : 'bg-orange-50 text-orange-800 border border-orange-200/60 hover:bg-orange-100'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Featured Primary Match Card ────────────────────────────── */}
      {topMatch && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
              <span>อันดับ 1 ที่คะแนนสูงสุด (Highest Ranked Candidate)</span>
            </span>
          </div>
          <RecommendationFeature
            creator={topMatch}
            isCompared={comparisonList.includes(topMatch.username)}
            isShortlisted={Boolean(shortlist[topMatch.username])}
            onToggleCompare={() => onToggleCompare(topMatch.username)}
            onToggleShortlist={() => onToggleShortlist?.(topMatch)}
            onOpenDetail={() => onOpenCreatorDetail(topMatch)}
          />
        </div>
      )}

      {/* ─── Additional Ranked Matches ───────────────────────────────── */}
      {remainingMatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              อันดับครีเอเตอร์อื่นๆ ในระบบ ({remainingMatches.length} คน)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              เรียงตาม {sortBy === 'match' ? 'Match Score' : sortBy}
            </span>
          </div>

          <RecommendationList
            creators={remainingMatches}
            comparisonList={comparisonList}
            shortlist={shortlist}
            onToggleCompare={onToggleCompare}
            onToggleShortlist={onToggleShortlist}
            onOpenDetail={onOpenCreatorDetail}
          />
        </div>
      )}
    </div>
  );
};

export default RecommendationsView;
