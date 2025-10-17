'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { illustrationsApi, worksApi } from '@/lib/api';
import type { Illustration, Work } from '@unbelong/shared';
import { generateSlug } from '@unbelong/shared';

interface IllustrationFormProps {
  illustration?: Illustration;
  isEdit?: boolean;
}

export default function IllustrationForm({
  illustration,
  isEdit = false,
}: IllustrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [formData, setFormData] = useState({
    work_id: illustration?.work_id || '',
    title: illustration?.title || '',
    slug: illustration?.slug || '',
    description: illustration?.description || '',
    image_id: illustration?.image_id || '',
    og_image_id: illustration?.og_image_id || '',
    status: illustration?.status || 'draft',
    tags: illustration?.tags ? JSON.stringify(illustration.tags, null, 2) : '[]',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const response = await worksApi.list('illustration', undefined);
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
      // タグのJSON検証
      let tagsArray;
      try {
        tagsArray = JSON.parse(formData.tags);
        if (!Array.isArray(tagsArray)) {
          throw new Error('タグは配列形式で入力してください');
        }
      } catch (err) {
        alert('タグのJSON形式が正しくありません: ' + (err as Error).message);
        setLoading(false);
        return;
      }

      const submitData = {
        work_id: formData.work_id,
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        image_id: formData.image_id,
        og_image_id: formData.og_image_id || null,
        status: formData.status,
        tags: JSON.stringify(tagsArray),
      };

      if (isEdit && illustration) {
        await illustrationsApi.update(illustration.id, submitData);
        alert('イラストを更新しました');
      } else {
        await illustrationsApi.create(submitData);
        alert('イラストを作成しました');
      }
      router.push('/dashboard/illustrations');
    } catch (error) {
      console.error('イラストの保存に失敗しました:', error);
      alert('イラストの保存に失敗しました');
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">作品を選択してください</option>
          {works.map((work) => (
            <option key={work.id} value={work.id}>
              {work.title}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          このイラストが属する作品を選択してください。作品が存在しない場合は、先に作品管理から作成してください。
        </p>
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
          placeholder="イラストのタイトル"
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
          placeholder="illustration-title"
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
          placeholder="イラストの説明や制作背景など"
        />
      </div>

      {/* メイン画像ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="image_id"
          value={formData.image_id}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Cloudflare Images ID"
        />
        <p className="text-sm text-gray-500 mt-1">
          画像管理ページからアップロードした画像のIDを入力してください。
        </p>
      </div>

      {/* OG画像ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">OG画像ID</label>
        <input
          type="text"
          name="og_image_id"
          value={formData.og_image_id}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Cloudflare Images ID"
        />
        <p className="text-sm text-gray-500 mt-1">
          SNSシェア用の画像。指定しない場合はメイン画像が使用されます。
        </p>
      </div>

      {/* タグ（JSON配列） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ（JSON配列形式）
        </label>
        <textarea
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          placeholder={`[
  "デジタルイラスト",
  "オリジナル",
  "風景"
]`}
        />
        <p className="text-sm text-gray-500 mt-1">
          JSON配列形式でタグを記述してください。カテゴリ分けや検索に使用されます。
        </p>
      </div>

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
