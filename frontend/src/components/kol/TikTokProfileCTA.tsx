import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export interface CreatorProfileLike {
  username: string;
  display_name?: string;
  profile_url?: string | null;
  is_demo_fixture?: boolean;
  provenance?: string;
  is_profile_verified?: boolean;
  profile_status?: string;
}

export interface ProfileLinkStatus {
  isClickable: boolean;
  label: string;
  badgeText?: string;
  tooltip: string;
  url?: string;
  isDemo: boolean;
}

/**
 * Deterministically resolves whether a creator's public profile link is trusted and clickable.
 * - Trusted & verified live accounts: Clickable with valid URL.
 * - Curated demo fixtures: Non-clickable, clearly labeled as Demo Fixture / Profile unavailable.
 * - Missing or unverified profiles: Non-clickable with "Profile unavailable".
 */
export function getProfileLinkStatus(creator?: CreatorProfileLike | null): ProfileLinkStatus {
  if (!creator) {
    return {
      isClickable: false,
      label: 'Profile unavailable',
      tooltip: 'Creator data unavailable',
      isDemo: false,
    };
  }

  const isDemo = Boolean(
    creator.is_demo_fixture ||
    creator.provenance === 'curated_demo_fixture' ||
    creator.provenance === 'demo_fixture'
  );

  // Demo fixtures: synthetic records created for offline internship evaluation
  if (isDemo) {
    return {
      isClickable: false,
      label: 'Profile unavailable',
      badgeText: 'Curated Demo Fixture',
      tooltip: 'Curated Demo Fixture — Profile is not a verified live account',
      isDemo: true,
    };
  }

  // Missing or empty profile_url
  const rawUrl = creator.profile_url?.trim();
  if (!rawUrl) {
    return {
      isClickable: false,
      label: 'Profile unavailable',
      badgeText: 'No Link Available',
      tooltip: 'Public TikTok profile URL is not available',
      isDemo: false,
    };
  }

  // Explicit unverified or unavailable flag
  if (
    creator.is_profile_verified === false ||
    creator.profile_status === 'unavailable' ||
    creator.profile_status === 'unverified'
  ) {
    return {
      isClickable: false,
      label: 'Profile unavailable',
      badgeText: 'Unverified Profile',
      tooltip: 'Profile link is unverified and cannot be opened directly',
      isDemo: false,
    };
  }

  // Check valid TikTok URL format
  const isValidFormat = /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]+/.test(rawUrl);
  if (!isValidFormat) {
    return {
      isClickable: false,
      label: 'Profile unavailable',
      badgeText: 'Invalid URL',
      tooltip: 'Profile URL is not a valid TikTok profile link',
      isDemo: false,
    };
  }

  // Trusted, verified public profile
  return {
    isClickable: true,
    label: 'View TikTok Profile',
    badgeText: 'Verified TikTok',
    tooltip: `Open public TikTok profile for @${creator.username}`,
    url: rawUrl,
    isDemo: false,
  };
}

export interface TikTokProfileCTAProps {
  creator?: CreatorProfileLike | null;
  variant?: 'hero' | 'inline' | 'compact' | 'table';
  className?: string;
  showDemoTag?: boolean;
}

export const TikTokProfileCTA: React.FC<TikTokProfileCTAProps> = ({
  creator,
  variant = 'inline',
  className = '',
  showDemoTag = true,
}) => {
  const status = getProfileLinkStatus(creator);

  if (variant === 'hero') {
    if (status.isClickable && status.url) {
      return (
        <a
          href={status.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-indigo-600 rounded-xl hover:from-rose-600 hover:to-indigo-700 transition shadow-sm ${className}`}
        >
          <span>View TikTok Profile</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    }
    return (
      <span
        title={status.tooltip}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed select-none ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
        <span>Profile unavailable</span>
        {status.isDemo && showDemoTag && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded">
            Demo Fixture
          </span>
        )}
      </span>
    );
  }

  if (variant === 'compact') {
    if (status.isClickable && status.url) {
      return (
        <a
          href={status.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ${className}`}
        >
          <span>TikTok</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return (
      <span
        title={status.tooltip}
        className={`inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed select-none ${className}`}
      >
        <span>Profile unavailable</span>
      </span>
    );
  }

  if (variant === 'table') {
    if (status.isClickable && status.url) {
      return (
        <a
          href={status.url}
          target="_blank"
          rel="noopener noreferrer"
          title={status.tooltip}
          className={`p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition ${className}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    }
    return (
      <span
        title={status.tooltip}
        className={`p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed select-none ${className}`}
      >
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Unavailable</span>
      </span>
    );
  }

  // Default: 'inline'
  if (status.isClickable && status.url) {
    return (
      <a
        href={status.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition ${className}`}
      >
        <span>TikTok</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    );
  }

  return (
    <span
      title={status.tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed select-none ${className}`}
    >
      <span>Profile unavailable</span>
      {status.isDemo && showDemoTag && (
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">· Demo</span>
      )}
    </span>
  );
};
