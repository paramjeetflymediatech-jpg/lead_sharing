import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

export async function GET(req, context) {
  try {
    // await connectToDatabase();

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
    const job = await Job.findById(jobId);

    // Handle both populated object and direct ID
    const ownerId = job?.homeowner?._id || job?.homeowner;

    // Use String comparison for IDs to be safe
    if (!job || String(ownerId) !== String(userId)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 📋 Fetch all leads for this job (simplified - no populate for MySQL stubs)
    const leads = await Lead.find({ job: jobId });

    console.log(`Found ${leads.length} leads for job ${jobId}`);

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (err) {
    console.error("GET LEADS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}