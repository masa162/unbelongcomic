import { Hono } from 'hono';
import type { Bindings } from '../index';
import type { AuthorProfile } from '@unbelong/shared';

const author = new Hono<{ Bindings: Bindings }>();

// 作者プロフィール取得
author.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM author_profile WHERE id = 1').all<
      AuthorProfile
    >();

    if (results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'プロフィールが見つかりません',
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
        error: 'プロフィールの取得に失敗しました',
      },
      500
    );
  }
});

// 作者プロフィール更新
author.put('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, bio, avatar_image_id, social_links } = body;

    const now = Math.floor(Date.now() / 1000);
    const socialLinksJson = social_links ? JSON.stringify(social_links) : null;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (avatar_image_id !== undefined) {
      updates.push('avatar_image_id = ?');
      params.push(avatar_image_id);
    }
    if (socialLinksJson !== null) {
      updates.push('social_links = ?');
      params.push(socialLinksJson);
    }

    updates.push('updated_at = ?');
    params.push(now);

    await c.env.DB.prepare(`UPDATE author_profile SET ${updates.join(', ')} WHERE id = 1`)
      .bind(...params)
      .run();

    const { results } = await c.env.DB.prepare('SELECT * FROM author_profile WHERE id = 1').all<
      AuthorProfile
    >();

    return c.json({
      success: true,
      data: results[0],
      message: 'プロフィールを更新しました',
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: 'プロフィールの更新に失敗しました',
        message: error.message,
      },
      500
    );
  }
});

export default author;
