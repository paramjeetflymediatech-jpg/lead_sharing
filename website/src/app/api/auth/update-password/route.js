
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req) {
    try {
        await connectToDatabase();
        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "New password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isValid = await verifyPassword(currentPassword, user.password);

        if (!isValid) {
            return NextResponse.json(
                { message: "Incorrect current password" },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
