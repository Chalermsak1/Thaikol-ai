import React from 'react';
import { RecommendationResponse } from '../types';
import { CompareCreators } from '../components/kol/CompareCreators';
import { EmptyState } from '../components/common/EmptyState';
import { SlidersHorizontal, Info } from 'lucide-react';

interface CompareViewProps {
  result: RecommendationResponse | null;
  comparisonList: string[];
  onRemoveCreator: (username: string) => void;
  onClearAll: () => void;
  onGoToRecommendations: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  result,
  comparisonList,
  onRemoveCreator,
  onClearAll,
  onGoToRecommendations,
}) => {
  if (!result || !result.recommendations || result.recommendations.length === 0) {
    return (
      <EmptyState
        title="No creators to compare"
        description="First run brand analysis and add creators to the comparison list from the Recommendations page."
        actionLabel="Go to Recommendations"
        onAction={onGoToRecommendations}
        icon={<SlidersHorizontal className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const comparedCreators = result.recommendations.filter((c) =>
    comparisonList.includes(c.username)
  );

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Creator Comparison</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective side-by-side evaluation across 5 scoring dimensions
          </p>
        </div>

        {comparisonList.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn-secondary text-xs self-start sm:self-auto"
          >
            Clear all ({comparisonList.length})
          </button>
        )}
      </div>

      {/* Instruction callout */}
      {comparisonList.length === 0 && (
        <div className="saas-card p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-700 mb-0.5">
              No creators selected for comparison yet
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Go to{' '}
              <button
                onClick={onGoToRecommendations}
                className="text-slate-800 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Recommendations
              </button>
              {' '}and click "Compare" on up to 3 creators.
            </p>
          </div>
        </div>
      )}

      {/* Comparison table */}
      {comparedCreators.length > 0 && (
        <CompareCreators
          creators={comparedCreators}
          onRemoveCreator={onRemoveCreator}
          onClearAll={onClearAll}
        />
      )}
    </div>
  );
};
