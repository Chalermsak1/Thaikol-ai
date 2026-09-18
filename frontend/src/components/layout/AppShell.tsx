import React, { useState } from 'react';
import { ActiveNavPage } from '../../types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
  activePage: ActiveNavPage;
  onSelectPage: (page: ActiveNavPage) => void;
  hasAnalyzedBrand: boolean;
  comparisonCount: number;
  onRunDemo: () => void;
  isLoading: boolean;
  demoModeActive: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activePage,
  onSelectPage,
  hasAnalyzedBrand,
  comparisonCount,
  onRunDemo,
  isLoading,
  demoModeActive,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex">
      <Sidebar
        activePage={activePage}
        onSelectPage={onSelectPage}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        hasAnalyzedBrand={hasAnalyzedBrand}
        comparisonCount={comparisonCount}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onRunDemo={onRunDemo}
          isLoading={isLoading}
          demoModeActive={demoModeActive}
        />

        <main
          key={activePage}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-[1280px] w-full mx-auto page-enter"
        >
          {children}
        </main>

        <footer className="border-t border-slate-200/60 py-4 px-6 text-center text-[11px] text-slate-400">
          ThaiKOL AI · Explainable TikTok Creator Intelligence for the Thai Market
        </footer>
      </div>
    </div>
  );
};
