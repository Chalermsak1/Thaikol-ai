import React from 'react';
import { ShieldCheck, Cpu, SlidersHorizontal, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-10 overflow-hidden radial-bg-glow">
      {/* Colorful Floating Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-pink-300/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
      <div className="absolute top-16 right-1/4 w-80 h-80 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none translate-x-1/2" />
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-pink-200 shadow-md shadow-pink-500/10 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            ระบบจับคู่แบรนด์ไทยกับครีเอเตอร์ TikTok ด้วย AI เชิงอธิบายได้ (Explainable AI)
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          จับคู่แบรนด์กับ{' '}
          <span className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            TikTok KOLs
          </span>{' '}
          อย่างแม่นยำและโปร่งใส
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 mb-8 leading-relaxed font-medium">
          ดึงอัตลักษณ์และหมวดหมู่สินค้าจากเว็บไซต์และ Facebook Page ของแบรนด์อัตโนมัติ
          แปลงเป็นเวกเตอร์ความหมาย 384 มิติด้วย MiniLM Multilingual
          และคำนวณคะแนนแนะนำครีเอเตอร์ไทยผ่านสูตร 5 มิติที่มีความโปร่งใสและอธิบายได้ทุกตัวเลข
        </p>

        {/* Quick Tech Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-sm font-semibold hover:border-indigo-300 transition">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>MiniLM-L12-v2 Multilingual Vectors</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-sm font-semibold hover:border-cyan-300 transition">
            <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
            <span>5-Factor Explainable Linear Scoring</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-sm font-semibold hover:border-emerald-300 transition">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Fail Offline Demo Mode</span>
          </div>
        </div>
      </div>
    </section>
  );
};
