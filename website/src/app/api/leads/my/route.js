import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req) {
  try {
    // await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const leads = await Lead.find({ tradesperson: profile._id });

    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
