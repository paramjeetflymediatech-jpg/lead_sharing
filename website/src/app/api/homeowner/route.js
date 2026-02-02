import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";

// ✅ REGISTER ALL MODELS USED IN POPULATE
import "@/models/Category";
import "@/models/SubCategory";

import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

export async function GET(req) {
  try {
    // await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Get all jobs for this homeowner
    const allJobs = await Job.find({ homeowner: userId });

    // Count active jobs
    const activeJobs = allJobs.filter(
      job => job.status === "OPEN" || job.status === "IN_PROGRESS"
    );

    // Get total quotes - simplified for MySQL stubs
    const totalQuotes = 0; // TODO: Implement when Lead.countDocuments is ready

    // Get recent jobs - simplified without populate
    const recentJobs = allJobs.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        activeJobs: activeJobs.length,
        quotesReceived: totalQuotes,
        totalSpent: 0,
        totalJobs: allJobs.length,
      },
      recentJobs,
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}