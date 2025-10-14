'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { episodesApi, worksApi } from '@/lib/api';
import type { Episode, EpisodeWithWork, Work } from '@unbelong/shared';
import { formatDate } from '@unbelong/shared';

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<EpisodeWithWork[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<string>('all');

  useEffect(() => {
    loadWorks();
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [selectedWork]);

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

  const loadEpisodes = async () => {
    try {
      const workId = selectedWork === 'all' ? undefined : selectedWork;
      const response = await episodesApi.list(workId, undefined);
      if (response.data.success && response.data.data) {
        setEpisodes(response.data.data);
      }
    } catch (error) {
      console.error('エピソードの取得に失敗しました:', error);
      alert('エピソードの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このエピソードを削除しますか？')) return;

    try {
      await episodesApi.delete(id);
      alert('エピソードを削除しました');
      loadEpisodes();
    } catch (error) {
      console.error('エピソードの削除に失敗しました:', error);
      alert('エピソードの削除に失敗しました');
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
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || badges.draft}`}
      >
        {labels[status as keyof typeof labels] || status}
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
          <h1 className="text-3xl font-bold text-gray-900">エピソード管理</h1>
          <p className="text-gray-600 mt-2">マンガのエピソード（話数）管理</p>
        </div>
        <Link
          href="/dashboard/episodes/new"
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          新規作成
        </Link>
      </div>

      {/* 作品フィルター */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">作品で絞り込み</label>
        <select
          value={selectedWork}
          onChange={(e) => setSelectedWork(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">全ての作品</option>
          {works.map((work) => (
            <option key={work.id} value={work.id}>
              {work.title}
            </option>
          ))}
        </select>
      </div>

      {/* エピソード一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作品
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                話数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                閲覧数
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
            {episodes.map((episode) => (
              <tr key={episode.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{episode.work_title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">第{episode.episode_number}話</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{episode.title}</div>
                  <div className="text-sm text-gray-500">{episode.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(episode.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {episode.view_count.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(episode.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    href={`/dashboard/episodes/${episode.id}/edit`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(episode.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {episodes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">エピソードがまだありません</p>
            <p className="text-sm text-gray-400 mt-2">
              右上の「新規作成」ボタンからエピソードを追加してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
