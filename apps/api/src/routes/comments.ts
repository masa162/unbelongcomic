import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { Comment } from '@unbelong/shared';

const comments = new Hono<{ Bindings: Bindings }>();

// コメント一覧取得
comments.get('/', async (c) => {
  const targetType = c.req.query('target_type');
  const targetId = c.req.query('target_id');
  const status = c.req.query('status');

  try {
    let query = 'SELECT * FROM comments';
    const params: string[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (targetType) {
      conditions.push('target_type = ?');
      params.push(targetType);
    }

    if (targetId) {
      conditions.push('target_id = ?');
      params.push(targetId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Comment>();

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'コメントの取得に失敗しました',
      },
      500
    );
  }
});

// コメント詳細取得
comments.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .all<Comment>();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'コメントが見つかりません',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'コメントの取得に失敗しました',
      },
      500
    );
  }
});

// コメント作成
comments.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { target_type, target_id, content } = body;

    // バリデーション
    if (!target_type || !target_id || !content) {
      return c.json(
        {
          success: false,
          error: 'target_type, target_id, contentは必須です',
        },
        400
      );
    }

    if (content.length > 150) {
      return c.json(
        {
          success: false,
          error: 'コメントは150文字以内で入力してください',
        },
        400
      );
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // リクエスト情報を取得
    const ipAddress = c.req.header('CF-Connecting-IP') || null;
    const userAgent = c.req.header('User-Agent') || null;

    await c.env.DB.prepare(
      `INSERT INTO comments (id, target_type, target_id, content, status, ip_address, user_agent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, target_type, target_id, content, 'approved', ipAddress, userAgent, now, now)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .all<Comment>();

    // TODO: メール通知を送信（mail@unbelong.xyz）

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'コメントを投稿しました',
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'コメントの投稿に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// コメント更新（管理者用）
comments.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { content, status } = body;

    const now = Math.floor(Date.now() / 1000);

    const updates: string[] = [];
    const params: any[] = [];

    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    updates.push('updated_at = ?');
    params.push(now);

    params.push(id);

    await c.env.DB.prepare(`UPDATE comments SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .all<Comment>();

    return c.json({
      success: true,
      data: results[0],
      message: 'コメントを更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'コメントの更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// コメント削除
comments.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'コメントを削除しました',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'コメントの削除に失敗しました',
      },
      500
    );
  }
});

export default comments;
