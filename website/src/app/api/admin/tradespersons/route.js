import { NextResponse } from "next/server";
import pool from "../../../../../config/db.js";

export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "PENDING_APPROVAL";

        // Fetch tradespersons based on verification status
        const [rows] = await pool.query(
            `SELECT 
                tp.*, 
                u.name, 
                u.email, 
                u.phone,
                u.phone_verified
            FROM tradesperson_profiles tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.verification_status = ?
            ORDER BY tp.updated_at DESC`,
            [status]
        );

        return NextResponse.json({ success: true, data: rows });

    } catch (error) {
        console.error("Admin Fetch Tradespersons Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { profileId, status, rejectionReason } = await req.json();

        if (!profileId || !status) {
            return NextResponse.json({ error: "Profile ID and Status are required" }, { status: 400 });
        }

        // Update verification status
        await pool.query(
            `UPDATE tradesperson_profiles 
             SET verification_status = ?, 
                 rejection_reason = ?,
                 updated_at = NOW() 
             WHERE id = ?`,
            [status, rejectionReason || null, profileId]
        );

        return NextResponse.json({
            success: true,
            message: `Tradesperson profile ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error("Admin Update Tradesperson Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
