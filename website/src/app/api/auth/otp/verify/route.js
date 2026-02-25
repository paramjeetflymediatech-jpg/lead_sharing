import { NextResponse } from "next/server";
import pool from "@/../config/db.js";
import { jwtVerify } from "jose";
import { signAuthToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/serverAuth";

export async function POST(req) {
    try {
        const body = await req.json();
        const { otp } = body;

        // DEBUG: log what we received
        console.log("[OTP Verify] Received body:", JSON.stringify(body));

        // Priority: body.userId > x-user-id header > Bearer token
        let userId = body.userId || req.headers.get("x-user-id");

        if (!userId) {
            // Try to extract from Bearer token (for logged-in users like OnboardingScreen)
            const authHeader = req.headers.get("authorization");
            if (authHeader?.startsWith("Bearer ")) {
                try {
                    const token = authHeader.split(" ")[1];
                    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                    const { payload } = await jwtVerify(token, secret);
                    userId = payload.userId || payload.id;
                } catch (e) {
                    // Token invalid, userId stays null
                }
            }
        }

        console.log("[OTP Verify] userId resolved:", userId, "otp:", otp);

        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // ── 1. Check pending_users first (new signup flow) ──────────────────
        const [pendingRows] = await pool.query(
            "SELECT * FROM pending_users WHERE id = ?",
            [userId]
        );

        if (pendingRows.length > 0) {
            return await verifyPendingUser(pendingRows[0], otp);
        }

        // ── 2. Fall back to main users table (already verified users updating phone) ──
        const [rows] = await pool.query(
            "SELECT otp_code, otp_expires_at, phone_verified FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = rows[0];

        // If already verified (OTP was cleared by a previous successful call), return success
        if (user.phone_verified && !user.otp_code) {
            return NextResponse.json({
                success: true,
                message: "Phone number already verified"
                
            });
        }

        if (!user.otp_code || String(user.otp_code).trim() !== String(otp).trim()) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // Mark phone as verified and clear OTP
        await pool.query(
            "UPDATE users SET phone_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?",
            [userId]
        );

        // Sync phone to tradesperson profile if it's a tradesperson
        const [userRoleRows] = await pool.query("SELECT role, phone FROM users WHERE id = ?", [userId]);
        if (userRoleRows[0]?.role === "TRADESPERSON" && userRoleRows[0].phone) {
            await pool.query(
                "UPDATE tradesperson_profiles SET phone = ? WHERE user_id = ? AND (phone IS NULL OR phone = '')",
                [userRoleRows[0].phone, userId]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Phone number verified successfully"
        });

    } catch (error) {
        console.error("OTP Verify Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Verify OTP for a pending user, then promote them to the main users table.
 */
async function verifyPendingUser(pendingUser, otp) {
    const { id, email, password, name, role, phone, company_name, otp_code, otp_expires_at } = pendingUser;

    console.log("[verifyPendingUser] stored:", otp_code, "received:", otp, "match:", String(otp_code).trim() === String(otp).trim());

    if (!otp_code) {
        return NextResponse.json({
            error: "No active verification code found for this registration. Please click 'Resend' to get a new code."
        }, { status: 400 });
    }

    if (String(otp_code).trim() !== String(otp).trim()) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(otp_expires_at)) {
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Insert into main users table
        const [result] = await conn.query(
            `INSERT INTO users (email, password, name, role, phone, phone_verified, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
            [email, password, name, role, phone]
        );
        const newUserId = result.insertId;

        // If tradesperson, create profile
        if (role === "TRADESPERSON" && company_name) {
            await conn.query(
                `INSERT INTO tradesperson_profiles (user_id, company_name, phone, credits, created_at, updated_at)
                 VALUES (?, ?, ?, 5, NOW(), NOW())`,
                [newUserId, company_name, phone]
            );
        }

        // Delete from pending_users
        await conn.query("DELETE FROM pending_users WHERE id = ?", [id]);

        await conn.commit();

        // Generate token for the newly promoted user
        const token = signAuthToken({ userId: newUserId.toString(), role });

        // Auto-login the user
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            message: "Account verified successfully!",
            token,
            id: newUserId.toString(),
            userId: newUserId.toString(), // Keep for compatibility
            email,
            role,
            name,
            phone,
            phoneVerified: true,
            verificationStatus: role === "TRADESPERSON" ? "NOT_STARTED" : undefined
        });
    } catch (error) {
        await conn.rollback();
        console.error("verifyPendingUser Error:", error);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    } finally {
        conn.release();
    }
}
