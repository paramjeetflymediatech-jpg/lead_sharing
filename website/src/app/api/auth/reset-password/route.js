
import { NextResponse } from "next/server";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req) {
    try {
        await connectToDatabase();
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { success: false, message: "Missing token or password" },
                { status: 400 }
            );
        }

        // Hash the token to compare with DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid token and not expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hash(password, 12);

        // Update user
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
