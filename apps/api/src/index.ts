import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// ルート
import worksRouter from './routes/works';
import episodesRouter from './routes/episodes';
import illustrationsRouter from './routes/illustrations';
import commentsRouter from './routes/comments';
import imagesRouter from './routes/images';
import authorRouter from './routes/author';

// 型定義
export type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェア
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || ['*'];
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return origin;
      }
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ヘルスチェック
app.get('/', (c) => {
  return c.json({
    service: 'unbelong-api',
    version: '1.0.0',
    status: 'ok',
  });
});

// ルーティング
app.route('/works', worksRouter);
app.route('/episodes', episodesRouter);
app.route('/illustrations', illustrationsRouter);
app.route('/comments', commentsRouter);
app.route('/images', imagesRouter);
app.route('/author', authorRouter);

// 404ハンドラ
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// エラーハンドラ
app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
