import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { Image } from '@unbelong/shared';

const images = new Hono<{ Bindings: Bindings }>();

// 画像メタデータ一覧取得
images.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM images ORDER BY created_at DESC').all<
      Image
    >();

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: '画像の取得に失敗しました',
      },
      500
    );
  }
});

// 画像メタデータ取得
images.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
      .bind(id)
      .all<Image>();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: '画像が見つかりません',
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
        error: '画像の取得に失敗しました',
      },
      500
    );
  }
});

// 画像メタデータ作成（Cloudflare Imagesアップロード後）
images.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { id, filename, alt_text, width, height, format, size, uploaded_by } = body;

    // バリデーション
    if (!id || !filename) {
      return c.json(
        {
          success: false,
          error: 'id, filenameは必須です',
        },
        400
      );
    }

    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO images (id, filename, alt_text, width, height, format, size, uploaded_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        filename,
        alt_text || null,
        width || null,
        height || null,
        format || null,
        size || null,
        uploaded_by || null,
        now,
        now
      )
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
      .bind(id)
      .all<Image>();

    return c.json(
      {
        success: true,
        data: results[0],
        message: '画像メタデータを作成しました',
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: '画像メタデータの作成に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// 画像メタデータ更新
images.put('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { alt_text, width, height, format, size } = body;

    const now = Math.floor(Date.now() / 1000);

    const updates: string[] = [];
    const params: any[] = [];

    if (alt_text !== undefined) {
      updates.push('alt_text = ?');
      params.push(alt_text);
    }
    if (width !== undefined) {
      updates.push('width = ?');
      params.push(width);
    }
    if (height !== undefined) {
      updates.push('height = ?');
      params.push(height);
    }
    if (format !== undefined) {
      updates.push('format = ?');
      params.push(format);
    }
    if (size !== undefined) {
      updates.push('size = ?');
      params.push(size);
    }

    updates.push('updated_at = ?');
    params.push(now);

    params.push(id);

    await c.env.DB.prepare(`UPDATE images SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
      .bind(id)
      .all<Image>();

    return c.json({
      success: true,
      data: results[0],
      message: '画像メタデータを更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: '画像メタデータの更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

// 画像メタデータ削除
images.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: '画像メタデータを削除しました',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: '画像メタデータの削除に失敗しました',
      },
      500
    );
  }
});

export default images;
