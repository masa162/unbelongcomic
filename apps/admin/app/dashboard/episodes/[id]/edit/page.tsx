'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { episodesApi } from '@/lib/api';
import type { Episode } from '@unbelong/shared';
import EpisodeForm from '@/components/EpisodeForm';

export const runtime = 'edge';

export default function EditEpisodePage() {
  const params = useParams();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisode();
  }, []);

  const loadEpisode = async () => {
    try {
      const response = await episodesApi.get(params.id as string);
      if (response.data.success && response.data.data) {
        setEpisode(response.data.data);
      }
    } catch (error) {
      console.error('エピソードの取得に失敗しました:', error);
      alert('エピソードの取得に失敗しました');
    } finally {
      setLoading(false);
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

  if (!episode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">エピソードが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">エピソード編集</h1>
        <p className="text-gray-600 mt-2">
          第{episode.episode_number}話: {episode.title}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <EpisodeForm episode={episode} isEdit />
      </div>
    </div>
  );
}
