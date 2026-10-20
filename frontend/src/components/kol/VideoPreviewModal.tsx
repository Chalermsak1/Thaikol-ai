import React, { useState, useEffect } from 'react';
import { KOLRecommendation } from '../../types';
import { getCreatorAvatar, getCreatorCover, isSamplePortrait } from '../../lib/creatorMedia';
import { TikTokProfileCTA } from './TikTokProfileCTA';
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(30);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Simulate video playback progress animation
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen || !creator) return null;

  const coverUrl = getCreatorCover(creator);
  const avatarUrl = getCreatorAvatar(creator);
  const displayCaption =
    caption ||
    (creator.sample_captions && creator.sample_captions[clipIndex - 1]) ||
    creator.sample_captions?.[0] ||
    'วิดีโอแนะนำสินค้าและรีวิวคอนเทนต์โดยครีเอเตอร์';

  const isSample = isSamplePortrait(creator);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Simulated 9:16 TikTok Phone Frame */}
      <div className="relative z-10 w-full max-w-[360px] h-[640px] max-h-[92vh] bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between">
        {/* Top Header Scrim */}
        <div className="relative z-20 px-4 pt-4 pb-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-pulse" />
              <span>CLIP #{clipIndex}</span>
            </span>
            {isSample && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] text-white/90 font-medium">
                ตัวอย่างจำลอง
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition border border-white/10"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center transition border border-white/10"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Cover Background with Play/Pause Touch */}
        <div
          className="absolute inset-0 cursor-pointer overflow-hidden"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <img
            src={coverUrl}
            alt="TikTok Video Preview"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

          {/* Center Play Overlay Icon when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl animate-scale-in">
                <Play className="w-8 h-8 fill-white ml-1 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Side Action Icons (TikTok Style) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 text-white">
          {/* Creator Mini Avatar */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md bg-slate-800">
              <img src={avatarUrl} alt={creator.display_name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              +
            </div>
          </div>

          {/* Likes */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition">
              <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(creator.average_likes ?? 24500)}
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition">
              <MessageCircle className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(Math.round((creator.average_likes ?? 24500) * 0.08))}
            </span>
          </div>

          {/* Shares / Saves */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition">
              <Share2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[10px] font-bold font-mono">
              {formatCompactNumber(Math.round((creator.average_likes ?? 24500) * 0.04))}
            </span>
          </div>
        </div>

        {/* Bottom Content Scrim & Caption */}
        <div className="relative z-20 px-4 pb-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2.5">
          {/* Creator Profile Tag */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-wide">
              {creator.display_name}
            </span>
            {creator.is_profile_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            )}
            <span className="text-xs text-white/60 font-mono">
              @{creator.username}
            </span>
          </div>

          {/* Caption */}
          <p className="text-xs text-white/90 line-clamp-3 leading-relaxed font-thai">
            {displayCaption}
          </p>

          {/* Audio info pill */}
          <div className="flex items-center gap-2 text-[11px] text-white/80">
            <Music2 className="w-3 h-3 text-[#FF5A1F] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="truncate max-w-[200px]">
              Original Audio · @{creator.username}
            </span>
          </div>

          {/* Video Timeline Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1 cursor-pointer">
            <div
              className="h-full bg-[#FF5A1F] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Action CTAs */}
          <div className="pt-1.5 flex items-center justify-between gap-2">
            <TikTokProfileCTA creator={creator} variant="hero" />
          </div>
        </div>
      </div>
    </div>
  );
};
