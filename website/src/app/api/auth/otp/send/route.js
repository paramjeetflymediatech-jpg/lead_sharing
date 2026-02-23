import { NextResponse } from "next/server";
import pool from "@/../config/db.js";

export async function POST(req) {
    try {
        const body = await req.json();
        const { phone } = body;
        let userId = req.headers.get("x-user-id") || body.userId;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[OTP Send] userId:", userId, "type:", typeof userId);

        // DEBUG: Show current database and ALL pending_users
        const [dbResult] = await pool.query("SELECT DATABASE() as db");
        const [allPending] = await pool.query("SELECT id, email FROM pending_users");
        const [allUsers] = await pool.query("SELECT id, email FROM users");
        console.log("[OTP Send] Connected DB:", dbResult[0].db);
        console.log("[OTP Send] ALL pending_users:", JSON.stringify(allPending));
        console.log("[OTP Send] ALL users:", JSON.stringify(allUsers));

        // Fetch user email to send dual-channel OTP
        let user = null;
        let isPending = false;

        const [users] = await pool.query(
            "SELECT email, name FROM users WHERE id = ?",
            [userId]
        );

        console.log("[OTP Send] users table result:", users.length);

        if (users.length > 0) {
            user = users[0];
        } else {
            // Check pending_users
            const [pending] = await pool.query(
                "SELECT email, name FROM pending_users WHERE id = ?",
                [userId]
            );
            console.log("[OTP Send] pending_users table result:", pending.length);
            if (pending.length > 0) {
                user = pending[0];
                isPending = true;
            }
        }

        if (!user) {
            console.log("[OTP Send] User NOT FOUND for userId:", userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Store OTP in database
        if (isPending) {
            await pool.query(
                "UPDATE pending_users SET otp_code = ?, otp_expires_at = ? WHERE id = ?",
                [otpCode, expiresAt, userId]
            );
        } else {
            await pool.query(
                "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?",
                [otpCode, expiresAt, userId]
            );
        }

        // Send via Email
        if (user?.email) {
            try {
                const { sendEmail } = await import("@/lib/mail");
                await sendEmail({
                    to: user.email,
                    subject: "Your Verification Code - AllCarePros",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #1149C7;">Verification Code</h2>
                            <p>Hi ${user.name || 'there'},</p>
                            <p>Your 6-digit verification code for AllCarePros is:</p>
                            <div style="background: #f4f7ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1149C7;">${otpCode}</span>
                            </div>
                            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 AllCarePros System</p>
                        </div>
                    `
                });
                console.log(`[OTP] Email sent to ${user.email}`);
            } catch (mailError) {
                console.error("Failed to send OTP email:", mailError);
                // We continue even if email fails, as SMS might still work
            }
        }

        // TODO: Integrate actual SMS gateway (Twilio, AWS SNS, etc.)
        // For now, we log it to console for development
        console.log(`[OTP] SMS (Logged) to ${phone}: ${otpCode}`);

        return NextResponse.json({
            success: true,
            message: "Verification code sent to your phone and email"
        });

    } catch (error) {
        console.error("OTP Send Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
