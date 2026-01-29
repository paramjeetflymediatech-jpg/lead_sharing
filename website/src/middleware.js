










import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("auth_token")?.value;
  const pathname = req.nextUrl.pathname;

  console.log("🔐 Middleware checking:", pathname, "Has token:", !!token);

  if (!token) {
    console.log("❌ No token found");
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId;
    const role = payload.role; // HOMEOWNER | TRADESPERSON | ADMIN

    console.log("✅ Token verified:", { userId, role });

    // ❌ Invalid role
    if (!["HOMEOWNER", "TRADESPERSON", "ADMIN"].includes(role)) {
      console.log("❌ Invalid role:", role);
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 403 }
      );
    }

    /* ======================
       ROLE BASED RULES
    ======================= */

    // 🛠️ Only HOMEOWNER can CREATE job
    if (
      pathname === "/api/jobs" &&
      req.method === "POST" &&
      role !== "HOMEOWNER"
    ) {
      return NextResponse.json(
        { message: "Only homeowner can create job" },
        { status: 403 }
      );
    }

    // 🏠 HOMEOWNER routes - only homeowners can access
    if (pathname.startsWith("/api/homeowner/") && role !== "HOMEOWNER") {
      console.log("❌ Non-homeowner trying to access homeowner route");
      return NextResponse.json(
        { message: "Only homeowners can access this resource" },
        { status: 403 }
      );
    }

    // 🔓 Only TRADESPERSON can unlock lead
    if (
      pathname.startsWith("/api/leads/unlock") &&
      role !== "TRADESPERSON"
    ) {
      return NextResponse.json(
        { message: "Only tradesperson can unlock lead" },
        { status: 403 }
      );
    }

    // 🛡️ Admin APIs only ADMIN
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    // ✅ Forward user info to APIs
    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId);
    headers.set("x-user-role", role);

    console.log("✅ Request authorized, forwarding with headers");

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/jobs/:path*",
    "/api/leads/:path*",
    "/api/profile/:path*",
    "/api/homeowner/:path*",
    "/api/tradesperson/:path*",
    "/api/admin/:path*",
  ],
};