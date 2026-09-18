import React from 'react';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 1, label: 'Website & domain analysis', category: 'Brand Extraction' },
  { id: 2, label: 'Social signals (Facebook)', category: 'Social Context' },
  { id: 3, label: 'Brand profile synthesis', category: 'Profile Corpus' },
  { id: 4, label: 'Search query generation', category: 'Query Engine' },
  { id: 5, label: 'TikTok creator discovery', category: 'KOL Ingestion' },
  { id: 6, label: 'Multilingual embeddings (MiniLM)', category: 'Vector Embedding' },
  { id: 7, label: '5-factor scoring & safety', category: 'Multi-Factor Model' },
  { id: 8, label: 'Ranked recommendations', category: 'Final Output' },
];

interface LoadingPipelineProps {
  currentStage: number;
  hasError?: boolean;
}

export const LoadingPipeline: React.FC<LoadingPipelineProps> = ({
  currentStage,
  hasError = false,
}) => {
  const progress = Math.round((Math.min(currentStage, PIPELINE_STAGES.length) / PIPELINE_STAGES.length) * 100);

  return (
    <div className="saas-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Analyzing Brand</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage {Math.min(currentStage + 1, PIPELINE_STAGES.length)} of {PIPELINE_STAGES.length}
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="score-bar-track h-[3px]">
        <div
          className="score-bar-fill transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-0">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStage;
          const isActive = idx === currentStage && !hasError;
          const isFailed = idx === currentStage && hasError;

          return (
            <div key={stage.id} className="pipeline-step border-b border-slate-50 last:border-0">
              {/* Icon */}
              <div
                className={`pipeline-step-icon ${
                  isCompleted
                    ? 'bg-emerald-50'
                    : isActive
                    ? 'bg-slate-100'
                    : isFailed
                    ? 'bg-rose-50'
                    : 'bg-transparent'
                }`}
              >
                {isCompleted && <Check className="w-3 h-3 text-emerald-600" />}
                {isActive && <Loader2 className="w-3 h-3 text-slate-700 animate-spin" />}
                {isFailed && <AlertCircle className="w-3 h-3 text-rose-600" />}
                {!isCompleted && !isActive && !isFailed && (
                  <Circle className="w-3 h-3 text-slate-300" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs font-medium leading-tight ${
                    isCompleted
                      ? 'text-slate-500 line-through'
                      : isActive
                      ? 'text-slate-900'
                      : isFailed
                      ? 'text-rose-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{stage.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
