
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
// import { isValidObjectId } from "mongoose";

export async function PATCH(req, { params }) {
  try {
    // await connectToDatabase();

    // In Next.js 15+, params is a promise
    const { id } = await params;
    const { role } = await req.json();

    if (isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 }
      );
    }

    if (!["HOMEOWNER", "TRADESPERSON", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    //; // Not supported

    if (user) {
      delete user.password;
      delete user.lean;
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Role updated", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN ROLE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
