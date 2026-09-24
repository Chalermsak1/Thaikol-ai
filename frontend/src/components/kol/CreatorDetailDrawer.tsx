import React from 'react';
import { KOLRecommendation } from '../../types';
import { TikTokProfileCTA, getProfileLinkStatus } from './TikTokProfileCTA';
import { ScoreBreakdown } from './ScoreBreakdown';
import { WhyThisCreator } from './WhyThisCreator';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  Activity,
  User,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';

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
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl bg-white h-full shadow-2xl flex flex-col drawer-enter border-l border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              {creator.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {creator.display_name}
              </h3>
              {(() => {
                const linkStatus = getProfileLinkStatus(creator);
                if (linkStatus.isClickable && linkStatus.url) {
                  return (
                    <a
                      href={linkStatus.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      @{creator.username}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  );
                }
                return (
                  <span
                    title={linkStatus.tooltip}
                    className="text-xs text-slate-500 inline-flex items-center gap-1 font-mono cursor-default"
                  >
                    @{creator.username}
                  </span>
                );
              })()}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Overall Match Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Match Score
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">
                Against current brand profile
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-extrabold text-slate-900 tabular-nums leading-none">
                {creator.final_score.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">/ 100</div>
            </div>
          </div>

          {/* Section 2: Profile & Identity */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Creator Profile</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Platform</span>
                <span className="font-semibold text-slate-800">TikTok Thailand</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Brand Safety Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Screened Safe
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Data Provenance</span>
                <span className="font-mono text-[11px] text-slate-600">
                  {creator.provenance || 'Public TikTok Signal'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Audience Information & Fit Proxy */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Audience Fit Proxy (Informational)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Audience Fit Signal</span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {creator.audience_fit_proxy !== null && creator.audience_fit_proxy !== undefined
                    ? `${creator.audience_fit_proxy.toFixed(1)} / 100`
                    : 'Not available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Follower Demographics</span>
                <span className="text-xs text-slate-500 italic">Not available in public dataset</span>
              </div>
              <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                <strong className="text-slate-700">Notice:</strong> Informational signal based on public content context. Not verified audience demographics. Follower age, gender, and income distributions cannot be retrieved from public APIs and are explicitly not fabricated.
              </p>
            </div>
          </div>

          {/* Section 3: Performance Signals */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Performance Signals</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Engagement Score
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {creator.engagement_quality_score.toFixed(1)}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Relative candidate percentile</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Local Content Score
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {creator.local_content_relevance_score.toFixed(1)}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Thai language & dialect signals</div>
              </div>
            </div>
          </div>

          {/* Section 4: 5-Factor Matching Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Multi-Factor Model Breakdown</span>
            </div>
            <ScoreBreakdown breakdown={creator.score_breakdown} />
          </div>

          {/* Section 5: Content Signals */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Matching Content Signals</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.matching_topics && creator.matching_topics.length > 0 ? (
                creator.matching_topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">General Creator</span>
              )}
            </div>
          </div>

          {/* Section 6: Why this creator? */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Why this creator?</span>
            </div>
            <WhyThisCreator recommendation={creator} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Close
          </button>
          <TikTokProfileCTA creator={creator} variant="hero" />
        </div>
      </div>
    </div>
  );
};
