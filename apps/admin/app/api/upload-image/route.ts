import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（Basic認証がかかっているので、ここでは省略可）

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB制限）
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズが大きすぎます（最大10MB）' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'サポートされていないファイル形式です（JPEG, PNG, WebP, GIFのみ）' },
        { status: 400 }
      );
    }

    // Cloudflare Images APIにアップロード
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials:', { accountId: !!accountId, apiToken: !!apiToken });
      return NextResponse.json(
        { success: false, error: 'Cloudflare API設定が不足しています' },
        { status: 500 }
      );
    }

    // FormDataを作成（Cloudflare Images API用）
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // Cloudflare Images APIにアップロード
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: uploadFormData,
      }
    );

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
      console.error('Cloudflare Images upload error:', uploadResult);
      return NextResponse.json(
        {
          success: false,
          error: '画像のアップロードに失敗しました',
          details: uploadResult.errors || uploadResult.messages,
        },
        { status: 500 }
      );
    }

    // アップロード成功
    const imageData = uploadResult.result;

    return NextResponse.json({
      success: true,
      data: {
        id: imageData.id,
        filename: imageData.filename,
        uploaded: imageData.uploaded,
        variants: imageData.variants,
      },
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '画像のアップロードに失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
