import { NextResponse } from "next/server";
import pool from "../../../../../config/db";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Get tradesperson profile first
    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    const [rows] = await pool.query(
      `
      SELECT id, plan, amount, currency, credits, status, created_at
      FROM payments
      WHERE tradesperson_id = ?
      ORDER BY created_at DESC
      `,
      [profile.id]
    );

    return NextResponse.json({
      success: true,
      count: rows.length,
      payments: rows,
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
