import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA } from './TikTokProfileCTA';
import { ShieldCheck, Eye } from 'lucide-react';

interface DiscoveryTableProps {
  creators: KOLRecommendation[];
  onSelectCreator?: (creator: KOLRecommendation) => void;
}

export const DiscoveryTable: React.FC<DiscoveryTableProps> = ({
  creators,
  onSelectCreator,
}) => {
  if (creators.length === 0) {
    return (
      <div className="saas-card p-10 text-center space-y-2">
        <p className="text-sm font-semibold text-slate-800">No candidate creators found</p>
        <p className="text-xs text-slate-500">Try adjusting your filters or resetting the search query.</p>
      </div>
    );
  }

  return (
    <div className="saas-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4">Creator</th>
              <th className="py-3.5 px-4">Category & Topics</th>
              <th className="py-3.5 px-4 text-center">Followers</th>
              <th className="py-3.5 px-4 text-right">Engagement</th>
              <th className="py-3.5 px-4 text-right">Semantic Match</th>
              <th className="py-3.5 px-4 text-right">Overall</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {creators.map((creator) => (
              <tr
                key={creator.username}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => onSelectCreator?.(creator)}
              >
                {/* Rank */}
                <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                  {String(creator.rank).padStart(2, '0')}
                </td>

                {/* Creator Identity */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                        <span>{creator.display_name}</span>
                        {creator.brand_safety_risk_level === 'safe' && (
                          <span title="Screened Brand Safe" className="inline-flex">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        @{creator.username}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category & Topics */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {creator.matching_topics && creator.matching_topics.length > 0 ? (
                      creator.matching_topics.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">General</span>
                    )}
                  </div>
                </td>

                {/* Followers (Public availability check) */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    title="Follower count is not exposed in public snapshots without authenticated creator API access."
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 italic"
                  >
                    Not available
                  </span>
                </td>

                {/* Engagement Quality */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {creator.engagement_quality_score.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-0.5">/100</span>
                </td>

                {/* Semantic Match */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {creator.semantic_relevance_score.toFixed(1)}
                    </span>
                    <div className="w-14 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1 rounded-full"
                        style={{ width: `${creator.semantic_relevance_score}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Overall Score */}
                <td className="py-3.5 px-4 text-right">
                  <span className="font-mono font-extrabold text-sm text-slate-900">
                    {creator.final_score.toFixed(1)}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSelectCreator?.(creator)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <TikTokProfileCTA creator={creator} variant="table" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
