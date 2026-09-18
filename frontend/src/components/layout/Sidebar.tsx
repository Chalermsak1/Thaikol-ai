import React from 'react';
import { ActiveNavPage } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Users,
  Award,
  SlidersHorizontal,
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
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const workspaceNav = [
  { id: 'dashboard' as ActiveNavPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'brand' as ActiveNavPage, label: 'Brand Analysis', icon: Building2 },
  { id: 'discovery' as ActiveNavPage, label: 'KOL Discovery', icon: Users },
  { id: 'recommendations' as ActiveNavPage, label: 'Recommendations', icon: Award },
  { id: 'compare' as ActiveNavPage, label: 'Compare', icon: SlidersHorizontal },
];

const systemNav = [
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
  isMobileOpen,
  onCloseMobile,
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
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${isCollapsed ? 'w-[18px] h-[18px] mx-auto' : 'w-[15px] h-[15px]'} ${
            isActive ? 'text-white' : 'text-slate-400'
          }`}
        />
        {!isCollapsed && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}
        {!isCollapsed && 'badge' in item && item.badge && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full tabular-nums ${
              isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
      className={`h-full bg-white border-r border-slate-200 flex flex-col transition-[width] duration-200 ease-out ${
        isCollapsed ? 'w-[60px]' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center border-b border-slate-100 ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[11px] tracking-tight">TK</span>
            </div>
            <div>
              <div className="font-semibold text-[13px] text-slate-900 leading-tight tracking-tight">
                ThaiKOL AI
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Creator Intelligence
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-[11px]">TK</span>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {/* Workspace group */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="page-section-label mb-2">Workspace</div>
          )}
          {workspaceNav.map((item) => (
            <NavItem
              key={item.id}
              item={{
                ...item,
                badge:
                  item.id === 'compare' && comparisonCount > 0
                    ? String(comparisonCount)
                    : item.id === 'brand' && hasAnalyzedBrand
                    ? '●'
                    : undefined,
              }}
            />
          ))}
        </div>

        {/* System group */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="page-section-label mb-2">System</div>
          )}
          {systemNav.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom: collapse toggle (collapsed state) + status */}
      <div className="border-t border-slate-100 p-2.5 space-y-2">
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-200">
            <Wifi className="w-3 h-3 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-700 leading-tight">API Connected</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">FastAPI · Standby</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-60 h-full shadow-drawer">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
