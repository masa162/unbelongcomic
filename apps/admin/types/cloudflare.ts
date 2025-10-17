/**
 * Cloudflare Images API型定義
 */

export interface CloudflareImagesUploadResponse {
  success: boolean;
  result?: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
    meta?: Record<string, unknown>;
  };
  errors?: Array<{
    code: number;
    message: string;
  }>;
  messages?: string[];
}

export interface UploadImageApiResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    uploaded: string;
    variants: string[];
  };
  error?: string;
  details?: unknown;
}
