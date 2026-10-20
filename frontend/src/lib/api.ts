import axios from 'axios';
import { RecommendationResponse, HealthData, ProviderHealthResponse, MatchingRunStatus } from '../types';

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function recommendFromBrand(params: {
  website_url?: string;
  facebook_page_url?: string;
  limit?: number;
}): Promise<RecommendationResponse> {
  const response = await apiClient.post<RecommendationResponse>(
    '/api/v1/matching/recommend-from-brand',
    params
  );
  return response.data;
}

export async function getHealthStatus(): Promise<HealthData> {
  const response = await apiClient.get<HealthData>('/health');
  return response.data;
}

export async function getProvidersHealth(): Promise<ProviderHealthResponse> {
  const response = await apiClient.get<ProviderHealthResponse>('/health/providers');
  return response.data;
}

export async function createMatchingRun(params: {
  website_url?: string;
  facebook_page_url?: string;
  limit?: number;
}): Promise<MatchingRunStatus> {
  const response = await apiClient.post<MatchingRunStatus>(
    '/api/v1/matching/runs',
    params
  );
  return response.data;
}

export async function getMatchingRunStatus(runId: string): Promise<MatchingRunStatus> {
  const response = await apiClient.get<MatchingRunStatus>(
    `/api/v1/matching/runs/${runId}`
  );
  return response.data;
}

export async function getMatchingRunResults(runId: string): Promise<RecommendationResponse> {
  const response = await apiClient.get<RecommendationResponse>(
    `/api/v1/matching/runs/${runId}/results`
  );
  return response.data;
}

export async function getRecommendationById(
  id: string,
  limit: number = 10,
): Promise<RecommendationResponse> {
  const response = await apiClient.get<RecommendationResponse>(
    `/api/v1/matching/recommendations/${id}?limit=${limit}`
  );
  return response.data;
}

export async function discoverTikTokCreators(params: {
  queries: string[];
  max_results_per_query?: number;
  max_candidates?: number;
}): Promise<{ status: string; candidate_count: number; candidates: any[] }> {
  const response = await apiClient.post(
    '/api/v1/tiktok/discover',
    params
  );
  return response.data;
}

export async function listTikTokCandidates(params?: {
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const response = await apiClient.get(
    '/api/v1/tiktok/candidates',
    { params }
  );
  return response.data;
}

export async function ingestCreator(params: {
  url_or_handle: string;
  brand_name?: string;
  industry?: string;
  keywords?: string[];
}): Promise<{
  status: string;
  message: string;
  candidate: any;
  recommendation?: any;
}> {
  const response = await apiClient.post(
    '/api/v1/tiktok/ingest-creator',
    params
  );
  return response.data;
}


