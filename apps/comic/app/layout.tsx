import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'unbelong - コミック',
  description: 'belong のオリジナルマンガサイト',
  openGraph: {
    title: 'unbelong - コミック',
    description: 'belong のオリジナルマンガサイト',
    url: 'https://comic.unbelong.xyz',
    siteName: 'unbelong',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'unbelong - コミック',
    description: 'belong のオリジナルマンガサイト',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
