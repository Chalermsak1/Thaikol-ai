import React from 'react';
import { RecommendationResponse } from '../types';
import { BrandOverview } from '../components/brand/BrandOverview';
import { BrandSignals } from '../components/brand/BrandSignals';
import { SearchStrategy } from '../components/brand/SearchStrategy';
import { EmptyState } from '../components/common/EmptyState';
import { Building2 } from 'lucide-react';

interface BrandAnalysisViewProps {
  result: RecommendationResponse | null;
  onOpenEvidence: () => void;
  onGoToDashboard: () => void;
}

export const BrandAnalysisView: React.FC<BrandAnalysisViewProps> = ({
  result,
  onOpenEvidence,
  onGoToDashboard,
}) => {
  if (!result || !result.brand_profile) {
    return (
      <EmptyState
        title="No brand analyzed yet"
        description="Run brand analysis from the Dashboard to generate a comprehensive brand profile, audience signals, and evidence attribution."
        actionLabel="Go to Dashboard"
        onAction={onGoToDashboard}
        icon={<Building2 className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Brand Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Synthesized brand profile, audience signals, and public evidence
        </p>
      </div>

      {/* Brand overview card */}
      <BrandOverview
        brandProfile={result.brand_profile}
        onOpenEvidence={onOpenEvidence}
      />

      {/* Signals grid */}
      <BrandSignals brandProfile={result.brand_profile} />

      {/* Search strategy */}
      {result.search_queries && result.search_queries.length > 0 && (
        <SearchStrategy
          queries={result.search_queries}
          candidateCount={result.candidate_pool_count}
        />
      )}
    </div>
  );
};
