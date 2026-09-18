import React from 'react';
import { DataSourcesTrust } from '../components/system/DataSourcesTrust';

export const DataSourcesView: React.FC = () => {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Sources</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Provider status, evidence classification, and demographic proxy boundaries
        </p>
      </div>
      <DataSourcesTrust />
    </div>
  );
};
