import Link from 'next/link';
import { worksApi } from '@/lib/api';
import { getImageUrl } from '@unbelong/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60; // 60秒ごとに再検証

async function getWorks() {
  try {
    const response = await worksApi.list();
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('作品の取得に失敗しました:', error);
    return [];
  }
}

export default async function HomePage() {
  const works = await getWorks();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            unbelong comic
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            belong のオリジナルマンガを公開しています。
            <br />
            日常の記録と感覚の交差点。
          </p>
        </div>

        {/* 作品一覧 */}
        {works.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">現在公開中の作品はありません</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">連載中の作品</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work) => (
                <Link
                  key={work.id}
                  href={`/works/${work.slug}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* サムネイル */}
                  <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
                    {work.thumbnail_image_id ? (
                      <img
                        src={getImageUrl(work.thumbnail_image_id, 'public')}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image</span>
                      </div>
                    )}

                    {/* ステータスバッジ */}
                    {work.status === 'published' && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          連載中
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 作品情報 */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {work.title}
                    </h3>
                    {work.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {work.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>連載中</span>
                      <span className="text-primary-600 font-medium group-hover:underline">
                        読む →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTAセクション */}
        <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">イラストも公開中</h2>
          <p className="text-lg mb-6 opacity-90">
            オリジナルイラストもご覧いただけます
          </p>
          <a
            href="https://illust.unbelong.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            イラストサイトへ
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
