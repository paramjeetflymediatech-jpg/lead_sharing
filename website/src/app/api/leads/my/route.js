import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";

export async function GET(req) {
  try {
    await connectToDatabase();

    // 🔐 user from middleware
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1️⃣ user check
    const user = await User.findById(userId);
    if (!user || user.role !== "TRADESPERSON") {
      return NextResponse.json(
        { message: "Only tradesperson allowed" },
        { status: 403 }
      );
    }

    // 2️⃣ profile check
    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json(
        { message: "Tradesperson profile not found" },
        { status: 404 }
      );
    }

    // 3️⃣ fetch leads
    const leads = await Lead.find({ tradesperson: profile._id })
      .populate("job")
      .sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("FETCH LEADS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
