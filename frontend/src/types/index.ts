export type EvidenceNature = 'OBSERVED' | 'INFERRED' | 'ESTIMATED';

export interface EvidenceItem {
  field: string;
  source: string;
  source_url?: string;
  text: string;
  nature: EvidenceNature;
}

export interface BrandProfile {
  brand_name: string;
  industry: string;
  products_services: string[];
  target_audience: string[];
  content_themes: string[];
  brand_tone: string[];
  keywords: string[];
  location_signals: string[];
  summary: string;
  confidence: number;
  evidence: EvidenceItem[];
  is_demo_fixture: boolean;
  provenance: string;
}

export interface ScoreBreakdownItem {
  score: number;
  weight: number;
  weighted_contribution: number;
}

export interface ScoreBreakdown {
  semantic_relevance: ScoreBreakdownItem;
  engagement_quality: ScoreBreakdownItem;
  local_content_relevance: ScoreBreakdownItem;
  brand_safety: ScoreBreakdownItem;
  data_quality: ScoreBreakdownItem;
  final_score: number;
}

export interface KOLCandidate {
  username: string;
  normalized_username?: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: string;
  bio?: string | null;
  follower_count?: number | null;
  sample_video_count?: number;
  total_views?: number | null;
  total_likes?: number | null;
  total_comments?: number | null;
  total_shares?: number | null;
  total_saves?: number | null;
  average_views?: number | null;
  average_likes?: number | null;
  average_comments?: number | null;
  average_shares?: number | null;
  average_saves?: number | null;
  estimated_engagement_rate?: number | null;
  hashtags?: string[];
  sample_captions?: string[];
  matched_queries?: string[];
  thai_language_ratio?: number;
  thailand_keyword_count?: number;
  thailand_hashtag_count?: number;
  location_mentions?: string[];
  local_signal_score?: number;
  avatar_url?: string | null;
  video_thumbnail_url?: string | null;
  data_source?: string;
  collected_at?: string;
  data_freshness?: string;
  is_demo_fixture?: boolean;
  provenance?: string;
}

export interface TikTokDiscoveryResponse {
  status: string;
  candidate_count: number;
  candidates: KOLCandidate[];
  queries_used?: string[];
  provider?: string;
  data_source?: string;
  is_demo_fixture?: boolean;
}

export interface KOLRecommendation {
  rank: number;
  username: string;
  display_name: string;
  profile_url?: string | null;
  is_profile_verified?: boolean;
  profile_status?: 'verified' | 'unverified' | 'unavailable' | string;
  final_score: number;
  semantic_relevance_score: number;
  engagement_quality_score: number;
  local_content_relevance_score: number;
  audience_fit_proxy?: number | null;
  brand_safety_score: number;
  brand_safety_risk_level: 'safe' | 'review' | 'flagged' | string;
  data_quality_score: number;
  score_breakdown: ScoreBreakdown;
  reasons: string[];
  cautions: string[];
  matching_topics: string[];
  bio?: string | null;
  follower_count?: number | null;
  sample_video_count?: number;
  average_views?: number | null;
  average_likes?: number | null;
  average_comments?: number | null;
  average_shares?: number | null;
  estimated_engagement_rate?: number | null;
  sample_captions?: string[];
  hashtags?: string[];
  avatar_url?: string | null;
  video_thumbnail_url?: string | null;
  data_source: string;
  collected_at: string;
  data_freshness?: 'fresh' | 'aging' | 'stale' | 'unknown' | string;
  is_demo_fixture: boolean;
  provenance: string;
}

export interface RecommendationResponse {
  status: string;
  recommendation_count: number;
  recommendations: KOLRecommendation[];
  weights_used: Record<string, number>;
  audience_data_note: string;
  brand_profile?: BrandProfile | null;
  search_queries?: string[];
  candidate_pool_count?: number | null;
  data_source?: string | null;
  provenance?: string | null;
}

export interface ProviderStatusItem {
  name: string;
  status: 'configured' | 'unconfigured' | 'demo' | 'available' | 'error' | string;
  provider_class: string;
  details?: string | null;
}

export interface ProviderHealthResponse {
  status: string;
  demo_mode: boolean;
  providers: {
    website: ProviderStatusItem;
    facebook: ProviderStatusItem;
    tiktok: ProviderStatusItem;
    [key: string]: ProviderStatusItem;
  };
  timestamp: string;
}

export interface MatchingRunStatus {
  run_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | string;
  stage: 'queued' | 'brand_analysis' | 'query_generation' | 'tiktok_discovery' | 'normalization' | 'enrichment' | 'embedding' | 'scoring' | 'completed' | 'failed' | string;
  progress_percent: number;
  stage_message: string;
  brand_name?: string | null;
  candidate_count?: number | null;
  error?: string | null;
  started_at: string;
  completed_at?: string | null;
  result?: RecommendationResponse | null;
}

export interface HealthData {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  demo_mode: boolean;
  database_connected: boolean;
  timestamp: string;
}

export interface DemoPreset {
  id: string;
  name: string;
  thaiName: string;
  category: string;
  websiteUrl: string;
  facebookUrl: string;
  tag: string;
}

export type ActiveNavPage = 
  | 'dashboard'
  | 'analyze'
  | 'brand'
  | 'discovery'
  | 'recommendations'
  | 'compare'
  | 'shortlist'
  | 'reports'
  | 'sources'
  | 'technical';

export type OutreachStatus = 'shortlisted' | 'contacted' | 'negotiating' | 'confirmed' | 'declined';

export interface ShortlistItem {
  username: string;
  creator: KOLRecommendation;
  status: OutreachStatus;
  addedAt: string;
  notes?: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  content: string;
  created_at: string;
} 
