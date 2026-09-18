import React from 'react';
import { BrandProfile } from '../../types';
import { FileText, MapPin, Database } from 'lucide-react';

interface BrandOverviewProps {
  brandProfile: BrandProfile;
  onOpenEvidence: () => void;
}

export const BrandOverview: React.FC<BrandOverviewProps> = ({
  brandProfile,
  onOpenEvidence,
}) => {
  const confidencePct = Math.round((brandProfile.confidence ?? 0) * 100);

  return (
    <div className="saas-card overflow-hidden">
      {/* Header band */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {brandProfile.brand_name}
            </h2>
            {brandProfile.is_demo_fixture && (
              <span className="badge badge-demo">Demo Fixture</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{brandProfile.industry}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Confidence */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {confidencePct}% confidence
          </div>
          <button
            onClick={onOpenEvidence}
            className="btn-secondary px-3 py-1.5 text-xs gap-1.5"
          >
            <FileText className="w-3 h-3 text-slate-400" />
            Evidence ({brandProfile.evidence.length})
          </button>
        </div>
      </div>

      {/* Summary */}
      {brandProfile.summary && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-600 leading-relaxed italic">
            "{brandProfile.summary}"
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Analysis</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Complete
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <MapPin className="w-3 h-3" />
            <span>Location</span>
          </div>
          <div className="text-xs font-medium text-slate-700">
            {brandProfile.location_signals.length > 0
              ? brandProfile.location_signals.slice(0, 2).join(', ')
              : 'Thailand'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <Database className="w-3 h-3" />
            <span>Provenance</span>
          </div>
          <div className="text-xs font-mono text-slate-500 truncate">
            {brandProfile.provenance || 'Public website + Facebook'}
          </div>
        </div>
      </div>
    </div>
  );
};
