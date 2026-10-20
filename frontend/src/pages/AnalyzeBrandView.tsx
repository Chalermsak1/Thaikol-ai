import React, { useState } from 'react';
import { RecommendationResponse, DemoPreset, ActiveNavPage } from '../types';
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Facebook,
  ShieldCheck,
  Zap,
  Target,
  Sliders,
  Award,
  Layers,
  Users,
  Tag,
  Compass,
  FileText,
  MapPin,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { LoadingPipeline } from '../components/common/LoadingPipeline';
import { ErrorState } from '../components/common/ErrorState';

const DEMO_PRESETS: (DemoPreset & { initial: string })[] = [
  {
    id: 'khaokho',
    name: 'Khaokho Talaypu',
    thaiName: 'เขาค้อทะเลภู',
    category: 'Herbal Personal Care & Hair Care',
    websiteUrl: 'https://khaokhotalaypu.com',
    facebookUrl: 'https://facebook.com/KhaokhoTalaypu',
    tag: 'Curated Benchmark',
    initial: 'KT',
  },
  {
    id: 'smooth-e',
    name: 'Smooth E',
    thaiName: 'สมูทอี',
    category: 'Dermocosmetics & Sensitive Skincare',
    websiteUrl: 'https://smooth-e.com',
    facebookUrl: 'https://facebook.com/SmoothEThailand',
    tag: 'Skincare',
    initial: 'SE',
  },
  {
    id: 'chatramue',
    name: 'ChaTraMue',
    thaiName: 'ชาตรามือ',
    category: 'Thai Tea & Traditional F&B',
    websiteUrl: 'https://chatramue.com',
    facebookUrl: 'https://facebook.com/ChaTraMue',
    tag: 'F&B',
    initial: 'CT',
  },
];

interface AnalyzeBrandViewProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  onAnalyze: (web?: string, fb?: string) => void;
  isLoading: boolean;
  pipelineStage: number;
  elapsedSeconds?: number;
  isLive?: boolean;
  result: RecommendationResponse | null;
  error: string | null;
  onSelectPage: (page: ActiveNavPage) => void;
  onOpenEvidence?: () => void;
  onSearchKOL?: (query: string) => void;
}

type ResultTab = 'overview' | 'audience' | 'topics' | 'evidence';

export const AnalyzeBrandView: React.FC<AnalyzeBrandViewProps> = ({
  websiteUrl,
  setWebsiteUrl,
  facebookUrl,
  setFacebookUrl,
  onAnalyze,
  isLoading,
  pipelineStage,
  elapsedSeconds = 0,
  isLive = false,
  result,
  error,
  onSelectPage,
  onOpenEvidence,
  onSearchKOL,
}) => {
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  const handlePresetSelect = (preset: DemoPreset) => {
    setWebsiteUrl(preset.websiteUrl);
    setFacebookUrl(preset.facebookUrl);
    onAnalyze(preset.websiteUrl, preset.facebookUrl);
  };

  const brand = result?.brand_profile;
  const topMatch = result?.recommendations?.[0];
  const confidencePct = Math.round((brand?.confidence ?? 0) * 100);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ─── Header Banner ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5A1F] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>เครื่องมือวิเคราะห์อัตลักษณ์แบรนด์ (Brand Intelligence)</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
          วิเคราะห์แบรนด์ & แมตช์ TikTok KOL
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-thai">
          นำเข้า URL เว็บไซต์และเพจ Facebook สาธารณะของแบรนด์ เพื่อถอดรหัสกลุ่มเป้าหมาย สไตล์เนื้อหา
          และค้นหาครีเอเตอร์ที่เหมาะสมกับแคมเปญ
        </p>
      </div>

      {/* ─── Analysis Input Form Card ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 space-y-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>ข้อมูลแบรนด์สำหรับวิเคราะห์</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบุ URL เว็บไซต์ หรือเพจ Facebook สาธารณะอย่างน้อย 1 ช่องทาง
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePresetSelect(DEMO_PRESETS[0])}
            disabled={isLoading}
            className="btn-secondary text-xs gap-1.5 self-start sm:self-auto cursor-pointer min-h-[38px] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>ตัวอย่าง: เขาค้อทะเลภู</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Website Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-orange-50 text-[#FF5A1F] flex items-center justify-center">
                  <Globe className="w-3 h-3" />
                </div>
                <span>เว็บไซต์ทางการ (Website URL)</span>
              </label>
              <span className="text-xs text-slate-400">e-Commerce, Homepage, Catalog</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://brand-example.com"
                disabled={isLoading}
                className="w-full text-xs sm:text-sm pl-3.5 pr-16 py-3 rounded-2xl border border-slate-200/90 min-h-[46px] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5A1F] transition-all shadow-2xs"
              />
              {websiteUrl && (
                <button
                  type="button"
                  onClick={() => setWebsiteUrl('')}
                  disabled={isLoading}
                  className="absolute right-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded cursor-pointer min-h-[36px] flex items-center"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Facebook Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Facebook className="w-3 h-3" />
                </div>
                <span>เพจ Facebook สาธารณะ (Facebook Page URL)</span>
              </label>
              <span className="text-xs text-slate-400">Official Page URL</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/brandpage"
                disabled={isLoading}
                className="w-full text-xs sm:text-sm pl-3.5 pr-16 py-3 rounded-2xl border border-slate-200/90 min-h-[46px] bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5A1F] transition-all shadow-2xs"
              />
              {facebookUrl && (
                <button
                  type="button"
                  onClick={() => setFacebookUrl('')}
                  disabled={isLoading}
                  className="absolute right-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded cursor-pointer min-h-[36px] flex items-center"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || (!websiteUrl && !facebookUrl)}
              className="w-full sm:w-auto btn-orange px-8 py-3 text-xs sm:text-sm justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 min-h-[46px] shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังวิเคราะห์สัญญาณแบรนด์...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>เริ่มวิเคราะห์แบรนด์</span>
                  <ArrowRight className="w-4 h-4 text-white/90" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect(DEMO_PRESETS[0])}
              disabled={isLoading}
              className="w-full sm:w-auto btn-secondary px-5 py-3 text-xs sm:text-sm justify-center gap-1.5 cursor-pointer min-h-[46px] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>ทดสอบด้วย เขาค้อทะเลภู (Khaokho)</span>
            </button>
          </div>
        </form>

        {/* Demo Benchmarks Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ชุดทดสอบแบรนด์ตัวอย่าง (Curated Benchmark Presets)
            </div>
            <span className="text-xs text-slate-400">คลิกเดียวเพื่อวิเคราะห์</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                disabled={isLoading}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-xs text-left transition-all cursor-pointer group min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {p.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 font-thai truncate">
                      {p.thaiName}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {p.category}
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-600 group-hover:underline">แตะเพื่อทดสอบ</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Loading Pipeline View */}
        {isLoading && (
          <div className="pt-4 border-t border-slate-100">
            <LoadingPipeline
              currentStage={pipelineStage}
              elapsedSeconds={elapsedSeconds}
              isLive={isLive}
            />
          </div>
        )}

        {/* Error Alert View */}
        {error && (
          <div className="pt-2">
            <ErrorState
              message={error}
              onRetry={() => onAnalyze()}
              onUseDemo={() => handlePresetSelect(DEMO_PRESETS[0])}
            />
          </div>
        )}
      </div>

      {/* ─── Detailed Brand Analysis Results (Embedded Mobile-First) ───── */}
      {brand && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Results Summary Banner */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-orange-200/90 bg-gradient-to-r from-orange-50/40 via-white to-white space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100/70">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#E24A12] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs shadow-orange-500/20">
                  {brand.brand_name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {brand.brand_name}
                    </h3>
                    {brand.is_demo_fixture ? (
                      <span className="badge badge-demo text-[10px]">
                        Benchmark Demo Fixture
                      </span>
                    ) : (
                      <span className="badge badge-safe text-[10px]">
                        Live Ingested
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    อุตสาหกรรม: <strong className="text-slate-800">{brand.industry}</strong> · รวบรวมสัญญาณ {brand.evidence?.length ?? 0} รายการ
                  </p>
                </div>
              </div>

              {/* Confidence & Top Match */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right px-3 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Confidence</div>
                  <div className="font-mono font-black text-sm text-slate-900">
                    {confidencePct}%
                  </div>
                </div>
                <div className="text-right px-3 py-1.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 shadow-2xs">
                  <div className="text-[10px] text-orange-900/60 font-bold uppercase">#1 Match</div>
                  <div className="font-mono font-black text-sm text-[#FF5A1F]">
                    {topMatch?.final_score.toFixed(1) ?? 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Match Preview & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Award className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>
                  อันดับ 1 ที่แนะนำ: <strong className="text-slate-900">{topMatch?.display_name}</strong> (@{topMatch?.username})
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSelectPage('recommendations')}
                  className="w-full sm:w-auto btn-orange text-xs px-5 py-2.5 gap-1.5 cursor-pointer shadow-xs min-h-[44px] justify-center"
                >
                  <span>ดูครีเอเตอร์ที่แนะนำ ({result.recommendation_count} คน)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-Friendly Tabs Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'overview' as ResultTab, label: 'ภาพรวม & สินค้า', icon: Layers },
              { id: 'audience' as ResultTab, label: 'กลุ่มเป้าหมาย & โทน', icon: Users },
              { id: 'topics' as ResultTab, label: `หัวข้อค้นหา (${result.search_queries?.length ?? 0})`, icon: Compass },
              { id: 'evidence' as ResultTab, label: `หลักฐาน & ที่มา (${brand.evidence?.length ?? 0})`, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[40px] shrink-0 ${
                    isActive
                      ? 'bg-[#FF5A1F] text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Products */}
          {activeTab === 'overview' && (
            <div className="saas-card p-5 sm:p-6 space-y-5 bg-white border-slate-200/90 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>บทสรุปผู้บริหาร (Executive Summary)</span>
                  </h4>
                  <span className="badge badge-neutral text-[9px]">Inferred by AI</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                  "{brand.summary || 'ไม่มีบทสรุปอัตโนมัติ'}"
                </p>
              </div>

              {/* Products & Offerings */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>สินค้าและบริการที่ตรวจพบ (Products & Offerings)</span>
                  </h4>
                  <span className="badge badge-safe text-[9px]">Observed Data</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {brand.products_services && brand.products_services.length > 0 ? (
                    brand.products_services.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/60"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">ไม่พบรายการสินค้าที่ชัดเจน</span>
                  )}
                </div>
              </div>

              {/* Location Signals */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>พื้นที่กลุ่มเป้าหมาย (Market Region)</span>
                </h4>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <span>
                    {brand.location_signals && brand.location_signals.length > 0
                      ? brand.location_signals.join(', ')
                      : 'ประเทศไทย (Thailand / National Focus)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Audience & Tone */}
          {activeTab === 'audience' && (
            <div className="saas-card p-5 sm:p-6 space-y-5 bg-white border-slate-200/90 shadow-xs">
              {/* Target Audience Signals */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>กลุ่มเป้าหมายผู้บริโภค (Target Audience Personas)</span>
                  </h4>
                  <span className="badge badge-safe text-[9px]">Contextual Match</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {brand.target_audience && brand.target_audience.length > 0 ? (
                    brand.target_audience.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-800 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">ไม่พบสัญญาณกลุ่มเป้าหมายเฉพาะเจาะจง</span>
                  )}
                </div>
              </div>

              {/* Content Themes */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>เสาหลักเนื้อหา (Content Pillars)</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {brand.content_themes && brand.content_themes.length > 0 ? (
                    brand.content_themes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-800 text-xs font-medium"
                      >
                        #{theme}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">ไม่ระบุ</span>
                  )}
                </div>
              </div>

              {/* Brand Tone */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>โทนและบุคลิกของแบรนด์ (Brand Tone)</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {brand.brand_tone && brand.brand_tone.length > 0 ? (
                    brand.brand_tone.map((tone, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                      >
                        {tone}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">ไม่ระบุ</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Generated Search Topics */}
          {activeTab === 'topics' && (
            <div className="saas-card p-5 sm:p-6 space-y-4 bg-white border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>หัวข้อค้นหา TikTok สำหรับแบรนด์นี้</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คีย์เวิร์ดที่ AI สร้างขึ้นสำหรับดึงกลุ่มครีเอเตอร์ที่เกี่ยวข้อง
                  </p>
                </div>
                {result.candidate_pool_count && (
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                    {result.candidate_pool_count} บัญชีในพูล
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.search_queries && result.search_queries.length > 0 ? (
                  result.search_queries.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">{q}</span>
                      </div>
                      {onSearchKOL && (
                        <button
                          type="button"
                          onClick={() => onSearchKOL(q)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 px-2 py-1 cursor-pointer"
                        >
                          ค้นหาทันที →
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">ไม่มีหัวข้อค้นหา</span>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Evidence & Data Provenance */}
          {activeTab === 'evidence' && (
            <div className="saas-card p-5 sm:p-6 space-y-4 bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>หลักฐานและที่มาของข้อมูล (Evidence & Sources)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ข้อมูลสาธารณะที่ถูกสังเคราะห์เป็นอัตลักษณ์แบรนด์
                  </p>
                </div>
                {onOpenEvidence && (
                  <button
                    type="button"
                    onClick={onOpenEvidence}
                    className="btn-secondary text-xs px-3 py-1.5 gap-1 cursor-pointer"
                  >
                    <span>ดูทั้งหมด</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Data Provenance Details */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ประเภทข้อมูล (Provenance)</span>
                  <span className="font-semibold text-slate-800">
                    {brand.is_demo_fixture
                      ? 'Benchmark Fixture (ข้อมูลตัวอย่างสำหรับการทดสอบ)'
                      : 'Live URL Ingested (วิเคราะห์สดจากลิงก์จริง)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ความเชื่อมั่น (Confidence)</span>
                  <span className="font-mono font-bold text-emerald-700">{confidencePct}%</span>
                </div>
              </div>

              {/* Evidence Snippets */}
              <div className="space-y-2">
                {brand.evidence && brand.evidence.length > 0 ? (
                  brand.evidence.slice(0, 5).map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-600 uppercase">
                          {ev.source || 'Source'}
                        </span>
                        <span className="truncate max-w-[200px]">{ev.source_url}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 font-thai">{ev.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลหลักฐานเพิ่มเติม</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Feature Highlights Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {[
          { icon: Zap, label: 'Fast Inference', desc: 'แมตช์รวดเร็วระดับวินาที' },
          { icon: Target, label: 'Audience Fit', desc: 'โมเดลผู้บริโภคชาวไทย' },
          { icon: ShieldCheck, label: 'Brand Safety Audit', desc: 'คัดกรองความเสี่ยงรอบด้าน' },
          { icon: Sliders, label: 'Explainable Ranking', desc: 'แจกแจงคะแนนโปร่งใส' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</div>
            <div className="text-xs text-slate-500 leading-tight">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AnalyzeBrandView;