import { authorApi } from '@/lib/api';
import { getImageUrl } from '@unbelong/shared';
import type { AuthorProfile } from '@unbelong/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 3600; // 1時間ごとに再検証

async function getAuthor(): Promise<AuthorProfile | null> {
  try {
    const response = await authorApi.get();
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('作者情報の取得に失敗しました:', error);
    return null;
  }
}

export default async function AboutPage() {
  const author = await getAuthor();

  if (!author) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">作者情報を取得できませんでした</p>
        </main>
        <Footer />
      </div>
    );
  }

  const socialLinks = author.social_links as Record<string, string> | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* アバター */}
              <div className="flex-shrink-0">
                {author.avatar_image_id ? (
                  <img
                    src={getImageUrl(author.avatar_image_id, 'thumbnail')}
                    alt={author.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
              </div>

              {/* 名前 */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{author.name}</h1>
                <p className="text-primary-100 text-lg">コミック作家 / イラストレーター</p>
              </div>
            </div>
          </div>

          {/* プロフィール */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">プロフィール</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{author.bio}</p>
            </div>
          </div>

          {/* SNSリンク */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="px-8 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">SNS・リンク</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(socialLinks).map(([key, url]) => {
                  const getLinkLabel = (key: string) => {
                    const labels: Record<string, string> = {
                      twitter: '𝕏 (Twitter)',
                      instagram: 'Instagram',
                      website: 'ウェブサイト',
                      blog: 'ブログ',
                      pixiv: 'pixiv',
                      youtube: 'YouTube',
                    };
                    return labels[key.toLowerCase()] || key;
                  };

                  const getIcon = (key: string) => {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey === 'twitter') return '𝕏';
                    if (lowerKey === 'instagram') return '📷';
                    if (lowerKey === 'website' || lowerKey === 'blog') return '🌐';
                    if (lowerKey === 'pixiv') return '🎨';
                    if (lowerKey === 'youtube') return '▶️';
                    return '🔗';
                  };

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors group"
                    >
                      <span className="text-2xl">{getIcon(key)}</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">{getLinkLabel(key)}</div>
                        <div className="text-xs text-gray-400 truncate group-hover:text-primary-600">
                          {url}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* 最終更新 */}
          <div className="px-8 pb-8 text-sm text-gray-500">
            最終更新: {new Date(author.updated_at * 1000).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
