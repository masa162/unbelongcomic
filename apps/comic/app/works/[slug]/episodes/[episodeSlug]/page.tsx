import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { worksApi, episodesApi } from '@/lib/api';
import { getImageUrl } from '@unbelong/shared';
import type { Work, Episode } from '@unbelong/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EpisodeViewer from '@/components/EpisodeViewer';

export const revalidate = 60;

async function getWork(slug: string): Promise<Work | null> {
  try {
    const response = await worksApi.getBySlug(slug);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function getEpisode(workSlug: string, episodeSlug: string): Promise<Episode | null> {
  try {
    const response = await episodesApi.getBySlug(workSlug, episodeSlug);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function getAllEpisodes(workId: string): Promise<Episode[]> {
  try {
    const response = await episodesApi.listByWork(workId);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; episodeSlug: string };
}): Promise<Metadata> {
  const work = await getWork(params.slug);
  const episode = await getEpisode(params.slug, params.episodeSlug);

  if (!work || !episode) {
    return {
      title: 'エピソードが見つかりません',
    };
  }

  const ogImageUrl = episode.og_image_id
    ? getImageUrl(episode.og_image_id, 'public')
    : work.og_image_id
    ? getImageUrl(work.og_image_id, 'public')
    : undefined;

  return {
    title: `${episode.title} - ${work.title} | unbelong`,
    description: episode.description || work.description || '',
    openGraph: {
      title: `${episode.title} - ${work.title}`,
      description: episode.description || '',
      images: ogImageUrl ? [ogImageUrl] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${episode.title} - ${work.title}`,
      description: episode.description || '',
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: { slug: string; episodeSlug: string };
}) {
  const work = await getWork(params.slug);

  if (!work) {
    notFound();
  }

  const episode = await getEpisode(params.slug, params.episodeSlug);

  if (!episode) {
    notFound();
  }

  const allEpisodes = await getAllEpisodes(work.id);
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* エピソードヘッダー */}
        <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* パンくずリスト */}
            <nav className="mb-4 text-sm">
              <ol className="flex items-center space-x-2 text-gray-500">
                <li>
                  <Link href="/" className="hover:text-primary-600">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href={`/works/${work.slug}`} className="hover:text-primary-600">
                    {work.title}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 font-medium">第{episode.episode_number}話</li>
              </ol>
            </nav>

            {/* エピソード情報 */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                  第{episode.episode_number}話
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {episode.title}
              </h1>
              {episode.description && (
                <p className="text-gray-600 text-lg">{episode.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                <span>👁️ {episode.view_count.toLocaleString()} 回</span>
                {episode.published_at && (
                  <span>
                    📅 {new Date(episode.published_at * 1000).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EpisodeViewer content={episode.content} episodeTitle={episode.title} />
        </div>

        {/* ナビゲーション */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 前のエピソード */}
              <div>
                {prevEpisode ? (
                  <Link
                    href={`/works/${work.slug}/episodes/${prevEpisode.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 group"
                  >
                    <div className="text-xs text-gray-500 mb-2">← 前のエピソード</div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">
                      第{prevEpisode.episode_number}話: {prevEpisode.title}
                    </div>
                  </Link>
                ) : (
                  <div className="h-full" />
                )}
              </div>

              {/* 作品ページに戻る */}
              <div className="flex items-center justify-center">
                <Link
                  href={`/works/${work.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  ← 作品ページに戻る
                </Link>
              </div>

              {/* 次のエピソード */}
              <div>
                {nextEpisode ? (
                  <Link
                    href={`/works/${work.slug}/episodes/${nextEpisode.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 group text-right"
                  >
                    <div className="text-xs text-gray-500 mb-2">次のエピソード →</div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">
                      第{nextEpisode.episode_number}話: {nextEpisode.title}
                    </div>
                  </Link>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SNSシェアボタン */}
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
              このエピソードをシェア
            </h3>
            <div className="flex justify-center space-x-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${work.title} 第${episode.episode_number}話: ${episode.title}`
                )}&url=${encodeURIComponent(
                  `https://comic.unbelong.xyz/works/${work.slug}/episodes/${episode.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] text-white px-6 py-3 rounded-lg hover:bg-[#1a8cd8] transition-colors"
              >
                𝕏でシェア
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${work.title} 第${episode.episode_number}話: ${episode.title}`,
                      url: window.location.href,
                    });
                  }
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                シェア
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
