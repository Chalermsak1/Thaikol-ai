import React, { useState } from 'react';
import { ActiveNavPage, ProviderHealthResponse } from '../../types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
  activePage: ActiveNavPage;
  onSelectPage: (page: ActiveNavPage) => void;
  hasAnalyzedBrand: boolean;
  comparisonCount: number;
  shortlistCount?: number;
  onRunDemo: () => void;
  isLoading: boolean;
  demoModeActive: boolean;
  providerHealth?: ProviderHealthResponse | null;
  onResetSession?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activePage,
  onSelectPage,
  hasAnalyzedBrand,
  comparisonCount,
  shortlistCount = 0,
  onRunDemo,
  isLoading,
  demoModeActive,
  providerHealth,
  onResetSession,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col md:flex-row">
      <Sidebar
        activePage={activePage}
        onSelectPage={onSelectPage}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        hasAnalyzedBrand={hasAnalyzedBrand}
        comparisonCount={comparisonCount}
        shortlistCount={shortlistCount}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        demoModeActive={demoModeActive}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onRunDemo={onRunDemo}
          isLoading={isLoading}
          demoModeActive={demoModeActive}
          providerHealth={providerHealth}
          hasAnalyzedBrand={hasAnalyzedBrand}
          onResetSession={onResetSession}
        />

        <main
          key={activePage}
          className="flex-1 px-3.5 py-4 sm:px-6 lg:px-8 max-w-[1280px] w-full mx-auto page-enter pb-24 md:pb-8"
        >
          {children}
        </main>

        <footer className="border-t border-slate-200/60 py-4 px-6 text-center text-[11px] text-slate-400 pb-22 md:pb-4">
          ThaiKOL AI · แพลตฟอร์มวิเคราะห์และค้นหา TikTok Creator อัจฉริยะสำหรับแบรนด์ไทย
        </footer>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomNav
        activePage={activePage}
        onSelectPage={onSelectPage}
        shortlistCount={shortlistCount}
        hasAnalyzedBrand={hasAnalyzedBrand}
      />
    </div>
  );
};
