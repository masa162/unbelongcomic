// unbelong 共通ユーティリティ関数

import type { CloudflareImageVariant } from './types';

/**
 * Cloudflare ImagesのURLを生成
 * @param imageId Cloudflare Images ID
 * @param variant バリアント名またはカスタムバリアント設定
 * @param accountHash Cloudflareアカウントハッシュ（カスタムドメイン未設定時に使用）
 */
export function getImageUrl(
  imageId: string,
  variant: string | CloudflareImageVariant = 'public',
  accountHash: string = 'wdR9enbrkaPsEgUtgFORrw'
): string {
  // カスタムドメインが設定されている場合は環境変数から取得
  const customDomain = getEnv('NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN');

  if (customDomain) {
    // カスタムドメイン使用
    if (typeof variant === 'string') {
      return `https://${customDomain}/${imageId}/${variant}`;
    }
    const params = new URLSearchParams();
    if (variant.width) params.set('width', variant.width.toString());
    if (variant.height) params.set('height', variant.height.toString());
    if (variant.fit) params.set('fit', variant.fit);
    if (variant.quality) params.set('quality', variant.quality.toString());
    if (variant.format) params.set('format', variant.format);
    const queryString = params.toString();
    return `https://${customDomain}/${imageId}/public${queryString ? '?' + queryString : ''}`;
  }

  // デフォルト: Cloudflare Imagesのデフォルトドメインを使用
  // https://imagedelivery.net/<ACCOUNT_HASH>/<IMAGE_ID>/<VARIANT>
  if (typeof variant === 'string') {
    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
  }

  // カスタムバリアントの場合はクエリパラメータで指定
  const params = new URLSearchParams();
  if (variant.width) params.set('width', variant.width.toString());
  if (variant.height) params.set('height', variant.height.toString());
  if (variant.fit) params.set('fit', variant.fit);
  if (variant.quality) params.set('quality', variant.quality.toString());
  if (variant.format) params.set('format', variant.format);

  const queryString = params.toString();
  return `https://imagedelivery.net/${accountHash}/${imageId}/public${queryString ? '?' + queryString : ''}`;
}

/**
 * スラッグを生成（日本語対応）
 * @param text 元のテキスト
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // スペースとアンダースコアをハイフンに
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '') // 英数字、ひらがな、カタカナ、漢字、ハイフン以外を削除
    .replace(/--+/g, '-') // 連続するハイフンを1つに
    .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}

/**
 * UUIDを生成（簡易版）
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Unix タイムスタンプを取得
 */
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Unix タイムスタンプを日付文字列に変換
 * @param timestamp Unix タイムスタンプ（秒）
 * @param locale ロケール（デフォルト: ja-JP）
 */
export function formatDate(
  timestamp: number,
  locale: string = 'ja-JP'
): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Unix タイムスタンプを日時文字列に変換
 * @param timestamp Unix タイムスタンプ（秒）
 * @param locale ロケール（デフォルト: ja-JP）
 */
export function formatDateTime(
  timestamp: number,
  locale: string = 'ja-JP'
): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 相対時間を取得（例: 3日前、2時間前）
 * @param timestamp Unix タイムスタンプ（秒）
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}ヶ月前`;
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
}

/**
 * JSONを安全にパース
 * @param json JSON文字列
 * @param defaultValue パースに失敗した場合のデフォルト値
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 配列をJSON文字列に変換
 * @param arr 配列
 */
export function arrayToJson(arr: any[]): string {
  return JSON.stringify(arr);
}

/**
 * テキストを切り詰める
 * @param text テキスト
 * @param maxLength 最大文字数
 * @param suffix 省略記号（デフォルト: ...）
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Markdownから画像URLを抽出
 * @param markdown Markdownテキスト
 */
export function extractImageUrls(markdown: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * 環境変数を安全に取得
 * @param key 環境変数名
 * @param defaultValue デフォルト値
 */
export function getEnv(key: string, defaultValue?: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}
