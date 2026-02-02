import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'ALL';

    const skip = (page - 1) * limit;

    // Build query
    const query = { role: { $ne: 'ADMIN' } };

    if (role !== 'ALL') {
      query.role = role; // Override to specific role if selected
    }

    if (search) {
      query.$or = [
        { name: { $regex: search } },
        { email: { $regex: search } }
      ];
    }

    // Get Data & Count Parallel
    const [users, total] = await Promise.all([
      User.find(query, { limit, skip }),
      User.countDocuments(query)
    ]);

    // Sanitize users to remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { password, password_reset_token, password_reset_expires, ...rest } = user;
      return rest;
    });

    return NextResponse.json({
      users: sanitizedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN CREATE USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
