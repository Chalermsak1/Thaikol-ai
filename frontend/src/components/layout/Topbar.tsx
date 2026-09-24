import React from 'react';
import { ActiveNavPage } from '../../types';
import { BookOpen, ExternalLink, Menu, RotateCcw } from 'lucide-react';

interface TopbarProps {
  activePage: ActiveNavPage;
  onOpenMobileMenu: () => void;
  onRunDemo?: () => void;
  isLoading: boolean;
  demoModeActive: boolean;
  hasAnalyzedBrand?: boolean;
  onResetSession?: () => void;
}

const PAGE_TITLES: Record<ActiveNavPage, { section: string; title: string; subtitle: string }> = {
  dashboard: { section: 'Workspace', title: 'Dashboard', subtitle: 'Creator intelligence for Thai marketing campaigns' },
  analyze: { section: 'Workspace', title: 'Analyze Brand', subtitle: 'Start with a client website and Facebook page' },
  brand: { section: 'Workspace', title: 'Brand Analysis', subtitle: 'Extracted brand profile, audience signals, and evidence' },
  discovery: { section: 'Workspace', title: 'KOL Discovery', subtitle: 'Explore Thai creators relevant to this brand' },
  recommendations: { section: 'Workspace', title: 'Recommended Creators', subtitle: 'Ranked creators with 5-factor scoring and rationale' },
  compare: { section: 'Workspace', title: 'Compare', subtitle: 'Neutral side-by-side evaluation across 5 dimensions' },
  shortlist: { section: 'Workspace', title: 'Campaign Roster', subtitle: 'Shortlisted creator portfolio' },
  reports: { section: 'System', title: 'Reports', subtitle: 'Campaign summary, briefing copy, and data exports' },
  sources: { section: 'System', title: 'Data Sources', subtitle: 'Provider status, evidence classification, and provenance' },
  technical: { section: 'System', title: 'Technical Details', subtitle: 'System architecture, API contracts, and diagnostics' },
};

export const Topbar: React.FC<TopbarProps> = ({
  activePage,
  onOpenMobileMenu,
  isLoading,
  demoModeActive,
  hasAnalyzedBrand,
  onResetSession,
}) => {
  const meta = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">ThaiKOL AI</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-400 hidden md:inline">{meta.section}</span>
          <span className="text-slate-300 hidden md:inline">/</span>
          <span className="font-semibold text-slate-900 truncate">{meta.title}</span>
        </nav>
      </div>

      {/* Right: API status + Demo badge + Small actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {hasAnalyzedBrand && onResetSession && (
          <button
            onClick={onResetSession}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition cursor-pointer"
            title="Reset session and start new brand analysis"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}

        {isLoading && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Running Engine...</span>
          </div>
        )}

        {demoModeActive ? (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/90 text-amber-800 text-xs font-semibold"
            title="Curated demo data fixture for offline presentation"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>DEMO MODE</span>
          </div>
        ) : (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
            title="Connected to live API services"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Live Mode</span>
          </div>
        )}

        <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>API Online</span>
        </div>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200 transition"
          title="Open FastAPI Swagger Interactive Documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>API Docs</span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
