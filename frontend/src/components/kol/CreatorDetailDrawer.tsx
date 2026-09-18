import React from 'react';
import { KOLRecommendation } from '../../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { WhyThisCreator } from './WhyThisCreator';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface CreatorDetailDrawerProps {
  creator: KOLRecommendation | null;
  onClose: () => void;
}

export const CreatorDetailDrawer: React.FC<CreatorDetailDrawerProps> = ({
  creator,
  onClose,
}) => {
  if (!creator) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="drawer-panel w-full max-w-lg sm:max-w-xl drawer-enter">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
              {creator.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {creator.display_name}
              </h3>
              <a
                href={creator.profile_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 font-mono"
              >
                @{creator.username}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Overall score tile */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Match Score
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Against brand profile · 5-factor model
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums leading-none">
                {creator.final_score.toFixed(1)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">/ 100</div>
            </div>
          </div>

          {/* Safety badges */}
          {creator.brand_safety_risk_level === 'safe' && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Content screened — brand safety: safe</span>
            </div>
          )}

          {/* Score Breakdown */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Score Breakdown
            </div>
            <ScoreBreakdown breakdown={creator.score_breakdown} />
          </div>

          {/* Match Rationale */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Match Rationale
            </div>
            <WhyThisCreator recommendation={creator} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Close
          </button>
          <a
            href={creator.profile_url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-5 py-2 text-xs gap-1.5"
          >
            Open TikTok Profile
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
