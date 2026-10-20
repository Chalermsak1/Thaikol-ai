import React from 'react';
import { ActiveNavPage } from '../../types';
import {
  LayoutDashboard,
  Sparkles,
  Building2,
  Users,
  Award,
  SlidersHorizontal,
  BookmarkCheck,
  FileText,
  Database,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Wifi,
} from 'lucide-react';

interface SidebarProps {
  activePage: ActiveNavPage;
  onSelectPage: (page: ActiveNavPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasAnalyzedBrand: boolean;
  comparisonCount: number;
  shortlistCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  demoModeActive?: boolean;
}

const workspaceNav = [
  { id: 'dashboard' as ActiveNavPage, label: 'แดชบอร์ด (Dashboard)', icon: LayoutDashboard },
  { id: 'analyze' as ActiveNavPage, label: 'วิเคราะห์แบรนด์ (Analyze)', icon: Sparkles },
  { id: 'brand' as ActiveNavPage, label: 'โปรไฟล์แบรนด์ (Brand Profile)', icon: Building2 },
  { id: 'discovery' as ActiveNavPage, label: 'ค้นหาครีเอเตอร์ (Discovery)', icon: Users },
  { id: 'recommendations' as ActiveNavPage, label: 'อันดับแนะนำ (Recommendations)', icon: Award },
  { id: 'compare' as ActiveNavPage, label: 'เปรียบเทียบคู่ขนาน (Compare)', icon: SlidersHorizontal },
  { id: 'shortlist' as ActiveNavPage, label: 'บันทึกคัดเลือก (Shortlist)', icon: BookmarkCheck },
];

const systemNav = [
  { id: 'reports' as ActiveNavPage, label: 'รายงานแคมเปญ (Reports)', icon: FileText },
  { id: 'sources' as ActiveNavPage, label: 'แหล่งข้อมูล (Data Sources)', icon: Database },
  { id: 'technical' as ActiveNavPage, label: 'ระบบเทคนิค (Technical)', icon: Terminal },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
  hasAnalyzedBrand,
  comparisonCount,
  shortlistCount = 0,
  isMobileOpen,
  onCloseMobile,
  demoModeActive = true,
}) => {
  const handleNavClick = (page: ActiveNavPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  const NavItem = ({ item }: { item: typeof workspaceNav[0] & { badge?: string | null } }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
          isActive
            ? 'bg-white/12 text-white font-bold shadow-xs ring-1 ring-white/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${isCollapsed ? 'w-5 h-5 mx-auto' : 'w-4.5 h-4.5'} ${
            isActive ? 'text-[#FF5A1F]' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />
        {!isCollapsed && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}
        {!isCollapsed && 'badge' in item && item.badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
              isActive ? 'bg-[#FF5A1F] text-white' : 'bg-white/10 text-slate-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <aside
      className={`h-full bg-[#13161c] border-r border-slate-800/80 flex flex-col transition-[width] duration-200 ease-out select-none text-slate-200 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center border-b border-white/8 ${isCollapsed ? 'justify-center p-3.5' : 'justify-between px-5 py-4'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Modern Creator Logo with vibrant orange accent */}
            <div className="w-9 h-9 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center shrink-0 shadow-sm font-black text-sm tracking-wider">
              ✦
            </div>
            <div className="min-w-0">
              <div className="font-black text-base text-white leading-tight tracking-tight truncate flex items-center gap-1.5">
                <span>ThaiKOL AI</span>
                <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 font-mono">2025</span>
              </div>
              <div className="text-xs text-slate-400 font-semibold leading-tight mt-0.5 tracking-wider uppercase">
                Creator Platform
              </div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center shadow-sm font-black text-sm tracking-wider">
            ✦
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {/* Workspace group */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
          )}
          {workspaceNav.map((item) => (
            <NavItem
              key={item.id}
              item={{
                ...item,
                badge:
                  item.id === 'compare' && comparisonCount > 0
                    ? String(comparisonCount)
                    : item.id === 'shortlist' && shortlistCount > 0
                    ? String(shortlistCount)
                    : item.id === 'brand' && hasAnalyzedBrand
                    ? 'Ready'
                    : undefined,
              }}
            />
          ))}
        </div>

        {/* System group */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              System
            </div>
          )}
          {systemNav.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom: collapse toggle (collapsed state) + status cards */}
      <div className="border-t border-white/8 p-3 space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="API Connected" />
            {demoModeActive && (
              <div className="w-2 h-2 rounded-full bg-amber-400" title="Demo Mode" />
            )}
          </div>
        ) : (
          <>
            {/* API Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/6 border border-white/8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 leading-tight">API Connected</div>
                <div className="text-xs text-slate-400 font-mono truncate">FastAPI · Port 8000</div>
              </div>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>

            {/* Demo Mode indicator when active */}
            {demoModeActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-bold text-xs tracking-wide uppercase">Demo Mode</span>
                <span className="text-xs text-amber-400/80 ml-auto font-medium truncate">Curated</span>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
