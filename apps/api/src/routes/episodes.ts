import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { Episode, EpisodeWithWork } from '@unbelong/shared';

const episodes = new Hono<{ Bindings: Bindings }>();

// エピソード一覧取得
episodes.get('/', async (c) => {
  const workId = c.req.query('work_id');
  const status = c.req.query('status') || 'published';

  try {
    let query = `
      SELECT e.*, w.title as work_title, w.slug as work_slug
      FROM episodes e
      JOIN works w ON e.work_id = w.id
      WHERE e.status = ?
    `;
    const params: string[] = [status];

    if (workId) {
      query += ' AND e.work_id = ?';
      params.push(workId);
    }

    query += ' ORDER BY e.episode_number ASC';

    const { results } = await c.env.DB.prepare(query).bind(...params).all<EpisodeWithWork>();

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'エピソードの取得に失敗しました',
      },
      500
    );
  }
});

// エピソード詳細取得
episodes.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const query = `
      SELECT e.*, w.title as work_title, w.slug as work_slug
      FROM episodes e
      JOIN works w ON e.work_id = w.id
      WHERE e.id = ?
    `;

    const { results } = await c.env.DB.prepare(query).bind(id).all<EpisodeWithWork>();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'エピソードが見つかりません',
        },
        404
      );
    }

    // 閲覧数をインクリメント
    await c.env.DB.prepare('UPDATE episodes SET view_count = view_count + 1 WHERE id = ?')
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
        error: 'エピソードの取得に失敗しました',
      },
      500
    );
  }
});

// エピソード作成
episodes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {
      work_id,
      episode_number,
      title,
      slug,
      description,
      content,
      status,
      thumbnail_image_id,
      og_image_id,
    } = body;

    // バリデーション
    if (!work_id || !episode_number || !title || !slug || !content) {
      return c.json(
        {
          success: false,
          error: 'work_id, episode_number, title, slug, contentは必須です',
        },
        400
      );
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO episodes (id, work_id, episode_number, title, slug, description, content, status, thumbnail_image_id, og_image_id, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        work_id,
        episode_number,
        title,
        slug,
        description || null,
        content,
        status || 'draft',
        thumbnail_image_id || null,
        og_image_id || null,
        now,
        now,
        status === 'published' ? now : null
      )
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM episodes WHERE id = ?')
      .bind(id)
      .all<Episode>();

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'エピソードを作成しました',
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'エピソードの作成に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// エピソード更新
episodes.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const {
      episode_number,
      title,
      slug,
      description,
      content,
      status,
      thumbnail_image_id,
      og_image_id,
    } = body;

    const now = Math.floor(Date.now() / 1000);

    const updates: string[] = [];
    const params: any[] = [];

    if (episode_number !== undefined) {
      updates.push('episode_number = ?');
      params.push(episode_number);
    }
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
    if (content) {
      updates.push('content = ?');
      params.push(content);
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

    updates.push('updated_at = ?');
    params.push(now);

    params.push(id);

    await c.env.DB.prepare(`UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM episodes WHERE id = ?')
      .bind(id)
      .all<Episode>();

    return c.json({
      success: true,
      data: results[0],
      message: 'エピソードを更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'エピソードの更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// エピソード削除
episodes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM episodes WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'エピソードを削除しました',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'エピソードの削除に失敗しました',
      },
      500
    );
  }
});

export default episodes;
