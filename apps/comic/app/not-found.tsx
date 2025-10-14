import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
