'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { episodesApi, worksApi } from '@/lib/api';
import type { Episode, Work } from '@unbelong/shared';
import { generateSlug } from '@unbelong/shared';
import ImageSelectorField from './ImageSelectorField';

interface EpisodeFormProps {
  episode?: Episode;
  isEdit?: boolean;
}

export default function EpisodeForm({ episode, isEdit = false }: EpisodeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [formData, setFormData] = useState({
    work_id: episode?.work_id || '',
    episode_number: episode?.episode_number || 1,
    title: episode?.title || '',
    slug: episode?.slug || '',
    description: episode?.description || '',
    content: episode?.content || '',
    status: episode?.status || 'draft',
    thumbnail_image_id: episode?.thumbnail_image_id || '',
    og_image_id: episode?.og_image_id || '',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await worksApi.list('comic', undefined);
      if (response.data.success && response.data.data) {
        setWorks(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'episode_number' ? parseInt(value) : value,
    }));

    // タイトル変更時に自動的にスラッグを生成
    if (name === 'title' && !isEdit) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 空の画像IDをnullに変換
      const submitData = {
        ...formData,
        thumbnail_image_id: formData.thumbnail_image_id || null,
        og_image_id: formData.og_image_id || null,
      };

      if (isEdit && episode) {
        await episodesApi.update(episode.id, submitData);
        alert('エピソードを更新しました');
      } else {
        await episodesApi.create(submitData);
        alert('エピソードを作成しました');
      }
      router.push('/dashboard/episodes');
    } catch (error: any) {
      console.error('エピソードの保存に失敗しました:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'エピソードの保存に失敗しました';
      const detailMessage = error?.response?.data?.message ? `\n詳細: ${error.response.data.message}` : '';
      alert(`エピソードの保存に失敗しました\n${errorMessage}${detailMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 作品選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作品 <span className="text-red-500">*</span>
        </label>
        <select
          name="work_id"
          value={formData.work_id}
          onChange={handleChange}
          required
          disabled={isEdit}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
        >
          <option value="">作品を選択してください</option>
          {works.map((work) => (
            <option key={work.id} value={work.id}>
              {work.title}
            </option>
          ))}
        </select>
      </div>

      {/* 話数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          話数 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="episode_number"
          value={formData.episode_number}
          onChange={handleChange}
          required
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="1"
        />
      </div>

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="第1話のタイトル"
        />
      </div>

      {/* スラッグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          スラッグ（URL用） <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="episode-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          英数字とハイフンのみ。URLの一部として使用されます。
        </p>
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="エピソードの簡単な説明"
        />
      </div>

      {/* コンテンツ（Markdown） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          コンテンツ（Markdown） <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={20}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          placeholder="Markdown形式でコンテンツを記述&#10;&#10;## 見出し&#10;&#10;![画像](https://img.unbelong.xyz/画像ID/public)&#10;&#10;**太字** *斜体*"
        />
        <p className="text-sm text-gray-500 mt-1">
          Markdown記法で記述してください。画像は Cloudflare Images の URL を使用します。
        </p>
      </div>

      {/* サムネイル画像ID */}
      <ImageSelectorField
        label="サムネイル画像"
        value={formData.thumbnail_image_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, thumbnail_image_id: value }))
        }
        helperText="エピソード一覧などに表示されるサムネイル画像"
      />

      {/* OG画像ID */}
      <ImageSelectorField
        label="OG画像"
        value={formData.og_image_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, og_image_id: value }))
        }
        helperText="SNSシェア用の画像。未設定の場合はサムネイルまたは作品画像が使用されます"
      />

      {/* ステータス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="draft">下書き</option>
          <option value="published">公開</option>
          <option value="archived">アーカイブ</option>
        </select>
      </div>

      {/* ボタン */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : isEdit ? '更新' : '作成'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
