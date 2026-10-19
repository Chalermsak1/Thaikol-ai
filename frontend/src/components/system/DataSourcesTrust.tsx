import React from 'react';
import { Globe, Share2, Video, Users, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { ProviderHealthResponse } from '../../types';

type SourceStatus = 'available' | 'partial' | 'unavailable';

interface DataSourcesTrustProps {
  providerHealth?: ProviderHealthResponse | null;
}

const statusConfig: Record<SourceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  available: {
    label: 'พร้อมใช้งาน (Available)',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  partial: {
    label: 'ทำงานบางส่วน (Partial)',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
  },
  unavailable: {
    label: 'ไม่รองรับ (Not Available)',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <XCircle className="w-3.5 h-3.5 text-slate-400" />,
  },
};

export const DataSourcesTrust: React.FC<DataSourcesTrustProps> = ({ providerHealth }) => {
  const isDemo = providerHealth?.demo_mode ?? false;
  const tkConfigured = providerHealth?.providers?.tiktok?.status === 'configured';
  const fbConfigured = providerHealth?.providers?.facebook?.status === 'configured';

  const dynamicSources = [
    {
      name: 'Business Official Website (เว็บไซต์ธุรกิจ)',
      icon: Globe,
      coverage: 'เมทาดาทาสาธารณะ, รายการสินค้า, ข้อมูลจุดยืนแบรนด์, คีย์เวิร์ดผลิตภัณฑ์',
      status: 'available' as SourceStatus,
      note: providerHealth?.providers?.website?.details || 'ProductionWebsiteProvider (SSRF guarded HTML scraper)',
    },
    {
      name: 'Facebook Public Page (หน้าเพจสาธารณะ)',
      icon: Share2,
      coverage: 'ข้อความเกี่ยวกับธุรกิจ, ข้อมูลติดต่อ, ข้อมูลแนะนำเพจสาธารณะ',
      status: (fbConfigured ? 'available' : isDemo ? 'partial' : 'unavailable') as SourceStatus,
      note: fbConfigured
        ? (providerHealth?.providers?.facebook?.details || 'Apify Facebook Pages Scraper active')
        : isDemo
        ? 'โหมดสาธิตมาตรฐาน (Offline Benchmark Fixture)'
        : 'APIFY_API_TOKEN unconfigured. Public page extraction unavailable.',
    },
    {
      name: 'TikTok Public Content (คอนเทนต์สาธารณะบน TikTok)',
      icon: Video,
      coverage: 'แคปชั่นวิดีโอ, แฮชแท็ก, ยอดวิว/ยอดไลก์, สัญญาณภาษาไทย',
      status: (tkConfigured ? 'available' : isDemo ? 'partial' : 'unavailable') as SourceStatus,
      note: tkConfigured
        ? (providerHealth?.providers?.tiktok?.details || 'Apify TikTok Scraper active')
        : isDemo
        ? 'ชุดทดสอบมาตรฐานครีเอเตอร์ไทย (DEMO_MODE=true)'
        : 'APIFY_API_TOKEN unconfigured. Live creator discovery unavailable.',
    },
    {
      name: 'Audience Demographics (ข้อมูลประชากรผู้ติดตามเชิงลึก)',
      icon: Users,
      coverage: 'อายุ, เพศ, รายได้ส่วนบุคคล, ข้อมูลหลังบ้านของบัญชีผู้ใช้',
      status: 'unavailable' as SourceStatus,
      note: 'ไม่สามารถดึงได้ผ่าน Public API — ThaiKOL AI ใช้วิธีประเมินเชิงบริบทเนื้อหา (Audience Fit Proxy) และระบุว่าเป็นข้อมูลอ้างอิงเท่านั้น',
    },
  ];

  return (
    <div className="space-y-4 font-thai">
      {dynamicSources.map((src, idx) => {
        const Icon = src.icon;
        const status = statusConfig[src.status];
        return (
          <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 text-[#FF5A1F] flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon className="w-5 h-5 text-[#FF5A1F]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-black text-slate-900">{src.name}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{src.coverage}</div>
                  <div className="text-[11px] text-slate-400 font-mono pt-0.5">{src.note}</div>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${status.className}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Ethics note */}
      <div className="p-5 rounded-3xl bg-orange-50/40 border border-orange-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black text-[#C93B07]">
          <ShieldCheck className="w-4 h-4 text-[#FF5A1F]" />
          <span>นโยบายความเป็นส่วนตัวและหลักจริยธรรมข้อมูล (Privacy & Data Governance)</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-thai">
          ThaiKOL AI ดึงเฉพาะข้อมูลที่เผยแพร่ต่อสาธารณะเท่านั้น ไม่มีการล็อกอินบัญชีส่วนตัว ไม่มีข้อมูลแชตลับ และไม่มีการประดิษฐ์สถิติหรือผู้ติดตามปลอม ข้อมูลทั้งหมดอิงจากตัวอย่างคอนเทนต์จริงที่สังเกตได้บนแพลตฟอร์ม
        </p>
      </div>
    </div>
  );
};

export default DataSourcesTrust;
