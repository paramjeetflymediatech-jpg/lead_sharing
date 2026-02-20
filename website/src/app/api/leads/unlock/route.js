import { NextResponse } from "next/server";
import db from "../../../../../config/db";

const LEAD_COST = 1;
const MAX_LEADS_PER_JOB = 3;

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized. Only tradespersons can unlock leads."
      }, { status: 403 });
    }

    const { jobId, message, priceEstimate } = await req.json();

    // Validate inputs
    if (!jobId || !message || !priceEstimate) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: jobId, message, or priceEstimate"
      }, { status: 400 });
    }

    // Get job details
    const [jobs] = await db.query(
      `SELECT * FROM jobs WHERE id = ? LIMIT 1`,
      [jobId]
    );

    if (!jobs || jobs.length === 0 || jobs[0].status !== "OPEN") {
      return NextResponse.json({
        success: false,
        message: "Job not available or already closed"
      }, { status: 400 });
    }

    const job = jobs[0];

    // Get tradesperson profile
    const [profiles] = await db.query(
      `SELECT * FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tradesperson profile not found"
      }, { status: 404 });
    }

    const profile = profiles[0];
    console.log("UNLOCK DEBUG: Profile retrieved:", profile);

    if (!profile.id) {
      console.error("UNLOCK DEBUG: Profile ID is missing", profile);
      return NextResponse.json({
        success: false,
        message: "Invalid tradesperson profile data"
      }, { status: 500 });
    }

    // Check credits
    if (profile.credits < LEAD_COST) {
      return NextResponse.json({
        success: false,
        message: "Not enough credits. Please top up your credits first."
      }, { status: 400 });
    }

    // Check lead count for this job
    const [leadCountResult] = await db.query(
      `SELECT COUNT(*) as count FROM leads WHERE job_id = ? AND is_unlocked = TRUE`,
      [jobId]
    );

    const leadCount = leadCountResult[0].count;

    if (leadCount >= MAX_LEADS_PER_JOB) {
      return NextResponse.json({
        success: false,
        message: `This job already has ${leadCount} leads. Maximum ${MAX_LEADS_PER_JOB} leads allowed.`
      }, { status: 400 });
    }

    // Check if already unlocked (leads.tradesperson_id = tradesperson_profiles.id)
    const [existingLeads] = await db.query(
      `SELECT * FROM leads WHERE job_id = ? AND tradesperson_id = ? AND is_unlocked = TRUE LIMIT 1`,
      [jobId, profile.id]
    );

    if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json({
        success: false,
        message: "You have already unlocked this lead"
      }, { status: 400 });
    }

    // Sanitize price estimate (remove currency symbols, commas, etc.)
    const cleanPrice = priceEstimate.toString().replace(/[^0-9.]/g, '');

    // Validate price range for DECIMAL(10,2)
    const numericPrice = parseFloat(cleanPrice);
    if (cleanPrice.length > 10 || isNaN(numericPrice) || numericPrice > 99999999.99) {
      return NextResponse.json({
        success: false,
        message: "Invalid price estimate. Maximum allowed value is 99,999,999.99"
      }, { status: 400 });
    }

    // Deduct credits
    await db.query(
      `UPDATE tradesperson_profiles SET credits = credits - ? WHERE user_id = ?`,
      [LEAD_COST, userId]
    );

    // Create lead entry (tradesperson_id = tradesperson_profiles.id)
    let leadResult;
    try {
      const [result] = await db.query(
        `INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked, unlocked_at) 
           VALUES (?, ?, ?, ?, TRUE, NOW())`,
        [jobId, profile.id, message.trim(), cleanPrice]
      );
      leadResult = result;
    } catch (err) {
      console.error("LEAD INSERT ERROR:", err);
      // Refund credits if lead creation fails
      await db.query(`UPDATE tradesperson_profiles SET credits = credits + ? WHERE user_id = ?`, [LEAD_COST, userId]);
      throw err;
    }

    // 🚀 CREATE MESSAGE AUTOMATICALLY
    try {
      await db.query(
        `INSERT INTO messages (
            sender_id, 
            receiver_id, 
            job_id, 
            content, 
            conversation_status, 
            conversation_accepted_by_homeowner, 
            conversation_accepted_by_tradesperson, 
            is_read
          ) VALUES (?, ?, ?, ?, 'PENDING_HOMEOWNER_ACCEPTANCE', FALSE, FALSE, FALSE)`,
        [userId, job.homeowner_id, jobId, message.trim()]
      );
    } catch (err) {
      console.error("MESSAGE INSERT ERROR:", err);
      // We log the error but don't fail the request since the lead was unlocked (credits deducted, lead created)
      // Optionally you could transaction rollback here if consistency is critical
    }

    return NextResponse.json({
      success: true,
      message: "Lead unlocked successfully",
      leadId: leadResult.insertId,
      contact: {
        name: job.contact_name,
        email: job.contact_email,
        phone: job.contact_phone,
      },
      remainingCredits: profile.credits - LEAD_COST,
    }, { status: 201 });

  } catch (error) {
    console.error("UNLOCK LEAD ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message,
      details: error.sqlMessage || "No SQL details"
    }, { status: 500 });
  }
}