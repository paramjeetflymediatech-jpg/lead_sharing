
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

import fs from "fs";
import path from "path";

export async function DELETE(req, { params }) {
  try {
    // await connectToDatabase();
    const { id } = await params;

    if (isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    // 1. Fetch media paths before deletion
    const mediaPaths = await User.getAssociatedMedia(id);

    // 2. Delete the user (database cascades handle record cleanup)
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 3. Clean up files on disk
    if (mediaPaths && mediaPaths.length > 0) {
      mediaPaths.forEach(mediaPath => {
        // Only delete if it's a local upload
        if (typeof mediaPath === 'string' && mediaPath.startsWith('/uploads/')) {
          const absolutePath = path.join(process.cwd(), 'public', mediaPath);
          try {
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
              console.log(`[CLEANUP] Deleted file: ${absolutePath}`);
            }
          } catch (err) {
            console.error(`[CLEANUP ERROR] Failed to delete ${absolutePath}:`, err);
          }
        }
      });
    }

    return NextResponse.json({ message: "User and all associated data deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("ADMIN DELETE USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
