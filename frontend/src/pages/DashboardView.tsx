import React from 'react';
import { RecommendationResponse, DemoPreset } from '../types';
import { Search, Sparkles, ArrowRight, CheckCircle2, Users, Award } from 'lucide-react';
import { LoadingPipeline } from '../components/common/LoadingPipeline';
import { ErrorState } from '../components/common/ErrorState';

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'khaokho',
    name: 'Khaokho Talaypu',
    thaiName: 'เขาค้อทะเลภู',
    category: 'Herbal Personal Care & Hair Care',
    websiteUrl: 'https://khaokhotalaypu.com',
    facebookUrl: 'https://facebook.com/KhaokhoTalaypu',
    tag: 'Demo benchmark',
  },
  {
    id: 'smooth-e',
    name: 'Smooth E',
    thaiName: 'สมูทอี',
    category: 'Dermocosmetics & Sensitive Skincare',
    websiteUrl: 'https://smooth-e.com',
    facebookUrl: 'https://facebook.com/SmoothEThailand',
    tag: 'Skincare',
  },
  {
    id: 'chatramue',
    name: 'ChaTraMue',
    thaiName: 'ชาตรามือ',
    category: 'Thai Tea & Traditional F&B',
    websiteUrl: 'https://chatramue.com',
    facebookUrl: 'https://facebook.com/ChaTraMue',
    tag: 'F&B',
  },
];

interface DashboardViewProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  onAnalyze: (web?: string, fb?: string) => void;
  isLoading: boolean;
  pipelineStage: number;
  result: RecommendationResponse | null;
  error: string | null;
  onSelectPage: (page: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  websiteUrl,
  setWebsiteUrl,
  facebookUrl,
  setFacebookUrl,
  onAnalyze,
  isLoading,
  pipelineStage,
  result,
  error,
  onSelectPage,
}) => {
  const handlePresetSelect = (preset: DemoPreset) => {
    setWebsiteUrl(preset.websiteUrl);
    setFacebookUrl(preset.facebookUrl);
    onAnalyze(preset.websiteUrl, preset.facebookUrl);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Find the right Thai TikTok creators for your brand.
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Enter a brand website and Facebook page. ThaiKOL AI extracts the brand identity,
          discovers relevant creators, and delivers ranked recommendations with mathematical explainability.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="saas-card p-6 space-y-5">
        {/* Card header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Analyze a Brand</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter public URLs to extract brand signals and generate recommendations
            </p>
          </div>
          <button
            onClick={() => handlePresetSelect(DEMO_PRESETS[0])}
            disabled={isLoading}
            className="btn-secondary text-xs gap-1.5 hidden sm:inline-flex"
          >
            <Sparkles className="w-3 h-3 text-slate-400" />
            Try Demo
          </button>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Business Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              disabled={isLoading}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Facebook Public Page URL</label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/yourbrand"
              disabled={isLoading}
              className="form-input"
            />
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Or load a benchmark preset
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                disabled={isLoading}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {preset.name}
                  </span>
                  <span className="badge badge-neutral text-[10px]">{preset.tag}</span>
                </div>
                {preset.thaiName && (
                  <span className="text-[11px] text-slate-400 font-thai">{preset.thaiName}</span>
                )}
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1">
            <span>Brand Analysis</span>
            <span>·</span>
            <span>KOL Discovery</span>
            <span>·</span>
            <span>MiniLM Embeddings</span>
            <span>·</span>
            <span>5-Factor Scoring</span>
          </div>
          <button
            onClick={() => onAnalyze()}
            disabled={isLoading}
            className="btn-primary px-6 py-2.5 text-xs gap-2 w-full sm:w-auto justify-center"
          >
            <Search className="w-3.5 h-3.5" />
            {isLoading ? 'Analyzing...' : 'Analyze Brand'}
          </button>
        </div>
      </div>

      {/* Loading pipeline */}
      {isLoading && <LoadingPipeline currentStage={pipelineStage} />}

      {/* Error */}
      {error && !isLoading && (
        <ErrorState
          message={error}
          onRetry={() => onAnalyze()}
          onUseDemo={() => handlePresetSelect(DEMO_PRESETS[0])}
        />
      )}

      {/* Result summary card */}
      {result && !isLoading && (
        <div className="saas-card p-5 space-y-4">
          {/* Status header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {result.brand_profile?.brand_name || 'Brand'} — Analysis Complete
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {result.data_source === 'demo_fixture'
                    ? 'Curated benchmark fixture · Demo Mode'
                    : 'Live public data · Real-time snapshot'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectPage('brand')}
                className="btn-secondary px-3.5 py-1.5 text-xs"
              >
                Brand Profile
              </button>
              <button
                onClick={() => onSelectPage('recommendations')}
                className="btn-primary px-4 py-1.5 text-xs gap-1.5"
              >
                View Recommendations
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Pool Analyzed
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {result.candidate_pool_count || result.recommendations.length}
              </div>
              <div className="text-[10px] text-slate-500">Thai creators</div>
            </div>

            <div className="stat-card">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Recommendations
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {result.recommendation_count}
              </div>
              <div className="text-[10px] text-slate-500">ranked results</div>
            </div>

            <div className="stat-card">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Top Match Score
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {result.recommendations[0]?.final_score.toFixed(1) ?? 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                @{result.recommendations[0]?.username}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
