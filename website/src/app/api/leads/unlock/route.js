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

    // Check if already unlocked
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

    // Deduct credits
    await db.query(
      `UPDATE tradesperson_profiles SET credits = credits - ? WHERE user_id = ?`,
      [LEAD_COST, userId]
    );

    // Create lead entry
    const [leadResult] = await db.query(
      `INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked, unlocked_at) 
       VALUES (?, ?, ?, ?, TRUE, NOW())`,
      [jobId, profile.id, message.trim(), priceEstimate.trim()]
    );

    // 🚀 CREATE MESSAGE AUTOMATICALLY
    // This creates the first message in the conversation with PENDING_HOMEOWNER_ACCEPTANCE status
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
      error: error.message
    }, { status: 500 });
  }
}