import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'unbelong 管理画面',
  description: 'マンガ・イラスト作品の管理画面',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
