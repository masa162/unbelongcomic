# unbelong - マンガ・イラスト公開プラットフォーム

マンガ作家「belong」の自作マンガおよびイラスト作品をオンラインで公開するプラットフォーム。

## プロジェクト構成

このプロジェクトはモノレポ構成で、以下のアプリケーションを含みます：

### アプリケーション

- **admin** (`apps/admin`) - 管理画面 (admin.unbelong.xyz)
  - Next.js製の管理画面
  - 作品・画像・コメントの管理機能

- **comic** (`apps/comic`) - マンガサイト (comic.unbelong.xyz)
  - マンガ作品の閲覧サイト
  - 縦スクロール型ビューア

- **illust** (`apps/illust`) - イラストサイト (illust.unbelong.xyz)
  - イラストポートフォリオサイト
  - ギャラリー表示

- **api** (`apps/api`) - Cloudflare Workers API
  - バックエンドAPI
  - D1データベースとの連携

### 共通パッケージ

- **packages/shared** - 共通の型定義・ユーティリティ
- **packages/database** - データベーススキーマとマイグレーション

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **ホスティング**: Cloudflare Pages
- **画像CDN**: Cloudflare Images
- **言語**: TypeScript

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev:admin   # 管理画面
npm run dev:comic   # マンガサイト
npm run dev:illust  # イラストサイト
npm run dev:api     # API

# ビルド
npm run build:admin
npm run build:comic
npm run build:illust
npm run build:api

# デプロイ
npm run deploy:admin
npm run deploy:comic
npm run deploy:illust
npm run deploy:api
```

## 環境変数

各アプリケーションのルートに `.env.local` ファイルを作成してください。

### admin / comic / illust

```env
NEXT_PUBLIC_API_URL=https://api.unbelong.xyz
```

### api

```env
DATABASE_ID=your-d1-database-id
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_TOKEN=your-images-token
```

## ドメイン構成

- `admin.unbelong.xyz` - 管理画面
- `comic.unbelong.xyz` - マンガサイト
- `illust.unbelong.xyz` - イラストサイト
- `img.unbelong.xyz` - 画像CDN (Cloudflare Images)
- `api.unbelong.xyz` - API (Cloudflare Workers)

## ライセンス

UNLICENSED - このプロジェクトは非公開です。
