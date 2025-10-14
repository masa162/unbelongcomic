import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">unbelong</h1>
            <span className="ml-2 text-sm text-gray-500">comic</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              作品一覧
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              作者について
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <button className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
