import React, { useState } from 'react';
import axios from 'axios';
import {
  Cpu,
  ExternalLink,
  Sparkles,
  Tag,
  ShieldCheck,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Flame,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { getProfileLinkStatus } from './kol/TikTokProfileCTA';

interface SemanticMatch {
  username: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: string;
  semantic_relevance_score: number;
  cosine_similarity: number;
  matching_topics: string[];
  brand_text?: string;
  creator_text?: string;
  data_source: string;
  is_demo_fixture: boolean;
  provenance: string;
}

interface MatchResponse {
  match_count: number;
  matches: SemanticMatch[];
  embedding_model: string;
}

interface ScoreBreakdownItem {
  score: number;
  weight: number;
  weighted_contribution: number;
}

interface ScoreBreakdown {
  semantic_relevance: ScoreBreakdownItem;
  engagement_quality: ScoreBreakdownItem;
  local_content_relevance: ScoreBreakdownItem;
  brand_safety: ScoreBreakdownItem;
  data_quality: ScoreBreakdownItem;
  final_score: number;
}

interface KOLRecommendation {
  rank: number;
  username: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: string;
  final_score: number;
  semantic_relevance_score: number;
  engagement_quality_score: number;
  local_content_relevance_score: number;
  audience_fit_proxy?: number | null;
  brand_safety_score: number;
  brand_safety_risk_level: string;
  data_quality_score: number;
  score_breakdown: ScoreBreakdown;
  reasons: string[];
  cautions: string[];
  matching_topics: string[];
  data_source: string;
  collected_at: string;
  is_demo_fixture: boolean;
  provenance: string;
}

interface RecommendationResponse {
  status: string;
  recommendation_count: number;
  recommendations: KOLRecommendation[];
  weights_used: Record<string, number>;
  audience_data_note: string;
}

export const SemanticMatchingSandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'semantic'>('recommendation');
  const [loading, setLoading] = useState(false);
  const [semanticResult, setSemanticResult] = useState<MatchResponse | null>(null);
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedKols, setExpandedKols] = useState<Record<string, boolean>>({});

  const toggleExpand = (username: string) => {
    setExpandedKols((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const handleRunSemanticMatching = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<MatchResponse>('/api/v1/matching/semantic-from-brand', {
        website_url: 'https://khaokhotalaypu.com',
        facebook_page_url: 'https://facebook.com/KhaokhoTalaypu',
      });
      setSemanticResult(res.data);
      setActiveTab('semantic');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'object' ? detail.message || JSON.stringify(detail) : detail || err.message;
      setError(errMsg || 'Failed to execute semantic matching');
    } finally {
      setLoading(false);
    }
  };

  const handleRunRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<RecommendationResponse>('/api/v1/matching/recommend-from-brand', {
        website_url: 'https://khaokhotalaypu.com',
        facebook_page_url: 'https://facebook.com/KhaokhoTalaypu',
      });
      setRecResult(res.data);
      setActiveTab('recommendation');
      // Auto-expand the #1 recommended KOL
      if (res.data.recommendations.length > 0) {
        setExpandedKols({ [res.data.recommendations[0].username]: true });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'object' ? detail.message || JSON.stringify(detail) : detail || err.message;
      setError(errMsg || 'Failed to execute recommendation engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Phase 4 Multi-Factor KOL Scorer & Explainability
            </div>
            <h3 className="text-xl font-bold text-white">AI-Powered TikTok KOL Recommendation Engine</h3>
            <p className="text-xs text-slate-400">
              Combines semantic relevance (45%), engagement quality (25%), local content fit (15%), brand safety (10%), and data completeness (5%).
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunRecommendation}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 font-semibold text-sm text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading && activeTab === 'recommendation' ? 'Scoring KOLs...' : 'Run KOL Recommendation'}</span>
            </button>

            <button
              onClick={handleRunSemanticMatching}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-brand-400" />
              <span>{loading && activeTab === 'semantic' ? 'Matching...' : 'Semantic View'}</span>
            </button>
          </div>
        </div>

        {/* Selected Brand Context Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Selected Benchmark Brand:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[11px]">
              Khaokho Talaypu เขาค้อทะเลภู (Curated Assessment Fixture)
            </span>
          </div>
          <p className="text-slate-400">
            Natural beauty & herbal personal care brand established in Phetchabun, Thailand. Core themes: 100% natural butterfly pea, aloe vera, ginger shampoos, hair loss prevention, and clean beauty.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Execution Notice:</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Tab Toggle View */}
        {(recResult || semanticResult) && (
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('recommendation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'recommendation'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Multi-Factor Recommendations ({recResult?.recommendation_count || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('semantic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'semantic'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Semantic Similarity View ({semanticResult?.match_count || 0})</span>
            </button>
          </div>
        )}

        {/* TAB 1: Multi-Factor Recommendation View */}
        {activeTab === 'recommendation' && recResult && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Ranked <strong className="text-white">{recResult.recommendation_count}</strong> creator candidates using multi-factor explainable scoring.
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                <span>Weights: Sem 45% · Eng 25% · Loc 15% · Safe 10% · Data 5%</span>
              </div>
            </div>

            <div className="space-y-3">
              {recResult.recommendations.map((rec) => {
                const isExpanded = !!expandedKols[rec.username];
                return (
                  <div
                    key={rec.username}
                    className={`rounded-xl border transition-all duration-200 ${
                      rec.rank === 1
                        ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Rank & Creator Details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            rec.rank === 1
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30'
                              : rec.rank <= 3
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          #{rec.rank}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{rec.display_name}</span>
                            {(() => {
                              const linkStatus = getProfileLinkStatus(rec);
                              if (linkStatus.isClickable && linkStatus.url) {
                                return (
                                  <a
                                    href={linkStatus.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-tiktok-cyan hover:underline"
                                  >
                                    <span>@{rec.username}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                );
                              }
                              return (
                                <span className="text-xs text-slate-400 font-mono inline-flex items-center gap-1">
                                  @{rec.username}
                                  <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1 py-0.2 rounded">
                                    Profile unavailable
                                  </span>
                                </span>
                              );
                            })()}
                            {rec.rank === 1 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Top Match
                              </span>
                            )}
                          </div>

                          {/* Quick Component Badges */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-emerald-400" />
                              <span>Semantic: <strong className="text-slate-200">{rec.semantic_relevance_score.toFixed(1)}</strong></span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>Engagement: <strong className="text-slate-200">{rec.engagement_quality_score.toFixed(1)}</strong></span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-cyan-400" />
                              <span>Local: <strong className="text-slate-200">{rec.local_content_relevance_score.toFixed(1)}</strong></span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-blue-400" />
                              <span>Safety: <strong className="text-slate-200">{rec.brand_safety_score.toFixed(0)}</strong></span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Final Score & Accordion Button */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-400 leading-none">
                            {rec.final_score.toFixed(1)}
                            <span className="text-xs text-slate-400 font-normal ml-0.5">/100</span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                            Final Score
                          </div>
                        </div>

                        <button
                          onClick={() => toggleExpand(rec.username)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                        >
                          <span>Why this KOL?</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable "Why this KOL?" Breakdown Section */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-slate-950/70 border-t border-slate-800/80 space-y-4 rounded-b-xl text-xs">
                        {/* 1. Score Breakdown Table */}
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
                            Multi-Factor Score Breakdown
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Semantic (45%)</div>
                              <div className="text-sm font-bold text-white mt-0.5">{rec.score_breakdown.semantic_relevance.score.toFixed(1)}</div>
                              <div className="text-[10px] text-emerald-400">+{rec.score_breakdown.semantic_relevance.weighted_contribution.toFixed(2)}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Engagement (25%)</div>
                              <div className="text-sm font-bold text-white mt-0.5">{rec.score_breakdown.engagement_quality.score.toFixed(1)}</div>
                              <div className="text-[10px] text-amber-400">+{rec.score_breakdown.engagement_quality.weighted_contribution.toFixed(2)}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Local Content (15%)</div>
                              <div className="text-sm font-bold text-white mt-0.5">{rec.score_breakdown.local_content_relevance.score.toFixed(1)}</div>
                              <div className="text-[10px] text-cyan-400">+{rec.score_breakdown.local_content_relevance.weighted_contribution.toFixed(2)}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                              <div className="text-[10px] text-slate-400">Brand Safety (10%)</div>
                              <div className="text-sm font-bold text-white mt-0.5">{rec.score_breakdown.brand_safety.score.toFixed(1)}</div>
                              <div className="text-[10px] text-blue-400">+{rec.score_breakdown.brand_safety.weighted_contribution.toFixed(2)}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                              <div className="text-[10px] text-slate-400">Data Quality (5%)</div>
                              <div className="text-sm font-bold text-white mt-0.5">{rec.score_breakdown.data_quality.score.toFixed(1)}</div>
                              <div className="text-[10px] text-indigo-400">+{rec.score_breakdown.data_quality.weighted_contribution.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Deterministic Reasons & Cautions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Positive Reasons */}
                          <div className="space-y-2 p-3 rounded-lg bg-slate-900/90 border border-emerald-900/30">
                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Recommendation Rationale:
                            </div>
                            <ul className="space-y-1.5">
                              {rec.reasons.map((r, i) => (
                                <li key={i} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                                  <span className="text-emerald-400">•</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Caution Flags */}
                          <div className="space-y-2 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Caution & Campaign Review:
                            </div>
                            {rec.cautions.length > 0 ? (
                              <ul className="space-y-1.5">
                                {rec.cautions.map((c, i) => (
                                  <li key={i} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                                    <span className="text-amber-400">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-slate-400 text-[11px]">
                                No caution or campaign review flags detected.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. Matching Topics & Audience Fit Proxy */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] uppercase font-semibold text-slate-400">Overlapping Topics:</span>
                            {rec.matching_topics.length > 0 ? (
                              rec.matching_topics.map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  {t}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[10px]">None</span>
                            )}
                          </div>

                          {rec.audience_fit_proxy !== null && rec.audience_fit_proxy !== undefined && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span>Audience Fit Proxy:</span>
                              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono font-bold">
                                {rec.audience_fit_proxy.toFixed(1)}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mandatory Non-Demographic Disclaimer Note */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-brand-400" />
                Audience Data & Fairness Notice:
              </div>
              <div>{recResult.audience_data_note}</div>
            </div>
          </div>
        )}

        {/* TAB 2: Semantic View (Phase 3 View) */}
        {activeTab === 'semantic' && semanticResult && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Semantically matched and ranked <strong className="text-white">{semanticResult.match_count}</strong> creator candidates (cosine similarity only).
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                  {semanticResult.embedding_model.split('/').pop()} (384-dim)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {semanticResult.matches.map((m, idx) => (
                <div
                  key={m.username}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{m.display_name}</div>
                        {(() => {
                          const linkStatus = getProfileLinkStatus(m);
                          if (linkStatus.isClickable && linkStatus.url) {
                            return (
                              <a
                                href={linkStatus.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-tiktok-cyan hover:underline"
                              >
                                <span>@{m.username}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            );
                          }
                          return (
                            <span className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1">
                              @{m.username}
                              <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1 py-0.2 rounded">
                                Profile unavailable
                              </span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-400">
                        {m.semantic_relevance_score.toFixed(1)}
                        <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        cos: {m.cosine_similarity.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, m.semantic_relevance_score)}%` }}
                    />
                  </div>

                  {m.matching_topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.matching_topics.map((top) => (
                        <span
                          key={top}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {top}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
