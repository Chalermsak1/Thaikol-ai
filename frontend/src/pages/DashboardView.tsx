import React from 'react';
import { RecommendationResponse, ActiveNavPage } from '../types';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentAnalysis } from '../components/dashboard/RecentAnalysis';
import { WorkflowOverview } from '../components/dashboard/WorkflowOverview';

interface DashboardViewProps {
  result: RecommendationResponse | null;
  onSelectPage: (page: ActiveNavPage) => void;
  onRunDemo: () => void;
  isLoading: boolean;
  onOpenEvidence?: () => void;
  onResetSession?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  onSelectPage,
  onRunDemo,
  isLoading,
  onOpenEvidence,
  onResetSession,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            FastAPI · Bilingual Matching
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Creator intelligence for Thai marketing campaigns.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onSelectPage={onSelectPage}
        onRunDemo={onRunDemo}
        isLoading={isLoading}
      />

      {/* Recent Analysis Summary Card */}
      <RecentAnalysis
        result={result}
        onSelectPage={onSelectPage}
        onOpenEvidence={onOpenEvidence}
        onResetSession={onResetSession}
      />

      {/* Workflow Architecture Overview */}
      <WorkflowOverview
        onSelectPage={onSelectPage}
        hasAnalyzedBrand={!!result}
      />
    </div>
  );
};
