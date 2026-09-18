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

export interface KOLRecommendation {
  rank: number;
  username: string;
  display_name: string;
  profile_url: string;
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
  data_source: string;
  collected_at: string;
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
  | 'brand'
  | 'discovery'
  | 'recommendations'
  | 'compare'
  | 'sources'
  | 'technical';
