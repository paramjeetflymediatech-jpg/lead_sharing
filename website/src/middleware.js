import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

console.log("!!!!!!!!!!!!!!!!!! MIDDLEWARE FILE LOADED !!!!!!!!!!!!!!!!!!");

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // 1. Identify if the route is whitelisted for public access
  const isWhitelistedApi =
    pathname === "/api/tradesperson/search" ||
    pathname.startsWith("/api/me") ||
    pathname.startsWith("/api/tradespeople/") ||
    pathname.startsWith("/api/tradesperson/ratings") ||
    pathname.startsWith("/api/auth/otp") ||
    (pathname === "/api/jobs" && req.method === "POST");

  const authHeader = req.headers.get("authorization");
  let token = req.cookies.get("auth_token")?.value;

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. If whitelisted and NO token, proceed as Guest immediately
  if (isWhitelistedApi && !token) {
    if ((pathname === "/api/profile" || pathname === "/api/me") && req.method !== "GET") {
      // Fall through to 401
    } else {
      return NextResponse.next();
    }
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    if (isWhitelistedApi) return NextResponse.next();
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  const secret = new TextEncoder().encode(JWT_SECRET);

  if (!token) {
    // If it's a page and not a whitelisted API, redirect to login
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId || payload.id;
    const role = payload.role;

    // Role-based access control for pages
    if (pathname.startsWith("/tradesperson") && role !== "TRADESPERSON") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (pathname === "/onboarding" && role !== "TRADESPERSON") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (pathname.startsWith("/homeowner") && role !== "HOMEOWNER") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Role-based access control for API
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json({ message: "Admin access only" }, { status: 403 });
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId.toString());
    headers.set("x-user-role", role);
    headers.set("x-pathname", pathname);

    console.log(`[Middleware] Passing to Next.js - User: ${userId}, Role: ${role}, Path: ${pathname}`);

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    if (isWhitelistedApi) {
      return NextResponse.next();
    }
    console.error("Token verification failed:", error.message);
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/jobs/:path*",
    "/api/leads/:path*",
    "/api/profile",
    "/api/profile/:path*",
    "/api/homeowner/:path*",
    "/api/tradesperson/:path*",
    "/api/admin/:path*",
    "/api/me/:path*",
    "/api/notifications/:path*",
    "/api/notifications",
    "/api/auth/update-password",
    "/api/auth/push-token",
    "/api/topup",
    "/api/ratings",
    "/api/auth/otp/:path*",
    "/tradesperson/:path*",
    "/tradesperson",
    "/homeowner/:path*",
    "/homeowner",
    "/onboarding",
  ],
};