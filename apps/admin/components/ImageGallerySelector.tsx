'use client';

import { useState, useEffect } from 'react';
import { imagesApi } from '@/lib/api';
import type { Image } from '@unbelong/shared';
import { getImageUrl } from '@unbelong/shared';

interface ImageGallerySelectorProps {
  onSelect: (imageId: string) => void;
  onClose: () => void;
  selectedImageId?: string;
}

export default function ImageGallerySelector({
  onSelect,
  onClose,
  selectedImageId,
}: ImageGallerySelectorProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedImageId || null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedId) {
      onSelect(selectedId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">画像を選択</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">画像がまだありません</p>
                <p className="text-sm text-gray-400">
                  画像管理ページから画像をアップロードしてください
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedId(image.id)}
                  className={`
                    relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all
                    ${
                      selectedId === image.id
                        ? 'border-primary-600 ring-2 ring-primary-600 ring-offset-2'
                        : 'border-transparent hover:border-gray-300'
                    }
                  `}
                >
                  <img
                    src={`${getImageUrl(image.id, 'public')}?width=300`}
                    alt={image.alt_text || image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedId === image.id && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                    {image.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedId && (
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                選択中: {selectedId}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedId}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              選択
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
