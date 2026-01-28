import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Get user info from cookies/session instead of headers
    // First, try to get from headers (for development)
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    
    // If headers are not available, try to get from query params or cookies
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log("Dashboard API Called - User ID:", userId, "Role:", role);

    // For now, allow access if we have userId (temporary fix for testing)
    if (!userId) {
      console.log("No userId found in headers");
      return NextResponse.json(
        { 
          success: false,
          message: "Authentication required",
          stats: { 
            activeJobs: 0, 
            quotesReceived: 0, 
            totalSpent: 0, 
            totalJobs: 0 
          }, 
          recentJobs: [] 
        },
        { status: 401 }
      );
    }

    // Get all jobs by this homeowner
    const jobs = await Job.find({ homeowner: userId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Found jobs for user:", userId, "Count:", jobs.length);

    // Get leads for each job
    const jobsWithLeads = await Promise.all(
      jobs.map(async (job) => {
        const leads = await Lead.find({ job: job._id })
          .populate({
            path: 'tradesperson',
            populate: {
              path: 'user',
              select: 'name email'
            }
          })
          .lean();

        return {
          ...job,
          leads: leads,
          leadCount: leads.length
        };
      })
    );

    // Calculate stats
    const stats = {
      activeJobs: jobs.filter(job => job.status === 'OPEN' || job.status === 'IN_PROGRESS').length,
      quotesReceived: jobsWithLeads.reduce((total, job) => {
        return total + (job.leadCount || 0);
      }, 0),
      totalSpent: 0, // You'll need to add payment logic for this
      totalJobs: jobs.length
    };

    // Get recent jobs (last 5)
    const recentJobs = jobsWithLeads.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats,
      recentJobs,
      allJobs: jobsWithLeads
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error",
        stats: { 
          activeJobs: 0, 
          quotesReceived: 0, 
          totalSpent: 0, 
          totalJobs: 0 
        }, 
        recentJobs: [] 
      },
      { status: 500 }
    );
  }
}