import axios from 'axios';
import type {
  Work,
  Episode,
  EpisodeWithWork,
  Illustration,
  Comment,
  Image,
  AuthorProfile,
  ApiResponse,
} from '@unbelong/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Works API
export const worksApi = {
  list: (type?: 'comic' | 'illustration', status?: string) =>
    api.get<ApiResponse<Work[]>>('/works', { params: { type, status } }),
  get: (id: string) => api.get<ApiResponse<Work>>(`/works/${id}`),
  create: (data: Partial<Work>) => api.post<ApiResponse<Work>>('/works', data),
  update: (id: string, data: Partial<Work>) =>
    api.put<ApiResponse<Work>>(`/works/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/works/${id}`),
};

// Episodes API
export const episodesApi = {
  list: (workId?: string, status?: string) =>
    api.get<ApiResponse<EpisodeWithWork[]>>('/episodes', { params: { work_id: workId, status } }),
  get: (id: string) => api.get<ApiResponse<EpisodeWithWork>>(`/episodes/${id}`),
  create: (data: Partial<Episode>) => api.post<ApiResponse<Episode>>('/episodes', data),
  update: (id: string, data: Partial<Episode>) =>
    api.put<ApiResponse<Episode>>(`/episodes/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/episodes/${id}`),
};

// Illustrations API
export const illustrationsApi = {
  list: (status?: string) =>
    api.get<ApiResponse<Illustration[]>>('/illustrations', { params: { status } }),
  get: (id: string) => api.get<ApiResponse<Illustration>>(`/illustrations/${id}`),
  create: (data: Partial<Illustration>) =>
    api.post<ApiResponse<Illustration>>('/illustrations', data),
  update: (id: string, data: Partial<Illustration>) =>
    api.put<ApiResponse<Illustration>>(`/illustrations/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/illustrations/${id}`),
};

// Comments API
export const commentsApi = {
  list: (targetType?: string, targetId?: string, status?: string) =>
    api.get<ApiResponse<Comment[]>>('/comments', {
      params: { target_type: targetType, target_id: targetId, status },
    }),
  get: (id: string) => api.get<ApiResponse<Comment>>(`/comments/${id}`),
  create: (data: Partial<Comment>) => api.post<ApiResponse<Comment>>('/comments', data),
  update: (id: string, data: Partial<Comment>) =>
    api.put<ApiResponse<Comment>>(`/comments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/comments/${id}`),
};

// Images API
export const imagesApi = {
  list: () => api.get<ApiResponse<Image[]>>('/images'),
  get: (id: string) => api.get<ApiResponse<Image>>(`/images/${id}`),
  create: (data: Partial<Image>) => api.post<ApiResponse<Image>>('/images', data),
  update: (id: string, data: Partial<Image>) =>
    api.put<ApiResponse<Image>>(`/images/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/images/${id}`),
};

// Author API
export const authorApi = {
  get: () => api.get<ApiResponse<AuthorProfile>>('/author'),
  update: (data: Partial<AuthorProfile>) => api.put<ApiResponse<AuthorProfile>>('/author', data),
};

export default api;
