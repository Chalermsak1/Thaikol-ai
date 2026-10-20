import axios from 'axios';
import { RecommendationResponse, HealthData, ProviderHealthResponse, MatchingRunStatus, ShortlistItem } from '../types';

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

// Shortlist & Collaboration Workflow API
export async function fetchShortlist(campaignId?: string): Promise<ShortlistItem[]> {
  const params: Record<string, string> = {};
  if (campaignId && campaignId !== 'all') {
    params.campaign_id = campaignId;
  }
  const response = await apiClient.get<any[]>('/api/v1/shortlist', { params });
  return (response.data || []).map((raw) => ({
    username: raw.username,
    creator: raw.creator || {
      username: raw.username,
      display_name: raw.username,
      final_score: 85,
      follower_count: 50000,
      average_views: 15000,
    },
    status: raw.status || 'shortlisted',
    addedAt: raw.added_at || new Date().toISOString(),
    notes: raw.notes || '',
    campaignId: raw.campaign_id || 'default',
    draftDueDate: raw.draft_due_date,
    liveDate: raw.live_date,
    agreedRateTHB: raw.agreed_rate_thb,
    deliverableFormat: raw.deliverable_format,
    documentLinks: raw.document_links || [],
    livePostUrl: raw.live_post_url,
    actualCostTHB: raw.actual_cost_thb,
    actualViews: raw.actual_views,
    actualLikes: raw.actual_likes,
    actualComments: raw.actual_comments,
    actualShares: raw.actual_shares,
    trackingStatus: raw.tracking_status || 'pending_post',
    trackingUpdatedAt: raw.tracking_updated_at,
  }));
}

export async function upsertShortlistItem(item: ShortlistItem): Promise<void> {
  const payload = {
    username: item.username,
    campaign_id: item.campaignId || 'default',
    status: item.status,
    notes: item.notes || '',
    added_at: item.addedAt,
    draft_due_date: item.draftDueDate,
    live_date: item.liveDate,
    agreed_rate_thb: item.agreedRateTHB,
    deliverable_format: item.deliverableFormat,
    document_links: item.documentLinks || [],
    live_post_url: item.livePostUrl,
    actual_cost_thb: item.actualCostTHB,
    actual_views: item.actualViews,
    actual_likes: item.actualLikes,
    actual_comments: item.actualComments,
    actual_shares: item.actualShares,
    tracking_status: item.trackingStatus || 'pending_post',
    creator: item.creator,
  };
  await apiClient.post('/api/v1/shortlist', payload);
}

export async function updateShortlistItem(
  username: string,
  updates: Partial<ShortlistItem>,
  campaignId: string = 'default'
): Promise<void> {
  const payload: Record<string, any> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.campaignId !== undefined) payload.campaign_id = updates.campaignId;
  if (updates.draftDueDate !== undefined) payload.draft_due_date = updates.draftDueDate;
  if (updates.liveDate !== undefined) payload.live_date = updates.liveDate;
  if (updates.agreedRateTHB !== undefined) payload.agreed_rate_thb = updates.agreedRateTHB;
  if (updates.deliverableFormat !== undefined) payload.deliverable_format = updates.deliverableFormat;
  if (updates.documentLinks !== undefined) payload.document_links = updates.documentLinks;
  if (updates.livePostUrl !== undefined) payload.live_post_url = updates.livePostUrl;
  if (updates.actualCostTHB !== undefined) payload.actual_cost_thb = updates.actualCostTHB;
  if (updates.actualViews !== undefined) payload.actual_views = updates.actualViews;
  if (updates.actualLikes !== undefined) payload.actual_likes = updates.actualLikes;
  if (updates.actualComments !== undefined) payload.actual_comments = updates.actualComments;
  if (updates.actualShares !== undefined) payload.actual_shares = updates.actualShares;
  if (updates.trackingStatus !== undefined) payload.tracking_status = updates.trackingStatus;
  if (updates.creator !== undefined) payload.creator = updates.creator;

  await apiClient.put(`/api/v1/shortlist/${encodeURIComponent(username)}`, payload, {
    params: { campaign_id: campaignId },
  });
}

export async function deleteShortlistItem(
  username: string,
  campaignId: string = 'default'
): Promise<void> {
  await apiClient.delete(`/api/v1/shortlist/${encodeURIComponent(username)}`, {
    params: { campaign_id: campaignId },
  });
}

export async function syncShortlistBatch(items: ShortlistItem[]): Promise<void> {
  const payload = {
    items: items.map((item) => ({
      username: item.username,
      campaign_id: item.campaignId || 'default',
      status: item.status,
      notes: item.notes || '',
      added_at: item.addedAt,
      draft_due_date: item.draftDueDate,
      live_date: item.liveDate,
      agreed_rate_thb: item.agreedRateTHB,
      deliverable_format: item.deliverableFormat,
      document_links: item.documentLinks || [],
      live_post_url: item.livePostUrl,
      actual_cost_thb: item.actualCostTHB,
      actual_views: item.actualViews,
      actual_likes: item.actualLikes,
      actual_comments: item.actualComments,
      actual_shares: item.actualShares,
      tracking_status: item.trackingStatus || 'pending_post',
      creator: item.creator,
    })),
  };
  await apiClient.post('/api/v1/shortlist/sync', payload);
}



