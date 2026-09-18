import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="saas-card p-10 sm:p-14 flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">{description}</p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2 pt-1">
          {secondaryActionLabel && onSecondaryAction && (
            <button onClick={onSecondaryAction} className="btn-secondary">
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
