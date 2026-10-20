import React, { useState } from 'react';
import { KOLRecommendation, ShortlistItem, OutreachStatus } from '../types';
import { estimateCreatorRateCard, formatTHBCurrency } from '../lib/rateCardCalculator';
import { formatCompactNumber } from '../lib/format';
import { TikTokProfileCTA } from '../components/kol/TikTokProfileCTA';
import { EmptyState } from '../components/common/EmptyState';
import {
  Star,
  Users,
  DollarSign,
  Download,
  Copy,
  Check,
  Trash2,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';

interface ShortlistViewProps {
  shortlist: Record<string, ShortlistItem>;
  onUpdateStatus: (username: string, status: OutreachStatus) => void;
  onUpdateNotes: (username: string, notes: string) => void;
  onRemoveFromShortlist: (username: string) => void;
  onRemove?: (username: string) => void;
  onClearAll?: () => void;
  onOpenCreatorDetail: (creator: KOLRecommendation) => void;
  onGoToRecommendations: () => void;
  brandName?: string;
}

const STATUS_CONFIG: Record<OutreachStatus, { label: string; thaiLabel: string; bg: string; text: string; border: string }> = {
  shortlisted: { label: 'Shortlisted', thaiLabel: 'บันทึกไว้', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  contacted: { label: 'Contacted', thaiLabel: 'ติดต่อแล้ว', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  negotiating: { label: 'Negotiating', thaiLabel: 'กำลังต่อรอง', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  confirmed: { label: 'Confirmed', thaiLabel: 'ยืนยันร่วมงาน', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  declined: { label: 'Declined', thaiLabel: 'ปฏิเสธ/ไม่ผ่าน', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  shortlist,
  onUpdateStatus,
  onUpdateNotes,
  onRemoveFromShortlist,
  onRemove,
  onOpenCreatorDetail,
  onGoToRecommendations,
  brandName = 'Campaign',
}) => {
  const [copied, setCopied] = useState(false);
  const items = Object.values(shortlist);

  if (items.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีครีเอเตอร์ในรายการบันทึก"
        description="กดไอคอนบุ๊กมาร์กหรือติดดาวครีเอเตอร์จากการค้นหา เพื่อวางแผนงบประมาณและจัดทีม KOL สำหรับแคมเปญของคุณ"
        actionLabel="ค้นหาครีเอเตอร์เลย"
        onAction={onGoToRecommendations}
        icon={<Star className="w-5 h-5 text-amber-500" />}
      />
    );
  }

  // Aggregate Campaign Metrics
  const totalFollowers = items.reduce(
    (sum, item) =>
      sum +
      (item.creator.follower_count ??
        (item.creator.audience_fit_proxy ? item.creator.audience_fit_proxy * 1000 : 45000)),
    0
  );

  const totalProjectedViews = items.reduce(
    (sum, item) =>
      sum +
      (item.creator.average_views ??
        Math.round((item.creator.follower_count ?? 45000) * 0.25)),
    0
  );

  const budgetMetrics = items.reduce(
    (acc, item) => {
      const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
      return {
        min: acc.min + rate.minRateTHB,
        max: acc.max + rate.maxRateTHB,
        avg: acc.avg + rate.avgRateTHB,
      };
    },
    { min: 0, max: 0, avg: 0 }
  );

  const confirmedCount = items.filter((i) => i.status === 'confirmed').length;

  // Copy Shortlist Summary / Agency Media Plan Proposal
  const handleCopyRoster = () => {
    const listText = items
      .map((item, idx) => {
        const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
        return `${idx + 1}. ${item.creator.display_name} (@${item.creator.username})\n   ระดับ: ${rate.tierLabel} | แมตช์: ${item.creator.final_score.toFixed(1)}/100\n   สถานะ: ${STATUS_CONFIG[item.status].thaiLabel} (${STATUS_CONFIG[item.status].label})\n   ผู้ติดตาม: ${formatCompactNumber(item.creator.follower_count ?? 0)} | วิวเฉลี่ย: ${formatCompactNumber(item.creator.average_views ?? 0)}\n   ประเมินค่าจ้าง/คลิป: ${formatTHBCurrency(rate.minRateTHB)} - ${formatTHBCurrency(rate.maxRateTHB)} (เฉลี่ย ${formatTHBCurrency(rate.avgRateTHB)})\n   บันทึก: ${item.notes || '-'}`;
      })
      .join('\n\n');

    const estimatedCPV = (budgetMetrics.avg / Math.max(totalProjectedViews, 1)).toFixed(2);

    const text = `🎯 THAIKOL AI · CAMPAIGN MEDIA PLAN PROPOSAL
แบรนด์/แคมเปญ: ${brandName}
จำนวนครีเอเตอร์ในแผน: ${items.length} คน (ยืนยันแล้ว: ${confirmedCount} คน)
รวมยอดผู้ติดตามเป้าหมาย: ${formatCompactNumber(totalFollowers)} บัญชี
ประมาณการยอดวิวรวม: ~${formatCompactNumber(totalProjectedViews)} วิว
ประมาณการงบประมาณรวม: ${formatTHBCurrency(budgetMetrics.min)} - ${formatTHBCurrency(budgetMetrics.max)} (เฉลี่ย: ${formatTHBCurrency(budgetMetrics.avg)})
ประมาณการต้นทุนต่อวิว (CPV): ~฿${estimatedCPV} บาท/วิว
=====================================================

${listText}
`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download Shortlist CSV
  const handleDownloadCSV = () => {
    const headers = [
      'username',
      'display_name',
      'status',
      'final_score',
      'min_rate_thb',
      'max_rate_thb',
      'avg_rate_thb',
      'notes',
      'added_at',
    ];

    const rows = items.map((item) => {
      const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
      return [
        `"${item.creator.username}"`,
        `"${item.creator.display_name.replace(/"/g, '""')}"`,
        `"${item.status}"`,
        item.creator.final_score.toFixed(1),
        rate.minRateTHB,
        rate.maxRateTHB,
        rate.avgRateTHB,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
        `"${item.addedAt}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${brandName.toLowerCase().replace(/\s+/g, '_')}_shortlist_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              รายการบันทึกแคมเปญ & การติดต่อ
            </h1>
            <span className="badge bg-orange-50 text-[#FF5A1F] border border-orange-200/80 font-mono font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-full">
              {items.length} ครีเอเตอร์
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            ติดตามสถานะการติดต่อ ต่อรองราคา และประเมินงบประมาณแคมเปญสำหรับ {brandName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyRoster}
            className="flex-1 sm:flex-initial btn-secondary text-xs sm:text-sm px-4 py-2.5 gap-1.5 min-h-[44px] justify-center cursor-pointer rounded-full font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'คัดลอกสรุปแล้ว' : 'คัดลอกสรุป (Brief)'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-initial btn-orange text-xs sm:text-sm px-5 py-2.5 gap-1.5 min-h-[44px] justify-center cursor-pointer shadow-xs rounded-full font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Aggregate KPI Overview (Mobile 2x2 Grid) ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Roster Size */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              ขนาดทีม (Roster)
            </span>
            <Star className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]/20" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {items.length} <span className="text-xs font-normal text-slate-400">คน</span>
          </div>
          <div className="text-xs text-slate-500 truncate font-medium">
            {confirmedCount} ยืนยัน · {items.length - confirmedCount} กำลังคุย
          </div>
        </div>

        {/* Estimated Budget Range */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              งบเฉลี่ย (Est. Budget)
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-600 font-mono truncate">
            {formatTHBCurrency(budgetMetrics.avg)}
          </div>
          <div className="text-xs text-slate-500 truncate font-medium">
            {formatTHBCurrency(budgetMetrics.min)} - {formatTHBCurrency(budgetMetrics.max)}
          </div>
        </div>

        {/* Est Combined Reach */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              ผู้ติดตามรวม (Reach)
            </span>
            <Users className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ~{(totalFollowers / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-500 truncate font-medium">
            ฐานผู้ติดตามรวม
          </div>
        </div>

        {/* Average Match Quality */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              คะแนนเฉลี่ย (Fit)
            </span>
            <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {(items.reduce((s, i) => s + i.creator.final_score, 0) / items.length).toFixed(1)}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <div className="text-xs text-slate-500 truncate font-medium">
            ค่าเฉลี่ย 5 ปัจจัย
          </div>
        </div>
      </div>

      {/* ─── Shortlist Cards List ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span>รายชื่อครีเอเตอร์และสถานะการติดต่อ</span>
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            ประเมินตามอัตราตลาดในประเทศไทย
          </span>
        </div>

        {items.map((item) => {
          const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
          const currentStatus = STATUS_CONFIG[item.status];

          return (
            <div key={item.username} className="p-4 sm:p-5 hover:bg-slate-50/40 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Identity */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-slate-100 border border-slate-200/90 text-slate-900 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                    {item.creator.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onOpenCreatorDetail(item.creator)}
                        className="font-bold text-slate-900 hover:text-[#FF5A1F] transition text-sm sm:text-base cursor-pointer truncate text-left"
                      >
                        {item.creator.display_name}
                      </button>
                      <span className="text-xs sm:text-sm font-mono text-slate-400 truncate">
                        @{item.creator.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="badge badge-neutral text-xs font-semibold">
                        {rate.tierLabel}
                      </span>
                      <span className="badge bg-orange-50 text-[#FF5A1F] border border-orange-200/80 text-xs font-mono font-bold">
                        Fit: {item.creator.final_score.toFixed(1)}/100
                      </span>
                      {item.creator.matching_topics.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Selector & Rate Card Row */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                  {/* Commercial Rate Card */}
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-left sm:text-right">
                    <div className="text-[11px] uppercase font-bold text-emerald-700">
                      ประมาณการค่าจ้าง / คลิป
                    </div>
                    <div className="text-xs sm:text-sm font-black text-emerald-800 font-mono">
                      {formatTHBCurrency(rate.minRateTHB)} - {formatTHBCurrency(rate.maxRateTHB)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.username, e.target.value as OutreachStatus)}
                      className={`text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border cursor-pointer min-h-[44px] ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                    >
                      <option value="shortlisted">⭐ บันทึกไว้</option>
                      <option value="contacted">📩 ติดต่อแล้ว</option>
                      <option value="negotiating">🤝 กำลังต่อรอง</option>
                      <option value="confirmed">✅ ยืนยันร่วมงาน</option>
                      <option value="declined">❌ ไม่ผ่าน/ปฏิเสธ</option>
                    </select>

                    <TikTokProfileCTA creator={item.creator} variant="inline" />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => (onRemoveFromShortlist ? onRemoveFromShortlist(item.username) : onRemove?.(item.username))}
                      className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                      title="ลบออกจากรายการบันทึก"
                      aria-label="ลบออกจากรายการบันทึก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Notes Field */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="บันทึกเพิ่มเติม (เช่น ไลน์ติดต่อ, รายละเอียดบรีฟ, เงื่อนไขพิเศษ)..."
                  defaultValue={item.notes || ''}
                  onBlur={(e) => onUpdateNotes(item.username, e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#FF5A1F] focus:outline-none transition py-1 font-thai"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistence Note Footer */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          รายการบันทึกนี้ถูกจัดเก็บไว้ในเบราว์เซอร์ของอุปกรณ์นี้ (Local Browser Storage) โดยอัตโนมัติ
        </span>
      </div>
    </div>
  );
};

export default ShortlistView;
