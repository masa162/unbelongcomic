import axios from 'axios';
import type { Work, Episode, Comment, AuthorProfile, ApiResponse, PaginatedResponse } from '@unbelong/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 作品API
export const worksApi = {
  // 公開中の作品一覧を取得
  list: () => api.get<ApiResponse<Work[]>>('/works', { params: { type: 'comic', status: 'published' } }),

  // スラッグで作品を取得
  getBySlug: (slug: string) => api.get<ApiResponse<Work>>(`/works/slug/${slug}`),

  // IDで作品を取得
  get: (id: string) => api.get<ApiResponse<Work>>(`/works/${id}`),
};

// エピソードAPI
export const episodesApi = {
  // 作品のエピソード一覧
  listByWork: (workId: string) =>
    api.get<ApiResponse<Episode[]>>('/episodes', { params: { work_id: workId, status: 'published' } }),

  // エピソードをIDで取得
  get: (id: string) => api.get<ApiResponse<Episode>>(`/episodes/${id}`),

  // エピソードをスラッグで取得
  getBySlug: (workSlug: string, episodeSlug: string) =>
    api.get<ApiResponse<Episode>>(`/works/slug/${workSlug}/episodes/${episodeSlug}`),
};

// コメントAPI
export const commentsApi = {
  // エピソードのコメント一覧（承認済みのみ）
  listByEpisode: (episodeId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Comment>>('/comments', {
      params: { episode_id: episodeId, status: 'approved', page, limit },
    }),

  // コメント投稿
  create: (data: {
    episode_id: string;
    author_name: string;
    author_email?: string;
    content: string;
    parent_comment_id?: string;
  }) => api.post<ApiResponse<Comment>>('/comments', data),
};

// 作者API
export const authorApi = {
  get: () => api.get<ApiResponse<AuthorProfile>>('/author'),
};

export default api;
