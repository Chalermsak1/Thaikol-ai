import React from 'react';

interface StatusBadgeProps {
  type: 'demo' | 'live' | 'safe' | 'review' | 'flagged' | 'provenance';
  label?: string;
  tooltip?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, label, tooltip }) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let defaultText = label;

  switch (type) {
    case 'demo':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200/80';
      dotColor = 'bg-amber-500';
      defaultText = defaultText || 'DEMO MODE';
      break;
    case 'live':
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      defaultText = defaultText || 'LIVE DATA';
      break;
    case 'safe':
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      defaultText = defaultText || 'Brand Safe';
      break;
    case 'review':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200/80';
      dotColor = 'bg-amber-500';
      defaultText = defaultText || 'Needs Review';
      break;
    case 'flagged':
      badgeStyles = 'bg-rose-50 text-rose-800 border-rose-200/80';
      dotColor = 'bg-rose-500';
      defaultText = defaultText || 'Flagged Risk';
      break;
    case 'provenance':
      badgeStyles = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      defaultText = defaultText || 'Verified';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeStyles}`}
      title={tooltip}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{defaultText}</span>
    </span>
  );
};
