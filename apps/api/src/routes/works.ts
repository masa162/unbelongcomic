import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { Work } from '@unbelong/shared';

const works = new Hono<{ Bindings: Bindings }>();

// 作品一覧取得
works.get('/', async (c) => {
  const type = c.req.query('type'); // comic or illustration
  const status = c.req.query('status') || 'published';

  try {
    let query = 'SELECT * FROM works WHERE status = ?';
    const params: string[] = [status];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY published_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Work>();

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: '作品の取得に失敗しました',
      },
      500
    );
  }
});

// 作品詳細取得（IDまたはslug）
works.get('/:identifier', async (c) => {
  const identifier = c.req.param('identifier');

  try {
    // IDかslugかを判定（UUIDはハイフンを含む）
    const isId = identifier.includes('-');
    const query = isId
      ? 'SELECT * FROM works WHERE id = ?'
      : 'SELECT * FROM works WHERE slug = ?';

    const { results } = await c.env.DB.prepare(query).bind(identifier).all<Work>();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: '作品が見つかりません',
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
        error: '作品の取得に失敗しました',
      },
      500
    );
  }
});

// 作品作成
works.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { type, title, slug, description, status, thumbnail_image_id, og_image_id, tags } = body;

    // バリデーション
    if (!type || !title || !slug) {
      return c.json(
        {
          success: false,
          error: 'type, title, slugは必須です',
        },
        400
      );
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const tagsJson = tags ? JSON.stringify(tags) : null;

    await c.env.DB.prepare(
      `INSERT INTO works (id, type, title, slug, description, status, thumbnail_image_id, og_image_id, tags, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        type,
        title,
        slug,
        description || null,
        status || 'draft',
        thumbnail_image_id || null,
        og_image_id || null,
        tagsJson,
        now,
        now,
        status === 'published' ? now : null
      )
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(id)
      .all<Work>();

    return c.json(
      {
        success: true,
        data: results[0],
        message: '作品を作成しました',
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: '作品の作成に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// 作品更新
works.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { title, slug, description, status, thumbnail_image_id, og_image_id, tags } = body;

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
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'published') {
        updates.push('published_at = ?');
        params.push(now);
      }
    }
    if (thumbnail_image_id !== undefined) {
      updates.push('thumbnail_image_id = ?');
      params.push(thumbnail_image_id);
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

    await c.env.DB.prepare(`UPDATE works SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(id)
      .all<Work>();

    return c.json({
      success: true,
      data: results[0],
      message: '作品を更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: '作品の更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// 作品削除
works.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: '作品を削除しました',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: '作品の削除に失敗しました',
      },
      500
    );
  }
});

export default works;
