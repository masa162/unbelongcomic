import Link from 'next/link';
import { notFound } from 'next/navigation';
import { worksApi, episodesApi } from '@/lib/api';
import { getImageUrl } from '@unbelong/shared';
import type { Work, Episode } from '@unbelong/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

async function getWork(slug: string): Promise<Work | null> {
  try {
    const response = await worksApi.getBySlug(slug);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('作品の取得に失敗しました:', error);
    return null;
  }
}

async function getEpisodes(workId: string): Promise<Episode[]> {
  try {
    const response = await episodesApi.listByWork(workId);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('エピソードの取得に失敗しました:', error);
    return [];
  }
}

export default async function WorkPage({ params }: { params: { slug: string } }) {
  const work = await getWork(params.slug);

  if (!work) {
    notFound();
  }

  const episodes = await getEpisodes(work.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 作品ヘッダー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* サムネイル */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              {work.thumbnail_image_id ? (
                <img
                  src={getImageUrl(work.thumbnail_image_id, 'public')}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* 作品情報 */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{work.title}</h1>
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                連載中
              </span>
            </div>

            {work.description && (
              <p className="text-gray-700 text-lg mb-6 leading-relaxed whitespace-pre-line">
                {work.description}
              </p>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500 mb-1">エピソード数</dt>
                  <dd className="text-2xl font-bold text-gray-900">{episodes.length}話</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 mb-1">総閲覧数</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {episodes.reduce((sum, ep) => sum + (ep.view_count || 0), 0).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 最新話へのリンク */}
            {episodes.length > 0 && (
              <Link
                href={`/works/${work.slug}/episodes/${episodes[0].slug}`}
                className="block w-full bg-primary-600 text-white text-center font-bold py-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                最新話を読む →
              </Link>
            )}
          </div>
        </div>

        {/* エピソード一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">エピソード一覧</h2>

          {episodes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">まだエピソードがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/works/${work.slug}/episodes/${episode.slug}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full mr-3">
                          第{episode.episode_number}話
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {episode.title}
                        </h3>
                      </div>

                      {episode.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {episode.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👁️ {episode.view_count.toLocaleString()} 回</span>
                        {episode.published_at && (
                          <span>
                            📅{' '}
                            {new Date(episode.published_at * 1000).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 text-primary-600 group-hover:translate-x-2 transition-transform">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
