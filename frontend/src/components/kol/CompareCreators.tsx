import React from 'react';
import { KOLRecommendation } from '../../types';
import { X, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface CompareCreatorsProps {
  creators: KOLRecommendation[];
  onRemoveCreator: (username: string) => void;
  onClearAll: () => void;
}

export const CompareCreators: React.FC<CompareCreatorsProps> = ({
  creators,
  onRemoveCreator,
  onClearAll,
}) => {
  if (creators.length === 0) {
    return (
      <div className="saas-card p-10 text-center space-y-3">
        <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-900">No creators selected for comparison</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Click the "Compare" button on any recommendation card to compare up to 3 creators side-by-side across all 5 evaluation dimensions.
        </p>
      </div>
    );
  }

  return (
    <div className="saas-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Side-by-Side Evaluation Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective decision-support comparison without artificial winner declarations
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
        >
          Clear Selection
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-semibold text-slate-500 text-[11px] uppercase tracking-wider w-1/4">
                Evaluation Metric
              </th>
              {creators.map((c) => (
                <th key={c.username} className="py-3.5 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-bold text-slate-900">{c.display_name}</span>
                      <button
                        onClick={() => onRemoveCreator(c.username)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <a
                      href={c.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-mono inline-flex items-center gap-0.5"
                    >
                      <span>@{c.username}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">

            {/* Overall Match Score */}
            <tr className="bg-slate-50/60">
              <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                Overall Match Score
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3.5 px-4 text-center">
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {c.final_score.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400"> / 100</span>
                  <div className="mt-1.5 w-full bg-slate-200 rounded-full h-[3px] overflow-hidden">
                    <div
                      className="h-[3px] rounded-full bg-slate-700 transition-all duration-500"
                      style={{ width: `${c.final_score}%` }}
                    />
                  </div>
                </td>
              ))}
            </tr>

            {/* Semantic Relevance */}
            <tr>
              <td className="py-3 px-4 font-sans text-slate-700">
                Semantic Match
                <span className="text-slate-400 font-mono ml-1">(45%)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-800">
                  <span className="font-semibold">{c.score_breakdown.semantic_relevance.score.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                    +{c.score_breakdown.semantic_relevance.weighted_contribution.toFixed(1)} pts
                  </span>
                </td>
              ))}
            </tr>

            {/* Engagement Quality */}
            <tr>
              <td className="py-3 px-4 font-sans text-slate-700">
                Engagement Quality
                <span className="text-slate-400 font-mono ml-1">(25%)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-800">
                  <span className="font-semibold">{c.score_breakdown.engagement_quality.score.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                    +{c.score_breakdown.engagement_quality.weighted_contribution.toFixed(1)} pts
                  </span>
                </td>
              ))}
            </tr>

            {/* Local Content Relevance */}
            <tr>
              <td className="py-3 px-4 font-sans text-slate-700">
                Local Content Relevance
                <span className="text-slate-400 font-mono ml-1">(15%)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-800">
                  <span className="font-semibold">{c.score_breakdown.local_content_relevance.score.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-sans">
                    +{c.score_breakdown.local_content_relevance.weighted_contribution.toFixed(1)} pts
                  </span>
                </td>
              ))}
            </tr>

            {/* Brand Safety */}
            <tr>
              <td className="py-3 px-4 font-sans text-slate-700">
                Brand Safety Screen
                <span className="text-slate-400 font-mono ml-1">(10%)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-800">
                  <span className="font-semibold">{c.score_breakdown.brand_safety.score.toFixed(0)}</span>
                  <span className="text-[10px] text-slate-400 ml-0.5"> / 100</span>
                </td>
              ))}
            </tr>

            {/* Data Quality */}
            <tr>
              <td className="py-3 px-4 font-sans text-slate-700">
                Data Quality
                <span className="text-slate-400 font-mono ml-1">(5%)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-800">
                  <span className="font-semibold">{c.score_breakdown.data_quality.score.toFixed(1)}</span>
                </td>
              ))}
            </tr>

            {/* Audience Fit Proxy */}
            <tr className="bg-slate-50/30">
              <td className="py-3 px-4 font-sans text-slate-500 italic">
                Audience Fit Proxy
                <span className="text-slate-400 not-italic ml-1">(Informational)</span>
              </td>
              {creators.map((c) => (
                <td key={c.username} className="py-3 px-4 text-center text-slate-500">
                  {c.audience_fit_proxy !== null && c.audience_fit_proxy !== undefined
                    ? `${c.audience_fit_proxy.toFixed(1)}/100`
                    : 'N/A'}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};
