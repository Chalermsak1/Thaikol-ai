import React from 'react';
import { EvidenceItem } from '../../types';
import { X, ExternalLink, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end font-thai">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full sm:max-w-xl bg-white max-h-[92vh] sm:max-h-full h-full shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-white">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#FF5A1F] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>หลักฐานที่มาของข้อมูล (Data Provenance & Audit)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              หลักฐานที่ตรวจสอบได้ · {brandName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-[11px] text-slate-600 flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-700">การจำแนก:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">OBSERVED (ข้อความจริงจากเว็บ)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span className="font-semibold">INFERRED (AI สังเคราะห์บริบท)</span>
          </span>
        </div>

        {/* Evidence List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {evidence.map((item, idx) => {
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
            if (item.nature === 'OBSERVED') {
              badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            } else if (item.nature === 'INFERRED') {
              badgeClass = 'bg-orange-50 text-[#C93B07] border-orange-200';
            } else if (item.nature === 'ESTIMATED') {
              badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white space-y-2 hover:border-orange-200 transition shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-slate-600 uppercase">
                    {item.field}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeClass}`}>
                    {item.nature}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-thai bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  "{item.text}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate">แหล่งที่มา: {item.source}</span>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF5A1F] hover:text-[#E24A12] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>เปิดลิงก์</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-right pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            onClick={onClose}
            className="btn-secondary px-5 py-2.5 text-xs font-bold cursor-pointer min-h-[44px]"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDrawer;
