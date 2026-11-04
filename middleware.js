import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';

// Protects every page and API route except the login page and login API.
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = await verifyToken(token);

  const isPublic = pathname === '/login' || pathname === '/api/auth/login';
  if (isPublic) {
    if (pathname === '/login' && user) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
