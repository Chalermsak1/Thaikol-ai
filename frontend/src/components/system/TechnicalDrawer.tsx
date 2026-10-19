import React from 'react';
import { Cpu, Database, Server, Radio, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { ProviderHealthResponse } from '../../types';
import { TikTokDiscoverySandbox } from '../TikTokDiscoverySandbox';
import { SemanticMatchingSandbox } from '../SemanticMatchingSandbox';

interface TechnicalDrawerProps {
  demoMode?: boolean;
  providerHealth?: ProviderHealthResponse | null;
}

export const TechnicalDrawer: React.FC<TechnicalDrawerProps> = ({ demoMode, providerHealth }) => {
  return (
    <div className="space-y-6 max-w-5xl font-thai">
      {/* Provider Connectivity & Telemetry Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#FF5A1F]" />
            <div>
              <h3 className="text-sm font-black text-slate-900">สถานะการเชื่อมต่อบริการภายนอก (Live External Providers)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                การตรวจสอบคีย์รับส่งข้อมูล อะแดปเตอร์เชื่อมต่อ และสถานะความพร้อมของระบบ
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-600 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
            GET /health/providers
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Website Provider */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Website Provider</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" />
                ACTIVE
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#FF5A1F] font-semibold">ProductionWebsiteProvider</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              สแกนข้อมูลผ่าน BeautifulSoup4 พร้อมระบบป้องกัน SSRF ตรวจจับ IP ภายในองค์กร และจำกัดขนาดข้อมูล 2MB
            </p>
          </div>

          {/* Facebook Provider */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Facebook Provider</span>
              {providerHealth?.providers?.facebook?.status === 'configured' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  CONFIGURED
                </span>
              ) : demoMode || providerHealth?.providers?.facebook?.status === 'demo' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  DEMO FIXTURE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <AlertCircle className="w-2.5 h-2.5" />
                  UNCONFIGURED
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              {providerHealth?.providers?.facebook?.provider_class || 'ApifyFacebookProvider'}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {providerHealth?.providers?.facebook?.details || 'อะแดปเตอร์ Apify Facebook Pages Scraper (ดึงข้อมูลเฉพาะสาธารณะ)'}
            </p>
          </div>

          {/* TikTok Provider */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">TikTok Provider</span>
              {providerHealth?.providers?.tiktok?.status === 'configured' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  CONFIGURED
                </span>
              ) : demoMode || providerHealth?.providers?.tiktok?.status === 'demo' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  DEMO FIXTURE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-2.5 h-2.5" />
                  TOKEN UNSET
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              {providerHealth?.providers?.tiktok?.provider_class || 'ApifyTikTokProvider'}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {providerHealth?.providers?.tiktok?.details || 'Apify TikTok Scraper พร้อมระบบ Exponential Backoff 3 ครั้ง รองรับ Rate Limits'}
            </p>
          </div>
        </div>
      </div>

      {/* Stack specifications */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">สถาปัตยกรรมและเทคโนโลยี (Architecture & Stack)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ข้อกำหนดทางวิศวกรรมและโมเดลประมวลผลภาษาธรรมชาติ
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-600 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
            FastAPI 0.115 + Python 3.12
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Server className="w-4 h-4 text-[#FF5A1F]" />
              <span>Backend & API Contracts</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              FastAPI พร้อม Pydantic v2 schemas รองรับทั้ง Synchronous matching และ Asynchronous background runs:
              <code className="text-[#C93B07] font-mono bg-orange-50 px-1.5 py-0.5 rounded text-[10px] block mt-1">
                POST /api/v1/matching/runs
              </code>
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-[#FF5A1F]" />
              <span>AI Embedding Model</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] block mb-1">
                paraphrase-multilingual-MiniLM-L12-v2
              </code>
              เวกเตอร์ความหนาแน่นสูง 384 มิติ พร้อมคำนวณ Cosine Similarity รองรับภาษาไทยและอังกฤษ
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Database className="w-4 h-4 text-[#FF5A1F]" />
              <span>ฐานข้อมูลและสแนปช็อต</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              PostgreSQL 16 + SQLAlchemy 2.0 ORM จัดเก็บ Point-in-time Snapshots เพื่อตรวจสอบความสดใหม่ของข้อมูล
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End Pipeline Architecture Flowchart */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">ผังการทำงานของระบบ (End-to-End Pipeline Architecture)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กระบวนการ 7 ขั้นตอนตั้งแต่รับข้อมูลแบรนด์จนถึงการคัดเลือกและแนะนำครีเอเตอร์
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-600 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
            Pipeline Flow
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            {[
              { step: '1', title: 'รับข้อมูลแบรนด์', desc: 'เว็บไซต์และ Facebook', color: 'border-slate-200 bg-slate-50/80' },
              { step: '2', title: 'วิเคราะห์โปรไฟล์', desc: 'กลุ่มเป้าหมายและสไตล์', color: 'border-slate-200 bg-slate-50/80' },
              { step: '3', title: 'สร้างคำค้นหา', desc: 'คีย์เวิร์ดภาษาไทย-อังกฤษ', color: 'border-slate-200 bg-slate-50/80' },
              { step: '4', title: 'ดึงข้อมูล TikTok', desc: 'ครีเอเตอร์จากคลิปจริง', color: 'border-slate-200 bg-slate-50/80' },
              { step: '5', title: 'AI Matching', desc: 'เวกเตอร์ 384 มิติ', color: 'border-orange-200 bg-orange-50/80 text-[#C93B07] font-bold' },
              { step: '6', title: 'ให้คะแนน 5 ปัจจัย', desc: 'สูตรถ่วงน้ำหนักตรวจสอบได้', color: 'border-slate-200 bg-slate-50/80' },
              { step: '7', title: 'จัดอันดับแนะนำ', desc: 'การ์ดผลลัพธ์และเหตุผล', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-950 font-bold' },
            ].map((node) => (
              <div key={node.step} className={`p-3.5 rounded-2xl border ${node.color} flex flex-col justify-between shadow-2xs`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                    ขั้นตอน {node.step}
                  </span>
                </div>
                <div>
                  <div className="font-black text-slate-900 text-xs">{node.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug">{node.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Sandboxes */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">กล่องเครื่องมือทดสอบสำหรับนักพัฒนา (Diagnostic Sandboxes)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ทดสอบการดึงข้อมูลครีเอเตอร์และการคำนวณเวกเตอร์แบบแยกส่วน
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>เครื่องมือทดสอบ A: ทดสอบการค้นหาและดึงข้อมูลจาก TikTok (Scraper Sandbox)</span>
            </div>
            <TikTokDiscoverySandbox />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>เครื่องมือทดสอบ B: ทดสอบความคล้ายคลึงเวกเตอร์ (Cosine Similarity Sandbox)</span>
            </div>
            <SemanticMatchingSandbox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDrawer;
