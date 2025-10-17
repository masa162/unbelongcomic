import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { Illustration } from '@unbelong/shared';

const illustrations = new Hono<{ Bindings: Bindings }>();

// イラスト一覧取得
illustrations.get('/', async (c) => {
  const status = c.req.query('status');

  try {
    let query = 'SELECT * FROM illustrations';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY published_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Illustration>();

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'イラストの取得に失敗しました',
      },
      500
    );
  }
});

// イラスト詳細取得
illustrations.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?')
      .bind(id)
      .all<Illustration>();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'イラストが見つかりません',
        },
        404
      );
    }

    // 閲覧数をインクリメント
    await c.env.DB.prepare('UPDATE illustrations SET view_count = view_count + 1 WHERE id = ?')
      .bind(id)
      .run();

    return c.json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'イラストの取得に失敗しました',
      },
      500
    );
  }
});

// イラスト作成
illustrations.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { work_id, title, slug, description, content, image_id, status, og_image_id, tags } =
      body;

    // バリデーション
    if (!work_id || !title || !slug || !image_id) {
      return c.json(
        {
          success: false,
          error: 'work_id, title, slug, image_idは必須です',
        },
        400
      );
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const tagsJson = tags ? JSON.stringify(tags) : null;

    await c.env.DB.prepare(
      `INSERT INTO illustrations (id, work_id, title, slug, description, content, image_id, status, og_image_id, tags, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        work_id,
        title,
        slug,
        description || null,
        content || null,
        image_id,
        status || 'draft',
        og_image_id || null,
        tagsJson,
        now,
        now,
        status === 'published' ? now : null
      )
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?')
      .bind(id)
      .all<Illustration>();

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'イラストを作成しました',
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'イラストの作成に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// イラスト更新
illustrations.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { title, slug, description, content, image_id, status, og_image_id, tags } = body;

    const now = Math.floor(Date.now() / 1000);
    const tagsJson = tags ? JSON.stringify(tags) : null;

    const updates: string[] = [];
    const params: any[] = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (slug) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (image_id) {
      updates.push('image_id = ?');
      params.push(image_id);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'published') {
        updates.push('published_at = ?');
        params.push(now);
      }
    }
    if (og_image_id !== undefined) {
      updates.push('og_image_id = ?');
      params.push(og_image_id);
    }
    if (tagsJson !== null) {
      updates.push('tags = ?');
      params.push(tagsJson);
    }

    updates.push('updated_at = ?');
    params.push(now);

    params.push(id);

    await c.env.DB.prepare(`UPDATE illustrations SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM illustrations WHERE id = ?')
      .bind(id)
      .all<Illustration>();

    return c.json({
      success: true,
      data: results[0],
      message: 'イラストを更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'イラストの更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// イラスト削除
illustrations.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM illustrations WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'イラストを削除しました',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'イラストの削除に失敗しました',
      },
      500
    );
  }
});

export default illustrations;
