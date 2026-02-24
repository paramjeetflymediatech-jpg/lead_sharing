
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { logToFile } from "@/lib/serverAuth";

export async function GET(req) {
    try {
        // await connectToDatabase();

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");
        logToFile(`API Profile GET userId=${userId} role=${role}`);

        if (!userId) {
            console.log("[API Profile] No user ID found in headers");
            return NextResponse.json(
                { success: true, data: null, message: "Guest session" },
                { status: 200 }
            );
        }

        console.log("[API Profile] Fetching profile for user:", userId, "Role:", role);

        // 👤 User
        const userRaw = await User.findById(userId);
        if (!userRaw) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Clean user object for serialization
        const user = { ...userRaw };
        delete user.password;
        if (typeof user.lean === "function") delete user.lean;

        let profile = null;
        if (role === "TRADESPERSON") {
            profile = await TradespersonProfile.findOne({ user: userId });
        }

        console.log("[API Profile] Success. Profile status:", profile?.verificationStatus);
        return NextResponse.json({
            success: true,
            data: { ...user, profile },
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
        // await connectToDatabase();

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

        // findOneAndUpdate signature: (query, updateData, options)
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
                // runValidators: true
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