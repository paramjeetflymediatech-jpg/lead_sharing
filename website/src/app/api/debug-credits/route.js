import { NextResponse } from "next/server";
import db from "../../../../config/db";

export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ message: "No user ID" });
        }

        const [rows] = await db.query("SELECT * FROM tradesperson_profiles WHERE user_id = ?", [userId]);
        return NextResponse.json({
            message: "Debug Credits",
            profile: rows[0] || "No profile found",
            userId
        });
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
