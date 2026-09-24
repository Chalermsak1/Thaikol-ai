import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA } from './TikTokProfileCTA';
import { ShieldCheck } from 'lucide-react';

interface CreatorTableProps {
  creators: KOLRecommendation[];
  onSelectCreator?: (creator: KOLRecommendation) => void;
}

export const CreatorTable: React.FC<CreatorTableProps> = ({
  creators,
  onSelectCreator,
}) => {
  if (creators.length === 0) {
    return (
      <div className="saas-card p-8 text-center">
        <p className="text-sm text-slate-500">No creators match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="saas-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '2.5rem' }}>#</th>
              <th>Creator</th>
              <th className="hidden md:table-cell">Topics</th>
              <th className="text-right">Semantic</th>
              <th className="text-right hidden sm:table-cell">Engagement</th>
              <th className="text-right hidden lg:table-cell">Local</th>
              <th className="text-right">Overall</th>
              <th className="text-right">Profile</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => (
              <tr
                key={creator.username}
                onClick={() => onSelectCreator?.(creator)}
              >
                {/* Rank */}
                <td>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {String(creator.rank).padStart(2, '0')}
                  </span>
                </td>

                {/* Creator identity */}
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-600 text-[11px] shrink-0">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs leading-tight truncate max-w-[140px]">
                        {creator.display_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        @{creator.username}
                      </div>
                    </div>
                    {creator.brand_safety_risk_level === 'safe' && (
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0 hidden sm:block" />
                    )}
                  </div>
                </td>

                {/* Topics */}
                <td className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {creator.matching_topics.slice(0, 2).map((t, i) => (
                      <span key={i} className="badge badge-neutral">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Scores */}
                <td className="text-right">
                  <span className="font-mono font-semibold text-slate-800 tabular-nums text-[11px]">
                    {creator.semantic_relevance_score.toFixed(1)}
                  </span>
                </td>
                <td className="text-right hidden sm:table-cell">
                  <span className="font-mono font-semibold text-slate-800 tabular-nums text-[11px]">
                    {creator.engagement_quality_score.toFixed(1)}
                  </span>
                </td>
                <td className="text-right hidden lg:table-cell">
                  <span className="font-mono font-semibold text-slate-800 tabular-nums text-[11px]">
                    {creator.local_content_relevance_score.toFixed(1)}
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-mono font-bold text-slate-900 tabular-nums text-xs">
                    {creator.final_score.toFixed(1)}
                  </span>
                </td>

                {/* Action */}
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <TikTokProfileCTA creator={creator} variant="table" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
