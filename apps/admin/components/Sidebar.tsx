'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: '📊' },
  { name: '作品管理', href: '/dashboard/works', icon: '📚' },
  { name: 'エピソード管理', href: '/dashboard/episodes', icon: '📖' },
  { name: 'イラスト管理', href: '/dashboard/illustrations', icon: '🎨' },
  { name: '画像管理', href: '/dashboard/images', icon: '🖼️' },
  { name: 'コメント管理', href: '/dashboard/comments', icon: '💬' },
  { name: '作者情報', href: '/dashboard/author', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <h1 className="text-white text-xl font-bold">unbelong 管理</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          unbelong v1.0
          <br />
          Powered by Cloudflare
        </p>
      </div>
    </div>
  );
}
