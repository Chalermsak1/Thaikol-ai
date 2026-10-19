import React from 'react';
import { TechnicalDrawer } from '../components/system/TechnicalDrawer';
import { ProviderHealthResponse } from '../types';
import { Cpu, ArrowLeft } from 'lucide-react';

interface TechnicalViewProps {
  demoMode?: boolean;
  providerHealth?: ProviderHealthResponse | null;
  onGoToDashboard?: () => void;
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({
  demoMode,
  providerHealth,
  onGoToDashboard,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-thai">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        {onGoToDashboard && (
          <button
            className="text-xs text-[#FF5A1F] hover:text-[#E24A12] font-bold mb-3 inline-flex items-center gap-1.5 cursor-pointer transition min-h-[36px]"
            onClick={onGoToDashboard}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าหลัก (Dashboard)</span>
          </button>
        )}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#FF5A1F]" />
            <span>System Architecture & Diagnostics</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          สถาปัตยกรรมทางเทคนิค (Technical Architecture)
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          API Contracts, Pipeline Model Architecture, และกล่องเครื่องมือทดสอบการค้นหา TikTok
        </p>
      </div>
      <TechnicalDrawer demoMode={demoMode} providerHealth={providerHealth} />
    </div>
  );
};

export default TechnicalView;
