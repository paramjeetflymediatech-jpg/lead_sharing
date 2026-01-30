import "server-only";

import { cookies, headers } from "next/headers";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const AUTH_COOKIE_NAME = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET;

// Helper to validate secret lazily
function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable in .env.local");
  }
  return JWT_SECRET;
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const hdrs = await headers();
  const auth = hdrs.get("authorization");
  const tokenFromHeader =
    auth && auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;

  const token = tokenFromHeader || tokenFromCookie;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    await connectToDatabase();
    const user = await User.findById(decoded.userId).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
  } catch (err) {
    return null;
  }
}
