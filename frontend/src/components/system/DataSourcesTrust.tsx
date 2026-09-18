import React from 'react';
import { Globe, Share2, Video, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type SourceStatus = 'available' | 'partial' | 'unavailable';

const sources = [
  {
    name: 'Business Website',
    icon: Globe,
    coverage: 'Public metadata, product listings, hero copy, brand keywords',
    status: 'Available' as SourceStatus,
    note: 'BeautifulSoup4 HTML scraper with SSRF protection and URL validation',
  },
  {
    name: 'Facebook Public Page',
    icon: Share2,
    coverage: 'About text, contact details, public bio and page cues',
    status: 'Available' as SourceStatus,
    note: 'Public page signals only — private posts and groups are excluded',
  },
  {
    name: 'TikTok Public Content',
    icon: Video,
    coverage: 'Creator captions, hashtags, play counts, public engagement',
    status: 'Partial' as SourceStatus,
    note: 'Apify actor snapshot or curated benchmark fixture (demo mode)',
  },
  {
    name: 'Audience Demographics',
    icon: Users,
    coverage: 'Age, gender, income, private follower analytics',
    status: 'Unavailable' as SourceStatus,
    note: 'Not available via public APIs. ThaiKOL AI uses a content-based Audience Fit Proxy instead — labeled informational only.',
  },
];

const statusConfig: Record<SourceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
  },
  partial: {
    label: 'Partial',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
  },
  unavailable: {
    label: 'Not Available',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <XCircle className="w-3 h-3 text-slate-400" />,
  },
};

export const DataSourcesTrust: React.FC = () => {
  return (
    <div className="space-y-3">
      {sources.map((src, idx) => {
        const Icon = src.icon;
        const status = statusConfig[src.status];
        return (
          <div key={idx} className="saas-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">{src.name}</div>
                  <div className="text-[11px] text-slate-500">{src.coverage}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{src.note}</div>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border shrink-0 ${status.className}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* Ethics note */}
      <div className="saas-card p-4 bg-slate-50/50">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Privacy & Ethics:</strong>{' '}
          ThaiKOL AI ingests only publicly accessible information. No private
          accounts, private messages, or protected content is accessed. Audience
          demographic data is never fabricated — only content-based proxy signals
          are used, clearly labeled as informational.
        </p>
      </div>
    </div>
  );
};
