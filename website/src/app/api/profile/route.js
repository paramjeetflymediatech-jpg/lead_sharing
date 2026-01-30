
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req) {
    try {
        await connectToDatabase();

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        let profile = null;
        if (role === "TRADESPERSON") {
            profile = await TradespersonProfile.findOne({ user: userId }).lean();
        }

        return NextResponse.json({
            success: true,
            data: { ...user, profile }, // Ensure data structure matches what frontend expects (data.data)
            user,
            profile,
        });
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        await connectToDatabase();

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "TRADESPERSON") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { companyName, profileImage, bio, phone, skills, serviceAreas } = body;

        // Basic validation
        if (!companyName?.trim()) {
            return NextResponse.json(
                { success: false, message: "Company name is required" },
                { status: 400 }
            );
        }

        const profile = await TradespersonProfile.findOneAndUpdate(
            { user: userId },
            {
                companyName: companyName.trim(),
                profileImage: profileImage || "",
                bio: bio || "",
                phone: phone || "",
                skills: skills || [],
                serviceAreas: serviceAreas || [],
                updatedAt: new Date(),
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("Profile PUT Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Update failed" },
            { status: 500 }
        );
    }
}