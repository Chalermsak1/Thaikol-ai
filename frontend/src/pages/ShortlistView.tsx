import React, { useState } from 'react';
import { KOLRecommendation, ShortlistItem, OutreachStatus } from '../types';
import { estimateCreatorRateCard, formatTHBCurrency } from '../lib/rateCardCalculator';
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

const STATUS_CONFIG: Record<OutreachStatus, { label: string; bg: string; text: string; border: string }> = {
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  contacted: { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  negotiating: { label: 'Negotiating', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  declined: { label: 'Declined', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  shortlist,
  onUpdateStatus,
  onUpdateNotes,
  onRemoveFromShortlist,
  onRemove,
  onClearAll: _onClearAll,
  onOpenCreatorDetail,
  onGoToRecommendations,
  brandName = 'Campaign',
}) => {
  const [copied, setCopied] = useState(false);
  const items = Object.values(shortlist);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No creators shortlisted yet"
        description="Star creators from the Recommendations view to build your campaign roster and calculate total budget."
        actionLabel="Browse Recommendations"
        onAction={onGoToRecommendations}
        icon={<Star className="w-5 h-5 text-amber-500" />}
      />
    );
  }

  // Aggregate Campaign Metrics
  const totalFollowers = items.reduce(
    (sum, item) => sum + (item.creator.audience_fit_proxy ? item.creator.audience_fit_proxy * 1000 : 45000),
    0
  );

  const budgetMetrics = items.reduce(
    (acc, _item) => {
      const rate = estimateCreatorRateCard(null, null);
      return {
        min: acc.min + rate.minRateTHB,
        max: acc.max + rate.maxRateTHB,
        avg: acc.avg + rate.avgRateTHB,
      };
    },
    { min: 0, max: 0, avg: 0 }
  );

  const confirmedCount = items.filter((i) => i.status === 'confirmed').length;

  // Copy Shortlist Summary
  const handleCopyRoster = () => {
    const listText = items
      .map((item, idx) => {
        const rate = estimateCreatorRateCard(null, null);
        return `${idx + 1}. ${item.creator.display_name} (@${item.creator.username})\n   Status: ${STATUS_CONFIG[item.status].label} | Match: ${item.creator.final_score.toFixed(1)}/100\n   Est. Cost/Video: ${formatTHBCurrency(rate.minRateTHB)} - ${formatTHBCurrency(rate.maxRateTHB)}\n   Notes: ${item.notes || 'None'}`;
      })
      .join('\n\n');

    const text = `🎯 THAIKOL AI · CAMPAIGN ROSTER & BUDGET PLANNER
Brand: ${brandName}
Creators Shortlisted: ${items.length} (Confirmed: ${confirmedCount})
Est. Total Campaign Budget: ${formatTHBCurrency(budgetMetrics.min)} - ${formatTHBCurrency(budgetMetrics.max)} (Avg: ${formatTHBCurrency(budgetMetrics.avg)})
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
      const rate = estimateCreatorRateCard(null, null);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Campaign Shortlist & Outreach Pipeline
            </h1>
            <span className="badge badge-neutral font-mono font-bold">
              {items.length} Creators
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track influencer outreach, negotiation stages, and commercial rate card budgets for {brandName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRoster}
            className="btn-secondary text-xs px-3.5 py-2 gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Roster Copied' : 'Copy Roster Brief'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn-primary text-xs px-4 py-2 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Shortlist CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Roster Size */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Roster Pipeline</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {items.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {confirmedCount} confirmed · {items.length - confirmedCount} in progress
          </div>
        </div>

        {/* Estimated Budget Range */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Est. Total Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatTHBCurrency(budgetMetrics.avg)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Range: {formatTHBCurrency(budgetMetrics.min)} - {formatTHBCurrency(budgetMetrics.max)}
          </div>
        </div>

        {/* Est Combined Reach */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Est. Combined Reach</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ~{(totalFollowers / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Follower audience pool
          </div>
        </div>

        {/* Average Match Quality */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Team Match Score</span>
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {(items.reduce((s, i) => s + i.creator.final_score, 0) / items.length).toFixed(1)}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            5-factor composite mean
          </div>
        </div>
      </div>

      {/* Shortlist Table / Cards */}
      <div className="saas-card overflow-hidden divide-y divide-slate-100">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Shortlisted Influencers & Rate Cards
          </span>
          <span className="text-[11px] text-slate-400">
            Market rate benchmarks for Thailand digital campaigns
          </span>
        </div>

        {items.map((item) => {
          const rate = estimateCreatorRateCard(null, null);
          const currentStatus = STATUS_CONFIG[item.status];

          return (
            <div key={item.username} className="p-5 hover:bg-slate-50/50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Identity */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                    {item.creator.display_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenCreatorDetail(item.creator)}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition text-sm cursor-pointer"
                      >
                        {item.creator.display_name}
                      </button>
                      <span className="text-xs font-mono text-slate-400">
                        @{item.creator.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="badge badge-neutral text-[10px]">
                        {rate.tierLabel}
                      </span>
                      <span className="badge badge-neutral text-[10px] font-mono font-bold text-indigo-600">
                        Match: {item.creator.final_score.toFixed(1)}/100
                      </span>
                      {item.creator.matching_topics.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Selector & Rate Card */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Commercial Rate Card */}
                  <div className="text-right px-3 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <div className="text-[10px] uppercase font-bold text-emerald-700">
                      Est. Rate / Video
                    </div>
                    <div className="text-xs font-black text-emerald-800 font-mono">
                      {formatTHBCurrency(rate.minRateTHB)} - {formatTHBCurrency(rate.maxRateTHB)}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.username, e.target.value as OutreachStatus)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                  >
                    <option value="shortlisted">⭐ Shortlisted</option>
                    <option value="contacted">📩 Contacted</option>
                    <option value="negotiating">🤝 Negotiating</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="declined">❌ Declined</option>
                  </select>

                  <TikTokProfileCTA creator={item.creator} variant="inline" />

                  {/* Remove Button */}
                  <button
                    onClick={() => (onRemoveFromShortlist ? onRemoveFromShortlist(item.username) : onRemove?.(item.username))}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition rounded-lg hover:bg-rose-50"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes Field */}
              <div className="flex items-center gap-2 pt-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add agency campaign notes (e.g. Line contact, deliverables, special discount, briefing status)..."
                  defaultValue={item.notes || ''}
                  onBlur={(e) => onUpdateNotes(item.username, e.target.value)}
                  className="w-full text-xs text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition py-0.5"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
