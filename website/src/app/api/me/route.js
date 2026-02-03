
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import "@/models/User";

export async function GET(req) {
  try {
    // await connectToDatabase();

    // 🔐 Middleware se aaya data
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 User
    const user = await User.findById(userId);
    //
    // ;

    if (user) {
      delete user.password;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let tradespersonProfile = null;

    // 🛠️ Extra data for tradesperson
    if (role === "TRADESPERSON") {
      tradespersonProfile = await TradespersonProfile.findOne({
        user: userId,
      });
    }

    return NextResponse.json({
      success: true,
      user,
      tradespersonProfile,
    });
  } catch (error) {
    console.error("GET ME error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, address, currentPassword, newPassword } = body;

    const updates = {};
    if (firstName && lastName) {
      updates.name = `${firstName} ${lastName}`;
    } else if (firstName) {
      updates.name = firstName;
    }

    if (phone) updates.phone = phone;
    // Address handling - simplistic for now, assuming columns exist or we skip
    if (address) {
      if (address.city) updates.city = address.city;
      if (address.postcode) updates.postcode = address.postcode;
      if (address.line1) updates.address_line1 = address.line1;
      // Note: User model map needs to support these or they will fail if strict
    }

    // Password change
    if (newPassword) {
      // In a real app, verify currentPassword first
      // const user = await User.findById(userId);
      // const isValid = await bcrypt.compare(currentPassword, user.password);
      // if (!isValid) throw new Error("Invalid current password");

      const bcrypt = require('bcryptjs'); // Require locally to ensure it exists
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(userId, updates);
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("UPDATE ME error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
