
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
// import { isValidObjectId } from "mongoose";
import { hashPassword } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    // await connectToDatabase();
    const { id } = await params;

    if (isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (user) {
      // remove password manually
      delete user.password;
      // remove helper lean method if present
      delete user.lean;
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("ADMIN USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    // await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    if (isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const updateData = { ...body };

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    } else {
      delete updateData.password; // Don't accidentally wipe it
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      // runValidators: true, // Not supported in stub
    });

    if (updatedUser) {
      delete updatedUser.password;
      delete updatedUser.lean;
    }

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // await connectToDatabase();
    const { id } = await params;

    if (isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("ADMIN DELETE USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
