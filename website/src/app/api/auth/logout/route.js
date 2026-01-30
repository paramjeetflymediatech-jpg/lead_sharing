import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  await clearAuthCookie();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (baseUrl) {
    return NextResponse.redirect(new URL('/auth/login', baseUrl));
  }

  // Fallback to request origin if env var not set (development)
  return NextResponse.redirect(new URL('/auth/login', req.url));
}
