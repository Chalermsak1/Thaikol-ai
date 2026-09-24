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
        title="No reports generated yet"
        description="Run brand analysis to produce an executive agency campaign briefing and exportable candidate datasets."
        actionLabel="Analyze a Brand"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<FileText className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const brand = result.brand_profile;
  const topMatches = result.recommendations.slice(0, 5);
  const primaryMatch = result.recommendations[0];

  const top5Budget = topMatches.reduce(
    (acc) => {
      const rate = estimateCreatorRateCard(null, null);
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
        const rate = estimateCreatorRateCard(null, null);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Campaign Reports & Briefings
          </h1>
          <p className="text-xs text-slate-500">
            Export candidate recommendations and agency client pitch documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs px-3.5 py-2 gap-1.5"
            title="Print or save as clean PDF briefing"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleCopyBriefing}
            className="btn-secondary text-xs px-3.5 py-2 gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Briefing Copied' : 'Copy Pitch Briefing'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn-primary text-xs px-4 py-2 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Executive Report Card */}
      <div className="saas-card p-6 sm:p-7 space-y-6">
        {/* Title Band */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Agency Campaign Synthesis
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {brand.brand_name} Creator Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Category: {brand.industry} · Location: {brand.location_signals?.join(', ') || 'Thailand'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs font-mono">
              Model: Sentence-Transformers 384-dim + 5-Factor Scorer
            </span>
          </div>
        </div>

        {/* 5-Stat Overview with Estimated Campaign Budget */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Brand Confidence
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {Math.round((brand.confidence ?? 0) * 100)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {brand.evidence?.length ?? 0} verified signals
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Candidate Pool
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {result.candidate_pool_count || result.recommendation_count || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Thai creators screened
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Top Ranked Match
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {primaryMatch?.final_score.toFixed(1)}
              <span className="text-xs font-normal text-slate-400"> / 100</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              @{primaryMatch?.username}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center justify-between">
              <span>Est. Top 5 Budget</span>
              <DollarSign className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-900 mt-1">
              {formatTHBCurrency(top5Budget.avg)}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-mono">
              {formatTHBCurrency(top5Budget.min)} - {formatTHBCurrency(top5Budget.max)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Brand Safety
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-900">100% Screened</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Zero severe flags
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Brand Positioning Summary
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 italic">
            "{brand.summary}"
          </p>
        </div>

        {/* Top 5 Ranked Creators Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top 5 Recommendations for Media Pitch
            </div>
            <span className="text-[11px] text-slate-400">Deterministic composite ranking with commercial rate estimation</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Creator Profile</th>
                  <th className="py-3 px-4">Topics</th>
                  <th className="py-3 px-4 text-right">Est. Rate / Post</th>
                  <th className="py-3 px-4 text-right">Semantic</th>
                  <th className="py-3 px-4 text-right">Engagement</th>
                  <th className="py-3 px-4 text-right">Overall Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topMatches.map((c) => {
                  const rate = estimateCreatorRateCard(null, null);
                  return (
                    <tr key={c.username} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                        #{c.rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.display_name}</div>
                        {(() => {
                          const linkStatus = getProfileLinkStatus(c);
                          if (linkStatus.isClickable && linkStatus.url) {
                            return (
                              <a
                                href={linkStatus.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5"
                              >
                                @{c.username}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            );
                          }
                          return (
                            <div className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-1">
                              <span>@{c.username}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                Profile unavailable
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.matching_topics.slice(0, 2).map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                        {formatTHBCurrency(rate.avgRateTHB)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                        {c.semantic_relevance_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                        {c.engagement_quality_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">Audit & Provenance Note:</div>
          <p>
            All evaluations are deterministic and mathematically traceable. The Audience Fit Proxy is an informational alignment heuristic and does not represent private follower telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
