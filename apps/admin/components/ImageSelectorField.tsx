'use client';

import { useState } from 'react';
import { getImageUrl } from '@unbelong/shared';
import ImageGallerySelector from './ImageGallerySelector';

interface ImageSelectorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helperText?: string;
}

export default function ImageSelectorField({
  label,
  value,
  onChange,
  required = false,
  helperText,
}: ImageSelectorFieldProps) {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-start space-x-4">
        {/* プレビュー */}
        {value && (
          <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
            <img
              src={`${getImageUrl(value, 'public')}?width=200`}
              alt="プレビュー"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">画像読み込みエラー</div>';
                }
              }}
            />
          </div>
        )}

        {/* 入力フィールドとボタン */}
        <div className="flex-1">
          <div className="flex space-x-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Cloudflare Images ID または画像を選択"
            />
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              ギャラリーから選択
            </button>
          </div>
          {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
          {value && (
            <p className="text-xs text-gray-400 mt-2 font-mono break-all">ID: {value}</p>
          )}
        </div>
      </div>

      {/* ギャラリーモーダル */}
      {showGallery && (
        <ImageGallerySelector
          onSelect={onChange}
          onClose={() => setShowGallery(false)}
          selectedImageId={value}
        />
      )}
    </div>
  );
}
