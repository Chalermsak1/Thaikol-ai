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
  Send,
  MessageCircle,
  X,
  ExternalLink,
  Target,
  TrendingUp,
  Layers,
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
  const [targetBudget, setTargetBudget] = useState<number>(50000);
  const [pitchCreator, setPitchCreator] = useState<KOLRecommendation | null>(null);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [pitchAngle, setPitchAngle] = useState('รีวิวสินค้าจริง 1 คลิป ความยาว 45-60 วินาที พร้อมปักตะกร้า');
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

  // Download Enterprise Media Plan CSV (with UTF-8 BOM for Thai Excel compatibility)
  const handleDownloadCSV = () => {
    const headers = [
      'ลำดับ (No.)',
      'ชื่อบัญชี (Username)',
      'ชื่อที่แสดง (Display Name)',
      'สถานะการติดต่อ (Status)',
      'ระดับ (Tier)',
      'ผู้ติดตาม (Followers)',
      'ยอดวิวเฉลี่ย (Avg Views)',
      'Engagement Rate (%)',
      'คะแนนแมตช์ AI (Fit Score)',
      'LINE ID',
      'Email',
      'เบอร์โทรศัพท์ (Phone)',
      'TikTok Shop ตะกร้า',
      'สไตล์คอนเทนต์ (Content Formats)',
      'ประมาณการเรทการ์ดต่ำสุด (THB)',
      'ประมาณการเรทการ์ดสูงสุด (THB)',
      'ประมาณการเรทการ์ดเฉลี่ย (THB)',
      'ลิงก์โปรไฟล์ TikTok',
      'บันทึกแคมเปญ (Notes)',
      'วันที่บันทึก (Added At)',
    ];

    const rows = items.map((item, idx) => {
      const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
      const er = item.creator.estimated_engagement_rate
        ? (item.creator.estimated_engagement_rate * 100).toFixed(2) + '%'
        : '-';
      const formats = item.creator.content_formats?.join('; ') || '-';
      const tiktokUrl = item.creator.profile_url || `https://www.tiktok.com/@${item.creator.username}`;

      return [
        idx + 1,
        `"${item.creator.username}"`,
        `"${item.creator.display_name.replace(/"/g, '""')}"`,
        `"${STATUS_CONFIG[item.status].thaiLabel}"`,
        `"${item.creator.creator_tier || rate.tierLabel}"`,
        item.creator.follower_count || 0,
        item.creator.average_views || 0,
        `"${er}"`,
        item.creator.final_score.toFixed(1),
        `"${item.creator.contact_line_id || '-'}"`,
        `"${item.creator.contact_email || '-'}"`,
        `"${item.creator.contact_phone || '-'}"`,
        `"${item.creator.has_tiktok_shop ? 'มีตะกร้า' : 'ไม่มี'}"`,
        `"${formats.replace(/"/g, '""')}"`,
        item.creator.rate_card_min || rate.minRateTHB,
        item.creator.rate_card_max || rate.maxRateTHB,
        rate.avgRateTHB,
        `"${tiktokUrl}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
        `"${item.addedAt}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${brandName.toLowerCase().replace(/\s+/g, '_')}_media_plan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Personalized Outreach Pitch Text
  const generatePitchText = (creator: KOLRecommendation) => {
    const rate = estimateCreatorRateCard(creator.follower_count, creator.average_views);
    const formatStr = creator.content_formats?.[0] || 'รีวิว/ป้ายยา';
    return `สวัสดีครับ/ค่ะคุณ ${creator.display_name} (@${creator.username}) 🌸
ติดต่อจากทีมการตลาดแบรนด์ "${brandName}" ครับ/ค่ะ

ทางทีมได้เห็นคลิป TikTok สไตล์ "${formatStr}" ของคุณแล้ว ชื่นชอบและมองว่าสอดคล้องกับภาพลักษณ์ของแบรนด์เราเป็นอย่างยิ่ง จึงอยากขอเรียนเชิญร่วมงานทำคลิปสปอนเซอร์ (Sponsored Video) ความยาว 45-60 วินาที

📌 ธีม/คอนเซ็ปต์: ${pitchAngle}
💰 ประมาณการเรทการ์ด: ${formatTHBCurrency(creator.rate_card_min || rate.minRateTHB)} - ${formatTHBCurrency(creator.rate_card_max || rate.maxRateTHB)} บาท (สามารถพูดคุยเงื่อนไขเพิ่มเติมได้ครับ)

หากคุณ ${creator.display_name} สะดวกรับงาน รบกวนขอทราบเงื่อนไขและคิวงานเพิ่มเติมได้เลยนะครับ ขอบพระคุณมากครับ 🙏✨`;
  };

  const handleCopyPitch = (creator: KOLRecommendation) => {
    const text = generatePitchText(creator);
    navigator.clipboard.writeText(text).then(() => {
      setPitchCopied(true);
      setTimeout(() => setPitchCopied(false), 2000);
    });
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

      {/* ─── Campaign Budget Optimizer & Audience Diversity Panel ────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FF5A1F] flex items-center justify-center text-xs">
                <Target className="w-4 h-4 text-white" />
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                จำลองงบประมาณแคมเปญ & พอร์ต KOL (Budget Optimizer)
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              ตั้งงบประมาณเป้าหมายเพื่อวิเคราะห์ความคุ้มค่า สัดส่วน Tier และการกระจายตัวของกลุ่มเป้าหมาย
            </p>
          </div>

          {/* Quick Target Budget Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
              ตั้งงบ:
            </span>
            {[30000, 50000, 100000, 200000].map((bgVal) => (
              <button
                key={bgVal}
                type="button"
                onClick={() => setTargetBudget(bgVal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer min-h-[36px] ${
                  targetBudget === bgVal
                    ? 'bg-[#FF5A1F] text-white shadow-xs'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                ฿{(bgVal / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Budget Utilization Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">
              งบเฉลี่ยครีเอเตอร์ในแผน: <span className="text-emerald-400 font-black">{formatTHBCurrency(budgetMetrics.avg)}</span>
            </span>
            <span className={budgetMetrics.avg <= targetBudget ? 'text-emerald-400' : 'text-rose-400'}>
              ใช้ไป {((budgetMetrics.avg / Math.max(targetBudget, 1)) * 100).toFixed(0)}% ของงบ {formatTHBCurrency(targetBudget)}
            </span>
          </div>
          <div className="w-full bg-slate-700/80 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                budgetMetrics.avg <= targetBudget * 0.9
                  ? 'bg-emerald-500'
                  : budgetMetrics.avg <= targetBudget
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round((budgetMetrics.avg / Math.max(targetBudget, 1)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* 3 Simulation Metrics Cards: Tier Mix, Projected CPV, Diversity */}
        {(() => {
          const allTopics = items.flatMap((i) => i.creator.matching_topics || []);
          const uniqueTopics = new Set(allTopics);
          const diversityScore = Math.min(
            100,
            Math.round((uniqueTopics.size / Math.max(1, allTopics.length)) * 100) || 85
          );

          const tierCounts = items.reduce((acc: Record<string, number>, item) => {
            const tier = item.creator.creator_tier?.split(' ')[0] || 'Micro';
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
          }, {});

          const cpv = (budgetMetrics.avg / Math.max(totalProjectedViews, 1)).toFixed(2);

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              {/* Tier Distribution Mix */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider">สัดส่วน Tier ในพอร์ต</span>
                  <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
                  {Object.entries(tierCounts).map(([tier, count]) => (
                    <span
                      key={tier}
                      className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 font-bold"
                    >
                      {tier}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projected CPV */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider">ต้นทุนต่อวิว (Est. CPV)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-black font-mono text-emerald-400 pt-0.5">
                  ~฿{cpv} <span className="text-xs font-normal text-slate-400">/ วิว</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  คำนวณจาก ~{formatCompactNumber(totalProjectedViews)} วิวเป้าหมาย
                </div>
              </div>

              {/* Audience Diversity Score */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider">การกระจายผู้ฟัง (Diversity)</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-black font-mono text-amber-300 pt-0.5">
                  {diversityScore}% <span className="text-xs font-normal text-slate-400">ไม่ทับซ้อน</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {diversityScore >= 70 ? '✓ กระจายหมวดหมู่และธีมได้ดี' : '⚠️ กลุ่มผู้ฟังอาจทับซ้อนกันสูง'}
                </div>
              </div>
            </div>
          );
        })()}
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
                        {item.creator.creator_tier || rate.tierLabel}
                      </span>
                      <span className="badge bg-orange-50 text-[#FF5A1F] border border-orange-200/80 text-xs font-mono font-bold">
                        Fit: {item.creator.final_score.toFixed(1)}/100
                      </span>

                      {/* LINE badge if found */}
                      {item.creator.contact_line_id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#06C755]/10 text-[#05963f] border border-[#06C755]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                          <span>LINE: {item.creator.contact_line_id}</span>
                        </span>
                      )}

                      {/* TikTok shop badge if found */}
                      {item.creator.has_tiktok_shop && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span>🛒 Shop</span>
                        </span>
                      )}

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
                      {formatTHBCurrency(item.creator.rate_card_min || rate.minRateTHB)} - {formatTHBCurrency(item.creator.rate_card_max || rate.maxRateTHB)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* 1-Click Outreach Pitch Button */}
                    <button
                      type="button"
                      onClick={() => setPitchCreator(item.creator)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FF5A1F]/10 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 transition flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                      title="สร้างข้อความทักบรีฟงาน 1-Click"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ทักบรีฟงาน</span>
                    </button>

                    {/* Direct LINE 1-Tap Link if present */}
                    {item.creator.contact_line_id && (
                      <a
                        href={`https://line.me/R/ti/p/~${item.creator.contact_line_id.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#06C755] text-white hover:bg-[#05b34c] transition flex items-center gap-1 cursor-pointer min-h-[44px] shadow-2xs"
                        title="เปิด LINE คุยงานทันที"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>LINE</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>
                    )}

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

      {/* ─── 1-Click Outreach Brief Generator Modal ──────────────────── */}
      {pitchCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-thai">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center text-sm shadow-xs">
                  ✉️
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    ข้อความทักบรีฟงาน (Outreach Pitch)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ถึง @{pitchCreator.username} ({pitchCreator.display_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPitchCreator(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Campaign Angle Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  ปรับแต่งคอนเซ็ปต์แคมเปญ:
                </label>
                <input
                  type="text"
                  value={pitchAngle}
                  onChange={(e) => setPitchAngle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF5A1F] focus:outline-none transition"
                />
              </div>

              {/* Generated Text Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  ข้อความพร้อมคัดลอก (Formatted Brief):
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-mono max-h-56 overflow-y-auto">
                  {generatePitchText(pitchCreator)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyPitch(pitchCreator)}
                  className="flex-1 btn-orange text-xs sm:text-sm py-3 justify-center gap-1.5 rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {pitchCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{pitchCopied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความทัก LINE / Email'}</span>
                </button>

                {pitchCreator.contact_line_id && (
                  <a
                    href={`https://line.me/R/ti/p/~${pitchCreator.contact_line_id.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>เปิด LINE</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistView;
