import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    const query = { homeowner: userId };
    if (status && status !== "all") {
      query.status = status;
    }

    // Get jobs
    const jobs = await Job.find(query)
      ;

    // Add lead count to each job
    const jobsWithLeadCount = await Promise.all(
      jobs.map(async (job) => {
        const leadCount = await Lead.countDocuments({ job: job._id });
        return {
          ...job,
          leadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithLeadCount,
    });
  } catch (error) {
    console.error("GET HOMEOWNER JOBS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}