
import { NextResponse } from "next/server";
import pool from "../../../../config/db";

/**
 * GET /api/notifications
 * Fetch notification history for the logged-in user
 */
export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit")) || 50;
        const offset = parseInt(searchParams.get("offset")) || 0;

        const [rows] = await pool.query(
            `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const [countRows] = await pool.query(
            'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
            [userId]
        );

        return NextResponse.json({
            success: true,
            notifications: rows,
            total: countRows[0].total
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(req) {
    try {
        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { ids } = await req.json();

        if (ids && Array.isArray(ids) && ids.length > 0) {
            // Mark specific notifications as read
            await pool.query(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (?)',
                [userId, ids]
            );
        } else {
            // Mark all as read
            await pool.query(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
                [userId]
            );
        }

        return NextResponse.json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.error("UPDATE NOTIFICATIONS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
