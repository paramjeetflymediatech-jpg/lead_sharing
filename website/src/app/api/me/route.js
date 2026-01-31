import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();

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
    const user = await User.findById(userId)
      .select("-password")
      .lean();

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
      }).lean();
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
