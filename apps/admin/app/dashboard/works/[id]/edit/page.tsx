export const runtime = 'edge';

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { worksApi } from '@/lib/api';
import type { Work } from '@unbelong/shared';
import WorkForm from '@/components/WorkForm';

export default function EditWorkPage() {
  const params = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWork();
  }, []);

  const loadWork = async () => {
    try {
      const response = await worksApi.get(params.id as string);
      if (response.data.success && response.data.data) {
        setWork(response.data.data);
      }
    } catch (error) {
      console.error('作品の取得に失敗しました:', error);
      alert('作品の取得に失敗しました');
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

  if (!work) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">作品が見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">作品編集</h1>
        <p className="text-gray-600 mt-2">{work.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <WorkForm work={work} isEdit />
      </div>
    </div>
  );
}
