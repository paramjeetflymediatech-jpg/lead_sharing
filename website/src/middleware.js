import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// const JWT_SECRET = process.env.JWT_SECRET; // Remove top-level
// const secret = ... // Remove top-level

export async function middleware(req) {
  return proxy(req);
}

export async function proxy(req) {
  let token = req.cookies.get("auth_token")?.value;

  // Fallback to Authorization header for mobile app
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  const pathname = req.nextUrl.pathname;

  // 1. Identify if the route is whitelisted for public access
  const isWhitelistedApi =
    pathname === "/api/tradesperson/search" ||
    pathname.startsWith("/api/me") ||
    pathname.startsWith("/api/tradespeople/") ||
    pathname.startsWith("/api/tradesperson/ratings") ||
    pathname.startsWith("/api/auth/otp");

  // 2. If whitelisted and NO token, proceed as Guest immediately
  if (isWhitelistedApi && !token) {
    // For profile and me, only allow GET public access for guests
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

  // 3. If no token and NOT whitelisted, 401
  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId || payload.id; // Support both naming conventions
    const role = payload.role;

    if (!["HOMEOWNER", "TRADESPERSON", "ADMIN"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 403 });
    }

    // Optional: Check if token exists in DB for session management
    /* 
    const [tokenRows] = await pool.query('SELECT id FROM auth_tokens WHERE token = ? AND expires_at > NOW()', [token]);
    if (tokenRows.length === 0) {
      return NextResponse.json({ message: "Session expired or revoked" }, { status: 401 });
    }
    */

    /* ======================
       ROLE BASED RULES
    ======================= */

    // 🛠️ Only HOMEOWNER can CREATE job
    if (pathname === "/api/jobs" && req.method === "POST" && role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Only homeowner can create job" }, { status: 403 });
    }

    // 🏠 HOMEOWNER routes - only homeowners can access
    if (pathname.startsWith("/api/homeowner/") && role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Only homeowners can access this resource" }, { status: 403 });
    }

    // 🔒 Only TRADESPERSON can access tradesperson pages
    if (pathname.startsWith("/tradesperson") && role !== "TRADESPERSON") {
      return NextResponse.json({ message: "Tradesperson access only" }, { status: 403 });
    }

    // ✅ Forward user info to APIs

    // 🛡️ Admin APIs only ADMIN
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json({ message: "Admin access only" }, { status: 403 });
    }

    // ✅ Forward user info to APIs (even whitelisted ones so header knows they are logged in)
    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId);
    headers.set("x-user-role", role);

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    // If JWT fails but it's a whitelisted route, let it through as Guest
    if (isWhitelistedApi) {
      return NextResponse.next();
    }

    console.error("Token verification failed:", error.message);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

export default proxy;

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
    "/api/auth/update-password",
    "/api/topup",
    "/api/ratings",
    "/api/auth/otp/:path*",
  ],
};