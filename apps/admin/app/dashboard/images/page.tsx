'use client';

import { useEffect, useState } from 'react';
import { imagesApi } from '@/lib/api';
import type { Image } from '@unbelong/shared';
import { getImageUrl } from '@unbelong/shared';

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await imagesApi.list();
      if (response.data.success && response.data.data) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('画像の取得に失敗しました:', error);
      alert('画像の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Cloudflare Imagesにアップロード
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '画像のアップロードに失敗しました');
      }

      const imageId = uploadResult.data.id;

      // 2. DBに画像メタデータを保存
      await imagesApi.create({
        id: imageId,
        filename: uploadResult.data.filename || selectedFile.name,
        alt_text: '',
        format: selectedFile.type,
        size: selectedFile.size,
      });

      alert('画像をアップロードしました');
      setSelectedFile(null);

      // ファイル入力をリセット
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      loadImages();
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      alert(`画像のアップロードに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この画像を削除しますか？')) return;

    try {
      await imagesApi.delete(id);
      alert('画像を削除しました');
      loadImages();
    } catch (error) {
      console.error('画像の削除に失敗しました:', error);
      alert('画像の削除に失敗しました');
    }
  };

  const copyImageUrl = (imageId: string) => {
    const url = getImageUrl(imageId, 'public');
    navigator.clipboard.writeText(url);
    alert('画像URLをコピーしました');
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
          <h1 className="text-3xl font-bold text-gray-900">画像管理</h1>
          <p className="text-gray-600 mt-2">Cloudflare Imagesで管理されている画像</p>
        </div>
      </div>

      {/* アップロードセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">画像アップロード</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          WebP形式を推奨。最大サイズ: 10MB
        </p>
      </div>

      {/* 画像一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          画像一覧 ({images.length}件)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                <img
                  src={getImageUrl(image.id, 'thumbnail')}
                  alt={image.alt_text || image.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate mb-2">
                {image.filename}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {image.size ? `${(image.size / 1024).toFixed(2)} KB` : '-'}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyImageUrl(image.id)}
                  className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  URL
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="flex-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">画像がまだありません</p>
            <p className="text-sm text-gray-400 mt-2">
              上のフォームから画像をアップロードしてください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
