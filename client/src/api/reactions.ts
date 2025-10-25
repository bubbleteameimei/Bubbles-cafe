import { getApiBaseUrl } from '@/lib/asset-path';

export interface ReactionTotals {
  postId: number;
  baselineLikes: number;
  baselineDislikes: number;
  likesCount: number;
  dislikesCount: number;
  totals: {
    likes: number;
    dislikes: number;
  };
}

export async function fetchReactions(postId: number): Promise<ReactionTotals> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/posts/${postId}/reactions` : `/api/posts/${postId}/reactions`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch reactions');
  }
  return response.json();
}

export async function submitReaction(postId: number, isLike: boolean): Promise<ReactionTotals> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/posts/${postId}/reaction` : `/api/posts/${postId}/reaction`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ isLike }),
  });
  if (!response.ok) {
    throw new Error('Failed to update reaction');
  }
  return response.json();
}