// unbelong 共通型定義

// 作品タイプ
export type WorkType = 'comic' | 'illustration';

// ステータス
export type Status = 'draft' | 'published' | 'archived';

// コメントステータス
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

// ターゲットタイプ
export type TargetType = 'episode' | 'illustration';

// 作品
export interface Work {
  id: string;
  type: WorkType;
  title: string;
  slug: string;
  description: string | null;
  author: string;
  status: Status;
  thumbnail_image_id: string | null;
  og_image_id: string | null;
  tags: string | null; // JSON string
  created_at: number;
  updated_at: number;
  published_at: number | null;
}

// エピソード（マンガの話数）
export interface Episode {
  id: string;
  work_id: string;
  episode_number: number;
  title: string;
  slug: string;
  description: string | null;
  content: string; // Markdown
  status: Status;
  thumbnail_image_id: string | null;
  og_image_id: string | null;
  view_count: number;
  created_at: number;
  updated_at: number;
  published_at: number | null;
}

// エピソード（作品情報付き）
export interface EpisodeWithWork extends Episode {
  work_title: string;
  work_slug: string;
}

// イラスト
export interface Illustration {
  id: string;
  work_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null; // Markdown
  image_id: string;
  status: Status;
  og_image_id: string | null;
  view_count: number;
  tags: string | null; // JSON string
  created_at: number;
  updated_at: number;
  published_at: number | null;
}

// イラスト（作品情報付き）
export interface IllustrationWithWork extends Illustration {
  work_title: string;
  work_slug: string;
}

// 画像メタデータ
export interface Image {
  id: string; // Cloudflare Images ID
  filename: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  size: number | null;
  uploaded_by: string | null;
  created_at: number;
  updated_at: number;
}

// コメント
export interface Comment {
  id: string;
  target_type: TargetType;
  target_id: string;
  content: string;
  status: CommentStatus;
  ip_address: string | null;
  user_agent: string | null;
  created_at: number;
  updated_at: number;
}

// 作者プロフィール
export interface AuthorProfile {
  id: number;
  name: string;
  bio: string | null;
  avatar_image_id: string | null;
  social_links: string | null; // JSON string
  created_at: number;
  updated_at: number;
}

// ソーシャルリンク
export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  pixiv?: string;
  blog?: string;
  [key: string]: string | undefined;
}

// サイト設定
export interface SiteSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: number;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: Pagination;
}

// Cloudflare Images URL生成用
export interface CloudflareImageVariant {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'json';
}

// フォーム入力型
export interface WorkInput {
  type: WorkType;
  title: string;
  slug: string;
  description?: string;
  status?: Status;
  thumbnail_image_id?: string;
  og_image_id?: string;
  tags?: string[];
}

export interface EpisodeInput {
  work_id: string;
  episode_number: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  status?: Status;
  thumbnail_image_id?: string;
  og_image_id?: string;
}

export interface IllustrationInput {
  work_id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  image_id: string;
  status?: Status;
  og_image_id?: string;
  tags?: string[];
}

export interface CommentInput {
  target_type: TargetType;
  target_id: string;
  content: string;
}

export interface ImageUpload {
  file: File | Blob;
  alt_text?: string;
}
