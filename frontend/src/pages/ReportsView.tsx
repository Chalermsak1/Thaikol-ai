import React, { useState } from 'react';
import { RecommendationResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { getProfileLinkStatus } from '../components/kol/TikTokProfileCTA';
import { estimateCreatorRateCard, formatTHBCurrency } from '../lib/rateCardCalculator';
import {
  FileText,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Printer,
  DollarSign,
} from 'lucide-react';

interface ReportsViewProps {
  result: RecommendationResponse | null;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  result,
  onGoToDashboard,
  onGoToAnalyze,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result || !result.brand_profile || !result.recommendations) {
    return (
      <EmptyState
        title="ยังไม่มีรายงานแคมเปญ (No Reports Generated Yet)"
        description="เริ่มการวิเคราะห์แบรนด์เพื่อสร้างรายงานสรุปผู้บริหารสำหรับทีมการตลาดและเอเจนซี่ พร้อมชุดข้อมูลนำออก"
        actionLabel="เริ่มวิเคราะห์แบรนด์ (Analyze Brand)"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<FileText className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const brand = result.brand_profile;
  const topMatches = result.recommendations.slice(0, 5);
  const primaryMatch = result.recommendations[0];

  const top5Budget = topMatches.reduce(
    (acc, c) => {
      const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
      return {
        min: acc.min + rate.minRateTHB,
        max: acc.max + rate.maxRateTHB,
        avg: acc.avg + rate.avgRateTHB,
      };
    },
    { min: 0, max: 0, avg: 0 }
  );

  // Copy Agency Briefing
  const handleCopyBriefing = () => {
    const creatorsSummary = topMatches
      .map((c) => {
        const linkStatus = getProfileLinkStatus(c);
        const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
        const tiktokLine = linkStatus.isClickable
          ? `   TikTok: ${linkStatus.url}`
          : `   TikTok: Profile unavailable (${linkStatus.label})`;
        return `#${c.rank} ${c.display_name} (@${c.username})\n   Overall Match: ${c.final_score.toFixed(1)}/100 | Semantic: ${c.semantic_relevance_score.toFixed(1)} | Engagement: ${c.engagement_quality_score.toFixed(1)}\n   Est. Cost/Post: ${formatTHBCurrency(rate.minRateTHB)} - ${formatTHBCurrency(rate.maxRateTHB)}\n${tiktokLine}\n   Why Matched: ${c.reasons.join('; ')}`;
      })
      .join('\n\n');

    const text = `=====================================================
THAIKOL AI · CREATOR INTELLIGENCE BRIEFING REPORT
Brand: ${brand.brand_name}
Industry: ${brand.industry}
Location: ${brand.location_signals?.join(', ') || 'Thailand'}
Model Confidence: ${Math.round((brand.confidence ?? 0) * 100)}%
Candidate Pool: ${result.candidate_pool_count || 0} creators (Provenance: ${result.provenance || 'curated_demo_fixture'})
=====================================================

EXECUTIVE SUMMARY:
"${brand.summary}"

TARGET AUDIENCE:
${brand.target_audience?.map((a) => `• ${a}`).join('\n') || '• Thai organic and personal care consumers'}

CONTENT THEMES:
${brand.content_themes?.map((t) => `#${t}`).join(' · ') || 'N/A'}

TOP RECOMMENDED TIKTOK CREATORS:
${creatorsSummary}

DISCLAIMER & METHODOLOGY:
Scores computed using a 5-factor deterministic model: Semantic (45%), Engagement Quality (25%), Local Thai Signals (15%), Brand Safety (10%), Data Quality (5%).
Audience Fit Proxy is strictly informational. Curated demo creators are non-verified fixtures.
=====================================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      'rank', 'username', 'display_name', 'profile_url', 'profile_status', 'final_score',
      'semantic_relevance_score', 'engagement_quality_score',
      'local_content_relevance_score', 'brand_safety_score', 'data_quality_score',
    ];
    const rows = result.recommendations.map((r) => {
      const linkStatus = getProfileLinkStatus(r);
      const urlCol = linkStatus.isClickable ? (r.profile_url ?? '') : 'Profile unavailable';
      return [
        r.rank, `"${r.username}"`, `"${r.display_name.replace(/"/g, '""')}"`,
        `"${urlCol}"`, `"${linkStatus.label}"`, r.final_score.toFixed(1),
        r.semantic_relevance_score.toFixed(1), r.engagement_quality_score.toFixed(1),
        r.local_content_relevance_score.toFixed(1), r.brand_safety_score.toFixed(0),
        r.data_quality_score.toFixed(1),
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${brand.brand_name.toLowerCase().replace(/\s+/g, '_')}_kol_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-thai">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              Agency Intelligence Pitch
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            รายงานและบรีฟแคมเปญ (Campaign Reports & Briefings)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            เอกสารสรุปข้อเสนอแคมเปญครีเอเตอร์สำหรับลูกค้าระดับองค์กรและเอเจนซี่
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs px-3.5 py-2.5 gap-1.5 min-h-[44px] cursor-pointer"
            title="พิมพ์หรือบันทึกเป็น PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>พิมพ์ / PDF</span>
          </button>
          <button
            onClick={handleCopyBriefing}
            className="btn-secondary text-xs px-3.5 py-2.5 gap-1.5 min-h-[44px] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'คัดลอกบรีฟแล้ว' : 'คัดลอก Pitch Brief'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn-orange text-xs px-4 py-2.5 gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Executive Report Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        {/* Title Band */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Campaign Executive Briefing
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">
              {brand.brand_name} Creator Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              หมวดหมู่: {brand.industry} · พื้นที่เป้าหมาย: {brand.location_signals?.join(', ') || 'ประเทศไทย'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs font-mono">
              Model: ThaiKOL 5-Factor Scorer
            </span>
          </div>
        </div>

        {/* 5-Stat Overview with Estimated Campaign Budget */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              ความเชื่อมั่นแบรนด์
            </div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {Math.round((brand.confidence ?? 0) * 100)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {brand.evidence?.length ?? 0} หลักฐานที่ตรวจสอบ
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              ขนาด Candidate Pool
            </div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {result.candidate_pool_count || result.recommendation_count || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ครีเอเตอร์ไทยที่คัดกรอง
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              อันดับ 1 สูงสุด
            </div>
            <div className="text-xl font-black font-mono text-[#FF5A1F] mt-1">
              {primaryMatch?.final_score.toFixed(1)}
              <span className="text-xs font-bold text-slate-400 font-sans"> / 100</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
              @{primaryMatch?.username}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80">
            <div className="text-[10px] uppercase font-black text-[#C93B07] flex items-center justify-between">
              <span>งบประเมิน Top 5</span>
              <DollarSign className="w-3.5 h-3.5 text-[#FF5A1F]" />
            </div>
            <div className="text-lg font-black font-mono text-slate-900 mt-1">
              {formatTHBCurrency(top5Budget.avg)}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5 font-mono">
              {formatTHBCurrency(top5Budget.min)} - {formatTHBCurrency(top5Budget.max)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="text-[10px] uppercase font-bold text-emerald-800">
              ความปลอดภัยแบรนด์
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black text-emerald-950">100% Screened</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              ไม่พบเนื้อหารุนแรง/ต้องห้าม
            </div>
          </div>
        </div>

        {/* Executive Summary Quote */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            สรุปจุดยืนของแบรนด์ (Positioning Summary)
          </div>
          <p className="text-xs text-slate-800 leading-relaxed bg-orange-50/40 p-4 rounded-2xl border border-orange-100/80 italic font-thai">
            "{brand.summary}"
          </p>
        </div>

        {/* Top 5 Ranked Creators Table / Cards */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top 5 ครีเอเตอร์แนะนำสำหรับแคมเปญ (Media Pitch Candidates)
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              คำนวณค่าตัวประเมินเบื้องต้นตามสถิติยอดวิว
            </span>
          </div>

          {/* Mobile view (< md) */}
          <div className="space-y-3 md:hidden">
            {topMatches.map((c) => {
              const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
              const linkStatus = getProfileLinkStatus(c);
              return (
                <div
                  key={c.username}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-mono font-bold text-xs flex items-center justify-center">
                        #{c.rank}
                      </span>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{c.display_name}</div>
                        {linkStatus.isClickable && linkStatus.url ? (
                          <a
                            href={linkStatus.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#FF5A1F] font-mono font-semibold"
                          >
                            @{c.username}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">@{c.username}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-[#FF5A1F] font-mono">
                        {c.final_score.toFixed(1)}/100
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono font-semibold">
                        {formatTHBCurrency(rate.avgRateTHB)}/โพสต์
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop view (>= md) */}
          <div className="hidden md:block overflow-x-auto border border-slate-200/90 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">อันดับ</th>
                  <th className="py-3 px-4">ครีเอเตอร์</th>
                  <th className="py-3 px-4">หัวข้อ</th>
                  <th className="py-3 px-4 text-right">ค่าตัวประเมิน/โพสต์</th>
                  <th className="py-3 px-4 text-right">Semantic</th>
                  <th className="py-3 px-4 text-right">Engagement</th>
                  <th className="py-3 px-4 text-right">คะแนนรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topMatches.map((c) => {
                  const rate = estimateCreatorRateCard(c.follower_count, c.average_views);
                  const linkStatus = getProfileLinkStatus(c);
                  return (
                    <tr key={c.username} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-center font-mono font-black text-slate-500">
                        #{c.rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.display_name}</div>
                        {linkStatus.isClickable && linkStatus.url ? (
                          <a
                            href={linkStatus.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono text-[#FF5A1F] hover:underline inline-flex items-center gap-0.5 font-semibold"
                          >
                            <span>@{c.username}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-400">
                            @{c.username}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.matching_topics.slice(0, 2).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-orange-50 text-[#C93B07] text-[10px] font-bold">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        {formatTHBCurrency(rate.avgRateTHB)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                        {c.semantic_relevance_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                        {c.engagement_quality_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[#FF5A1F] text-sm">
                        {c.final_score.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <div className="font-bold text-slate-800">หมายเหตุกำกับความโปร่งใสและหลักจริยธรรม:</div>
          <p className="leading-relaxed">
            การประเมินทุกขั้นตอนคำนวณผ่านโมเดล 5 มิติที่ตรวจสอบย้อนกลับได้ทางคณิตศาสตร์ ข้อมูลดึงจากเนื้อหาสาธารณะบน TikTok และหน้าธุรกิจของแบรนด์ ไม่มีการเข้าถึงหรือประดิษฐ์ข้อมูลส่วนบุคคล
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
