import React from 'react';

interface ScoreBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  weight?: string;
  size?: 'sm' | 'md';
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  value,
  max = 100,
  showValue = true,
  label,
  weight,
  size = 'sm',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      {(label || weight) && (
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-slate-600 font-medium">{label}</span>}
            {weight && <span className="text-slate-400 font-mono">({weight})</span>}
          </div>
          {showValue && (
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {value.toFixed(1)}
            </span>
          )}
        </div>
      )}
      <div className={`score-bar-track ${size === 'md' ? 'h-[6px]' : 'h-[4px]'}`}>
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
