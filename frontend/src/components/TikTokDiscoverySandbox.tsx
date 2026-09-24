import React, { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, ExternalLink, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { getProfileLinkStatus } from './kol/TikTokProfileCTA';

interface KOLCandidate {
  username: string;
  normalized_username: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: string;
  bio?: string;
  follower_count?: number;
  sample_video_count: number;
  average_views?: number;
  average_likes?: number;
  average_comments?: number;
  average_shares?: number;
  estimated_engagement_rate?: number;
  hashtags: string[];
  sample_captions: string[];
  matched_queries: string[];
  thai_language_ratio: number;
  thailand_keyword_count: number;
  thailand_hashtag_count: number;
  location_mentions: string[];
  local_signal_score: number;
  data_source: string;
  is_demo_fixture: boolean;
  provenance: string;
}

interface DiscoveryResponse {
  discovery_run_id: string;
  status: string;
  candidate_count: number;
  candidates: KOLCandidate[];
}

export const TikTokDiscoverySandbox: React.FC = () => {
  const [queriesInput, setQueriesInput] = useState('แชมพูสมุนไพร, ลดผมร่วง');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiscover = async (customQueries?: string[]) => {
    setLoading(true);
    setError(null);

    const queries = customQueries || queriesInput.split(',').map((q) => q.trim()).filter(Boolean);
    if (queries.length === 0) {
      setError('Please enter at least one query term.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post<DiscoveryResponse>('/api/v1/tiktok/discover', {
        queries,
        max_results_per_query: 20,
        max_candidates: 30,
      });

      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to connect to discovery service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-tiktok-red/10 text-tiktok-red border border-tiktok-red/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 2 Developer Sandbox
            </div>
            <h3 className="text-xl font-bold text-white">TikTok Creator Candidate Discovery</h3>
            <p className="text-xs text-slate-400">
              Query public TikTok creators, extract transparent content signals, aggregate video metrics, and compute Estimated Engagement Rate.
            </p>
          </div>

          {/* Quick Pre-set Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setQueriesInput('แชมพูสมุนไพร, ลดผมร่วง');
                handleDiscover(['แชมพูสมุนไพร', 'ลดผมร่วง']);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              🌿 Herbal Hair Care
            </button>
            <button
              onClick={() => {
                setQueriesInput('organic, skincare, ผิวแพ้ง่าย');
                handleDiscover(['organic', 'skincare', 'ผิวแพ้ง่าย']);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              ✨ Organic Skincare
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={queriesInput}
              onChange={(e) => setQueriesInput(e.target.value)}
              placeholder="Enter search queries separated by commas (e.g. แชมพูสมุนไพร, กู้ผิว)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={() => handleDiscover()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-tiktok-red font-semibold text-sm text-white shadow-lg shadow-brand-500/20 hover:brightness-110 disabled:opacity-50 transition"
          >
            {loading ? 'Searching TikTok...' : 'Discover Creators'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Found <strong className="text-white">{result.candidate_count}</strong> deduplicated candidates (Run ID: <code className="text-slate-300">{result.discovery_run_id.slice(0, 8)}</code>)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>DEMO_MODE Standardized Fixture Safe</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.candidates.map((cand) => (
                <div
                  key={cand.normalized_username}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{cand.display_name}</span>
                        <span className="text-xs text-slate-400">@{cand.username}</span>
                      </div>
                      {(() => {
                        const linkStatus = getProfileLinkStatus(cand);
                        if (linkStatus.isClickable && linkStatus.url) {
                          return (
                            <a
                              href={linkStatus.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-tiktok-cyan hover:underline mt-0.5"
                            >
                              <span>{cand.profile_url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          );
                        }
                        return (
                          <div className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-1.5">
                            <span className="text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.2 rounded text-[10px]">
                              Profile unavailable ({linkStatus.label})
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {cand.data_source}
                    </span>
                  </div>

                  {cand.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                      "{cand.bio}"
                    </p>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">Followers</div>
                      <div className="font-bold text-slate-100">{cand.follower_count?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Avg Views</div>
                      <div className="font-bold text-slate-100">{cand.average_views ? Math.round(cand.average_views).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Avg Likes</div>
                      <div className="font-bold text-slate-100">{cand.average_likes ? Math.round(cand.average_likes).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Est. ER</div>
                      <div className="font-bold text-emerald-400">
                        {cand.estimated_engagement_rate ? `${(cand.estimated_engagement_rate * 100).toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Thailand Content Signals */}
                  <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-indigo-300">Thailand Content Signals:</span>
                      <span className="font-bold text-indigo-200">
                        Score: {(cand.local_signal_score * 100).toFixed(0)}/100
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                      <span>Thai Script: <strong className="text-slate-200">{(cand.thai_language_ratio * 100).toFixed(0)}%</strong></span>
                      <span>TH Keywords: <strong className="text-slate-200">{cand.thailand_keyword_count}</strong></span>
                      <span>TH Hashtags: <strong className="text-slate-200">{cand.thailand_hashtag_count}</strong></span>
                    </div>
                    {cand.location_mentions.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-indigo-300">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>{cand.location_mentions.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Matched Queries & Sample Hashtags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {cand.matched_queries.map((q) => (
                      <span key={q} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        <Tag className="w-2.5 h-2.5" />
                        {q}
                      </span>
                    ))}
                    {cand.hashtags.slice(0, 3).map((h) => (
                      <span key={h} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              ℹ️ <strong>Heuristic & Derived Metric Notice:</strong> "Estimated Engagement Rate" is derived from sampled video metrics as <code>(avg_likes + avg_comments + avg_shares) / follower_count</code> and is NOT an official TikTok metric. "Local Signal Score" analyzes content language, keywords, and hashtags and does NOT represent verified audience demographics.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
