import React from 'react';
import { RecommendationResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import {
  Building2,
  FileText,
  MapPin,
  Globe,
  Facebook,
  Tag,
  Layers,
  ArrowRight,
  Users,
  Compass,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';

interface BrandAnalysisViewProps {
  result: RecommendationResponse | null;
  onOpenEvidence: () => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
  onGoToRecommendations?: () => void;
  onSearchKOL?: (query: string) => void;
}

export const BrandAnalysisView: React.FC<BrandAnalysisViewProps> = ({
  result,
  onOpenEvidence,
  onGoToDashboard,
  onGoToAnalyze,
  onGoToRecommendations,
  onSearchKOL,
}) => {
  if (!result || !result.brand_profile) {
    return (
      <EmptyState
        title="ยังไม่มีการวิเคราะห์โปรไฟล์แบรนด์ (No Brand Analyzed)"
        description="เริ่มการวิเคราะห์แบรนด์ผ่านเว็บไซต์และหน้าเพจสาธารณะ เพื่อสกัดเอกลักษณ์ กลุ่มเป้าหมาย และหัวข้อค้นหาครีเอเตอร์"
        actionLabel="เริ่มวิเคราะห์แบรนด์ (Analyze Brand)"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<Building2 className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const brand = result.brand_profile;
  const confidencePct = Math.round((brand.confidence ?? 0) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-thai">
      {/* ─── Hero Brand Header ───────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/80">
              <Sparkles className="w-3 h-3 text-[#FF5A1F]" />
              <span>Brand Intelligence Profile</span>
            </span>
            {brand.is_demo_fixture ? (
              <span className="badge badge-demo text-[10px]">ชุดทดสอบมาตรฐาน (Benchmark)</span>
            ) : (
              <span className="badge badge-safe text-[10px]">ข้อมูลสาธารณะสด (Live Data)</span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200/90 text-[#FF5A1F] flex items-center justify-center font-black text-2xl shadow-2xs shrink-0">
              {brand.brand_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {brand.brand_name}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                <span className="text-slate-700 font-semibold">{brand.industry}</span>
                <span>•</span>
                <span>ความแม่นยำโมเดล {confidencePct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onOpenEvidence}
            className="btn-secondary text-xs px-4 py-2.5 gap-1.5 min-h-[44px] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>หลักฐานข้อมูล ({brand.evidence?.length ?? 0})</span>
          </button>

          {result.recommendations && result.recommendations.length > 0 && (
            <button
              onClick={onGoToRecommendations || onGoToDashboard}
              className="btn-orange text-xs px-4 py-2.5 gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
            >
              <span>ดูครีเอเตอร์ ({result.recommendation_count})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Grid: Brand Overview, Persona & Content Themes ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Summary Quote */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>สรุปภาพรวมจุดยืนของแบรนด์ (Executive Summary)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                ความเชื่อมั่น: {confidencePct}%
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed bg-orange-50/40 p-4 rounded-2xl border border-orange-100/80 italic font-thai">
              "{brand.summary || 'ไม่มีข้อมูลสรุปจุดยืนแบรนด์'}"
            </p>

            {/* Products & Catalog */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>สินค้าและบริการหลัก (Extracted Products)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.products_services && brand.products_services.length > 0 ? (
                  brand.products_services.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/80 shadow-2xs"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">ไม่พบรายการสินค้าเฉพาะเจาะจง</span>
                )}
              </div>
            </div>
          </div>

          {/* Target Audience Signals */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>กลุ่มเป้าหมายเชิงบริบท (Target Audience Signals)</span>
              </h2>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Contextual Match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brand.target_audience && brand.target_audience.length > 0 ? (
                brand.target_audience.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {item}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">ไม่พบสัญญาณกลุ่มเป้าหมาย</span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              💡 <strong>ข้อสังเกต:</strong> ข้อมูลประชากรศาสตร์ (Audience Demographics) วิเคราะห์จากสัญญาณบริบทเนื้อหาและคีย์เวิร์ดสาธารณะ ไม่มีการเข้าถึงข้อมูลส่วนตัวของผู้ติดตาม
            </p>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Content Themes & Brand Tone */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>ธีมเนื้อหาและสไตล์การสื่อสาร (Themes & Tone)</span>
              </h2>
            </div>

            {/* Content Themes */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                ธีมเนื้อหาหลัก (Content Pillars)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {brand.content_themes && brand.content_themes.length > 0 ? (
                  brand.content_themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-[#C93B07] text-xs font-bold"
                    >
                      #{theme}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">ไม่ได้ระบุ</span>
                )}
              </div>
            </div>

            {/* Brand Tone */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                โทนและบุคลิกแบรนด์ (Tone & Style)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {brand.brand_tone && brand.brand_tone.length > 0 ? (
                  brand.brand_tone.map((tone, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/70"
                    >
                      {tone}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">ไม่ได้ระบุ</span>
                )}
              </div>
            </div>
          </div>

          {/* Sources & Geographic Signals */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>แหล่งข้อมูลและพื้นที่เป้าหมาย (Sources & Signals)</span>
              </h2>
            </div>

            {/* Sources list */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-semibold truncate">Official Website</span>
                </div>
                <span className="badge badge-neutral text-[10px]">สแกนแล้ว</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-semibold truncate">Facebook Page</span>
                </div>
                <span className="badge badge-neutral text-[10px]">ดึงข้อมูลแล้ว</span>
              </div>
            </div>

            {/* Geographic Signals */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                ตลาดเป้าหมายและสัญญาณพื้นที่ (Target Market)
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>
                  {brand.location_signals && brand.location_signals.length > 0
                    ? brand.location_signals.join(', ')
                    : 'ประเทศไทย (Thailand / National)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Generated Search Topics for TikTok Discovery ───────────── */}
      {result.search_queries && result.search_queries.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>หัวข้อค้นหาบน TikTok ที่ระบบสร้างขึ้น ({result.search_queries.length} หัวข้อ)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI สังเคราะห์คีย์เวิร์ดจากเอกลักษณ์แบรนด์ เพื่อใช้ค้นหาและคัดเลือกครีเอเตอร์ที่เกี่ยวข้องบน TikTok
              </p>
            </div>
            {result.candidate_pool_count && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                {result.candidate_pool_count} ครีเอเตอร์ในระบบ
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {result.search_queries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSearchKOL?.(q)}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:bg-orange-50/50 hover:border-orange-300 transition text-left cursor-pointer group"
                title="แตะเพื่อค้นหาครีเอเตอร์ด้วยหัวข้อนี้ใน Discovery"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0" />
                  <span className="truncate group-hover:text-[#FF5A1F] font-semibold">{q}</span>
                </div>
                <Search className="w-3 h-3 text-slate-400 group-hover:text-[#FF5A1F] shrink-0 transition" />
              </button>
            ))}
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={onGoToRecommendations || onGoToDashboard}
                className="btn-orange text-xs px-4 py-2.5 gap-1.5 shadow-2xs cursor-pointer min-h-[44px]"
              >
                <span>ดูอันดับครีเอเตอร์ที่แมตช์สูงสุด ({result.recommendation_count} คน)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandAnalysisView;
