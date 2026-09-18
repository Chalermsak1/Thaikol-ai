import React from 'react';
import { Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { HealthBadge } from './HealthBadge';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-rose-500 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                ThaiKOL AI
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
                v1.0 • TikTok Matcher
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              AI-Powered Creator Recommendation Platform · แพลตฟอร์มค้นหาและจับคู่ครีเอเตอร์
            </p>
          </div>
        </div>

        {/* Status and Action links */}
        <div className="flex items-center gap-4">
          <HealthBadge />
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 border border-slate-200/80 transition shadow-sm"
              title="Open OpenAPI / Swagger Documentation"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Swagger API Docs</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
