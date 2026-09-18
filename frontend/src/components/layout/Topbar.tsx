import React from 'react';
import { ActiveNavPage } from '../../types';
import { BookOpen, ExternalLink, Menu } from 'lucide-react';

interface TopbarProps {
  activePage: ActiveNavPage;
  onOpenMobileMenu: () => void;
  onRunDemo: () => void;
  isLoading: boolean;
  demoModeActive: boolean;
}

const PAGE_TITLES: Record<ActiveNavPage, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Analyze a brand and discover matching creators' },
  brand: { title: 'Brand Intelligence', subtitle: 'Extracted brand profile, audience signals, and evidence' },
  discovery: { title: 'KOL Discovery', subtitle: 'Candidate creator pool and semantic matching results' },
  recommendations: { title: 'Recommendations', subtitle: 'Ranked creators with multi-factor scores and rationale' },
  compare: { title: 'Creator Comparison', subtitle: 'Side-by-side evaluation across 5 dimensions' },
  sources: { title: 'Data Sources', subtitle: 'Provider status, evidence classification, and provenance' },
  technical: { title: 'Technical', subtitle: 'API contracts, model details, and diagnostics' },
};

export const Topbar: React.FC<TopbarProps> = ({
  activePage,
  onOpenMobileMenu,
  isLoading,
  demoModeActive,
}) => {
  const meta = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-slate-400 hidden sm:block">ThaiKOL AI</span>
          <span className="text-xs text-slate-300 hidden sm:block">/</span>
          <span className="text-xs font-semibold text-slate-800 truncate">{meta.title}</span>
        </div>
      </div>

      {/* Right: demo mode badge + API docs */}
      <div className="flex items-center gap-2.5">
        {demoModeActive && (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded badge-demo text-[11px] font-medium"
            title="Running on curated Khaokho Talaypu fixture — no live API calls"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Demo Mode</span>
          </div>
        )}

        {isLoading && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shrink-0" />
            <span>Analyzing...</span>
          </div>
        )}

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
          title="Open Swagger API Documentation"
        >
          <BookOpen className="w-3 h-3" />
          <span>API Docs</span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
