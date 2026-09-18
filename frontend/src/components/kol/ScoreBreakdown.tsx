import React from 'react';
import { ScoreBar } from '../common/ScoreBar';

interface ScoreBreakdownData {
  semantic_relevance: { score: number; weighted_contribution: number };
  engagement_quality: { score: number; weighted_contribution: number };
  local_content_relevance: { score: number; weighted_contribution: number };
  brand_safety: { score: number; weighted_contribution: number };
  data_quality: { score: number; weighted_contribution: number };
}

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownData;
}

const FACTORS = [
  { key: 'semantic_relevance' as const, label: 'Semantic Match', weight: '45%' },
  { key: 'engagement_quality' as const, label: 'Engagement', weight: '25%' },
  { key: 'local_content_relevance' as const, label: 'Local Relevance', weight: '15%' },
  { key: 'brand_safety' as const, label: 'Brand Safety', weight: '10%' },
  { key: 'data_quality' as const, label: 'Data Quality', weight: '5%' },
];

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="space-y-2.5">
      {FACTORS.map((factor) => {
        const score = breakdown[factor.key]?.score ?? 0;
        return (
          <ScoreBar
            key={factor.key}
            value={score}
            label={factor.label}
            weight={factor.weight}
            showValue={true}
          />
        );
      })}
    </div>
  );
};
