import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  await clearAuthCookie();
  // Redirect back to login page after logging out
  return NextResponse.redirect(new URL('/auth/login', req.url));
}
