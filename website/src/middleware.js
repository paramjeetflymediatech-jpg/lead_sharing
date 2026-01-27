import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// Edge compatible secret
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("auth_token")?.value;

  // 🔒 No token
  if (!token) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // ✅ VERIFY TOKEN (EDGE SAFE)
    const { payload } = await jwtVerify(token, secret);

    // ✅ Forward user data to API routes
    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.userId);
    headers.set("x-user-role", payload.role);

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

/**
 * 🔐 Protect routes
 */
export const config = {
  matcher: [
    "/api/jobs/:path*",
    "/api/leads/:path*",
    "/api/profile/:path*",
  ],
};
