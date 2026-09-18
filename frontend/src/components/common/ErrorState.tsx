import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onUseDemo: () => void;
  rawDetails?: string | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onUseDemo,
  rawDetails,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="saas-card border-rose-200 bg-rose-50/40 p-6 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-semibold text-rose-950">Unable to complete brand analysis</h4>
          <p className="text-xs text-rose-800 leading-relaxed">{message}</p>
          <div className="text-[11px] text-rose-700/90 pt-1">
            <strong>Possible causes:</strong> The provided website is unreachable, Facebook page is restricted/private, or the external scraper experienced a connection timeout.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
        <button
          onClick={onRetry}
          className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Try Again</span>
        </button>

        <button
          onClick={onUseDemo}
          className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Load Offline Demo Fixture (Khaokho Talaypu)</span>
        </button>

        {rawDetails && (
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="ml-auto text-[11px] text-rose-700 hover:text-rose-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Technical details</span>
            {showTechnical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {showTechnical && rawDetails && (
        <pre className="p-3 rounded-lg bg-rose-950 text-rose-200 font-mono text-[10px] overflow-x-auto">
          {rawDetails}
        </pre>
      )}
    </div>
  );
};
