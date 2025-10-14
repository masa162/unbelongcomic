'use client';

import { useEffect, useState } from 'react';
import { authorApi } from '@/lib/api';
import type { AuthorProfile } from '@unbelong/shared';

export default function AuthorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar_image_id: '',
    social_links: '{}',
  });

  useEffect(() => {
    loadAuthor();
  }, []);

  const loadAuthor = async () => {
    try {
      const response = await authorApi.get();
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setAuthor(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          avatar_image_id: data.avatar_image_id || '',
          social_links: data.social_links ? JSON.stringify(data.social_links, null, 2) : '{}',
        });
      }
    } catch (error) {
      console.error('プロフィールの取得に失敗しました:', error);
      alert('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // JSONの検証
      let socialLinksObj;
      try {
        socialLinksObj = JSON.parse(formData.social_links);
      } catch (err) {
        alert('SNSリンクのJSON形式が正しくありません');
        setSaving(false);
        return;
      }

      await authorApi.update({
        name: formData.name,
        bio: formData.bio,
        avatar_image_id: formData.avatar_image_id || null,
        social_links: socialLinksObj,
      });

      alert('プロフィールを更新しました');
      loadAuthor();
    } catch (error) {
      console.error('プロフィールの保存に失敗しました:', error);
      alert('プロフィールの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">作者プロフィール</h1>
        <p className="text-gray-600 mt-2">サイトに表示される作者情報を編集します</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Belong"
            />
          </div>

          {/* プロフィール文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロフィール <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="薬剤師 / コミック作家 / イラストレーター&#10;&#10;1986年　神奈川県出身"
            />
            <p className="text-sm text-gray-500 mt-1">
              改行はそのまま反映されます。
            </p>
          </div>

          {/* アバター画像ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アバター画像ID
            </label>
            <input
              type="text"
              name="avatar_image_id"
              value={formData.avatar_image_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Cloudflare Images ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              画像管理ページからアップロードした画像のIDを入力してください。
            </p>
          </div>

          {/* SNSリンク（JSON） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SNSリンク（JSON形式）
            </label>
            <textarea
              name="social_links"
              value={formData.social_links}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder={`{
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "website": "https://masa86.com/"
}`}
            />
            <p className="text-sm text-gray-500 mt-1">
              JSON形式でSNSリンクを記述してください。キー名は自由に設定できます。
            </p>
          </div>

          {/* プレビュー */}
          {author && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の設定</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">名前:</span> {author.name}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">最終更新:</span>{' '}
                  {new Date(author.updated_at * 1000).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
