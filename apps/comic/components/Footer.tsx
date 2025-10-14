import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト情報 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">unbelong</h3>
            <p className="text-sm text-gray-400">
              belong のオリジナルマンガを公開しているサイトです。
            </p>
          </div>

          {/* リンク */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">サイトマップ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  作品一覧
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  作者について
                </Link>
              </li>
              <li>
                <a
                  href="https://illust.unbelong.xyz"
                  className="text-sm hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  イラストサイト
                </a>
              </li>
            </ul>
          </div>

          {/* SNS・外部リンク */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">SNS</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://masa86.com/"
                  className="text-sm hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ブログ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} belong (unbelong). All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Powered by Cloudflare Pages
          </p>
        </div>
      </div>
    </footer>
  );
}
