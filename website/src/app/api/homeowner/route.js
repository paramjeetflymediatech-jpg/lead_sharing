import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

export async function GET(req) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Get all jobs for this homeowner
    const allJobs = await Job.find({ homeowner: userId });
    
    // Count active jobs (OPEN or IN_PROGRESS)
    const activeJobs = allJobs.filter(
      job => job.status === "OPEN" || job.status === "IN_PROGRESS"
    );

    // Get total quotes received across all jobs
    const jobIds = allJobs.map(job => job._id);
    const totalQuotes = await Lead.countDocuments({ 
      job: { $in: jobIds } 
    });

    // Get recent jobs (last 5)
    const recentJobs = await Job.find({ homeowner: userId })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        activeJobs: activeJobs.length,
        quotesReceived: totalQuotes,
        totalSpent: 0, // You can implement payment tracking later
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