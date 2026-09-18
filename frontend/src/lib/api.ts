import axios from 'axios';
import { RecommendationResponse, HealthData } from '../types';

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
