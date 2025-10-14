import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic認証の認証情報（本番環境では環境変数から取得）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'unbelong2024';

export function middleware(request: NextRequest) {
  // ログインページとAPIルートは認証をスキップ
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Basic認証のチェック
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  const auth = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(auth, 'base64').toString().split(':');

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
