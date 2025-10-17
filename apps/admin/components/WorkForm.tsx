'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { worksApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import { generateSlug } from '@unbelong/shared';
import ImageSelectorField from './ImageSelectorField';

interface WorkFormProps {
  work?: Work;
  isEdit?: boolean;
}

export default function WorkForm({ work, isEdit = false }: WorkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: work?.type || 'comic',
    title: work?.title || '',
    slug: work?.slug || '',
    description: work?.description || '',
    status: work?.status || 'draft',
    thumbnail_image_id: work?.thumbnail_image_id || '',
    og_image_id: work?.og_image_id || '',
    tags: work?.tags ? JSON.parse(work.tags) : [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      if (isEdit && work) {
        await worksApi.update(work.id, submitData);
        alert('作品を更新しました');
      } else {
        await worksApi.create(submitData);
        alert('作品を作成しました');
      }
      router.push('/dashboard/works');
    } catch (error: any) {
      console.error('作品の保存に失敗しました:', error);
      const errorMessage = error?.response?.data?.error || error?.message || '作品の保存に失敗しました';
      const detailMessage = error?.response?.data?.message ? `\n詳細: ${error.response.data.message}` : '';
      alert(`作品の保存に失敗しました\n${errorMessage}${detailMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タイプ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タイプ <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="comic">マンガ</option>
          <option value="illustration">イラスト</option>
        </select>
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
          placeholder="作品のタイトル"
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
          placeholder="peach-float"
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
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="作品の説明文"
        />
      </div>

      {/* サムネイル画像ID */}
      <ImageSelectorField
        label="サムネイル画像"
        value={formData.thumbnail_image_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, thumbnail_image_id: value }))
        }
        helperText="作品一覧などに表示されるサムネイル画像"
      />

      {/* OG画像ID */}
      <ImageSelectorField
        label="OG画像"
        value={formData.og_image_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, og_image_id: value }))
        }
        helperText="SNSシェア用の画像。未設定の場合はサムネイルが使用されます"
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
