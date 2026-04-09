import { NextResponse } from "next/server";
import { DeletionRequest } from "@/models/DeletionRequest";
import pool from '@/../config/db.js';
export async function POST(req) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Find pending request
        const existingRequest = await DeletionRequest.findOne({
            user_id: userId,
            status: "PENDING",
        });

        if (!existingRequest) {
            return NextResponse.json(
                { message: "No pending deletion request found" },
                { status: 404 }
            );
        }

        const id = existingRequest.id || existingRequest._id;

                // Reset user's deletion pending flag
                await pool.query(
                    'UPDATE users SET is_deletion_pending = FALSE, deletion_requested_at = NULL WHERE id = ?',
                    [userId]
                );

                const deleted = await DeletionRequest.findByIdAndDelete(id);

                if (!deleted) {
                    return NextResponse.json({ message: "Failed to cancel request" }, { status: 500 });
                }
        return NextResponse.json(
            { message: "Deletion request cancelled successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("CANCEL DELETION REQUEST ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
