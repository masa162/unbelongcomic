'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { worksApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import { formatDate } from '@unbelong/shared';

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'comic' | 'illustration'>('all');

  useEffect(() => {
    loadWorks();
  }, [filter]);

  const loadWorks = async () => {
    try {
      const type = filter === 'all' ? undefined : filter;
      const response = await worksApi.list(type, undefined);
      if (response.data.success && response.data.data) {
        setWorks(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
      alert('作品の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この作品を削除しますか？関連するエピソードも全て削除されます。')) return;

    try {
      await worksApi.delete(id);
      alert('作品を削除しました');
      loadWorks();
    } catch (error) {
      console.error('作品の削除に失敗しました:', error);
      alert('作品の削除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      published: '公開中',
      draft: '下書き',
      archived: 'アーカイブ',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || badges.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'comic' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        マンガ
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
        イラスト
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
          <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600 mt-2">マンガ・イラスト作品の管理</p>
        </div>
        <Link
          href="/dashboard/works/new"
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          新規作成
        </Link>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => setFilter('comic')}
            className={`px-4 py-2 rounded-md ${
              filter === 'comic'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            マンガ
          </button>
          <button
            onClick={() => setFilter('illustration')}
            className={`px-4 py-2 rounded-md ${
              filter === 'illustration'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            イラスト
          </button>
        </div>
      </div>

      {/* 作品一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                更新日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {works.map((work) => (
              <tr key={work.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{work.title}</div>
                  <div className="text-sm text-gray-500">{work.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(work.type)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(work.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(work.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    href={`/dashboard/works/${work.id}/edit`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(work.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {works.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">作品がまだありません</p>
            <p className="text-sm text-gray-400 mt-2">
              右上の「新規作成」ボタンから作品を追加してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
