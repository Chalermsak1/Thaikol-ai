import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { KOLRecommendation, KOLSampleVideo } from '../../types';
import { getCreatorAvatar, getCreatorCover, isSamplePortrait } from '../../lib/creatorMedia';
import { formatCompactNumber } from '../../lib/format';
import {
  X,
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Music2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tv,
} from 'lucide-react';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: KOLRecommendation | null;
  caption?: string;
  clipIndex?: number;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  creator,
  caption,
  clipIndex = 1,
}) => {
  // Extract all available clips from sample_videos or fallback to sample_captions
  const allClips = useMemo<KOLSampleVideo[]>(() => {
    if (!creator) return [];
    if (creator.sample_videos && creator.sample_videos.length > 0) {
      return creator.sample_videos;
    }
    const caps = creator.sample_captions && creator.sample_captions.length > 0
      ? creator.sample_captions
      : [caption || 'วิดีโอแนะนำสินค้าและรีวิวคอนเทนต์โดยครีเอเตอร์'];

    return caps.map((capText, idx) => ({
      video_id: '',
      video_url: creator.profile_url || `https://www.tiktok.com/@${creator.username}`,
      caption: capText,
      likes: creator.average_likes ? Math.round(creator.average_likes * (1 - idx * 0.05)) : 24500,
      comments: creator.average_comments ? Math.round(creator.average_comments * (1 - idx * 0.05)) : 185,
      shares: creator.average_shares ? Math.round(creator.average_shares * (1 - idx * 0.05)) : 92,
    }));
  }, [creator, caption]);

  const totalClips = Math.max(allClips.length, 1);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(15);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [playerMode, setPlayerMode] = useState<'tiktok' | 'preview'>('tiktok');

  // Touch tracking for swipe gestures
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync active clip index when clipIndex prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const initialIdx = Math.max(0, Math.min(clipIndex - 1, totalClips - 1));
      setActiveClipIndex(initialIdx);
      setIsPlaying(true);
      setProgress(15);
      setSlideDirection(null);
    }
  }, [isOpen, clipIndex, totalClips]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, activeClipIndex, totalClips]);

  // Progress animation for simulated preview mode
  useEffect(() => {
    if (!isOpen || !isPlaying || playerMode === 'tiktok') return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Auto advance to next clip when finished
          if (totalClips > 1) {
            handleNext();
          }
          return 0;
        }
        return prev + 1.2;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playerMode, totalClips, activeClipIndex]);

  if (!isOpen || !creator) return null;

  const currentClip = allClips[activeClipIndex] || allClips[0];
  const displayCaption = currentClip?.caption || caption || 'วิดีโอรีวิวคอนเทนต์ TikTok';

  // Extract TikTok numeric video ID if present
  const extractVideoId = (clip?: KOLSampleVideo): string => {
    if (!clip) return '';
    if (clip.video_id && /^\d+$/.test(clip.video_id)) {
      return clip.video_id;
    }
    const match = clip.video_url?.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  };

  const videoId = extractVideoId(currentClip);

  // Resolve best direct TikTok link
  const directWatchUrl = useMemo(() => {
    if (currentClip?.video_url && currentClip.video_url.includes('tiktok.com')) {
      return currentClip.video_url;
    }
    if (videoId) {
      return `https://www.tiktok.com/@${creator.username}/video/${videoId}`;
    }
    if (creator.profile_url) {
      return creator.profile_url;
    }
    return `https://www.tiktok.com/@${creator.username}`;
  }, [currentClip, videoId, creator]);

  const coverUrl = currentClip?.cover_image_url || getCreatorCover(creator);
  const avatarUrl = getCreatorAvatar(creator);
  const isSample = isSamplePortrait(creator);

  const handleNext = () => {
    setSlideDirection('next');
    setProgress(0);
    setActiveClipIndex((prev) => (prev + 1) % totalClips);
  };

  const handlePrev = () => {
    setSlideDirection('prev');
    setProgress(0);
    setActiveClipIndex((prev) => (prev - 1 + totalClips) % totalClips);
  };

  // Touch Swipe Handlers for mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 45;
    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    // Vertical swipe (like TikTok)
    else if (Math.abs(deltaY) > threshold) {
      if (deltaY < 0) handleNext();
      else handlePrev();
    }
  };

  const likesCount = currentClip?.likes ?? creator.average_likes ?? 24500;
  const commentsCount = currentClip?.comments ?? Math.round(likesCount * 0.08);
  const sharesCount = currentClip?.shares ?? Math.round(likesCount * 0.04);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Simulated 9:16 TikTok Phone Frame */}
      <div
        className="relative z-10 w-full max-w-[375px] h-[660px] max-h-[92vh] bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header Scrim with Stories-style Dash Progress Indicators */}
        <div className="relative z-30 px-3.5 pt-3 pb-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex flex-col gap-2.5">
          {/* Story Dash Indicators (แตะเพื่อเปลี่ยนคลิป) */}
          <div className="flex items-center gap-1.5 w-full">
            {Array.from({ length: totalClips }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSlideDirection(idx > activeClipIndex ? 'next' : 'prev');
                  setProgress(0);
                  setActiveClipIndex(idx);
                }}
                className="flex-1 h-1 rounded-full overflow-hidden bg-white/25 hover:bg-white/40 transition cursor-pointer relative"
                title={`คลิปที่ ${idx + 1}`}
              >
                <div
                  className={`h-full bg-[#FF5A1F] transition-all duration-150 ${
                    idx < activeClipIndex
                      ? 'w-full'
                      : idx === activeClipIndex
                      ? `${progress}%`
                      : 'w-0'
                  }`}
                  style={idx === activeClipIndex ? { width: `${progress}%` } : undefined}
                />
              </button>
            ))}
          </div>

          {/* Top Bar Actions & Mode Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 font-mono shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
                <span>คลิป {activeClipIndex + 1}/{totalClips}</span>
              </span>

              {/* Player mode toggle switch if videoId is available */}
              {videoId ? (
                <button
                  type="button"
                  onClick={() => setPlayerMode(playerMode === 'tiktok' ? 'preview' : 'tiktok')}
                  className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 transition cursor-pointer"
                  title="สลับโหมดเครื่องเล่น"
                >
                  <Tv className="w-3 h-3 text-[#FF5A1F]" />
                  <span>{playerMode === 'tiktok' ? 'TikTok Player' : 'ภาพจำลอง'}</span>
                </button>
              ) : isSample ? (
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] text-white/90 font-medium">
                  ตัวอย่างจำลอง
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              {playerMode === 'preview' && (
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition border border-white/15 cursor-pointer shadow-xs active:scale-95"
                  title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition border border-white/15 cursor-pointer shadow-xs active:scale-95"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Side Arrow Controls for Sliding between clips */}
        {totalClips > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-lg active:scale-90"
              title="เลื่อนไปคลิปก่อนหน้า"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-lg active:scale-90"
              title="เลื่อนไปคลิปถัดไป"
            >
              <ChevronRight className="w-5 h-5 ml-0.5" />
            </button>
          </>
        )}

        {/* Video Canvas Area */}
        <div className="absolute inset-0 z-10 overflow-hidden bg-black flex items-center justify-center">
          {/* Mode 1: TikTok Official Embed Player */}
          {playerMode === 'tiktok' && videoId ? (
            <div className="w-full h-full pt-14 pb-28 flex items-center justify-center bg-black">
              <iframe
                key={`${videoId}-${activeClipIndex}`}
                src={`https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=0`}
                className="w-full h-full border-0 rounded-2xl bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`TikTok Video ${activeClipIndex + 1}`}
              />
            </div>
          ) : (
            /* Mode 2: Animated Dynamic Motion Player (Ken Burns Motion) */
            <div
              className={`absolute inset-0 cursor-pointer overflow-hidden transition-all duration-300 ${
                slideDirection === 'next'
                  ? 'animate-slide-next'
                  : slideDirection === 'prev'
                  ? 'animate-slide-prev'
                  : ''
              }`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <img
                src={coverUrl}
                alt="TikTok Video Preview"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'animate-kenburns scale-105' : 'scale-100'
                }`}
              />
              {/* Subtle vignette gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/50 pointer-events-none" />

              {/* Sound visualizer animation bars in center-right when playing */}
              {isPlaying && !isMuted && (
                <div className="absolute right-4 top-28 z-20 flex items-end gap-1 pointer-events-none opacity-80">
                  <div className="w-1 bg-[#FF5A1F] rounded-full animate-sound-wave-1" />
                  <div className="w-1 bg-[#FF5A1F] rounded-full animate-sound-wave-2" />
                  <div className="w-1 bg-[#FF5A1F] rounded-full animate-sound-wave-3" />
                  <div className="w-1 bg-[#FF5A1F] rounded-full animate-sound-wave-4" />
                </div>
              )}

              {/* Big Play / Pause Overlay Icon */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl animate-scale-in">
                    <Play className="w-8 h-8 fill-white ml-1 text-white" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Side Action Icons (TikTok Style) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3 text-white">
          {/* Creator Mini Avatar */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md bg-slate-800">
              <img src={avatarUrl} alt={creator.display_name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
              +
            </div>
          </div>

          {/* Likes */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/70 transition">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(likesCount)}
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/70 transition">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(commentsCount)}
            </span>
          </div>

          {/* Shares */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/70 transition">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(sharesCount)}
            </span>
          </div>
        </div>

        {/* Bottom Content Scrim, Caption & CTAs */}
        <div className="relative z-20 px-4 pb-4 pt-8 bg-gradient-to-t from-black via-black/85 to-transparent space-y-2">
          {/* Creator Profile Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">
              {creator.display_name}
            </span>
            {creator.is_profile_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400 shrink-0" />
            )}
            <span className="text-xs text-white/70 font-mono">
              @{creator.username}
            </span>
          </div>

          {/* Caption with clean font */}
          <p className="text-xs text-white/95 line-clamp-2 leading-relaxed font-thai drop-shadow-xs">
            "{displayCaption}"
          </p>

          {/* Audio info with rotating vinyl animation */}
          <div className="flex items-center gap-2 text-[11px] text-white/80">
            <Music2
              className={`w-3.5 h-3.5 text-[#FF5A1F] ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
            <span className="truncate max-w-[200px]">
              Original Audio · @{creator.username}
            </span>
          </div>

          {/* Direct TikTok CTA Button - ALWAYS ACTIVE & CLICKABLE */}
          <div className="pt-1.5">
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#E24A12] hover:from-[#E24A12] hover:to-[#C93B07] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-orange-500/25 active:scale-98 transition cursor-pointer"
            >
              <span>🚀 เปิดดูคลิปจริงบน TikTok (เปิดแอปทันที)</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Swipe hint for user convenience */}
          {totalClips > 1 && (
            <div className="text-center text-[10px] text-white/60 pt-0.5">
              <span>👉 ปัดซ้าย/ขวา หรือแตะลูกศรเพื่อเลื่อนดูคลิปอื่น ({activeClipIndex + 1}/{totalClips})</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoPreviewModal;
