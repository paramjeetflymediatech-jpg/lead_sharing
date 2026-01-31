import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function PUT(req) {
  try {
    await connectToDatabase();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, phone, postcode, bio, skills, serviceAreas, profileImage } = body; // ADDED postcode

    const updatedProfile = await TradespersonProfile.findOneAndUpdate(
      { user: userId },
      {
        companyName,
        phone,
        postcode,
        bio,
        skills: Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()),
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : serviceAreas.split(",").map(s => s.trim()),
        profileImage, // SAVE IT
        updatedAt: Date.now(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    console.error("Tradesperson Profile Update Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Keep GET as is, but duplicate here for complete file replacement since we can't patch easily
import { User } from "@/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tradespersonProfile = await TradespersonProfile.findOne({ user: userId })
      .populate('user', 'email');

    if (!tradespersonProfile) {
      const user = await User.findById(userId);
      if (user && user.role === "TRADESPERSON") {
        const newProfile = await TradespersonProfile.create({
          user: userId,
          companyName: user.name + "'s Services",
          phone: "",
          bio: "",
          skills: [],
          serviceAreas: [],
          profileImage: ""
        });
        // Attach email manually for the response since we just created it and have the user object
        const responseData = newProfile.toObject();
        responseData.user = { email: user.email };
        return NextResponse.json({ success: true, data: responseData });
      }
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tradespersonProfile });
  } catch (error) {
    console.error("Tradesperson Profile Fetch Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
