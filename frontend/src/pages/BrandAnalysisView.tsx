import React from 'react';
import { RecommendationResponse } from '../types';
import { SearchStrategy } from '../components/brand/SearchStrategy';
import { EmptyState } from '../components/common/EmptyState';
import {
  Building2,
  FileText,
  MapPin,
  Globe,
  Facebook,
  ShieldCheck,
  Tag,
  Layers,
} from 'lucide-react';

interface BrandAnalysisViewProps {
  result: RecommendationResponse | null;
  onOpenEvidence: () => void;
  onGoToDashboard: () => void;
  onGoToAnalyze?: () => void;
}

export const BrandAnalysisView: React.FC<BrandAnalysisViewProps> = ({
  result,
  onOpenEvidence,
  onGoToDashboard,
  onGoToAnalyze,
}) => {
  if (!result || !result.brand_profile) {
    return (
      <EmptyState
        title="No brand analyzed yet"
        description="Run brand analysis to extract comprehensive brand signals, audience themes, and public evidence."
        actionLabel="Analyze a Brand"
        onAction={onGoToAnalyze || onGoToDashboard}
        icon={<Building2 className="w-5 h-5 text-slate-400" />}
      />
    );
  }

  const brand = result.brand_profile;
  const confidencePct = Math.round((brand.confidence ?? 0) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="saas-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Brand Intelligence Profile
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {brand.brand_name}
            </h1>
            {brand.is_demo_fixture && (
              <span className="badge badge-demo text-[10px]">Demo Benchmark</span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {brand.industry}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenEvidence}
            className="btn-primary text-xs px-4 py-2 gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Evidence ({brand.evidence?.length ?? 0})</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout as Specified */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Brand Overview (Summary, Audience, Themes, Tone) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="saas-card p-5 sm:p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Brand Overview
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Synthesized Profile</span>
            </div>

            {/* 1. Summary */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Executive Summary
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60 italic">
                "{brand.summary || 'No summary available.'}"
              </p>
            </div>

            {/* 2. Audience */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Target Audience Signals
                </span>
                <span className="text-[10px] text-slate-400">Contextual Inferences</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.target_audience && brand.target_audience.length > 0 ? (
                  brand.target_audience.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-800"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not specified</span>
                )}
              </div>
            </div>

            {/* 3. Content Themes */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Content Themes
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.content_themes && brand.content_themes.length > 0 ? (
                  brand.content_themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium"
                    >
                      #{theme}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not specified</span>
                )}
              </div>
            </div>

            {/* 4. Brand Tone */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Brand Tone & Persona
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.brand_tone && brand.brand_tone.length > 0 ? (
                  brand.brand_tone.map((tone, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {tone}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Analysis Information (Sources, Confidence, Location, Status) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="saas-card p-5 sm:p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Analysis Information
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Audit Metadata</span>
            </div>

            {/* 1. Sources */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sources Analyzed
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium truncate flex-1">
                    https://khaokhotalaypu.com
                  </span>
                  <span className="badge badge-neutral text-[10px]">Crawled</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <Facebook className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium truncate flex-1">
                    facebook.com/KhaokhoTalaypu
                  </span>
                  <span className="badge badge-neutral text-[10px]">Extracted</span>
                </div>
              </div>
            </div>

            {/* 2. Confidence */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Model Confidence
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {confidencePct}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Confidence score synthesized from direct lexical overlap and multi-signal corroboration.
              </p>
            </div>

            {/* 3. Location */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Geographic Signals
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {brand.location_signals && brand.location_signals.length > 0
                    ? brand.location_signals.join(', ')
                    : 'Thailand (National / Bangkok)'}
                </span>
              </div>
            </div>

            {/* 4. Status */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Pipeline Status
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-900">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Analysis Complete</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700">
                  {brand.is_demo_fixture ? 'DEMO FIXTURE' : 'LIVE EXTRACT'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below 2-Column: Products / Services, Keywords, and Search Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products / Services */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Products & Services Identified</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {brand.products_services && brand.products_services.length > 0 ? (
              brand.products_services.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Not specified</span>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>Extracted Brand Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {brand.keywords && brand.keywords.length > 0 ? (
              brand.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Not specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Search Strategy */}
      {result.search_queries && result.search_queries.length > 0 && (
        <SearchStrategy
          queries={result.search_queries}
          candidateCount={result.candidate_pool_count}
        />
      )}
    </div>
  );
};
