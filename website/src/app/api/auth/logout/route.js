import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/serverAuth';

import { User } from '@/models/User';

export async function POST(req) {
  try {
    let token = req.cookies.get("auth_token")?.value;

    // Fallback to Authorization header for mobile app
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      await User.revokeAuthToken(token);
    }

    await clearAuthCookie();

    return NextResponse.json({ success: true, message: 'Logged out' });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (token) {
      await User.revokeAuthToken(token);
    }

    await clearAuthCookie();

    // Redirect to homepage after logout
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error("Logout GET error:", error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

