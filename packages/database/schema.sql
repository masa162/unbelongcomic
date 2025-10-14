-- unbelong データベーススキーマ
-- Cloudflare D1 (SQLite) 用

-- 作品マスターテーブル
CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('comic', 'illustration')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  author TEXT NOT NULL DEFAULT 'belong',
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  thumbnail_image_id TEXT,
  og_image_id TEXT,
  tags TEXT, -- JSON配列形式で保存
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER
);

CREATE INDEX idx_works_type ON works(type);
CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_works_slug ON works(slug);

-- 話数・エピソードテーブル（マンガ用）
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- Markdown形式のコンテンツ
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  thumbnail_image_id TEXT,
  og_image_id TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  UNIQUE(work_id, episode_number),
  UNIQUE(work_id, slug)
);

CREATE INDEX idx_episodes_work_id ON episodes(work_id);
CREATE INDEX idx_episodes_status ON episodes(status);
CREATE INDEX idx_episodes_published_at ON episodes(published_at);

-- イラスト作品テーブル
CREATE TABLE IF NOT EXISTS illustrations (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT, -- Markdown形式の説明文
  image_id TEXT NOT NULL, -- Cloudflare Images ID
  status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  og_image_id TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT, -- JSON配列形式で保存
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE INDEX idx_illustrations_work_id ON illustrations(work_id);
CREATE INDEX idx_illustrations_status ON illustrations(status);
CREATE INDEX idx_illustrations_slug ON illustrations(slug);
CREATE INDEX idx_illustrations_published_at ON illustrations(published_at);

-- 画像メタデータテーブル
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY, -- Cloudflare Images ID
  filename TEXT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  format TEXT,
  size INTEGER, -- バイト数
  uploaded_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_images_filename ON images(filename);
CREATE INDEX idx_images_created_at ON images(created_at);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK(target_type IN ('episode', 'illustration')),
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'spam')) DEFAULT 'approved', -- 即時反映なのでデフォルトapproved
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- 作者プロフィールテーブル
CREATE TABLE IF NOT EXISTS author_profile (
  id INTEGER PRIMARY KEY CHECK(id = 1), -- 単一レコードのみ許可
  name TEXT NOT NULL,
  bio TEXT,
  avatar_image_id TEXT,
  social_links TEXT, -- JSON形式で保存 {"twitter": "...", "instagram": "..."}
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 初期データ投入
INSERT OR IGNORE INTO author_profile (id, name, bio, social_links) VALUES (
  1,
  'Belong',
  '1986年　神奈川県出身

薬剤師 / コミック作家 / イラストレーター',
  '{"blog": "https://masa86.com/"}'
);

-- サイト設定テーブル
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 初期設定データ
INSERT OR IGNORE INTO site_settings (key, value, description) VALUES
  ('site_name', 'unbelong', 'サイト名'),
  ('comic_og_image_id', '', 'マンガサイトデフォルトOG画像ID'),
  ('illust_og_image_id', '', 'イラストサイトデフォルトOG画像ID'),
  ('favicon_image_id', '', 'ファビコン画像ID'),
  ('comment_notification_email', 'mail@unbelong.xyz', 'コメント通知先メールアドレス');

-- ビュー: 公開中の作品一覧
CREATE VIEW IF NOT EXISTS published_works AS
SELECT * FROM works
WHERE status = 'published'
ORDER BY published_at DESC;

-- ビュー: 公開中のエピソード一覧
CREATE VIEW IF NOT EXISTS published_episodes AS
SELECT
  e.*,
  w.title as work_title,
  w.slug as work_slug
FROM episodes e
JOIN works w ON e.work_id = w.id
WHERE e.status = 'published' AND w.status = 'published'
ORDER BY e.published_at DESC;

-- ビュー: 公開中のイラスト一覧
CREATE VIEW IF NOT EXISTS published_illustrations AS
SELECT
  i.*,
  w.title as work_title,
  w.slug as work_slug
FROM illustrations i
JOIN works w ON i.work_id = w.id
WHERE i.status = 'published' AND w.status = 'published'
ORDER BY i.published_at DESC;

-- ビュー: 承認済みコメント一覧
CREATE VIEW IF NOT EXISTS approved_comments AS
SELECT * FROM comments
WHERE status = 'approved'
ORDER BY created_at DESC;
