import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";

import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

// ✅ IMPORTANT: register populate schemas
import "@/models/Category";
import "@/models/SubCategory";

export async function GET(req) {
  try {
    // await connectToDatabase();

    // Get user ID from headers (authentication से)
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    console.log("Homeowner My Jobs API - User ID:", userId, "Role:", role);

    // Authentication check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Only homeowners can view their jobs."
        },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Optional: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Build query - सिर्फ इस homeowner के jobs
    const query = { homeowner: userId };

    // Status filter (अगर दिया गया हो)
    if (status && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      query.status = status;
    }

    // Get jobs with pagination
    const jobs = await Job.find(query) // नए jobs पहले
      ;

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    // हर job के leads की जानकारी लें
    const jobsWithLeads = await Promise.all(
      jobs.map(async (job) => {
        const leads = await Lead.find({ job: job._id }) // नए leads पहले
          ;

        return {
          _id: job._id,
          // Job details
          category: job.category,
          subCategory: job.subCategory,
          description: job.description,
          location: job.location,
          startTime: job.startTime,
          jobStage: job.jobStage,
          ownership: job.ownership,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          media: job.media || [],
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          // Leads information
          leads: leads,
          leadCount: leads.length,
          hasLeads: leads.length > 0,
          // Latest lead (अगर हो)
          latestLead: leads.length > 0 ? {
            tradespersonName: leads[0].tradesperson?.user?.name || 'Unknown',
            message: leads[0].message,
            priceEstimate: leads[0].priceEstimate,
            receivedAt: leads[0].createdAt
          } : null
        };
      })
    );

    // Statistics calculate करें
    const totalOpenJobs = await Job.countDocuments({ homeowner: userId, status: "OPEN" });
    const totalInProgressJobs = await Job.countDocuments({ homeowner: userId, status: "IN_PROGRESS" });
    const totalCompletedJobs = await Job.countDocuments({ homeowner: userId, status: "COMPLETED" });
    const totalCancelledJobs = await Job.countDocuments({ homeowner: userId, status: "CANCELLED" });

    // कुल leads count
    const jobIds = jobs.map(job => job._id);
    const totalLeads = await Lead.countDocuments({ job: { $in: jobIds } });

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobsWithLeads,
        summary: {
          totalJobs: totalJobs,
          activeJobs: totalOpenJobs + totalInProgressJobs,
          completedJobs: totalCompletedJobs,
          cancelledJobs: totalCancelledJobs,
          totalLeads: totalLeads,
          leadsByStatus: {
            open: totalOpenJobs,
            in_progress: totalInProgressJobs,
            completed: totalCompletedJobs,
            cancelled: totalCancelledJobs
          }
        },
        pagination: {
          currentPage: page,
          limit: limit,
          totalItems: totalJobs,
          totalPages: Math.ceil(totalJobs / limit),
          hasNextPage: page < Math.ceil(totalJobs / limit),
          hasPrevPage: page > 1
        },
        filters: {
          appliedStatus: status || 'all',
          userId: userId
        }
      },
      message: "Jobs retrieved successfully"
    });

  } catch (error) {
    console.error("HOMEOWNER MY JOBS API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message
      },
      { status: 500 }
    );
  }
}


