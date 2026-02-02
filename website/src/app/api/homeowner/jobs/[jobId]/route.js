import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job"; // ✅ IMPORTANT: Import Job model first
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

    // 🔐 Auth check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("Fetching job details for jobId:", jobId, "userId:", userId);

    // 🔎 Fetch job with populated fields
    const job = await Job.findOne({
      _id: jobId,
      homeowner: userId,
    })
      ;

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    // Count leads for this job
    const leadCount = await Lead.countDocuments({ job: jobId });

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        leadCount,
      },
    });
  } catch (err) {
    console.error("GET JOB DETAILS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}