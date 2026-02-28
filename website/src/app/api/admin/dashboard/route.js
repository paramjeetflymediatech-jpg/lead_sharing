import { NextResponse } from "next/server";
import db from "../../../../../config/db";

export async function GET() {
  try {
    // Get all counts in parallel for performance
    const [
      [usersResult],
      [homeownersResult],
      [tradespeopleResult],
      [jobsResult],
      [leadsResult],
      [revenueResult],
      [pendingVerificationsResult]
    ] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM users WHERE role != 'ADMIN'"),
      db.query("SELECT COUNT(*) as count FROM users WHERE role = 'HOMEOWNER'"),
      db.query("SELECT COUNT(*) as count FROM users WHERE role = 'TRADESPERSON'"),
      db.query("SELECT COUNT(*) as count FROM jobs"),
      db.query("SELECT COUNT(*) as count FROM leads"),
      db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"),
      db.query("SELECT COUNT(*) as count FROM tradesperson_profiles WHERE verification_status = 'PENDING_APPROVAL'")
    ]);

    const totalUsers = usersResult[0].count;
    const totalHomeowners = homeownersResult[0].count;
    const totalTradespeople = tradespeopleResult[0].count;
    const totalJobs = jobsResult[0].count;
    const totalLeads = leadsResult[0].count;
    const revenue = parseFloat(revenueResult[0].total || 0).toFixed(2);
    const pendingVerifications = pendingVerificationsResult[0].count;

    return NextResponse.json(
      {
        totalUsers,
        totalHomeowners,
        totalTradespeople,
        totalJobs,
        totalLeads,
        revenue,
        pendingVerifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
