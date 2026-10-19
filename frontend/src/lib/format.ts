/** Compact number formatting for observed public metrics (e.g. 145000 -> "145K"). */
export function formatCompactNumber(value?: number | null): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Formats a 0-1 ratio as a percentage string (e.g. 0.048 -> "4.8%"). */
export function formatPercent(ratio?: number | null, digits = 1): string | null {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return null;
  return `${(ratio * 100).toFixed(digits)}%`;
}
