import React, { useState, useEffect } from 'react';
import {
  ActiveNavPage,
  RecommendationResponse,
  KOLRecommendation,
  HealthData,
  ShortlistItem,
  OutreachStatus,
} from './types';
import { recommendFromBrand, getHealthStatus } from './lib/api';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './pages/DashboardView';
import { AnalyzeBrandView } from './pages/AnalyzeBrandView';
import { BrandAnalysisView } from './pages/BrandAnalysisView';
import { DiscoveryView } from './pages/DiscoveryView';
import { RecommendationsView } from './pages/RecommendationsView';
import { CompareView } from './pages/CompareView';
import { ShortlistView } from './pages/ShortlistView';
import { ReportsView } from './pages/ReportsView';
import { DataSourcesView } from './pages/DataSourcesView';
import { TechnicalView } from './pages/TechnicalView';
import { EvidenceDrawer } from './components/brand/EvidenceDrawer';
import { CreatorDetailDrawer } from './components/kol/CreatorDetailDrawer';

const STORAGE_KEY = 'thaikol_active_session_v1';

function getInitialSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read saved session:', e);
  }
  return null;
}

export const App: React.FC = () => {
  const saved = getInitialSession();

  // Navigation State
  const [activePage, setActivePage] = useState<ActiveNavPage>(
    saved?.activePage && saved.activePage !== 'analyze' ? saved.activePage : 'dashboard'
  );

  // Input & Execution State
  const [websiteUrl, setWebsiteUrl] = useState(saved?.websiteUrl ?? 'https://khaokhotalaypu.com');
  const [facebookUrl, setFacebookUrl] = useState(saved?.facebookUrl ?? 'https://facebook.com/KhaokhoTalaypu');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [result, setResult] = useState<RecommendationResponse | null>(saved?.result ?? null);
  const [error, setError] = useState<string | null>(null);

  // Compare List State
  const [comparisonList, setComparisonList] = useState<string[]>(saved?.comparisonList ?? []);

  // Shortlist State
  const [shortlist, setShortlist] = useState<Record<string, ShortlistItem>>(saved?.shortlist ?? {});

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
      if (data.recommendations && data.recommendations.length >= 2) {
        setComparisonList([
          data.recommendations[0].username,
          data.recommendations[1].username,
        ]);
      }

      // Automatically transition to recommendations view to see results
      setActivePage('recommendations');
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

  // Reset Session
  const handleResetSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear saved session:', e);
    }
    setResult(null);
    setWebsiteUrl('https://khaokhotalaypu.com');
    setFacebookUrl('https://facebook.com/KhaokhoTalaypu');
    setComparisonList([]);
    setShortlist({});
    setError(null);
    setActivePage('dashboard');
  };

  // LocalStorage Persistence
  useEffect(() => {
    try {
      if (!result) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const sessionData = {
        activePage,
        websiteUrl,
        facebookUrl,
        result,
        comparisonList,
        shortlist,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }
  }, [activePage, websiteUrl, facebookUrl, result, comparisonList, shortlist]);

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

  // Shortlist Handlers
  const handleToggleShortlist = (creator: KOLRecommendation) => {
    setShortlist((prev) => {
      const next = { ...prev };
      if (next[creator.username]) {
        delete next[creator.username];
      } else {
        next[creator.username] = {
          username: creator.username,
          creator,
          status: 'shortlisted',
          addedAt: new Date().toISOString(),
          notes: '',
        };
      }
      return next;
    });
  };

  const handleUpdateShortlistStatus = (username: string, status: OutreachStatus) => {
    setShortlist((prev) => {
      if (!prev[username]) return prev;
      return {
        ...prev,
        [username]: {
          ...prev[username],
          status,
        },
      };
    });
  };

  const handleUpdateShortlistNotes = (username: string, notes: string) => {
    setShortlist((prev) => {
      if (!prev[username]) return prev;
      return {
        ...prev,
        [username]: {
          ...prev[username],
          notes,
        },
      };
    });
  };

  const handleRemoveFromShortlist = (username: string) => {
    setShortlist((prev) => {
      const next = { ...prev };
      delete next[username];
      return next;
    });
  };

  return (
    <AppShell
      activePage={activePage}
      onSelectPage={setActivePage}
      hasAnalyzedBrand={!!result}
      comparisonCount={comparisonList.length}
      shortlistCount={Object.keys(shortlist).length}
      onRunDemo={handleRunDemo}
      isLoading={isLoading}
      demoModeActive={health?.demo_mode ?? true}
      onResetSession={handleResetSession}
    >
      {/* View Routing */}
      {activePage === 'dashboard' && (
        <DashboardView
          result={result}
          onSelectPage={setActivePage}
          onRunDemo={handleRunDemo}
          isLoading={isLoading}
          onOpenEvidence={() => setIsEvidenceDrawerOpen(true)}
          onResetSession={handleResetSession}
        />
      )}

      {activePage === 'analyze' && (
        <AnalyzeBrandView
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
          onGoToAnalyze={() => setActivePage('analyze')}
        />
      )}

      {activePage === 'discovery' && (
        <DiscoveryView
          result={result}
          onSelectCreator={(c) => setSelectedCreatorForDrawer(c)}
          onGoToDashboard={() => setActivePage('dashboard')}
          onGoToAnalyze={() => setActivePage('analyze')}
        />
      )}

      {activePage === 'recommendations' && (
        <RecommendationsView
          result={result}
          comparisonList={comparisonList}
          shortlist={shortlist}
          onToggleCompare={handleToggleCompare}
          onToggleShortlist={handleToggleShortlist}
          onGoToShortlist={() => setActivePage('shortlist')}
          onOpenCreatorDetail={(c) => setSelectedCreatorForDrawer(c)}
          onGoToDashboard={() => setActivePage('dashboard')}
          onGoToAnalyze={() => setActivePage('analyze')}
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

      {activePage === 'shortlist' && (
        <ShortlistView
          shortlist={shortlist}
          onUpdateStatus={handleUpdateShortlistStatus}
          onUpdateNotes={handleUpdateShortlistNotes}
          onRemoveFromShortlist={handleRemoveFromShortlist}
          onOpenCreatorDetail={(c) => setSelectedCreatorForDrawer(c)}
          onGoToRecommendations={() => setActivePage('recommendations')}
          brandName={result?.brand_profile?.brand_name || 'Campaign'}
        />
      )}

      {activePage === 'reports' && (
        <ReportsView
          result={result}
          onGoToDashboard={() => setActivePage('dashboard')}
          onGoToAnalyze={() => setActivePage('analyze')}
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

