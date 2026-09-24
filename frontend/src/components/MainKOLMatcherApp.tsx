import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles,
  Search,
  ExternalLink,
  Cpu,
  Flame,
  MapPin,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Copy,
  Download,
  Check,
  FileText,
  Layers,
  Info,
  Tag,
  RefreshCw,
  Terminal,
  Code,
  Globe,
  Share2,
  CheckCheck,
  Crown,
  Filter,
  X,
} from 'lucide-react';
import { TikTokProfileCTA, getProfileLinkStatus } from './kol/TikTokProfileCTA';

interface EvidenceItem {
  field: string;
  source: string;
  source_url?: string;
  text: string;
  nature: 'OBSERVED' | 'INFERRED' | 'ESTIMATED';
}

interface BrandProfile {
  brand_name: string;
  industry: string;
  products_services: string[];
  target_audience: string[];
  content_themes: string[];
  brand_tone: string[];
  keywords: string[];
  location_signals: string[];
  summary: string;
  confidence: number;
  evidence: EvidenceItem[];
  is_demo_fixture: boolean;
  provenance: string;
}

interface ScoreBreakdownItem {
  score: number;
  weight: number;
  weighted_contribution: number;
}

interface ScoreBreakdown {
  semantic_relevance: ScoreBreakdownItem;
  engagement_quality: ScoreBreakdownItem;
  local_content_relevance: ScoreBreakdownItem;
  brand_safety: ScoreBreakdownItem;
  data_quality: ScoreBreakdownItem;
  final_score: number;
}

interface KOLRecommendation {
  rank: number;
  username: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: string;
  final_score: number;
  semantic_relevance_score: number;
  engagement_quality_score: number;
  local_content_relevance_score: number;
  audience_fit_proxy?: number | null;
  brand_safety_score: number;
  brand_safety_risk_level: string;
  data_quality_score: number;
  score_breakdown: ScoreBreakdown;
  reasons: string[];
  cautions: string[];
  matching_topics: string[];
  data_source: string;
  collected_at: string;
  is_demo_fixture: boolean;
  provenance: string;
}

interface RecommendationResponse {
  status: string;
  recommendation_count: number;
  recommendations: KOLRecommendation[];
  weights_used: Record<string, number>;
  audience_data_note: string;
  brand_profile?: BrandProfile | null;
  search_queries?: string[];
  candidate_pool_count?: number | null;
  data_source?: string | null;
  provenance?: string | null;
}

interface DemoPreset {
  id: string;
  name: string;
  thaiName: string;
  icon: string;
  category: string;
  websiteUrl: string;
  facebookUrl: string;
  badge: string;
  colorClass: string;
  borderClass: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'khaokho',
    name: 'Khaokho Talaypu',
    thaiName: 'เขาค้อทะเลภู',
    icon: '🌿',
    category: 'แชมพูสมุนไพร & สกินแคร์ธรรมชาติ',
    websiteUrl: 'https://khaokhotalaypu.com',
    facebookUrl: 'https://facebook.com/KhaokhoTalaypu',
    badge: 'Benchmark Fixture',
    colorClass: 'bg-emerald-50 text-emerald-950',
    borderClass: 'border-emerald-300 hover:border-emerald-500',
  },
  {
    id: 'smooth-e',
    name: 'Smooth E',
    thaiName: 'สมูทอี ประเทศไทย',
    icon: '💧',
    category: 'เวชสำอาง สกินแคร์ลดสิวผิวแพ้ง่าย',
    websiteUrl: 'https://smooth-e.com',
    facebookUrl: 'https://facebook.com/SmoothEThailand',
    badge: 'Dermocosmetics',
    colorClass: 'bg-cyan-50 text-cyan-950',
    borderClass: 'border-cyan-300 hover:border-cyan-500',
  },
  {
    id: 'chatramue',
    name: 'ChaTraMue',
    thaiName: 'ชาตรามือ',
    icon: '🧋',
    category: 'ชาไทย ชานมไข่มุก & สินค้า F&B',
    websiteUrl: 'https://chatramue.com',
    facebookUrl: 'https://facebook.com/ChaTraMue',
    badge: 'Thai F&B',
    colorClass: 'bg-amber-50 text-amber-950',
    borderClass: 'border-amber-300 hover:border-amber-500',
  },
];

const PIPELINE_STAGES = [
  { id: 1, title: '1. วิเคราะห์เว็บไซต์', sub: 'Website Structure & Meta' },
  { id: 2, title: '2. ตรวจสอบ Facebook', sub: 'Public Page Cues' },
  { id: 3, title: '3. สังเคราะห์แบรนด์', sub: 'BrandProfile Corpus' },
  { id: 4, title: '4. ค้นหาครีเอเตอร์', sub: 'Candidate Ingestion' },
  { id: 5, title: '5. คำนวณเวกเตอร์ AI', sub: 'MiniLM-L12 Vectors' },
  { id: 6, title: '6. ประเมินคะแนน 5 มิติ', sub: 'Multi-Factor Scoring' },
  { id: 7, title: '7. สรุปคำอธิบายโปร่งใส', sub: 'Explainable Ranking' },
];

export const MainKOLMatcherApp: React.FC = () => {
  // Input State
  const [websiteUrl, setWebsiteUrl] = useState('https://khaokhotalaypu.com');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/KhaokhoTalaypu');
  const [limit, setLimit] = useState<5 | 10>(5);
  const [activePresetId, setActivePresetId] = useState<string>('khaokho');

  // Execution State
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedKols, setExpandedKols] = useState<Record<string, boolean>>({});
  const [showEvidence, setShowEvidence] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Filter State
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [safetyFilter, setSafetyFilter] = useState<'all' | 'safe' | 'review'>('all');

  // Staged progress timer during execution
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (loading) {
      setCurrentStage(0);
      interval = setInterval(() => {
        setCurrentStage((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
      }, 650);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const toggleExpand = (username: string) => {
    setExpandedKols((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const handleRunMatcher = async (webOverride?: string, fbOverride?: string) => {
    const web = (webOverride !== undefined ? webOverride : websiteUrl).trim();
    const fb = (fbOverride !== undefined ? fbOverride : facebookUrl).trim();

    if (!web && !fb) {
      setError('กรุณาระบุ URL ของเว็บไซต์ หรือ Facebook Public Page อย่างน้อยหนึ่งช่องทาง');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await axios.post<RecommendationResponse>('/api/v1/matching/recommend-from-brand', {
        website_url: web || undefined,
        facebook_page_url: fb || undefined,
        limit: 10, // Fetch 10 so toggle between Top 5 and Top 10 is instant
      });

      setResult(res.data);
      // Automatically expand #1 top recommendation
      if (res.data.recommendations.length > 0) {
        setExpandedKols({ [res.data.recommendations[0].username]: true });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errMsg = 'ไม่สามารถประมวลผลการแนะนำครีเอเตอร์ได้ กรุณาตรวจสอบ URL อีกครั้ง';
      if (typeof detail === 'object' && detail !== null) {
        errMsg = detail.message || JSON.stringify(detail);
      } else if (typeof detail === 'string') {
        errMsg = detail;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setWebsiteUrl(preset.websiteUrl);
    setFacebookUrl(preset.facebookUrl);
    handleRunMatcher(preset.websiteUrl, preset.facebookUrl);
  };

  // Collect unique topics across recommendations for the filter dropdown
  const allTopics = Array.from(
    new Set(result?.recommendations.flatMap((r) => r.matching_topics) || [])
  );

  // Filter recommendations based on active filters
  const filteredRecs = (result?.recommendations || [])
    .filter((r) => r.final_score >= minScore)
    .filter((r) => (selectedTopic === 'all' ? true : r.matching_topics.includes(selectedTopic)))
    .filter((r) => {
      if (safetyFilter === 'safe') return r.brand_safety_risk_level === 'safe';
      if (safetyFilter === 'review') return r.brand_safety_risk_level === 'review';
      return true;
    })
    .slice(0, limit);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!result) return;
    const brandName = result.brand_profile?.brand_name || 'Brand';
    const topRecs = filteredRecs
      .slice(0, 5)
      .map((r) => {
        const linkStatus = getProfileLinkStatus(r);
        const tiktokLine = linkStatus.isClickable
          ? `   TikTok: ${linkStatus.url}`
          : `   TikTok: Profile unavailable (${linkStatus.label})`;
        return `#${r.rank} ${r.display_name} (@${r.username}) — Final Score: ${r.final_score.toFixed(
          1
        )}/100\n${tiktokLine}\n   เหตุผล: ${r.reasons.join('; ')}`;
      })
      .join('\n\n');

    const summaryText = `🎯 ThaiKOL AI Recommendation Summary for ${brandName}\nProvenance: ${result?.provenance || 'curated_demo_fixture'}\nWeights: Semantic 45% · Engagement 25% · Local Fit 15% · Safety 10% · Data 5%\n\n${topRecs}\n\n* ข้อมูล Audience Fit Proxy เป็นสัญญาณเสริมจากเนื้อหาสาธารณะ ไม่ใช่ข้อมูล Demographics เชิงลึกของผู้ติดตาม. บัญชีใน Demo Mode เป็น Fixture สังเคราะห์`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!result || filteredRecs.length === 0) return;
    const headers = [
      'rank',
      'username',
      'display_name',
      'profile_url',
      'profile_status',
      'final_score',
      'semantic_relevance_score',
      'engagement_quality_score',
      'local_content_relevance_score',
      'brand_safety_score',
      'data_quality_score',
    ];

    const rows = filteredRecs.map((r) => {
      const linkStatus = getProfileLinkStatus(r);
      const urlCol = linkStatus.isClickable ? (r.profile_url ?? '') : 'Profile unavailable';
      return [
        r.rank,
        `"${r.username}"`,
        `"${r.display_name.replace(/"/g, '""')}"`,
        `"${urlCol}"`,
        `"${linkStatus.label}"`,
        r.final_score.toFixed(1),
        r.semantic_relevance_score.toFixed(1),
        r.engagement_quality_score.toFixed(1),
        r.local_content_relevance_score.toFixed(1),
        r.brand_safety_score.toFixed(0),
        r.data_quality_score.toFixed(1),
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thaikol_recommendations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* ========================================================================= */}
      {/* STEP 1: BUSINESS INPUT & BRAND DISCOVERY CARD (BRIGHT & CHEERFUL) */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden bg-white/95">
        {/* Colorful corner light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 shadow-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>ขั้นตอนที่ 1 — ระบุช่องทางแบรนด์ (Step 1: Business Input)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ค้นหาและจับคู่ครีเอเตอร์ TikTok สำหรับแบรนด์ของคุณ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              ระบุ URL เว็บไซต์ หรือ Facebook Page ของธุรกิจ ระบบจะดึงอัตลักษณ์แบรนด์และค้นหาครีเอเตอร์ที่เหมาะสมที่สุด
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">
              คลิกเพื่อทดสอบทันที:
            </span>
          </div>
        </div>

        {/* Quick Demo Presets Selector */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>เลือกแบรนด์ตัวอย่างเพื่อทดสอบในคลิกเดียว (Quick Demo Presets)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              คลิก 1 ครั้ง เพื่อโหลดและคำนวณอัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={loading}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 group cursor-pointer ${
                    preset.colorClass
                  } ${
                    isSelected
                      ? 'border-indigo-600 shadow-md shadow-indigo-500/15 ring-2 ring-indigo-500/20 scale-[1.01]'
                      : `${preset.borderClass} shadow-xs hover:shadow-md`
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">
                    {preset.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-xs text-slate-900 truncate">
                        {preset.thaiName}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/80 font-bold text-slate-700 shadow-2xs">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-1 font-medium">
                      {preset.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>URL เว็บไซต์ธุรกิจ (Business Website URL)</span>
              </span>
              {websiteUrl && (
                <button
                  type="button"
                  onClick={() => setWebsiteUrl('')}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
                >
                  ล้างค่า
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setActivePresetId('');
                }}
                placeholder="https://yourbrand.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-xs placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>URL Facebook Page สาธารณะ (Public Facebook Page)</span>
              </span>
              {facebookUrl && (
                <button
                  type="button"
                  onClick={() => setFacebookUrl('')}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
                >
                  ล้างค่า
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => {
                  setFacebookUrl(e.target.value);
                  setActivePresetId('');
                }}
                placeholder="https://facebook.com/yourbrand"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-xs placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          <div className="flex items-center gap-3 text-xs text-slate-700">
            <span className="font-bold text-slate-700">จำนวนครีเอเตอร์ที่ต้องการ:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setLimit(5)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  limit === 5
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top 5
              </button>
              <button
                type="button"
                onClick={() => setLimit(10)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  limit === 10
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top 10
              </button>
            </div>
          </div>

          <button
            onClick={() => handleRunMatcher()}
            disabled={loading}
            className="btn-vibrant-primary px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-rose-500/25 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>กำลังประมวลผล AI Pipeline (Stage {currentStage + 1}/7)...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>ค้นหาและจับคู่ TikTok KOLs (Run Matcher)</span>
              </>
            )}
          </button>
        </div>

        {/* Error Notice State */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 animate-fade-in shadow-xs">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-rose-900">แจ้งเตือนข้อผิดพลาด:</div>
              <div className="font-medium">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* STEP 2: PIPELINE STAGES PROGRESS VISUALIZER (BRIGHT & VIBRANT) */}
      {/* ========================================================================= */}
      {loading && (
        <section className="glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-200 bg-white/95 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>กำลังดำเนินการผ่าน 7-Stage End-to-End AI Matcher Pipeline</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  สกัดอัตลักษณ์แบรนด์ → สร้างคำค้นหา → ดึงครีเอเตอร์ → แปลงเวกเตอร์ MiniLM → คำนวณคะแนน 5 มิติ
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 shadow-2xs">
              ขั้นตอนที่ {currentStage + 1} / {PIPELINE_STAGES.length}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isDone = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isCurrent
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-md shadow-indigo-500/10 scale-[1.02] ring-2 ring-indigo-400/20'
                      : 'bg-slate-50 border-slate-200/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isDone ? (
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{stage.id}</span>
                    )}
                  </div>
                  <div className="text-[11px] font-black truncate leading-tight">{stage.title}</div>
                  <div className="text-[9px] text-slate-500 truncate opacity-90 mt-0.5 font-medium">{stage.sub}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* RESULTS WORKFLOW (BRIGHT & VIBRANT) */}
      {/* ========================================================================= */}
      {result && (
        <>
          {/* STEP 3: BRAND PROFILE & SEMANTIC ANALYSIS CARD */}
          {result.brand_profile && (
            <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 bg-white/95">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ขั้นตอนที่ 2 — ผลการวิเคราะห์อัตลักษณ์แบรนด์ (Brand Analysis)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex flex-wrap items-center gap-2.5">
                    <span>{result.brand_profile.brand_name}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                      {result.brand_profile.industry}
                    </span>
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-black flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>AI Confidence: {(result.brand_profile.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <button
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>หลักฐานสาธารณะ ({result.brand_profile.evidence.length})</span>
                    {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 4-Column Attribute Cards (Vibrant Pastel) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Products */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 shadow-xs">
                  <span className="font-black text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <span>🛍️ สินค้าและบริการหลัก</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.brand_profile.products_services.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-emerald-950 font-bold border border-emerald-200 shadow-2xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Target Audience */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2 shadow-xs">
                  <span className="font-black text-purple-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <span>🎯 กลุ่มเป้าหมาย</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.brand_profile.target_audience.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-purple-950 border border-purple-200 font-bold shadow-2xs">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Themes & Tone */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2 shadow-xs">
                  <span className="font-black text-rose-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <span>✨ ธีมและโทนคอนเทนต์</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.brand_profile.content_themes.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-rose-950 border border-rose-200 font-bold shadow-2xs">
                        {t}
                      </span>
                    ))}
                    {result.brand_profile.brand_tone.map((tone, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200 font-medium shadow-2xs">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Location Signals */}
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-2 shadow-xs">
                  <span className="font-black text-cyan-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <span>📍 สัญญาณสถานที่ในไทย</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.brand_profile.location_signals.length > 0 ? (
                      result.brand_profile.location_signals.map((loc, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-cyan-950 border border-cyan-200 font-bold shadow-2xs">
                          {loc}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 font-bold">ทั่วประเทศไทย (Nationwide Thailand)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 italic line-clamp-2 pt-1 font-medium">
                    "{result.brand_profile.summary}"
                  </p>
                </div>
              </div>

              {/* Expandable Evidence Snippets Audit Trail */}
              {showEvidence && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-fade-in text-xs shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-black text-slate-900 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>หลักฐานสาธารณะที่สกัดได้ (Extracted Public Evidence Snippets)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      จำแนกความน่าเชื่อถือ: <strong className="text-emerald-700 font-bold">OBSERVED</strong> (ข้อเท็จจริงตรง) vs <strong className="text-purple-700 font-bold">INFERRED</strong> (การวิเคราะห์สังเคราะห์)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {result.brand_profile.evidence.map((ev, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-500 uppercase font-black">{ev.field}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                              ev.nature === 'OBSERVED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : ev.nature === 'INFERRED'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {ev.nature}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed font-medium">"{ev.text}"</p>
                        <div className="text-[10px] text-slate-500 truncate pt-0.5">
                          ที่มา: {ev.source} {ev.source_url ? `(${ev.source_url})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STEP 4: TIKTOK CANDIDATE DISCOVERY SUMMARY */}
          <section className="glass-panel rounded-3xl p-6 border border-slate-200/90 space-y-4 bg-white/95 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs mb-1">
                  <Search className="w-3.5 h-3.5 text-rose-500" />
                  <span>ขั้นตอนที่ 3 — คลังครีเอเตอร์และคำค้นหา (Step 3: Candidate Pool & Queries)</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  คำค้นหา TikTok อัตโนมัติ & ข้อมูลคลังผู้สมัคร
                </h3>
              </div>

              {/* Data Source Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black border flex items-center gap-2 shadow-2xs ${
                    result.data_source === 'demo_fixture' || result.brand_profile?.is_demo_fixture
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>
                    {result.data_source === 'demo_fixture' || result.brand_profile?.is_demo_fixture
                      ? 'DEMO DATA — Curated Benchmark Fixture'
                      : 'LIVE DATA — Public TikTok Snapshot'}
                  </span>
                </span>
              </div>
            </div>

            {/* Generated Search Query Chips */}
            {result.search_queries && result.search_queries.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-600">
                  คำค้นหาบน TikTok ที่สร้างจากอัตลักษณ์แบรนด์โดยอัตโนมัติ:
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {result.search_queries.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5 hover:border-indigo-400 transition shadow-2xs"
                    >
                      <Tag className="w-3.5 h-3.5 text-rose-500" />
                      <span>#{q}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
              <div>
                พบครีเอเตอร์ในคลังผู้สมัครที่เกี่ยวข้องทั้งหมด{' '}
                <strong className="text-slate-900 text-sm font-black">
                  {result.candidate_pool_count || result.recommendation_count} คน
                </strong>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                * ระบบประเมินจาก Candidate Pool ที่พบตามข้อกำหนด และไม่นับรวมบัญชีที่ไม่มีสัญญาณความเกี่ยวข้อง
              </div>
            </div>
          </section>

          {/* STEP 5: RANKED RECOMMENDATIONS & EXPLAINABILITY */}
          <section className="space-y-6">
            {/* Header & Filter Controls Bar */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/95 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ขั้นตอนที่ 4 — จัดอันดับและอธิบายผล (Step 4: Ranked Recommendations)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ครีเอเตอร์ที่ได้รับการแนะนำสูงสุด ({filteredRecs.length} อันดับ)
                </h3>
              </div>

              {/* Filter Controls & Export Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Min Score Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value={0}>ทุกระดับคะแนน (All)</option>
                    <option value={75}>คะแนนขั้นต่ำ 75+</option>
                    <option value={80}>คะแนนขั้นต่ำ 80+</option>
                    <option value={85}>คะแนนขั้นต่ำ 85+</option>
                  </select>
                </div>

                {/* Topic Filter */}
                {allTopics.length > 0 && (
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer max-w-[140px] truncate"
                    >
                      <option value="all">ทุกหัวข้อเนื้อหา</option>
                      {allTopics.map((t) => (
                        <option key={t} value={t}>
                          #{t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Safety Filter */}
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
                  <select
                    value={safetyFilter}
                    onChange={(e) => setSafetyFilter(e.target.value as any)}
                    className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">ความปลอดภัยทุกระดับ</option>
                    <option value="safe">ปลอดภัยเต็ม 100 (Safe)</option>
                    <option value="review">ควรตรวจสอบก่อนร่วมงาน</option>
                  </select>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    onClick={handleCopySummary}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="คัดลอกสรุปผลการแนะนำไปยังคลิปบอร์ด"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>คัดลอกสรุป</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations List Cards */}
            {filteredRecs.length === 0 ? (
              <div className="p-12 text-center glass-panel rounded-3xl border border-slate-200 text-slate-500 text-sm space-y-2 bg-white/90">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-black text-slate-800">ไม่พบคู่ครีเอเตอร์ที่ตรงตามเงื่อนไขตัวกรอง</p>
                <p className="text-xs text-slate-500">ลองปรับลดคะแนนขั้นต่ำ หรือเลือกหัวข้อเนื้อหาทั้งหมด</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredRecs.map((rec) => {
                  const isExpanded = !!expandedKols[rec.username];
                  const isTopRank = rec.rank === 1;

                  return (
                    <article
                      key={rec.username}
                      className={`rounded-3xl transition-all duration-300 overflow-hidden ${
                        isTopRank
                          ? 'vip-card-glow'
                          : 'bg-white border border-slate-200/90 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Rank Champion Banner (Festive Gold) */}
                      {isTopRank && (
                        <div className="bg-gradient-to-r from-amber-400/30 via-amber-300/40 to-emerald-400/30 px-6 py-2.5 border-b border-amber-300/80 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span>👑 อันดับที่ 1 — ครีเอเตอร์ที่เหมาะสมกับแบรนด์มากที่สุด (Best Overall Match)</span>
                          </div>
                          <span className="text-[11px] font-mono font-black text-emerald-800 bg-white/90 px-3 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                            Top Recommendation
                          </span>
                        </div>
                      )}

                      {/* Main Card Content */}
                      <div className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left: Rank, Avatar & Creator Metadata */}
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                              isTopRank
                                ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-emerald-400 text-white shadow-md shadow-amber-500/30'
                                : rec.rank <= 3
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            #{rec.rank}
                          </div>

                          {/* Avatar Circle with TikTok Ring */}
                          <div className="tiktok-avatar-ring rounded-2xl shrink-0">
                            <div className="w-12 h-12 rounded-[13px] bg-white flex items-center justify-center font-black text-slate-900 text-base shadow-inner">
                              {rec.display_name.charAt(0)}
                            </div>
                          </div>

                          {/* Titles & Handle */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-slate-900 text-lg leading-snug">
                                {rec.display_name}
                              </h4>
                              {(() => {
                                const linkStatus = getProfileLinkStatus(rec);
                                if (linkStatus.isClickable && linkStatus.url) {
                                  return (
                                    <a
                                      href={linkStatus.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-black text-rose-600 hover:text-rose-700 transition"
                                    >
                                      <span>@{rec.username}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  );
                                }
                                return (
                                  <span className="text-xs text-slate-400 font-mono inline-flex items-center gap-1">
                                    @{rec.username}
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                      Profile unavailable
                                    </span>
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Component Score Pills */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1 font-medium">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Cpu className="w-3 h-3 text-emerald-600" />
                                <span>Semantic: <strong className="font-black text-emerald-900">{rec.semantic_relevance_score.toFixed(1)}</strong></span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                                <Flame className="w-3 h-3 text-amber-600" />
                                <span>Engagement: <strong className="font-black text-amber-900">{rec.engagement_quality_score.toFixed(1)}</strong></span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
                                <MapPin className="w-3 h-3 text-cyan-600" />
                                <span>Local: <strong className="font-black text-cyan-900">{rec.local_content_relevance_score.toFixed(1)}</strong></span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>Safety: <strong className="font-black text-blue-900">{rec.brand_safety_score.toFixed(0)}</strong></span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Final Score & Action Buttons */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/80">
                          {/* Final Score Gauge */}
                          <div className="text-right">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600 leading-none">
                              {rec.final_score.toFixed(1)}
                              <span className="text-xs text-slate-500 font-bold ml-1">/100</span>
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-black mt-1">
                              คะแนนรวม (Final Score)
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5">
                            <TikTokProfileCTA creator={rec} variant="inline" />

                            <button
                              onClick={() => toggleExpand(rec.username)}
                              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>เหตุผลที่แนะนำ</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable "Why this KOL?" Breakdown Section */}
                      {isExpanded && (
                        <div className="p-6 sm:p-7 bg-slate-50/90 border-t border-slate-200 space-y-6 text-xs animate-fade-in shadow-inner">
                          {/* 1. Visual Score Breakdown with Colorful Mini Progress Bars */}
                          <div className="space-y-3">
                            <div className="font-black text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-700">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                <span>แจกแจงคะแนน 5 องค์ประกอบ (Multi-Factor Breakdown)</span>
                              </span>
                              <span className="text-[11px] font-mono text-slate-600 font-bold">
                                สูตรคณิตศาสตร์: 45% Semantic + 25% Engagement + 15% Local + 10% Safety + 5% Data
                              </span>
                            </div>

                            {/* 5-Column Progress Meters */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              {/* Factor 1: Semantic Relevance */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-bold">Semantic (45%)</span>
                                  <span className="font-black text-slate-900">
                                    {rec.score_breakdown.semantic_relevance.score.toFixed(1)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, rec.score_breakdown.semantic_relevance.score)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-emerald-700 font-mono font-black text-right">
                                  +{rec.score_breakdown.semantic_relevance.weighted_contribution.toFixed(2)} pts
                                </div>
                              </div>

                              {/* Factor 2: Engagement Quality */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-bold">Engagement (25%)</span>
                                  <span className="font-black text-slate-900">
                                    {rec.score_breakdown.engagement_quality.score.toFixed(1)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, rec.score_breakdown.engagement_quality.score)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-amber-700 font-mono font-black text-right">
                                  +{rec.score_breakdown.engagement_quality.weighted_contribution.toFixed(2)} pts
                                </div>
                              </div>

                              {/* Factor 3: Local Content Fit */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-bold">Local Fit (15%)</span>
                                  <span className="font-black text-slate-900">
                                    {rec.score_breakdown.local_content_relevance.score.toFixed(1)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, rec.score_breakdown.local_content_relevance.score)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-cyan-700 font-mono font-black text-right">
                                  +{rec.score_breakdown.local_content_relevance.weighted_contribution.toFixed(2)} pts
                                </div>
                              </div>

                              {/* Factor 4: Brand Safety */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-bold">Brand Safety (10%)</span>
                                  <span className="font-black text-slate-900">
                                    {rec.score_breakdown.brand_safety.score.toFixed(0)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, rec.score_breakdown.brand_safety.score)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-blue-700 font-mono font-black text-right">
                                  +{rec.score_breakdown.brand_safety.weighted_contribution.toFixed(2)} pts
                                </div>
                              </div>

                              {/* Factor 5: Data Quality */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-bold">Data Quality (5%)</span>
                                  <span className="font-black text-slate-900">
                                    {rec.score_breakdown.data_quality.score.toFixed(1)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, rec.score_breakdown.data_quality.score)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-purple-700 font-mono font-black text-right">
                                  +{rec.score_breakdown.data_quality.weighted_contribution.toFixed(2)} pts
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Rationale & Cautions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Rationale Cards (Mint) */}
                            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2.5 shadow-xs">
                              <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>เหตุผลที่ AI แนะนำครีเอเตอร์ท่านนี้ (Recommendation Rationale):</span>
                              </div>
                              <ul className="space-y-1.5">
                                {rec.reasons.map((r, i) => (
                                  <li key={i} className="text-emerald-950 text-xs flex items-start gap-2 font-medium">
                                    <span className="text-emerald-600 font-black">•</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Caution Cards (Amber) */}
                            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2.5 shadow-xs">
                              <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span>ข้อควรระวังก่อนร่วมงานแคมเปญ (Campaign Review Flags):</span>
                              </div>
                              {rec.cautions.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {rec.cautions.map((c, i) => (
                                    <li key={i} className="text-amber-950 text-xs flex items-start gap-2 font-medium">
                                      <span className="text-amber-600 font-black">•</span>
                                      <span>{c}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-emerald-800 text-xs flex items-center gap-2 font-medium">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>ไม่พบความเสี่ยงหรือข้อควรระวังด้านความปลอดภัยสำหรับครีเอเตอร์ท่านนี้</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 3. Overlapping Topics & Audience Fit Proxy */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                หัวข้อคอนเทนต์ที่ตรงกัน (Matching Topics):
                              </span>
                              {rec.matching_topics.length > 0 ? (
                                rec.matching_topics.map((top) => (
                                  <span
                                    key={top}
                                    className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shadow-2xs"
                                  >
                                    <Tag className="w-3 h-3 text-emerald-600" />
                                    <span>#{top}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs">ไม่พบคำสำคัญซ้ำโดยตรง (ใช้คะแนนเวกเตอร์ MiniLM)</span>
                              )}
                            </div>

                            {/* Audience Fit Proxy Card */}
                            {rec.audience_fit_proxy !== null && rec.audience_fit_proxy !== undefined && (
                              <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                <span className="font-bold text-slate-700">Audience Fit Proxy:</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono font-black">
                                  {rec.audience_fit_proxy.toFixed(1)}/100
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Disclaimer Notice */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5 shadow-2xs">
                            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>หมายเหตุเรื่อง Audience Fit Proxy:</strong> เป็นค่าสัญญาณสนับสนุนเชิงเนื้อหาจากข้อมูลสาธารณะ (Content-level proxy) ไม่ใช่ข้อมูลประชากรศาสตร์ (Demographics) ของผู้ติดตามจริง และไม่ได้นำมาคิดในคะแนน Final Score โดยตรง
                            </span>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: HOW IT WORKS & SYSTEM ARCHITECTURE (BRIGHT) */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-6 bg-white/95 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>การทำงานเบื้องหลังของ ThaiKOL AI (End-to-End Workflow)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              กระบวนการทำงานตั้งแต่สกัดข้อมูลดิจิทัล จนถึงการแนะนำครีเอเตอร์ที่โปร่งใสและปลอดภัย
            </p>
          </div>

          <button
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black border border-slate-200 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>สถาปัตยกรรมทางเทคนิค (Technical Architecture)</span>
            {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 6-Step Workflow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-indigo-600 font-black uppercase">1. ข้อมูลธุรกิจ</div>
            <div className="font-black text-slate-900 mt-1">Website + FB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Public URLs</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-indigo-600 font-black uppercase">2. สกัดอัตลักษณ์</div>
            <div className="font-black text-slate-900 mt-1">Brand Corpus</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Evidence tracking</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-indigo-600 font-black uppercase">3. ค้นหาครีเอเตอร์</div>
            <div className="font-black text-slate-900 mt-1">TikTok Ingestion</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Thai keywords & ER</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-indigo-600 font-black uppercase">4. AI เวกเตอร์</div>
            <div className="font-black text-slate-900 mt-1">MiniLM Vectors</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Semantic Match</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-indigo-600 font-black uppercase">5. ให้คะแนน 5 มิติ</div>
            <div className="font-black text-slate-900 mt-1">5-Factor Scoring</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Linear Composite</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1 shadow-2xs">
            <div className="text-[10px] text-emerald-700 font-black uppercase">6. ผลการแนะนำ</div>
            <div className="font-black text-emerald-950 mt-1">Ranked Output</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">TikTok profile links</div>
          </div>
        </div>

        {/* Expandable Technical Details */}
        {showTechDetails && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-fade-in shadow-inner">
            <div className="font-black text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>สถาปัตยกรรมทางวิศวกรรมและ Production Stack</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="font-black text-slate-900">Backend Core & REST API</span>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  FastAPI (Python 3.12+), Pydantic v2 strict schemas, SQLAlchemy 2.0 ORM, และ Alembic migrations สถาปัตยกรรมแยก Provider สำหรับ Website, Facebook, TikTok, Embeddings, และ Multi-Factor Scoring
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="font-black text-slate-900">AI & Multilingual Embeddings</span>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Local <code>sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2</code> (384-dimensional dense vectors) พร้อมระบบ Caching เวกเตอร์ และทำงานแบบ Offline ได้โดยไม่ต้องพึ่งพา External API
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="font-black text-slate-900">Frontend & Infrastructure</span>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  React 18 + TypeScript + Vite + Tailwind CSS พร้อม Docker Compose (FastAPI backend + PostgreSQL 16 + Vite frontend) และระบบสำรอง <code>DEMO_MODE=true</code> เพื่อความเสถียร 100%
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MainKOLMatcherApp;
