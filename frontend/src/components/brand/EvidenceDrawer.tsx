import React from 'react';
import { EvidenceItem } from '../../types';
import { X, ExternalLink, FileText } from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
  brandName: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
  brandName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col drawer-enter border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Data Provenance & Audit Trail</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Extracted Evidence · {brandName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center gap-4">
          <span className="font-semibold text-slate-700">Classification:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>OBSERVED (Direct verbatim)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>INFERRED (Contextual synthesis)</span>
          </span>
        </div>

        {/* Evidence List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {evidence.map((item, idx) => {
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
            if (item.nature === 'OBSERVED') {
              badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            } else if (item.nature === 'INFERRED') {
              badgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
            } else if (item.nature === 'ESTIMATED') {
              badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2 hover:border-slate-300 transition shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase">
                    {item.field}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}`}>
                    {item.nature}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  "{item.text}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                  <span className="truncate">Source: {item.source}</span>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-1.5 text-xs cursor-pointer shadow-2xs"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
