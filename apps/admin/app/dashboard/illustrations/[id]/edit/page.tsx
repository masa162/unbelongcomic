export const runtime = 'edge';

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { illustrationsApi } from '@/lib/api';
import type { Illustration } from '@unbelong/shared';
import IllustrationForm from '@/components/IllustrationForm';

export default function EditIllustrationPage() {
  const params = useParams();
  const [illustration, setIllustration] = useState<Illustration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIllustration();
  }, []);

  const loadIllustration = async () => {
    try {
      const response = await illustrationsApi.get(params.id as string);
      if (response.data.success && response.data.data) {
        setIllustration(response.data.data);
      }
    } catch (error) {
      console.error('イラストの取得に失敗しました:', error);
      alert('イラストの取得に失敗しました');
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

  if (!illustration) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">イラストが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">イラスト編集</h1>
        <p className="text-gray-600 mt-2">{illustration.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <IllustrationForm illustration={illustration} isEdit />
      </div>
    </div>
  );
}
