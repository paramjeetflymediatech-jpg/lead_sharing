import { NextResponse } from "next/server";
import pool from "@/../config/db.js";
import { sendSMS } from "@/lib/sms";

export async function POST(req) {
    try {
        const body = await req.json();
        // Priority: body.userId > x-user-id header (Register flow needs body.userId to override stale cookies)
        let userId = body.userId || req.headers.get("x-user-id");
        let phone = body.phone; // Fallback, but we'll try to get it from DB

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized or User ID missing" }, { status: 401 });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        console.log("[OTP Send] userId:", userId, "type:", typeof userId);

        // Fetch user info from database
        let user = null;
        let isPending = false;

        // Try pending_users first (new signup flow)
        const [pending] = await pool.query(
            "SELECT email, name, phone FROM pending_users WHERE id = ?",
            [userId]
        );

        if (pending.length > 0) {
            user = pending[0];
            isPending = true;
        } else {
            // Check main users table
            const [users] = await pool.query(
                "SELECT email, name, phone FROM users WHERE id = ?",
                [userId]
            );
            if (users.length > 0) {
                user = users[0];
            }
        }

        if (!user) {
            // DEBUG: Show why it failed
            const [allPending] = await pool.query("SELECT id, email FROM pending_users");
            console.log("[OTP Send] User NOT FOUND for userId:", userId);
            console.log("[OTP Send] Current pending_users IDs:", allPending.map(p => p.id));
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Use phone from database primarily
        if (user.phone) {
            phone = user.phone;
        }

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
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

        // Send via SMS
        console.log(`[OTP] Sending SMS to ${phone}: ${otpCode}`);
        try {
            const smsResult = await sendSMS({
                to: phone,
                message: `Your AllCarePros verification code is: ${otpCode}. Valid for 10 minutes.`
            });

            if (!smsResult.success) {
                console.error("[OTP] SMS delivery failed:", smsResult.error);
                // We proceed since email was sent, but this is a warning
            } else {
                console.log("[OTP] SMS sent successfully");
            }
        } catch (smsError) {
            console.error("[OTP] SMS error:", smsError);
        }

        return NextResponse.json({
            success: true,
            message: "Verification code sent to your phone and email"
        });

    } catch (error) {
        console.error("OTP Send Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
