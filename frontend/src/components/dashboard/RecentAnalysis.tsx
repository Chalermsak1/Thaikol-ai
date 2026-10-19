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
          {brand ? 'Active Brand Campaign' : 'Recent Activity'}
        </h2>
        {brand && (
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Profile Ready · {result?.recommendation_count ?? 0} Creators Matched</span>
          </span>
        )}
      </div>

      {brand ? (
        <div className="saas-card overflow-hidden border-slate-200/90 shadow-xs">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50/30 to-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {brand.brand_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {brand.brand_name}
                    </h3>
                    {brand.is_demo_fixture ? (
                      <span className="badge badge-demo text-[10px]">
                        Demo Fixture
                      </span>
                    ) : (
                      <span className="badge badge-safe text-[10px]">
                        Live Ingest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {brand.industry}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                className="btn-primary text-xs px-4 py-1.5 gap-1.5 shadow-xs"
              >
                <span>View Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/40 border-b border-slate-100">
            {/* Metric 1: Brand Confidence */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Profile Confidence
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {Math.round((brand.confidence ?? 0) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400">synthesized</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                {brand.evidence?.length ?? 0} corroborating signals
              </div>
            </div>

            {/* Metric 2: Candidate Pool */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Discovered Pool
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
                #1 Match Score
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-indigo-600">
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
                Safety Screening
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900">Screened Safe</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                Automated content policy audit
              </div>
            </div>
          </div>

          {/* Top Recommendation Highlight Strip */}
          {topMatch && (
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50/30 border-b border-indigo-100/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {topMatch.display_name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {topMatch.display_name}
                    </span>
                    <span className="text-xs text-indigo-600 font-mono">
                      @{topMatch.username}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                      Top Recommendation
                    </span>
                  </div>
                  {topMatch.reasons?.[0] && (
                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{topMatch.reasons[0]}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
                  <div className="font-mono text-base font-extrabold text-slate-900">
                    {topMatch.final_score.toFixed(1)} / 100
                  </div>
                </div>
                <button
                  onClick={() => onSelectPage('recommendations')}
                  className="btn-secondary text-xs px-3 py-1.5 gap-1"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Navigation Bar */}
          <div className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white">
            <div className="flex items-center gap-2 text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-800">Target Audience:</span>
              {brand.target_audience && brand.target_audience.length > 0 ? (
                brand.target_audience.slice(0, 3).map((aud, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {aud}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">Thai organic consumers</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectPage('brand')}
                className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Brand Profile</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => onSelectPage('compare')}
                className="text-slate-600 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Comparison Matrix</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Benchmark Prompt Card */
        <div className="saas-card p-8 border-dashed border-slate-300 text-center space-y-3 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No brand analyzed yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Enter your brand website or Facebook page above, or click a benchmark brand to preview real-time TikTok creator matches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
