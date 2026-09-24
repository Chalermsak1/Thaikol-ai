import React from 'react';
import { ActiveNavPage } from '../../types';
import {
  LayoutDashboard,
  Sparkles,
  Building2,
  Users,
  Award,
  SlidersHorizontal,
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
  { id: 'dashboard' as ActiveNavPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze' as ActiveNavPage, label: 'Analyze Brand', icon: Sparkles },
  { id: 'brand' as ActiveNavPage, label: 'Brand Analysis', icon: Building2 },
  { id: 'discovery' as ActiveNavPage, label: 'KOL Discovery', icon: Users },
  { id: 'recommendations' as ActiveNavPage, label: 'Recommendations', icon: Award },
  { id: 'compare' as ActiveNavPage, label: 'Compare', icon: SlidersHorizontal },
];

const systemNav = [
  { id: 'reports' as ActiveNavPage, label: 'Reports', icon: FileText },
  { id: 'sources' as ActiveNavPage, label: 'Data Sources', icon: Database },
  { id: 'technical' as ActiveNavPage, label: 'Technical', icon: Terminal },
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
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          isActive
            ? 'bg-slate-900 text-white font-semibold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${isCollapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4'} ${
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
        {!isCollapsed && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}
        {!isCollapsed && 'badge' in item && item.badge && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
              isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
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
      className={`h-full bg-white border-r border-slate-200/90 flex flex-col transition-[width] duration-200 ease-out select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center border-b border-slate-100 ${isCollapsed ? 'justify-center p-3.5' : 'justify-between px-5 py-4'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-white font-bold text-xs tracking-wider">TK</span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 leading-tight tracking-tight truncate">
                ThaiKOL AI
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 tracking-wider uppercase">
                Creator Intelligence
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
            <span className="text-white font-bold text-xs tracking-wider">TK</span>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System
            </div>
          )}
          {systemNav.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom: collapse toggle (collapsed state) + status cards */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="API Connected" />
            {demoModeActive && (
              <div className="w-2 h-2 rounded-full bg-amber-500" title="Demo Mode" />
            )}
          </div>
        ) : (
          <>
            {/* API Status */}
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-slate-800 leading-tight">API Connected</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">FastAPI · Port 8000</div>
              </div>
              <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>

            {/* Demo Mode indicator when active */}
            {demoModeActive && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-[10px] tracking-wide uppercase">Demo Mode</span>
                <span className="text-[10px] text-amber-600 ml-auto font-medium truncate">Curated</span>
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
