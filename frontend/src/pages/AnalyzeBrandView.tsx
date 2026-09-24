import React from 'react';
import { RecommendationResponse, DemoPreset, ActiveNavPage } from '../types';
import { Search, Sparkles, ArrowRight, CheckCircle2, Globe, Facebook } from 'lucide-react';
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
    tag: 'Curated Benchmark',
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

interface AnalyzeBrandViewProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  onAnalyze: (web?: string, fb?: string) => void;
  isLoading: boolean;
  pipelineStage: number;
  result: RecommendationResponse | null;
  error: string | null;
  onSelectPage: (page: ActiveNavPage) => void;
}

export const AnalyzeBrandView: React.FC<AnalyzeBrandViewProps> = ({
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  const handlePresetSelect = (preset: DemoPreset) => {
    setWebsiteUrl(preset.websiteUrl);
    setFacebookUrl(preset.facebookUrl);
    onAnalyze(preset.websiteUrl, preset.facebookUrl);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Analyze Brand
        </h1>
        <p className="text-xs text-slate-500">
          Analyze a client's public website and Facebook page to understand their brand, audience, and content signals.
        </p>
      </div>

      {/* Main Form Workspace Card */}
      <div className="saas-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Brand Source Inputs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter public URLs to extract brand signals, content themes, and target audience
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePresetSelect(DEMO_PRESETS[0])}
            disabled={isLoading}
            className="btn-secondary text-xs gap-1.5 hidden sm:inline-flex"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Try Demo</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="form-label flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Website URL
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Primary domain or e-commerce</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://brand-example.com"
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="form-label flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-slate-400" />
                Facebook Page URL
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Official brand community page</span>
            </label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/brandpage"
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto btn-primary px-6 py-2 text-xs justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Brand Signals...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze Brand</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect(DEMO_PRESETS[0])}
              disabled={isLoading}
              className="w-full sm:w-auto btn-secondary px-4 py-2 text-xs justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Try Demo (Khaokho Talaypu)</span>
            </button>
          </div>
        </form>

        {/* Demo Presets Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-500">
            Or select a benchmark preset:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                disabled={isLoading}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 truncate">
                    {p.name}
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 shrink-0">
                    {p.tag}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-thai truncate">
                  {p.thaiName} · {p.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Execution Display */}
        {isLoading && (
          <div className="pt-4 border-t border-slate-100">
            <LoadingPipeline currentStage={pipelineStage} />
          </div>
        )}

        {/* Error Alert */}
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

      {/* Success Banner if Result Exists */}
      {result && result.brand_profile && !isLoading && (
        <div className="saas-card p-5 border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analysis Complete for {result.brand_profile.brand_name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Extracted brand profile with {result.brand_profile.evidence?.length ?? 0} evidence points and matched {result.recommendation_count} candidate creators.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectPage('brand')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Brand Intelligence
            </button>
            <button
              onClick={() => onSelectPage('recommendations')}
              className="btn-primary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
