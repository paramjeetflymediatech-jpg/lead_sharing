import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// models
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Lead } from "@/models/Lead";
import Job from "@/models/Job";

const LEAD_COST = 1;
const MAX_LEADS_PER_JOB = 3;

export async function POST(req) {
  try {
    await connectToDatabase();

    // 🔐 user from middleware
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // body
    const { jobId, message, priceEstimate } = await req.json();

    if (!jobId || !message) {
      return NextResponse.json(
        { message: "jobId and message required" },
        { status: 400 }
      );
    }

    // 1️⃣ user check
    const user = await User.findById(userId);
    if (!user || user.role !== "TRADESPERSON") {
      return NextResponse.json(
        { message: "Only tradesperson allowed" },
        { status: 403 }
      );
    }

    // 2️⃣ job check
    const job = await Job.findById(jobId);
    if (!job || job.status !== "OPEN") {
      return NextResponse.json(
        { message: "Job not available" },
        { status: 400 }
      );
    }

    // 3️⃣ profile check
    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json(
        { message: "Tradesperson profile missing" },
        { status: 400 }
      );
    }

    // 4️⃣ MAX 3 LEADS CHECK (🔥 IMPORTANT)
    const leadCount = await Lead.countDocuments({ job: jobId });

    if (leadCount >= MAX_LEADS_PER_JOB) {
      return NextResponse.json(
        { message: "Lead limit reached for this job" },
        { status: 400 }
      );
    }

    // 5️⃣ duplicate lead check
    const already = await Lead.findOne({
      job: jobId,
      tradesperson: profile._id,
    });

    if (already) {
      return NextResponse.json(
        { message: "Lead already purchased" },
        { status: 400 }
      );
    }

    // 6️⃣ credit check
    if (profile.credits < LEAD_COST) {
      return NextResponse.json(
        { message: "Not enough credits" },
        { status: 400 }
      );
    }

    // 7️⃣ deduct credit
    profile.credits -= LEAD_COST;
    await profile.save();

    // 8️⃣ create lead
    const lead = await Lead.create({
      job: jobId,
      tradesperson: profile._id,
      message,
      priceEstimate,
      isUnlocked: true,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("LEAD PURCHASE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
