import React, { useState, useEffect } from 'react';
import {
  ActiveNavPage,
  RecommendationResponse,
  KOLRecommendation,
  HealthData,
} from './types';
import { recommendFromBrand, getHealthStatus } from './lib/api';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './pages/DashboardView';
import { BrandAnalysisView } from './pages/BrandAnalysisView';
import { DiscoveryView } from './pages/DiscoveryView';
import { RecommendationsView } from './pages/RecommendationsView';
import { CompareView } from './pages/CompareView';
import { DataSourcesView } from './pages/DataSourcesView';
import { TechnicalView } from './pages/TechnicalView';
import { EvidenceDrawer } from './components/brand/EvidenceDrawer';
import { CreatorDetailDrawer } from './components/kol/CreatorDetailDrawer';

export const App: React.FC = () => {
  // Navigation State
  const [activePage, setActivePage] = useState<ActiveNavPage>('dashboard');

  // Input & Execution State
  const [websiteUrl, setWebsiteUrl] = useState('https://khaokhotalaypu.com');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/KhaokhoTalaypu');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compare List State
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  // Drawer Inspection States
  const [selectedCreatorForDrawer, setSelectedCreatorForDrawer] = useState<KOLRecommendation | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Health State
  const [health, setHealth] = useState<HealthData | null>(null);

  // Fetch API Health on mount
  useEffect(() => {
    getHealthStatus()
      .then(setHealth)
      .catch(() => console.warn('Backend offline or using fallback'));
  }, []);

  // Multi-stage progress ticker while loading
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      setPipelineStage(0);
      interval = setInterval(() => {
        setPipelineStage((prev) => (prev < 7 ? prev + 1 : prev));
      }, 650);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Main Analyze Workflow
  const handleAnalyze = async (webOverride?: string, fbOverride?: string) => {
    const web = (webOverride !== undefined ? webOverride : websiteUrl).trim();
    const fb = (fbOverride !== undefined ? fbOverride : facebookUrl).trim();

    if (!web && !fb) {
      setError('Please provide at least one valid public website or Facebook page URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await recommendFromBrand({
        website_url: web || undefined,
        facebook_page_url: fb || undefined,
        limit: 10,
      });

      setResult(data);

      // Pre-populate comparison list with top 2 creators for immediate usability
      if (data.recommendations.length >= 2) {
        setComparisonList([
          data.recommendations[0].username,
          data.recommendations[1].username,
        ]);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errMsg = 'Failed to execute recommendation engine. Please verify the URL inputs.';
      if (typeof detail === 'object' && detail !== null) {
        errMsg = detail.message || JSON.stringify(detail);
      } else if (typeof detail === 'string') {
        errMsg = detail;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Trigger
  const handleRunDemo = () => {
    setWebsiteUrl('https://khaokhotalaypu.com');
    setFacebookUrl('https://facebook.com/KhaokhoTalaypu');
    handleAnalyze('https://khaokhotalaypu.com', 'https://facebook.com/KhaokhoTalaypu');
  };

  // Compare Toggle
  const handleToggleCompare = (username: string) => {
    setComparisonList((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : prev.length < 3
        ? [...prev, username]
        : prev
    );
  };

  return (
    <AppShell
      activePage={activePage}
      onSelectPage={setActivePage}
      hasAnalyzedBrand={!!result}
      comparisonCount={comparisonList.length}
      onRunDemo={handleRunDemo}
      isLoading={isLoading}
      demoModeActive={health?.demo_mode ?? true}
    >
      {/* View Routing */}
      {activePage === 'dashboard' && (
        <DashboardView
          websiteUrl={websiteUrl}
          setWebsiteUrl={setWebsiteUrl}
          facebookUrl={facebookUrl}
          setFacebookUrl={setFacebookUrl}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          pipelineStage={pipelineStage}
          result={result}
          error={error}
          onSelectPage={setActivePage}
        />
      )}

      {activePage === 'brand' && (
        <BrandAnalysisView
          result={result}
          onOpenEvidence={() => setIsEvidenceDrawerOpen(true)}
          onGoToDashboard={() => setActivePage('dashboard')}
        />
      )}

      {activePage === 'discovery' && (
        <DiscoveryView
          result={result}
          onSelectCreator={(c) => setSelectedCreatorForDrawer(c)}
          onGoToDashboard={() => setActivePage('dashboard')}
        />
      )}

      {activePage === 'recommendations' && (
        <RecommendationsView
          result={result}
          comparisonList={comparisonList}
          onToggleCompare={handleToggleCompare}
          onOpenCreatorDetail={(c) => setSelectedCreatorForDrawer(c)}
          onGoToDashboard={() => setActivePage('dashboard')}
        />
      )}

      {activePage === 'compare' && (
        <CompareView
          result={result}
          comparisonList={comparisonList}
          onRemoveCreator={(u) => setComparisonList((prev) => prev.filter((x) => x !== u))}
          onClearAll={() => setComparisonList([])}
          onGoToRecommendations={() => setActivePage('recommendations')}
        />
      )}

      {activePage === 'sources' && <DataSourcesView />}

      {activePage === 'technical' && (
        <TechnicalView demoMode={health?.demo_mode ?? true} />
      )}

      {/* Slide-over Drawers */}
      {result?.brand_profile && (
        <EvidenceDrawer
          isOpen={isEvidenceDrawerOpen}
          onClose={() => setIsEvidenceDrawerOpen(false)}
          evidence={result.brand_profile.evidence}
          brandName={result.brand_profile.brand_name}
        />
      )}

      <CreatorDetailDrawer
        creator={selectedCreatorForDrawer}
        onClose={() => setSelectedCreatorForDrawer(null)}
      />
    </AppShell>
  );
};

export default App;
