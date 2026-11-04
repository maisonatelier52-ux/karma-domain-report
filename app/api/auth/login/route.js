import { NextResponse } from 'next/server';
import { COOKIE_NAME, signToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const adminEmail = (process.env.ADMIN_EMAIL || 'karama@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'karma12345';

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await signToken({ email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
