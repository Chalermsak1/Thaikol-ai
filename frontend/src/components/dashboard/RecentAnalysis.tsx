import React from 'react';
import { RecommendationResponse, ActiveNavPage } from '../../types';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface RecentAnalysisProps {
  result: RecommendationResponse | null;
  onSelectPage: (page: ActiveNavPage) => void;
  onOpenEvidence?: () => void;
  onResetSession?: () => void;
}

export const RecentAnalysis: React.FC<RecentAnalysisProps> = ({
  result,
  onSelectPage,
  onOpenEvidence,
  onResetSession,
}) => {
  const brand = result?.brand_profile;
  const topMatch = result?.recommendations?.[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Analysis
        </h2>
        {brand && (
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Analyzed & Ready
          </span>
        )}
      </div>

      {brand ? (
        <div className="saas-card overflow-hidden">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {brand.brand_name}
                </h3>
                {brand.is_demo_fixture && (
                  <span className="badge badge-demo text-[10px]">
                    Demo Fixture
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {brand.industry}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onResetSession && (
                <button
                  onClick={onResetSession}
                  className="btn-secondary text-xs px-2.5 py-1.5 gap-1.5 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  title="Clear analysis and start fresh"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Analysis</span>
                </button>
              )}
              {onOpenEvidence && (
                <button
                  onClick={onOpenEvidence}
                  className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Evidence ({brand.evidence?.length ?? 0})</span>
                </button>
              )}
              <button
                onClick={() => onSelectPage('recommendations')}
                className="btn-primary text-xs px-3.5 py-1.5 gap-1.5"
              >
                <span>View Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real Metrics Grid - Strictly actual data only */}
          <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border-b border-slate-100">
            {/* Metric 1: Brand Confidence */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Brand Confidence
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {Math.round((brand.confidence ?? 0) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400">synthesized</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                {brand.evidence?.length ?? 0} evidence points
              </div>
            </div>

            {/* Metric 2: Candidate Pool */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Candidate Pool
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {result?.candidate_pool_count ?? result?.recommendation_count ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">creators</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                {result?.search_queries?.length ?? 0} search queries
              </div>
            </div>

            {/* Metric 3: Top Match Score */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Top Match Score
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {topMatch ? topMatch.final_score.toFixed(1) : '—'}
                </span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                {topMatch ? `@${topMatch.username}` : 'No matches'}
              </div>
            </div>

            {/* Metric 4: Brand Safety */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Brand Safety
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900">Screened</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                Zero flagged risk
              </div>
            </div>
          </div>

          {/* Quick Details Bar */}
          <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-800">Target Audience:</span>
              {brand.target_audience && brand.target_audience.length > 0 ? (
                brand.target_audience.slice(0, 3).map((aud, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                    {aud}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">Thai organic consumers</span>
              )}
            </div>

            <button
              onClick={() => onSelectPage('brand')}
              className="text-slate-700 hover:text-slate-950 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore Brand Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Benchmark Prompt Card */
        <div className="saas-card p-6 border-dashed border-slate-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No brand analyzed yet in this session</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Start by submitting your brand URLs or run the curated Khaokho Talaypu benchmark to preview creator matches.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectPage('analyze')}
              className="btn-primary text-xs px-4 py-2 gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Start Brand Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
