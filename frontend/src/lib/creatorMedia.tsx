import React, { useState } from 'react';
import { Check } from 'lucide-react';

/**
 * Curated high-resolution, fast-loading portrait photos and video covers
 * for demo fixtures and benchmark creators.
 *
 * NOTE ON DATA INTEGRITY:
 * These portraits are designated sample fixtures for demonstration purposes.
 * Real creator live profiles use the genuine avatar_url provided by the TikTok/Apify API.
 */
const SAMPLE_AVATARS: Record<string, string> = {
  // Demo Fixture Creators (11 profiles)
  mookda_skincare: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  cleanlife_pat: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  gam_tech_bkk: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  bkk_cafehopper: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  coffeewithpim: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=400&q=80',
  belle_thaiherb: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  aroi_bkk_guide: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
  thai_organic_life: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  roast_master_th: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  ploy_bkk_diary: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
  kinjubkajib: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',

  // Benchmark Fallback Mock Creators
  mayyr_official: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  archita_station: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  soundtiss_st: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  nurseryus_review: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  khunnu_beauty: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
};

const SAMPLE_COVERS: Record<string, string> = {
  mookda_skincare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&h=800&q=80',
  cleanlife_pat: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&h=800&q=80',
  gam_tech_bkk: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=800&q=80',
  bkk_cafehopper: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&h=800&q=80',
  coffeewithpim: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=800&q=80',
  belle_thaiherb: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&h=800&q=80',
  aroi_bkk_guide: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=800&q=80',
  thai_organic_life: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&h=800&q=80',
  roast_master_th: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&h=800&q=80',
  ploy_bkk_diary: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&h=800&q=80',
  kinjubkajib: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&h=800&q=80',

  mayyr_official: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&h=800&q=80',
  archita_station: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&h=800&q=80',
  soundtiss_st: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&h=800&q=80',
  nurseryus_review: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&h=800&q=80',
  khunnu_beauty: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&h=800&q=80',
};

const POOL_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
];

const POOL_COVERS = [
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=800&q=80',
];

/**
 * Returns a stable numerical hash for a string to pick from an avatar pool deterministically.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves creator avatar photo URL.
 * Priority:
 * 1. creator.avatar_url (real API response)
 * 2. Deterministic fixture mapping
 * 3. Seeded pool fallback based on handle
 */
export function getCreatorAvatar(creator?: {
  username?: string;
  avatar_url?: string | null;
}): string {
  if (creator?.avatar_url && typeof creator.avatar_url === 'string' && creator.avatar_url.startsWith('http')) {
    return creator.avatar_url;
  }
  const handle = (creator?.username || '').toLowerCase().replace(/^@/, '');
  if (handle && SAMPLE_AVATARS[handle]) {
    return SAMPLE_AVATARS[handle];
  }
  if (handle) {
    const idx = hashString(handle) % POOL_AVATARS.length;
    return POOL_AVATARS[idx];
  }
  return POOL_AVATARS[0];
}

/**
 * Resolves vertical content/video cover preview URL.
 * Priority:
 * 1. creator.video_thumbnail_url (real API video cover)
 * 2. Deterministic fixture mapping
 * 3. Seeded pool fallback based on handle
 */
export function getCreatorCover(creator?: {
  username?: string;
  video_thumbnail_url?: string | null;
}): string {
  if (
    creator?.video_thumbnail_url &&
    typeof creator.video_thumbnail_url === 'string' &&
    creator.video_thumbnail_url.startsWith('http')
  ) {
    return creator.video_thumbnail_url;
  }
  const handle = (creator?.username || '').toLowerCase().replace(/^@/, '');
  if (handle && SAMPLE_COVERS[handle]) {
    return SAMPLE_COVERS[handle];
  }
  if (handle) {
    const idx = hashString(handle) % POOL_COVERS.length;
    return POOL_COVERS[idx];
  }
  return POOL_COVERS[0];
}

/**
 * True if the displayed photo is a designated demonstration/sample portrait.
 * Used for transparent attribution and ethical AI standards.
 */
export function isSamplePortrait(creator?: {
  avatar_url?: string | null;
  is_demo_fixture?: boolean;
}): boolean {
  if (!creator?.avatar_url) return true;
  if (creator.is_demo_fixture) return true;
  return creator.avatar_url.includes('images.unsplash.com');
}

interface CreatorAvatarProps {
  creator: {
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
    is_profile_verified?: boolean;
    is_demo_fixture?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showVerified?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-8 h-8 rounded-xl text-xs', badge: 'w-3 h-3', icon: 'w-2 h-2', text: 'text-xs' },
  sm: { box: 'w-10 h-10 rounded-2xl text-sm', badge: 'w-3.5 h-3.5', icon: 'w-2 h-2', text: 'text-sm' },
  md: { box: 'w-12 h-12 rounded-2xl text-base', badge: 'w-4 h-4', icon: 'w-2.5 h-2.5', text: 'text-base' },
  lg: { box: 'w-14 h-14 rounded-2xl text-lg', badge: 'w-4 h-4', icon: 'w-2.5 h-2.5', text: 'text-lg' },
  xl: { box: 'w-16 h-16 rounded-3xl text-xl', badge: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-xl' },
};

/**
 * Production-ready Creator Avatar component with:
 * - High quality image loading
 * - Smooth fallback to gradient initials on network error or while loading
 * - Verified badge positioning
 */
export const CreatorAvatar: React.FC<CreatorAvatarProps> = ({
  creator,
  size = 'md',
  className = '',
  showVerified = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = getCreatorAvatar(creator);
  const displayName = creator.display_name || creator.username || 'KOL';
  const initial = displayName.charAt(0).toUpperCase();
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  React.useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`${config.box} overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-slate-100 border border-slate-200/80 shadow-2xs flex items-center justify-center font-bold text-[#FF5A1F] transition-transform`}
      >
        {!hasError && avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="font-black">{initial}</span>
        )}
      </div>

      {showVerified && creator.is_profile_verified && (
        <div
          className={`absolute -bottom-1 -right-1 ${config.badge} rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-xs ring-2 ring-white`}
          title="Verified TikTok Profile"
        >
          <Check className={`${config.icon} stroke-[3]`} />
        </div>
      )}
    </div>
  );
};
