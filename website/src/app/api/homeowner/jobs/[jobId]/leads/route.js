import { NextResponse } from "next/server";
import db from "../../../../../../../config/db"

export async function GET(req, context) {
  try {
    // ✅ Await params in Next.js 15+
    const params = await context.params;
    const jobId = params.jobId;

    // ✅ Validate jobId exists
    if (!jobId || jobId === 'undefined') {
      return NextResponse.json(
        { success: false, message: "Invalid job ID" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // 🔐 Auth check - only homeowners can view their job leads
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("Fetching leads for jobId:", jobId, "userId:", userId);

    // 🔎 Verify the job belongs to this homeowner
    const [jobCheck] = await db.query(
      `SELECT id, homeowner_id FROM jobs WHERE id = ? LIMIT 1`,
      [jobId]
    );

    if (!jobCheck || jobCheck.length === 0 || jobCheck[0].homeowner_id !== parseInt(userId)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 📋 Fetch all leads for this job with tradesperson details using JOIN
    const [leads] = await db.query(
      `SELECT 
        l.*,
        tp.company_name,
        tp.phone as tradesperson_phone,
        u.name as tradesperson_name,
        u.email as tradesperson_email
      FROM leads l
      LEFT JOIN tradesperson_profiles tp ON l.tradesperson_id = tp.user_id
      LEFT JOIN users u ON tp.user_id = u.id
      WHERE l.job_id = ?
      ORDER BY l.created_at DESC`,
      [jobId]
    );

    console.log(`Found ${leads.length} leads for job ${jobId}`);

    // Format the response to match what the frontend expects
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      _id: lead.id, // For backward compatibility
      job_id: lead.job_id,
      tradesperson_id: lead.tradesperson_id,
      message: lead.message,
      price_estimate: lead.price_estimate,
      status: lead.status,
      is_unlocked: lead.is_unlocked,
      created_at: lead.created_at,
      updated_at: lead.updated_at,

      // Tradesperson details
      tradesperson_name: lead.tradesperson_name || lead.company_name || "Professional",
      company_name: lead.company_name,
      phone: lead.tradesperson_phone,
      email: lead.tradesperson_email,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLeads,
      count: formattedLeads.length,
    });
  } catch (err) {
    console.error("GET LEADS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}