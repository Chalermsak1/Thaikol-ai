/**
 * Commercial Influencer Rate Card & Budget Calculator for Thai TikTok Market
 * Benchmarks derived from standard Thailand digital agency media planning rates.
 */

export interface CreatorTierInfo {
  tier: 'Nano' | 'Micro' | 'Mid-Tier' | 'Macro' | 'Mega';
  tierLabel: string;
  minRateTHB: number;
  maxRateTHB: number;
  avgRateTHB: number;
  estimatedCPMTHB: number;
}

export function estimateCreatorRateCard(
  followerCount?: number | null,
  averageViews?: number | null
): CreatorTierInfo {
  const followers = followerCount ?? 25000;
  const views = averageViews ?? Math.round(followers * 0.25);

  let tier: CreatorTierInfo['tier'] = 'Micro';
  let tierLabel = 'Micro-Creator (10k - 50k)';
  let minRate = 3500;
  let maxRate = 8000;
  let avgRate = 5500;
  let cpm = 180;

  if (followers < 10000) {
    tier = 'Nano';
    tierLabel = 'Nano-Creator (<10k)';
    minRate = 1500;
    maxRate = 3500;
    avgRate = 2500;
    cpm = 150;
  } else if (followers <= 50000) {
    tier = 'Micro';
    tierLabel = 'Micro-Creator (10k - 50k)';
    minRate = 3500;
    maxRate = 8500;
    avgRate = 5500;
    cpm = 175;
  } else if (followers <= 500000) {
    tier = 'Mid-Tier';
    tierLabel = 'Mid-Tier Creator (50k - 500k)';
    minRate = 9000;
    maxRate = 26000;
    avgRate = 16000;
    cpm = 200;
  } else if (followers <= 1000000) {
    tier = 'Macro';
    tierLabel = 'Macro-Creator (500k - 1M)';
    minRate = 28000;
    maxRate = 65000;
    avgRate = 42000;
    cpm = 220;
  } else {
    tier = 'Mega';
    tierLabel = 'Mega-Creator (>1M)';
    minRate = 65000;
    maxRate = 160000;
    avgRate = 95000;
    cpm = 250;
  }

  // Refine with view data if significant view count observed
  if (views > 0) {
    const viewBasedRate = Math.round((views / 1000) * cpm);
    // Blend 60% tier baseline, 40% view traction
    avgRate = Math.round(avgRate * 0.6 + viewBasedRate * 0.4);
    minRate = Math.round(avgRate * 0.75);
    maxRate = Math.round(avgRate * 1.35);
  }

  return {
    tier,
    tierLabel,
    minRateTHB: minRate,
    maxRateTHB: maxRate,
    avgRateTHB: avgRate,
    estimatedCPMTHB: cpm,
  };
}

export function formatTHBCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}
