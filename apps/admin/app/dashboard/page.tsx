'use client';

import { useEffect, useState } from 'react';
import { worksApi, episodesApi, commentsApi, imagesApi } from '@/lib/api';

interface Stats {
  works: number;
  episodes: number;
  comments: number;
  images: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    works: 0,
    episodes: 0,
    comments: 0,
    images: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [worksRes, episodesRes, commentsRes, imagesRes] = await Promise.all([
        worksApi.list(),
        episodesApi.list(),
        commentsApi.list(),
        imagesApi.list(),
      ]);

      setStats({
        works: worksRes.data.data?.length || 0,
        episodes: episodesRes.data.data?.length || 0,
        comments: commentsRes.data.data?.length || 0,
        images: imagesRes.data.data?.length || 0,
      });
    } catch (error) {
      console.error('統計情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '作品数',
      value: stats.works,
      icon: '📚',
      color: 'bg-blue-500',
    },
    {
      title: 'エピソード数',
      value: stats.episodes,
      icon: '📖',
      color: 'bg-green-500',
    },
    {
      title: 'コメント数',
      value: stats.comments,
      icon: '💬',
      color: 'bg-yellow-500',
    },
    {
      title: '画像数',
      value: stats.images,
      icon: '🖼️',
      color: 'bg-purple-500',
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">unbelong 管理画面へようこそ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{ borderLeftColor: card.color.replace('bg-', '') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクセス</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/works"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <p className="font-medium text-gray-900">作品管理</p>
                  <p className="text-sm text-gray-600">作品の追加・編集・削除</p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/images"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🖼️</span>
                <div>
                  <p className="font-medium text-gray-900">画像管理</p>
                  <p className="text-sm text-gray-600">画像のアップロード・管理</p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/comments"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">💬</span>
                <div>
                  <p className="font-medium text-gray-900">コメント管理</p>
                  <p className="text-sm text-gray-600">コメントの承認・編集・削除</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">システム情報</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">プロジェクト</span>
              <span className="font-medium text-gray-900">unbelong</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">バージョン</span>
              <span className="font-medium text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">データベース</span>
              <span className="font-medium text-gray-900">Cloudflare D1</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">画像CDN</span>
              <span className="font-medium text-gray-900">Cloudflare Images</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ホスティング</span>
              <span className="font-medium text-gray-900">Cloudflare Pages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
