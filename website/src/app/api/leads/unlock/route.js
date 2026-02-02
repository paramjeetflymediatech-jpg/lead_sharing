
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";

const LEAD_COST = 1;
const MAX_LEADS_PER_JOB = 3;

export async function POST(req) {
  try {
    // await connectToDatabase();

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

    const job = await Job.findById(jobId);
    if (!job || job.status !== "OPEN") {
      return NextResponse.json({
        success: false,
        message: "Job not available or already closed"
      }, { status: 400 });
    }

    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json({
        success: false,
        message: "Tradesperson profile not found"
      }, { status: 404 });
    }

    // Check credits
    if (profile.credits < LEAD_COST) {
      return NextResponse.json({
        success: false,
        message: "Not enough credits. Please top up your credits first."
      }, { status: 400 });
    }

    // Check lead count for this job
    const leadCount = await Lead.countDocuments({
      job: jobId,
      isUnlocked: true
    });

    if (leadCount >= MAX_LEADS_PER_JOB) {
      return NextResponse.json({
        success: false,
        message: `This job already has ${leadCount} leads. Maximum ${MAX_LEADS_PER_JOB} leads allowed.`
      }, { status: 400 });
    }

    // Check if already unlocked
    const existingLead = await Lead.findOne({
      job: jobId,
      tradesperson: profile._id,
      isUnlocked: true,
    });

    if (existingLead) {
      return NextResponse.json({
        success: false,
        message: "You have already unlocked this lead"
      }, { status: 400 });
    }

    // Deduct credits and update profile
    await TradespersonProfile.findByIdAndUpdate(profile._id, {
      credits: profile.credits - LEAD_COST
    });

    const lead = await Lead.create({
      job: jobId,
      tradesperson: profile._id,
      message: message.trim(),
      priceEstimate: priceEstimate.trim(),
      isUnlocked: true,
      unlockedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Lead unlocked successfully",
      leadId: lead._id,
      contact: {
        name: job.contactName,
        email: job.contactEmail,
        phone: job.contactPhone,
      },
      remainingCredits: profile.credits,
    }, { status: 201 });

  } catch (error) {
    console.error("UNLOCK LEAD ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}