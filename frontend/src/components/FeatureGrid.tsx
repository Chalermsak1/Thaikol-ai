import React from 'react';
import { Globe, Share2, Search, Sliders, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const steps = [
    {
      icon: <Globe className="w-6 h-6 text-indigo-600" />,
      iconBg: "bg-indigo-50 border-indigo-100",
      title: "1. Brand Analysis",
      thaiTitle: "วิเคราะห์อัตลักษณ์แบรนด์",
      desc: "สกัดข้อมูลสินค้าและบริการ กลุ่มเป้าหมาย และจุดยืนทางการตลาดจากเว็บไซต์และ Facebook สาธารณะ",
      provider: "WebsiteProvider & FacebookProvider",
    },
    {
      icon: <Share2 className="w-6 h-6 text-cyan-600" />,
      iconBg: "bg-cyan-50 border-cyan-100",
      title: "2. TikTok Discovery",
      thaiTitle: "ค้นหาครีเอเตอร์ TikTok",
      desc: "รวบรวมบัญชีครีเอเตอร์ไทยบน TikTok ผ่าน Scraper Provider หรือ Mock Fixture พร้อมตัดข้อมูลซ้ำซ้อน",
      provider: "TikTokProvider & Scraper",
    },
    {
      icon: <Search className="w-6 h-6 text-rose-600" />,
      iconBg: "bg-rose-50 border-rose-100",
      title: "3. Multilingual AI",
      thaiTitle: "เวกเตอร์ความหมาย MiniLM",
      desc: "แปลงเนื้อหาแบรนด์และโพสต์ครีเอเตอร์เป็นเวกเตอร์ 384 มิติ คำนวณ Cosine Similarity รองรับภาษาไทย",
      provider: "EmbeddingService & KOLMatcher",
    },
    {
      icon: <Sliders className="w-6 h-6 text-emerald-600" />,
      iconBg: "bg-emerald-50 border-emerald-100",
      title: "4. Explainable Scoring",
      thaiTitle: "การให้คะแนน 5 มิติโปร่งใส",
      desc: "คำนวณคะแนนรวมตามสูตรเชิงเส้น พร้อมสรุปเหตุผลที่แนะนำและข้อควรระวังสำหรับแคมเปญ",
      provider: "MultiFactorKOLScorer",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3 shadow-2xs">
          <span>Modular System Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          สถาปัตยกรรมและองค์ประกอบหลักของระบบ (Architecture)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
          ออกแบบตามหลัก Provider Abstraction ทำให้ทดสอบง่าย สลับผู้ให้บริการ Scraper ได้สะดวก และมีโหมดสำรองพร้อมทำงานเสมอ
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="glass-panel glass-panel-interactive rounded-3xl p-6 flex flex-col justify-between bg-white/95 border-slate-200"
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl ${step.iconBg} flex items-center justify-center mb-4 border shadow-xs`}>
                {step.icon}
              </div>
              <h3 className="font-black text-slate-900 text-base">{step.title}</h3>
              <div className="text-xs font-bold text-indigo-600 mb-2">{step.thaiTitle}</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">{step.desc}</p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-500 block truncate font-bold">
                {step.provider}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Business Example Preview */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/50 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>เกณฑ์มาตรฐานกรณีศึกษาจริง (Authentic Business Benchmark)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Khaokho Talaypu (เขาค้อทะเลภู) — แบรนด์ผลิตภัณฑ์ธรรมชาติและสมุนไพร
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              กรณีศึกษาจริงสำหรับทดสอบระบบ: แชมพูอัญชันบำรุงผมดกดำ และเจลว่านหางจระเข้ธรรมชาติ ระบบวิเคราะห์ครีเอเตอร์สายความงามและสุขภาพบน TikTok เพื่อหาผู้ที่ถ่ายทอดประโยชน์จากธรรมชาติได้อย่างตรงจุด
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 font-bold shadow-2xs">
                🌱 Clean Herbal Beauty
              </span>
              <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 font-bold shadow-2xs">
                💜 Butterfly Pea Herbal Shampoo
              </span>
              <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 font-bold shadow-2xs">
                👥 Target: Eco-conscious Thai Consumers
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="http://localhost:8000/health"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>ตรวจสอบ Health API</span>
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-black text-xs text-center flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Swagger OpenAPI</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;
