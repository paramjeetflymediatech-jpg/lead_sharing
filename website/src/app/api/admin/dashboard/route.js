import { NextResponse } from "next/server";
import db from "../../../../../config/db";

export async function GET() {
  try {
    // Get total users excluding admins
    const [usersResult] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role != 'ADMIN'"
    );
    const totalUsers = usersResult[0].count;

    // Get homeowners count
    const [homeownersResult] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'HOMEOWNER'"
    );
    const totalHomeowners = homeownersResult[0].count;

    // Get tradespeople count
    const [tradespeopleResult] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'TRADESPERSON'"
    );
    const totalTradespeople = tradespeopleResult[0].count;

    // Get total jobs
    const [jobsResult] = await db.query(
      "SELECT COUNT(*) as count FROM jobs"
    );
    const totalJobs = jobsResult[0].count;

    // Get total leads
    const [leadsResult] = await db.query(
      "SELECT COUNT(*) as count FROM leads"
    );
    const totalLeads = leadsResult[0].count;

    // Get total revenue from payments
    const [revenueResult] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
    );
    const revenue = parseFloat(revenueResult[0].total || 0).toFixed(2);

    // Get pending verifications count
    const [pendingVerificationsResult] = await db.query(
      "SELECT COUNT(*) as count FROM tradesperson_profiles WHERE verification_status = 'PENDING_APPROVAL'"
    );
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
