import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://unbelong-api.belong2jazz.workers.dev';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Work {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: 'comic' | 'illustration';
  status: 'draft' | 'published' | 'archived';
  thumbnail_image_id: string | null;
  og_image_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface Episode {
  id: string;
  work_id: string;
  title: string;
  episode_number: number;
  slug: string;
  content: string; // Markdown
  thumbnail_image_id: string | null;
  og_image_id: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: number | null;
  created_at: number;
  updated_at: number;
}

// Works API
export const worksApi = {
  list: (type?: 'comic' | 'illustration') => 
    client.get<ApiResponse<Work[]>>('/api/works', { params: { type } }),
  get: (idOrSlug: string) => 
    client.get<ApiResponse<Work>>(`/api/works/${idOrSlug}`),
};

// Episodes API
export const episodesApi = {
  list: (workId: string) => 
    client.get<ApiResponse<Episode[]>>(`/api/episodes`, { params: { workId } }),
  get: (idOrSlug: string) => 
    client.get<ApiResponse<Episode>>(`/api/episodes/${idOrSlug}`),
};

export default client;
