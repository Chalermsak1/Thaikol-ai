import React from 'react';
import { ActiveNavPage, ProviderHealthResponse } from '../../types';
import { BookOpen, ExternalLink, Menu, RotateCcw } from 'lucide-react';

interface TopbarProps {
  activePage: ActiveNavPage;
  onOpenMobileMenu: () => void;
  onRunDemo?: () => void;
  isLoading: boolean;
  demoModeActive: boolean;
  providerHealth?: ProviderHealthResponse | null;
  hasAnalyzedBrand?: boolean;
  onResetSession?: () => void;
}

const PAGE_TITLES: Record<ActiveNavPage, { section: string; title: string; subtitle: string }> = {
  dashboard: { section: 'ภาพรวม', title: 'หน้าแรก (Overview)', subtitle: 'ระบบค้นหาและวิเคราะห์ TikTok KOL สำหรับแบรนด์ไทย' },
  analyze: { section: 'วิเคราะห์', title: 'วิเคราะห์แบรนด์ (Analyze)', subtitle: 'ป้อน URL เว็บไซต์และ Facebook Page เพื่อดึงข้อมูล' },
  brand: { section: 'แบรนด์', title: 'ข้อมูลแบรนด์ (Profile)', subtitle: 'วิเคราะห์อุตสาหกรรม สินค้า และกลุ่มเป้าหมาย' },
  discovery: { section: 'ค้นหา', title: 'ค้นหา KOL (Discovery)', subtitle: 'ค้นหา TikTok Creator ตามหมวดหมู่และคีย์เวิร์ด' },
  recommendations: { section: 'ผลลัพธ์', title: 'ครีเอเตอร์ที่แนะนำ (Ranked)', subtitle: 'จัดอันดับความเหมาะสมด้วย 5-Factor Scoring' },
  compare: { section: 'เปรียบเทียบ', title: 'เปรียบเทียบครีเอเตอร์', subtitle: 'ประเมินจุดเด่นแบบเคียงข้างกัน 5 มิติ' },
  shortlist: { section: 'บันทึก', title: 'รายการบันทึก (Shortlist)', subtitle: 'พอร์ตโฟลิโอครีเอเตอร์ที่คัดเลือกไว้' },
  reports: { section: 'รายงาน', title: 'สรุปรายงาน (Report)', subtitle: 'สรุปข้อมูลแคมเปญและประมาณการเรทการ์ด' },
  sources: { section: 'ระบบ', title: 'แหล่งข้อมูล (Data Sources)', subtitle: 'สถานะ Provider และหลักฐานข้อมูลสาธารณะ' },
  technical: { section: 'ระบบ', title: 'ข้อมูลทางเทคนิค (Technical)', subtitle: 'สถาปัตยกรรมระบบ AI และแบบจำลองทางคณิตศาสตร์' },
};

export const Topbar: React.FC<TopbarProps> = ({
  activePage,
  onOpenMobileMenu,
  isLoading,
  demoModeActive,
  providerHealth,
  hasAnalyzedBrand,
  onResetSession,
}) => {
  const meta = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile menu toggle + Brand / Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Mark */}
        <div className="flex md:hidden items-center gap-1.5 font-black text-slate-900 tracking-tight text-base">
          <span className="w-6 h-6 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center text-xs shadow-xs">
            ✦
          </span>
          <span>ThaiKOL</span>
          <span className="text-slate-300 mx-0.5">·</span>
          <span className="font-bold text-xs sm:text-sm text-slate-600 truncate max-w-[150px]">
            {meta.section}
          </span>
        </div>

        {/* Desktop Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 min-w-0 text-sm">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] shrink-0" />
            <span className="tracking-tight font-extrabold text-slate-950">ThaiKOL AI</span>
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-bold px-2 py-0.5 rounded-md bg-slate-100 text-xs uppercase tracking-wider">
            {meta.section}
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 truncate tracking-tight text-sm">{meta.title}</span>
        </nav>
      </div>

      {/* Right: Live/Demo status badge + Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {hasAnalyzedBrand && onResetSession && (
          <button
            onClick={onResetSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer shadow-2xs"
            title="Reset session and start new brand analysis"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        )}

        {isLoading && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs sm:text-sm font-semibold text-indigo-700">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-beacon shrink-0" />
            <span>Running Pipeline...</span>
          </div>
        )}

        {demoModeActive ? (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs"
            title="Curated benchmark fixtures active for deterministic testing & offline demonstration"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>DEMO MODE</span>
          </div>
        ) : providerHealth?.providers?.tiktok?.status === 'configured' ? (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs"
            title="Live mode active: Apify TikTok Scraper provider configured and connected"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>LIVE DATA (Apify Connected)</span>
          </div>
        ) : (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold shadow-2xs"
            title="Live mode is active. Real TikTok creator discovery will require configuring APIFY_API_TOKEN."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>LIVE (Apify Unconfigured)</span>
          </div>
        )}

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition"
          title="Open FastAPI Swagger Interactive Documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>API</span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
