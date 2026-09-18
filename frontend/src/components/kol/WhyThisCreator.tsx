import React from 'react';
import { KOLRecommendation } from '../../types';
import { CheckCircle2, AlertTriangle, Info, Tag, Calculator } from 'lucide-react';

interface WhyThisCreatorProps {
  recommendation: KOLRecommendation;
}

export const WhyThisCreator: React.FC<WhyThisCreatorProps> = ({ recommendation }) => {
  const { score_breakdown } = recommendation;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
      {/* 1. Transparent Calculation Formula */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          <span>Transparent Scoring Formula</span>
        </div>
        <div className="font-mono text-[11px] text-slate-600 leading-relaxed overflow-x-auto">
          Final Score = (0.45 × {score_breakdown.semantic_relevance.score.toFixed(1)}) + 
          (0.25 × {score_breakdown.engagement_quality.score.toFixed(1)}) + 
          (0.15 × {score_breakdown.local_content_relevance.score.toFixed(1)}) + 
          (0.10 × {score_breakdown.brand_safety.score.toFixed(0)}) + 
          (0.05 × {score_breakdown.data_quality.score.toFixed(1)}) 
          = <strong className="text-slate-900">{recommendation.final_score.toFixed(2)}</strong>
        </div>
      </div>

      {/* 2. Recommendation Rationale & Campaign Caution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200/70 space-y-2">
          <div className="font-semibold text-emerald-900 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Positive Fit Factors</span>
          </div>
          <ul className="space-y-1 text-slate-700 text-xs">
            {recommendation.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200/70 space-y-2">
          <div className="font-semibold text-amber-900 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Campaign Review & Consideration Flags</span>
          </div>
          {recommendation.cautions.length > 0 ? (
            <ul className="space-y-1 text-slate-700 text-xs">
              {recommendation.cautions.map((caution, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              No sensitive keyword flags or profile concerns detected in public content.
            </p>
          )}
        </div>
      </div>

      {/* 3. Matching Topics & Audience Proxy */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overlapping Topics:
          </span>
          {recommendation.matching_topics.length > 0 ? (
            recommendation.matching_topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                <span>#{topic}</span>
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs italic">Dense semantic match (no verbatim keyword overlap)</span>
          )}
        </div>

        {recommendation.audience_fit_proxy !== null && recommendation.audience_fit_proxy !== undefined && (
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span className="text-slate-500 font-medium">Audience Fit Proxy:</span>
            <span className="font-mono font-bold text-slate-900">{recommendation.audience_fit_proxy.toFixed(1)}/100</span>
          </div>
        )}
      </div>

      {/* 4. Audience Fit Disclaimer */}
      <div className="p-2.5 rounded bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Audience Fit Proxy Notice:</strong> Informational proxy based on observable public cues. Not verified follower demographics. Does not directly affect final score.
        </span>
      </div>
    </div>
  );
};
