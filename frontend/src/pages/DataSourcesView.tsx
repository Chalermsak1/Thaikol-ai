import React from 'react';
import { DataSourcesTrust } from '../components/system/DataSourcesTrust';
import { ProviderHealthResponse } from '../types';
import { ShieldCheck } from 'lucide-react';

interface DataSourcesViewProps {
  providerHealth?: ProviderHealthResponse | null;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ providerHealth }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-thai">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#FF5A1F]" />
            <span>Data Transparency & Governance</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          แหล่งข้อมูลและความปลอดภัย (Data Sources & Trust)
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          ตรวจสอบสถานะการเชื่อมต่อ API ความโปร่งใสของข้อมูล และขอบเขตการเข้าถึงข้อมูลสาธารณะ
        </p>
      </div>
      <DataSourcesTrust providerHealth={providerHealth} />
    </div>
  );
};

export default DataSourcesView;
