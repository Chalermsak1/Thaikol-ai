export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatScore(val: number, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return val.toFixed(decimals);
}

export function formatPercentage(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return `${(val * 100).toFixed(0)}%`;
}
