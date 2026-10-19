import React from 'react';
import { ActiveNavPage } from '../../types';
import { LayoutDashboard, Users, Sparkles, BookmarkCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activePage: ActiveNavPage;
  onSelectPage: (page: ActiveNavPage) => void;
  shortlistCount?: number;
  hasAnalyzedBrand?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onSelectPage,
  shortlistCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveNavPage,
      label: 'หน้าแรก',
      icon: LayoutDashboard,
    },
    {
      id: 'discovery' as ActiveNavPage,
      label: 'ค้นหา KOL',
      icon: Users,
    },
    {
      id: 'analyze' as ActiveNavPage,
      label: 'วิเคราะห์แบรนด์',
      icon: Sparkles,
    },
    {
      id: 'shortlist' as ActiveNavPage,
      label: 'รายการบันทึก',
      icon: BookmarkCheck,
      badge: shortlistCount > 0 ? shortlistCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePage === item.id ||
            (item.id === 'discovery' && activePage === 'recommendations') ||
            (item.id === 'analyze' && activePage === 'brand');

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] touch-manipulation transition-all duration-150 select-none cursor-pointer relative ${
                isActive
                  ? 'text-[#FF5A1F] font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 bg-[#FF5A1F] text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none ${
                  isActive ? 'font-bold text-slate-900' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
