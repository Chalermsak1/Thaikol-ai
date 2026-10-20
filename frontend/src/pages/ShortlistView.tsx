import React, { useState } from 'react';
import { KOLRecommendation, ShortlistItem, OutreachStatus, Campaign, DocumentAttachment } from '../types';
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
  Send,
  MessageCircle,
  X,
  ExternalLink,
  Target,
  TrendingUp,
  Layers,
  Calendar,
  Clock,
  Paperclip,
  BarChart3,
  Plus,
  CheckCircle2,
  FolderPlus,
  Eye,
  Heart,
  FileText,
} from 'lucide-react';

interface ShortlistViewProps {
  shortlist: Record<string, ShortlistItem>;
  onUpdateStatus: (username: string, status: OutreachStatus) => void;
  onUpdateNotes: (username: string, notes: string) => void;
  onUpdateItem?: (username: string, updates: Partial<ShortlistItem>) => void;
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
  completed: { label: 'Completed', thaiLabel: 'จบงานแล้ว', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  declined: { label: 'Declined', thaiLabel: 'ปฏิเสธ/ไม่ผ่าน', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  shortlist,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateItem,
  onRemoveFromShortlist,
  onRemove,
  onOpenCreatorDetail,
  onGoToRecommendations,
  brandName = 'Campaign',
}) => {
  // Navigation Tabs: Pipeline vs Post-Campaign ROI
  const [activeTab, setActiveTab] = useState<'pipeline' | 'post_campaign'>('pipeline');

  // Campaigns Workspace State
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp-q4-skincare',
      name: '🌸 Q4 สกินแคร์ & บิวตี้ 2026',
      brandName: brandName || 'เขาค้อทะเลภู',
      targetBudget: 100000,
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      description: 'แคมเปญกระตุ้นยอดขายไตรมาส 4 เน้นสูตรสมุนไพรธรรมชาติ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'camp-hair-hero',
      name: '🌿 แคมเปญแชมพูสมุนไพรลดผมร่วง',
      brandName: brandName || 'เขาค้อทะเลภู',
      targetBudget: 50000,
      startDate: '2026-10-15',
      endDate: '2026-11-30',
      description: 'เน้น KOL สายรีวิวพลีชีพและ How-to ก่อน-หลังใช้ 14 วัน',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampBudget, setNewCampBudget] = useState(50000);
  const [newCampDesc, setNewCampDesc] = useState('');

  // Modals for Timeline & Attachments
  const [timelineModalItem, setTimelineModalItem] = useState<ShortlistItem | null>(null);
  const [docModalItem, setDocModalItem] = useState<ShortlistItem | null>(null);

  // Timeline form state
  const [editDraftDate, setEditDraftDate] = useState('');
  const [editLiveDate, setEditLiveDate] = useState('');
  const [editAgreedRate, setEditAgreedRate] = useState<number | undefined>();
  const [editFormat, setEditFormat] = useState('');

  // Document form state
  const [newDocLabel, setNewDocLabel] = useState('ใบเสนอราคา (Quotation)');
  const [newDocUrl, setNewDocUrl] = useState('');

  // General Actions
  const [copied, setCopied] = useState(false);
  const [targetBudget, setTargetBudget] = useState<number>(50000);
  const [pitchCreator, setPitchCreator] = useState<KOLRecommendation | null>(null);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [pitchAngle, setPitchAngle] = useState('รีวิวสินค้าจริง 1 คลิป ความยาว 45-60 วินาที พร้อมปักตะกร้า');
  const [editingLivePostUsername, setEditingLivePostUsername] = useState<string | null>(null);

  const allItems = Object.values(shortlist);

  // Filter items by selected campaign
  const items = selectedCampaignId === 'all'
    ? allItems
    : allItems.filter((i) => (i.campaignId || 'camp-q4-skincare') === selectedCampaignId);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  if (allItems.length === 0) {
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
      const minTHB = item.agreedRateTHB || item.creator.rate_card_min || rate.minRateTHB;
      const maxTHB = item.agreedRateTHB || item.creator.rate_card_max || rate.maxRateTHB;
      const avgTHB = item.agreedRateTHB || Math.round((minTHB + maxTHB) / 2);
      return {
        min: acc.min + minTHB,
        max: acc.max + maxTHB,
        avg: acc.avg + avgTHB,
      };
    },
    { min: 0, max: 0, avg: 0 }
  );

  const confirmedCount = items.filter((i) => i.status === 'confirmed' || i.status === 'completed').length;

  // Post-Campaign Metrics Calculation
  const actualSpend = items.reduce((sum, item) => sum + (item.actualCostTHB || item.agreedRateTHB || 0), 0);
  const actualViews = items.reduce((sum, item) => sum + (item.actualViews || 0), 0);
  const actualLikes = items.reduce((sum, item) => sum + (item.actualLikes || 0), 0);
  const actualComments = items.reduce((sum, item) => sum + (item.actualComments || 0), 0);
  const totalActualEngagements = actualLikes + actualComments;
  const actualOverallCPV = actualViews > 0 ? (actualSpend / actualViews).toFixed(2) : '0.00';
  const actualOverallCPE = totalActualEngagements > 0 ? (actualSpend / totalActualEngagements).toFixed(2) : '0.00';

  // Handle Campaign Creation
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampName.trim(),
      brandName: brandName || 'เขาค้อทะเลภู',
      targetBudget: Number(newCampBudget) || 50000,
      description: newCampDesc.trim(),
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [...prev, newCamp]);
    setSelectedCampaignId(newCamp.id);
    setIsCreateCampaignModalOpen(false);
    setNewCampName('');
    setNewCampDesc('');
  };

  // Handle Saving Timeline & Agreed Rate
  const handleSaveTimeline = () => {
    if (!timelineModalItem || !onUpdateItem) return;
    onUpdateItem(timelineModalItem.username, {
      draftDueDate: editDraftDate || undefined,
      liveDate: editLiveDate || undefined,
      agreedRateTHB: editAgreedRate ? Number(editAgreedRate) : undefined,
      deliverableFormat: editFormat || undefined,
    });
    setTimelineModalItem(null);
  };

  // Handle Saving Document Links
  const handleAddDocumentLink = () => {
    if (!docModalItem || !newDocUrl.trim() || !onUpdateItem) return;
    const currentDocs = docModalItem.documentLinks || [];
    const newDoc: DocumentAttachment = {
      id: `doc-${Date.now()}`,
      label: newDocLabel,
      url: newDocUrl.trim(),
    };
    onUpdateItem(docModalItem.username, {
      documentLinks: [...currentDocs, newDoc],
    });
    setNewDocUrl('');
  };

  const handleRemoveDocumentLink = (docId: string) => {
    if (!docModalItem || !onUpdateItem) return;
    const currentDocs = docModalItem.documentLinks || [];
    onUpdateItem(docModalItem.username, {
      documentLinks: currentDocs.filter((d) => d.id !== docId),
    });
  };

  // Copy Shortlist Summary / Agency Media Plan Proposal
  const handleCopyRoster = () => {
    const listText = items
      .map((item, idx) => {
        const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
        return `${idx + 1}. ${item.creator.display_name} (@${item.creator.username})\n   ระดับ: ${rate.tierLabel} | แมตช์: ${item.creator.final_score.toFixed(1)}/100\n   สถานะ: ${STATUS_CONFIG[item.status]?.thaiLabel || item.status}\n   ผู้ติดตาม: ${formatCompactNumber(item.creator.follower_count ?? 0)} | วิวเฉลี่ย: ${formatCompactNumber(item.creator.average_views ?? 0)}\n   กำหนดส่งดราฟต์: ${item.draftDueDate || '-'}\n   กำหนดโพสต์จริง: ${item.liveDate || '-'}\n   เรทการ์ด: ${formatTHBCurrency(item.agreedRateTHB || item.creator.rate_card_min || rate.minRateTHB)} - ${formatTHBCurrency(item.agreedRateTHB || item.creator.rate_card_max || rate.maxRateTHB)}\n   บันทึก: ${item.notes || '-'}`;
      })
      .join('\n\n');

    const estimatedCPV = (budgetMetrics.avg / Math.max(totalProjectedViews, 1)).toFixed(2);

    const text = `🎯 THAIKOL AI · CAMPAIGN MEDIA PLAN PROPOSAL
แบรนด์/แคมเปญ: ${activeCampaign ? activeCampaign.name : brandName}
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
      'แคมเปญ (Campaign)',
      'ชื่อบัญชี (Username)',
      'ชื่อที่แสดง (Display Name)',
      'สถานะการติดต่อ (Status)',
      'กำหนดส่งดราฟต์ (Draft Due)',
      'กำหนดโพสต์จริง (Live Date)',
      'ระดับ (Tier)',
      'ผู้ติดตาม (Followers)',
      'ยอดวิวเฉลี่ย (Avg Views)',
      'Engagement Rate (%)',
      'คะแนนแมตช์ AI (Fit Score)',
      'LINE ID',
      'Email',
      'เบอร์โทรศัพท์ (Phone)',
      'TikTok Shop',
      'รูปแบบคลิป (Formats)',
      'เรตการ์ดต่ำสุด (THB)',
      'เรตการ์ดสูงสุด (THB)',
      'เรตการ์ดตกลงจริง (THB)',
      'ลิงก์โปรไฟล์ TikTok',
      'บันทึกช่วยจำ (Notes)',
    ];

    const rows = items.map((item, idx) => {
      const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
      const camp = campaigns.find((c) => c.id === item.campaignId);
      return [
        idx + 1,
        `"${(camp ? camp.name : activeCampaign?.name || brandName).replace(/"/g, '""')}"`,
        `"@${item.creator.username}"`,
        `"${item.creator.display_name.replace(/"/g, '""')}"`,
        `"${STATUS_CONFIG[item.status]?.thaiLabel || item.status}"`,
        `"${item.draftDueDate || '-'}"`,
        `"${item.liveDate || '-'}"`,
        `"${item.creator.creator_tier || rate.tierLabel}"`,
        item.creator.follower_count ?? 0,
        item.creator.average_views ?? 0,
        ((item.creator.estimated_engagement_rate ?? 0) * 100).toFixed(2),
        item.creator.final_score.toFixed(1),
        `"${item.creator.contact_line_id || '-'}"`,
        `"${item.creator.contact_email || '-'}"`,
        `"${item.creator.contact_phone || '-'}"`,
        item.creator.has_tiktok_shop ? 'มี' : 'ไม่มี',
        `"${(item.creator.content_formats || []).join(', ')}"`,
        item.creator.rate_card_min || rate.minRateTHB,
        item.creator.rate_card_max || rate.maxRateTHB,
        item.agreedRateTHB || rate.avgRateTHB,
        `"${item.creator.profile_url || `https://www.tiktok.com/@${item.creator.username}`}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ThaiKOL_MediaPlan_${(activeCampaign ? activeCampaign.name : brandName).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Post-Campaign Performance Report
  const handleDownloadPostCampaignCSV = () => {
    const headers = [
      'ลำดับ',
      'ครีเอเตอร์',
      'TikTok Handle',
      'สถานะคลิป',
      'ลิงก์คลิปจริง (TikTok URL)',
      'งบประมาณที่จ่ายจริง (THB)',
      'ยอดวิวคาดการณ์ (Projected Views)',
      'ยอดวิวที่ได้จริง (Actual Views)',
      'ยอดวิวเทียบเป้า (%)',
      'ยอดไลก์จริง',
      'ยอดคอมเมนต์จริง',
      'Actual CPV (บาท/วิว)',
      'Actual CPE (บาท/Engage)',
    ];

    const rows = items.map((item, idx) => {
      const projViews = item.creator.average_views || 30000;
      const actViews = item.actualViews || 0;
      const cost = item.actualCostTHB || item.agreedRateTHB || 0;
      const cpv = actViews > 0 ? (cost / actViews).toFixed(2) : '-';
      const cpe = (item.actualLikes || 0) + (item.actualComments || 0) > 0 ? (cost / ((item.actualLikes || 0) + (item.actualComments || 0))).toFixed(2) : '-';
      const pct = projViews > 0 && actViews > 0 ? Math.round((actViews / projViews) * 100) : 0;

      return [
        idx + 1,
        `"${item.creator.display_name.replace(/"/g, '""')}"`,
        `"@${item.creator.username}"`,
        `"${item.trackingStatus || (item.livePostUrl ? 'live' : 'pending_post')}"`,
        `"${item.livePostUrl || '-'}"`,
        cost,
        projViews,
        actViews,
        `${pct}%`,
        item.actualLikes || 0,
        item.actualComments || 0,
        cpv,
        cpe,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ThaiKOL_PostCampaign_ROI_${(activeCampaign ? activeCampaign.name : brandName).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Personalized Outreach Pitch Text
  const generatePitchText = (creator: KOLRecommendation) => {
    const rate = estimateCreatorRateCard(creator.follower_count, creator.average_views);
    const formatStr = creator.content_formats?.[0] || 'รีวิว/ป้ายยา';
    return `สวัสดีครับ/ค่ะคุณ ${creator.display_name} (@${creator.username}) 🌸
ติดต่อจากทีมการตลาดแบรนด์ "${activeCampaign ? activeCampaign.brandName || activeCampaign.name : brandName}" ครับ/ค่ะ

ทางทีมได้เห็นคลิป TikTok สไตล์ "${formatStr}" ของคุณแล้ว ชื่นชอบและมองว่าสอดคล้องกับภาพลักษณ์ของแบรนด์เราเป็นอย่างยิ่ง จึงอยากขอเรียนเชิญร่วมงานทำคลิปสปอนเซอร์ (Sponsored Video) ความยาว 45-60 วินาที

📌 ธีม/คอนเซ็ปต์: ${pitchAngle}
💰 ประมาณการเรตการ์ด: ${formatTHBCurrency(creator.rate_card_min || rate.minRateTHB)} - ${formatTHBCurrency(creator.rate_card_max || rate.maxRateTHB)} บาท (สามารถพูดคุยเงื่อนไขเพิ่มเติมได้ครับ)

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
      {/* ─── Top Tabs: Pipeline vs Post-Campaign ROI ─────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>แผนงาน & ไปป์ไลน์ (Outreach Pipeline)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('post_campaign')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'post_campaign'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ผลลัพธ์จริงหลังปล่อยคลิป (Post-Campaign ROI)</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>PostgreSQL Synced</span>
          </span>
        </div>

        {/* Global Export Button */}
        <div className="flex items-center gap-2">
          {activeTab === 'pipeline' ? (
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="btn-orange text-xs px-3.5 py-2 gap-1.5 cursor-pointer shadow-xs rounded-xl font-bold flex items-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Media Plan (CSV)</span>
              <span className="sm:hidden">CSV</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownloadPostCampaignCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 gap-1.5 cursor-pointer shadow-xs rounded-xl font-bold flex items-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ROI Report (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Campaign Switcher Bar ───────────────────────────────────── */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FolderPlus className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>โฟลเดอร์แคมเปญ:</span>
            </span>

            {/* Campaign Selector Buttons */}
            <button
              type="button"
              onClick={() => setSelectedCampaignId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCampaignId === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ดูทั้งหมด ({allItems.length})
            </button>

            {campaigns.map((camp) => (
              <button
                key={camp.id}
                type="button"
                onClick={() => setSelectedCampaignId(camp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedCampaignId === camp.id
                    ? 'bg-[#FF5A1F] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-[#FF5A1F]'
                }`}
              >
                <span>{camp.name}</span>
                <span className="opacity-70 text-[10px]">
                  ({allItems.filter((i) => (i.campaignId || 'camp-q4-skincare') === camp.id).length})
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCreateCampaignModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#FF5A1F] bg-orange-50 hover:bg-orange-100 transition cursor-pointer flex items-center gap-1 border border-orange-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างแคมเปญใหม่</span>
            </button>
          </div>

          {/* Quick Copy Proposal Link */}
          {activeTab === 'pipeline' && (
            <button
              type="button"
              onClick={handleCopyRoster}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'คัดลอกสรุปแล้ว' : 'คัดลอก Media Plan ทั้งหมด'}</span>
            </button>
          )}
        </div>

        {activeCampaign && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span>🎯 แบรนด์: <strong className="text-slate-800">{activeCampaign.brandName}</strong></span>
              <span>งบเป้าหมาย: <strong className="text-[#FF5A1F]">{formatTHBCurrency(activeCampaign.targetBudget)}</strong></span>
              {activeCampaign.startDate && <span>ระยะเวลา: {activeCampaign.startDate} ถึง {activeCampaign.endDate}</span>}
            </div>
            {activeCampaign.description && <span className="italic text-slate-400">"{activeCampaign.description}"</span>}
          </div>
        )}
      </div>

      {activeTab === 'pipeline' ? (
        <>
          {/* ─── Pipeline View: Aggregate KPI Overview ─────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">ขนาดทีม (Roster)</span>
                <Star className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]/20" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {items.length} <span className="text-xs font-normal text-slate-400">คน</span>
              </div>
              <div className="text-xs text-slate-500 truncate font-medium">
                {confirmedCount} ยืนยัน · {items.length - confirmedCount} กำลังคุย
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">งบเฉลี่ย (Est. Budget)</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-base sm:text-xl font-black text-emerald-600 font-mono truncate">
                {formatTHBCurrency(budgetMetrics.avg)}
              </div>
              <div className="text-xs text-slate-500 truncate font-medium">
                {formatTHBCurrency(budgetMetrics.min)} - {formatTHBCurrency(budgetMetrics.max)}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">ผู้ติดตามรวม (Reach)</span>
                <Users className="w-4 h-4 text-[#FF5A1F]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ~{(totalFollowers / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-slate-500 truncate font-medium">ฐานผู้ติดตามรวม</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">คะแนนเฉลี่ย (Fit)</span>
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {(items.reduce((s, i) => s + i.creator.final_score, 0) / items.length).toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
              <div className="text-xs text-slate-500 truncate font-medium">ค่าเฉลี่ย 5 ปัจจัย</div>
            </div>
          </div>

          {/* ─── Campaign Budget Optimizer Panel ───────────────────────── */}
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

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">ตั้งงบ:</span>
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

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-300">
                  งบเฉลี่ยในแผน: <span className="text-emerald-400 font-black">{formatTHBCurrency(budgetMetrics.avg)}</span>
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

            {/* Simulation Cards */}
            {(() => {
              const allTopics = items.flatMap((i) => i.creator.matching_topics || []);
              const uniqueTopics = new Set(allTopics);
              const diversityScore = Math.min(100, Math.round((uniqueTopics.size / Math.max(1, allTopics.length)) * 100) || 85);
              const cpv = (budgetMetrics.avg / Math.max(totalProjectedViews, 1)).toFixed(2);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold uppercase tracking-wider">ประมาณการยอดวิวรวม</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-lg font-black font-mono text-emerald-400 pt-0.5">
                      ~{formatCompactNumber(totalProjectedViews)} วิว
                    </div>
                    <div className="text-[11px] text-slate-400">จากคลิปของ {items.length} ครีเอเตอร์</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold uppercase tracking-wider">ต้นทุนต่อวิว (Est. CPV)</span>
                      <DollarSign className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    </div>
                    <div className="text-lg font-black font-mono text-[#FF5A1F] pt-0.5">
                      ~฿{cpv} <span className="text-xs font-normal text-slate-400">/ วิว</span>
                    </div>
                    <div className="text-[11px] text-slate-400">เรตเฉลี่ยตลาด: ฿0.30 - ฿0.80</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold uppercase tracking-wider">การกระจายผู้ฟัง (Diversity)</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-lg font-black font-mono text-amber-300 pt-0.5">
                      {diversityScore}% <span className="text-xs font-normal text-slate-400">ไม่ทับซ้อน</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {diversityScore >= 70 ? '✓ กระจายหมวดหมู่และธีมได้ดี' : '⚠️ กลุ่มผู้ฟังอาจทับซ้อนกัน'}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ─── Creator List with Milestones & Documents ──────────────── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                <span>รายชื่อครีเอเตอร์, กำหนดวันส่งงาน & เอกสาร</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {items.length} รายการในแผน
              </span>
            </div>

            {items.map((item) => {
              const rate = estimateCreatorRateCard(item.creator.follower_count, item.creator.average_views);
              const currentStatus = STATUS_CONFIG[item.status] || STATUS_CONFIG.shortlisted;
              const hasDraftDue = !!item.draftDueDate;
              const hasLiveDate = !!item.liveDate;

              return (
                <div key={item.username} className="p-4 sm:p-5 hover:bg-slate-50/40 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Identity */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        onClick={() => onOpenCreatorDetail(item.creator)}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-slate-100 border border-slate-200/90 hover:border-[#FF5A1F] text-slate-900 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs cursor-pointer transition"
                        title="แตะเพื่อดูข้อมูลเชิงลึก & คลิป"
                      >
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

                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="badge badge-neutral text-xs font-semibold">
                            {item.creator.creator_tier || rate.tierLabel}
                          </span>
                          <span className="badge bg-orange-50 text-[#FF5A1F] border border-orange-200/80 text-xs font-mono font-bold">
                            Fit: {item.creator.final_score.toFixed(1)}%
                          </span>

                          {/* LINE badge */}
                          {item.creator.contact_line_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#06C755]/10 text-[#05963f] border border-[#06C755]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
                              <span>LINE: {item.creator.contact_line_id}</span>
                            </span>
                          )}

                          {/* TikTok shop badge */}
                          {item.creator.has_tiktok_shop && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span>🛒 Shop</span>
                            </span>
                          )}

                          {/* Campaign Assignment Badge */}
                          <select
                            value={item.campaignId || 'camp-q4-skincare'}
                            onChange={(e) => onUpdateItem?.(item.username, { campaignId: e.target.value })}
                            className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer"
                          >
                            {campaigns.map((c) => (
                              <option key={c.id} value={c.id}>
                                📁 {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Status & Commercial Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                      {/* Commercial Rate Card */}
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-left sm:text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-700">
                          {item.agreedRateTHB ? 'เรตการ์ดที่ตกลง' : 'ประมาณการค่าจ้าง / คลิป'}
                        </div>
                        <div className="text-xs sm:text-sm font-black text-emerald-800 font-mono">
                          {item.agreedRateTHB
                            ? formatTHBCurrency(item.agreedRateTHB)
                            : `${formatTHBCurrency(item.creator.rate_card_min || rate.minRateTHB)} - ${formatTHBCurrency(item.creator.rate_card_max || rate.maxRateTHB)}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* View Creator Detail & Clips Button */}
                        <button
                          type="button"
                          onClick={() => onOpenCreatorDetail(item.creator)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#FF5A1F] hover:border-[#FF5A1F] border border-slate-200/90 transition flex items-center gap-1.5 cursor-pointer min-h-[44px] shadow-2xs"
                          title="ดูข้อมูลเชิงลึก & คลิป"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          <span>ดูข้อมูล & คลิป</span>
                        </button>

                        {/* 1-Click Pitch Button */}
                        <button
                          type="button"
                          onClick={() => setPitchCreator(item.creator)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FF5A1F]/10 text-[#FF5A1F] hover:bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 transition flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ทักบรีฟงาน</span>
                        </button>

                        {/* LINE Link */}
                        {item.creator.contact_line_id && (
                          <a
                            href={`https://line.me/R/ti/p/~${item.creator.contact_line_id.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#06C755] text-white hover:bg-[#05b34c] transition flex items-center gap-1 cursor-pointer min-h-[44px] shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>LINE</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                          </a>
                        )}

                        {/* Status Select */}
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.username, e.target.value as OutreachStatus)}
                          className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer min-h-[44px] ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                        >
                          <option value="shortlisted">⭐ บันทึกไว้</option>
                          <option value="contacted">📩 ติดต่อแล้ว</option>
                          <option value="negotiating">🤝 กำลังต่อรอง</option>
                          <option value="confirmed">✅ ยืนยันร่วมงาน</option>
                          <option value="completed">🏆 จบงานแล้ว</option>
                          <option value="declined">❌ ไม่ผ่าน/ปฏิเสธ</option>
                        </select>

                        <TikTokProfileCTA creator={item.creator} variant="inline" />

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => (onRemoveFromShortlist ? onRemoveFromShortlist(item.username) : onRemove?.(item.username))}
                          className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                          title="ลบออกจากรายการบันทึก"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Milestones & Due Dates & Document Attachments Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setTimelineModalItem(item);
                          setEditDraftDate(item.draftDueDate || '');
                          setEditLiveDate(item.liveDate || '');
                          setEditAgreedRate(item.agreedRateTHB);
                          setEditFormat(item.deliverableFormat || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>กำหนดวันส่งงาน</span>
                      </button>

                      {hasDraftDue && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>ดราฟต์: {item.draftDueDate}</span>
                        </span>
                      )}

                      {hasLiveDate && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>โพสต์จริง: {item.liveDate}</span>
                        </span>
                      )}

                      {/* Document Attachment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDocModalItem(item);
                          setNewDocUrl('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        <span>แนบเอกสาร ({item.documentLinks?.length || 0})</span>
                      </button>

                      {/* Display attached document pills */}
                      {item.documentLinks?.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{doc.label}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>

                    {/* Notes Field */}
                    <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="บันทึกข้อความ..."
                        defaultValue={item.notes || ''}
                        onBlur={(e) => onUpdateNotes(item.username, e.target.value)}
                        className="w-full text-xs text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#FF5A1F] focus:outline-none transition py-0.5 font-sans"
                      />
                    </div>
                  </div>

                  {/* Live TikTok Video & Actual ROI Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-emerald-50/40 border border-orange-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>ผลตอบรับจริง:</span>
                      </span>

                      {item.livePostUrl ? (
                        <a
                          href={item.livePostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="เปิดดูคลิปจริงบน TikTok"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>🚀 เปิดดูคลิปจริง</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">ยังไม่มีลิงก์คลิปจริง</span>
                      )}

                      {item.actualViews ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>{formatCompactNumber(item.actualViews)} วิว</span>
                          {item.creator.average_views && (
                            <span className="text-[10px] text-emerald-700 font-normal">
                              ({Math.round((item.actualViews / item.creator.average_views) * 100)}% ของเป้า)
                            </span>
                          )}
                        </span>
                      ) : null}

                      {item.actualViews && (item.actualCostTHB || item.agreedRateTHB) ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold">
                          CPV จริง: ฿{((item.actualCostTHB || item.agreedRateTHB || 0) / item.actualViews).toFixed(2)}/วิว
                        </span>
                      ) : null}
                    </div>

                    {/* Quick input toggle for live clip & views */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLivePostUsername(
                          editingLivePostUsername === item.username ? null : item.username
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>{editingLivePostUsername === item.username ? 'ปิดฟอร์ม' : '✏️ อัปเดตคลิป & ยอดวิว'}</span>
                    </button>
                  </div>

                  {/* Inline Quick Editor if toggled */}
                  {editingLivePostUsername === item.username && (
                    <div className="p-3 rounded-2xl bg-white border border-orange-200 shadow-xs space-y-2 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">ลิงก์คลิป TikTok ที่ลงจริง</label>
                          <input
                            type="text"
                            placeholder="https://www.tiktok.com/@.../video/..."
                            defaultValue={item.livePostUrl || ''}
                            onBlur={(e) => onUpdateItem?.(item.username, { livePostUrl: e.target.value.trim() })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#FF5A1F] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">ยอดวิวได้จริง (Views)</label>
                          <input
                            type="number"
                            placeholder="เช่น 45000"
                            defaultValue={item.actualViews || ''}
                            onBlur={(e) => onUpdateItem?.(item.username, { actualViews: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#FF5A1F] focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* ─── Post-Campaign Performance & Actual ROI Tracker ─────────── */
        <div className="space-y-4">
          {/* Executive Post-Campaign KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">งบจ่ายจริง (Actual Spend)</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatTHBCurrency(actualSpend)}
              </div>
              <p className="text-[11px] text-slate-400">จากงบเป้าหมาย {formatTHBCurrency(targetBudget)}</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">ยอดวิวได้จริง (Actual Views)</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono flex items-center gap-1.5">
                <Eye className="w-5 h-5 text-emerald-500" />
                <span>{formatCompactNumber(actualViews)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                เทียบกับเป้า {formatCompactNumber(totalProjectedViews)} วิว ({totalProjectedViews > 0 ? Math.round((actualViews / totalProjectedViews) * 100) : 0}%)
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Actual CPV (ราคา/วิว)</span>
              <div className="text-xl sm:text-2xl font-black text-[#FF5A1F] font-mono">
                ฿{actualOverallCPV}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">✓ ต่ำกว่า Benchmark ตลาด (฿0.50)</p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Actual CPE (ราคา/Engage)</span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 font-mono flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-purple-500" />
                <span>฿{actualOverallCPE}</span>
              </div>
              <p className="text-[11px] text-slate-400">รวม {formatCompactNumber(totalActualEngagements)} ไลก์ & คอมเมนต์</p>
            </div>
          </div>

          {/* Post-Campaign Creator Tracking Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ติดตามผลลัพธ์วิดีโอที่ปล่อยจริง (Live Content Tracker)
                </h3>
                <p className="text-xs text-slate-500">กรอกลิงก์คลิปจริง ยอดวิว และค่าจ้างที่ตกลง เพื่อให้ระบบคำนวณ Actual CPV แบบเรียลไทม์</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadPostCampaignCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ผลลัพธ์ CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ครีเอเตอร์</th>
                    <th className="py-3 px-4">ลิงก์คลิป TikTok ที่ลงจริง</th>
                    <th className="py-3 px-3 text-right">ค่าจ้างจ่ายจริง (฿)</th>
                    <th className="py-3 px-3 text-right">วิวได้จริง (Views)</th>
                    <th className="py-3 px-3 text-right">Actual CPV</th>
                    <th className="py-3 px-3 text-center">เทียบเป้าหมาย</th>
                    <th className="py-3 px-4 text-center">สถานะติดตาม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {items.map((item) => {
                    const cost = item.actualCostTHB || item.agreedRateTHB || 0;
                    const views = item.actualViews || 0;
                    const cpv = views > 0 ? (cost / views).toFixed(2) : '-';
                    const projViews = item.creator.average_views || 30000;
                    const pct = projViews > 0 && views > 0 ? Math.round((views / projViews) * 100) : 0;

                    return (
                      <tr key={item.username} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                              {item.creator.display_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.creator.display_name}</p>
                              <p className="text-[11px] text-slate-400">@{item.creator.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* TikTok Live Post URL */}
                        <td className="py-3 px-4 min-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="วางลิงก์ https://tiktok.com/@..."
                              defaultValue={item.livePostUrl || ''}
                              onBlur={(e) => onUpdateItem?.(item.username, { livePostUrl: e.target.value.trim() })}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#FF5A1F] focus:outline-none"
                            />
                            {item.livePostUrl && (
                              <a
                                href={item.livePostUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#FF5A1F] flex items-center justify-center shrink-0 cursor-pointer"
                                title="เปิดดูคลิปจริงบน TikTok"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actual Cost */}
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            placeholder="0"
                            defaultValue={cost || ''}
                            onBlur={(e) => onUpdateItem?.(item.username, { actualCostTHB: Number(e.target.value) })}
                            className="w-24 px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono focus:border-[#FF5A1F] focus:outline-none"
                          />
                        </td>

                        {/* Actual Views */}
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            placeholder="0"
                            defaultValue={views || ''}
                            onBlur={(e) => onUpdateItem?.(item.username, { actualViews: Number(e.target.value) })}
                            className="w-24 px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono focus:border-[#FF5A1F] focus:outline-none text-emerald-600 font-bold"
                          />
                        </td>

                        {/* Actual CPV */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {cpv !== '-' ? `฿${cpv}` : '-'}
                        </td>

                        {/* Comparison vs Target */}
                        <td className="py-3 px-3 text-center">
                          {pct > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pct >= 100
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pct >= 70
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {pct >= 100 ? `🟢 ${pct}% เกินเป้า` : `🟡 ${pct}%`}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Tracking Status */}
                        <td className="py-3 px-4 text-center">
                          <select
                            value={item.trackingStatus || (item.livePostUrl ? 'live' : 'pending_post')}
                            onChange={(e) => onUpdateItem?.(item.username, { trackingStatus: e.target.value as any })}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer"
                          >
                            <option value="pending_post">⏳ รอลงคลิป</option>
                            <option value="live">🚀 เผยแพร่แล้ว</option>
                            <option value="tracking_done">🏆 เก็บผลเสร็จสิ้น</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Create New Campaign ──────────────────────────────── */}
      {isCreateCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-[#FF5A1F] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                <span>สร้างโฟลเดอร์แคมเปญใหม่</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateCampaignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อแคมเปญ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แคมเปญโปรโมตเปิดตัวสาขาใหม่"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">งบประมาณเป้าหมาย (บาท)</label>
                <input
                  type="number"
                  required
                  value={newCampBudget}
                  onChange={(e) => setNewCampBudget(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">วัตถุประสงค์ / คำอธิบายสั้นๆ</label>
                <textarea
                  rows={2}
                  placeholder="เช่น เน้นเพิ่มยอดวิวและปักตะกร้า TikTok Shop"
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCampaignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-orange-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  บันทึกแคมเปญ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Edit Timeline & Due Dates ────────────────────────── */}
      {timelineModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-[#FF5A1F] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>กำหนดวันส่งงาน: @{timelineModalItem.username}</span>
              </h3>
              <button
                type="button"
                onClick={() => setTimelineModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">วันกำหนดส่งดราฟต์วิดีโอ (Draft Due)</label>
                <input
                  type="date"
                  value={editDraftDate}
                  onChange={(e) => setEditDraftDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">วันกำหนดโพสต์คลิปจริง (Live Date)</label>
                <input
                  type="date"
                  value={editLiveDate}
                  onChange={(e) => setEditLiveDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ค่าจ้างตกลงจริง (บาท)</label>
                <input
                  type="number"
                  placeholder="ระบุตัวเลขค่าจ้างสุทธิ"
                  value={editAgreedRate || ''}
                  onChange={(e) => setEditAgreedRate(Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTimelineModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveTimeline}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-orange-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  บันทึกกำหนดการ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Document Attachments ─────────────────────────────── */}
      {docModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <span>เอกสารและสัญญา: @{docModalItem.username}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDocModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {/* Existing Documents List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">เอกสารที่แนบไว้:</span>
                {(!docModalItem.documentLinks || docModalItem.documentLinks.length === 0) ? (
                  <p className="text-slate-400 italic">ยังไม่มีเอกสารแนบ</p>
                ) : (
                  <div className="space-y-1.5">
                    {docModalItem.documentLinks.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5 truncate max-w-[260px]"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocumentLink(doc.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Document Form */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">+ เพิ่มลิงก์เอกสารใหม่:</span>
                <div>
                  <label className="text-slate-500 mb-1 block">ประเภทเอกสาร:</label>
                  <select
                    value={newDocLabel}
                    onChange={(e) => setNewDocLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="ใบเสนอราคา (Quotation)">📄 ใบเสนอราคา (Quotation)</option>
                    <option value="สัญญาจ้าง (Contract)">📝 สัญญาจ้าง (Contract)</option>
                    <option value="สลิปโอนเงินมัดจำ (Slip)">💳 สลิปโอนเงินมัดจำ (Slip)</option>
                    <option value="โฟลเดอร์ Google Drive">📁 โฟลเดอร์ Google Drive</option>
                    <option value="ดราฟต์วิดีโอ (Draft Video)">🎬 ดราฟต์วิดีโอ (Draft Video)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 mb-1 block">URL ลิงก์เอกสาร (Google Drive, Dropbox, ฯลฯ):</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={!newDocUrl.trim()}
                  onClick={handleAddDocumentLink}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50 transition"
                >
                  + แนบลิงก์นี้
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDocModalItem(null)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 1-Click Outreach Brief Generator Modal ──────────────────── */}
      {pitchCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-thai">
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

            <div className="p-5 space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  ข้อความพร้อมคัดลอก (Formatted Brief):
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-mono max-h-56 overflow-y-auto">
                  {generatePitchText(pitchCreator)}
                </div>
              </div>

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
