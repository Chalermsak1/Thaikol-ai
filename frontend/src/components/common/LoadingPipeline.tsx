import React from 'react';
import { Check, Loader2, Circle, AlertCircle, Clock, Radio } from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 1, label: 'Website & brand digital footprint', category: 'Brand Extraction' },
  { id: 2, label: 'Facebook social context & community signals', category: 'Social Context' },
  { id: 3, label: 'Brand profile synthesis & audience cues', category: 'Profile Corpus' },
  { id: 4, label: 'Targeted Thai search query generation', category: 'Query Engine' },
  { id: 5, label: 'TikTok creator discovery (live/benchmark)', category: 'KOL Ingestion' },
  { id: 6, label: 'Multilingual embeddings (MiniLM-L12)', category: 'Vector Embedding' },
  { id: 7, label: '5-factor scoring & brand safety screening', category: 'Multi-Factor Model' },
  { id: 8, label: 'Ranked creator recommendations & rationales', category: 'Final Output' },
];

interface LoadingPipelineProps {
  currentStage: number;
  hasError?: boolean;
  elapsedSeconds?: number;
  isLive?: boolean;
}

export const LoadingPipeline: React.FC<LoadingPipelineProps> = ({
  currentStage,
  hasError = false,
  elapsedSeconds = 0,
  isLive = false,
}) => {
  const isComplete = currentStage >= PIPELINE_STAGES.length;
  const progress = isComplete
    ? 100
    : Math.min(96, Math.round(((currentStage + 0.5) / PIPELINE_STAGES.length) * 100));

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <div className="saas-card p-5 sm:p-6 space-y-5 border-slate-200/90 shadow-sm bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isComplete ? 'bg-emerald-500' : 'bg-indigo-600 animate-beacon'
              }`}
            />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {isComplete ? 'Analysis & Matching Complete' : 'AI Discovery & Matching Pipeline Active'}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isLive ? 'LIVE DATA' : 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isComplete
              ? 'All pipeline stages completed. Candidate creators scored and ranked.'
              : `Stage ${Math.min(currentStage + 1, PIPELINE_STAGES.length)} of ${PIPELINE_STAGES.length}: ${PIPELINE_STAGES[Math.min(currentStage, PIPELINE_STAGES.length - 1)].label}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {elapsedSeconds > 0 && !isComplete && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatElapsed(elapsedSeconds)}</span>
            </div>
          )}
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border tabular-nums ${
              isComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-emerald-500'
              : 'bg-indigo-600 shimmer-active'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Explanatory callout for Live Data fetching */}
      {isLive && currentStage === 4 && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-300">
          <Radio className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <strong className="font-semibold text-emerald-950">Fetching Real TikTok Data via Apify:</strong>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Querying TikTok live scraper for candidate profiles and public video metrics based on generated search queries. Live provider collection typically takes 15–30 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Stage list */}
      <div className="space-y-1.5 pt-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStage;
          const isActive = idx === currentStage && !isComplete && !hasError;
          const isFailed = idx === currentStage && hasError;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50/70 border border-indigo-200/80 shadow-2xs'
                  : isCompleted
                  ? 'bg-slate-50/50 border border-transparent'
                  : isFailed
                  ? 'bg-rose-50 border border-rose-200'
                  : 'bg-transparent border border-transparent opacity-60'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : isFailed
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isFailed && <AlertCircle className="w-3.5 h-3.5" />}
                {!isCompleted && !isActive && !isFailed && (
                  <Circle className="w-2 h-2 fill-slate-300 text-slate-300" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold truncate ${
                    isCompleted
                      ? 'text-slate-700'
                      : isActive
                      ? 'text-indigo-950 font-bold'
                      : isFailed
                      ? 'text-rose-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
                <span
                  className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-bold'
                      : isCompleted
                      ? 'bg-slate-200/60 text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
