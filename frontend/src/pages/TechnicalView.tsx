import React from 'react';
import { TechnicalDrawer } from '../components/system/TechnicalDrawer';

interface TechnicalViewProps {
  demoMode?: boolean;
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({ demoMode }) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technical</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          API contracts, model architecture, and developer diagnostic sandboxes
        </p>
      </div>
      <TechnicalDrawer demoMode={demoMode} />
    </div>
  );
};
