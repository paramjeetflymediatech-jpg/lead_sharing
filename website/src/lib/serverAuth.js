import "server-only";

import { cookies, headers } from "next/headers";
import { User } from "@/models/User";
// import { connectToDatabase } from "@/lib/mongodb"; // Removed
import jwt from "jsonwebtoken";

const AUTH_COOKIE_NAME = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set

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
    // await connectToDatabase(); // Removed

    // User.findById now returns a promise that resolves to user object (or mock lean)
    // My new implementation returns an object with a lean() method for compatibility if awaited
    // strictly speaking, my implementation: findById returns { lean: ..., ...data }
    // BUT await User.findById(id) returns the object. 
    // And if the code does await User.findById(id), it will fail because findById(id) returns a Promise, not a Mongoose Query object.
    // The existing code: const user = await User.findById(decoded.userId);
    // This implies User.findById returns a Query object, which has .
    // My implementation needs to support this chain.

    // Let's adjust usage here to match my new implementation or update implementation.
    // Simpler to update this usage since I control both.

    const user = await User.findById(decoded.userId);

    if (!user) return null;
    return {
      id: user.id, // User model returns id as well
      role: user.role,
      email: user.email,
      name: user.name,
      profileImage: user.profile_image || user.profileImage, // Map from DB snake_case or existing camelCase
    };
  } catch (err) {
    return null;
  }
}

