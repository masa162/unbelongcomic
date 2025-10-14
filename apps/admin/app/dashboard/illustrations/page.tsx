'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { illustrationsApi } from '@/lib/api';
import type { Illustration } from '@unbelong/shared';
import { getImageUrl } from '@unbelong/shared';

export default function IllustrationsPage() {
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadIllustrations();
  }, [statusFilter]);

  const loadIllustrations = async () => {
    try {
      const response = await illustrationsApi.list(statusFilter || undefined);
      if (response.data.success && response.data.data) {
        setIllustrations(response.data.data);
      }
    } catch (error) {
      console.error('イラストの取得に失敗しました:', error);
      alert('イラストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await illustrationsApi.delete(id);
      alert('イラストを削除しました');
      loadIllustrations();
    } catch (error) {
      console.error('イラストの削除に失敗しました:', error);
      alert('イラストの削除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800',
    };
    const labels = {
      published: '公開',
      draft: '下書き',
      archived: 'アーカイブ',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">イラスト管理</h1>
          <p className="text-gray-600 mt-2">イラスト作品の一覧と管理</p>
        </div>
        <Link
          href="/dashboard/illustrations/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          新規作成
        </Link>
      </div>

      {/* フィルター */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-md ${
            statusFilter === ''
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`px-4 py-2 rounded-md ${
            statusFilter === 'published'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          公開
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-4 py-2 rounded-md ${
            statusFilter === 'draft'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          下書き
        </button>
        <button
          onClick={() => setStatusFilter('archived')}
          className={`px-4 py-2 rounded-md ${
            statusFilter === 'archived'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          アーカイブ
        </button>
      </div>

      {/* イラストグリッド */}
      {illustrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">イラストがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {illustrations.map((illustration) => (
            <div
              key={illustration.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* サムネイル */}
              <div className="aspect-square bg-gray-200 relative">
                {illustration.image_id ? (
                  <img
                    src={getImageUrl(illustration.image_id, 'thumbnail')}
                    alt={illustration.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* 情報 */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">
                    {illustration.title}
                  </h3>
                  {getStatusBadge(illustration.status)}
                </div>

                {illustration.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {illustration.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  <p>閲覧数: {illustration.view_count}</p>
                  <p>
                    作成日:{' '}
                    {new Date(illustration.created_at * 1000).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                {/* アクション */}
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/illustrations/${illustration.id}/edit`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 text-center"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(illustration.id, illustration.title)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
