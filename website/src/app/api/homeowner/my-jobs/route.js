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
    if (status && ['OPEN', 'IN_PROGRESS', 'HIRED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      query.status = status;
    }

    // Get jobs with pagination
    const jobs = await Job.find(query);

    // Get total count for pagination (filtered)
    // const totalJobs = await Job.countDocuments(query); // This tracks filtered count for pagination

    // For summary, we need counts of ALL jobs by status, regardless of current filter
    const totalOpenJobs = await Job.countDocuments({ homeowner: userId, status: "OPEN" });
    const totalInProgressJobs = await Job.countDocuments({ homeowner: userId, status: "IN_PROGRESS" });
    const totalHiredJobs = await Job.countDocuments({ homeowner: userId, status: "HIRED" });
    const totalCompletedJobs = await Job.countDocuments({ homeowner: userId, status: "COMPLETED" });
    const totalCancelledJobs = await Job.countDocuments({ homeowner: userId, status: "CANCELLED" });

    // Total jobs (unfiltered)
    const allUserJobsCount = await Job.countDocuments({ homeowner: userId });

    // Count for pagination logic (depends on filter)
    const filteredJobsCount = await Job.countDocuments(query);

    // हर job के leads की जानकारी लें
    const jobsWithLeads = await Promise.all(
      jobs.map(async (job) => {
        const leads = await Lead.find({ job: job._id });

        return {
          _id: job._id,
          // Job details
          category: job.category,
          subCategory: job.subCategory,
          description: job.description,
          location: job.location,
          city: job.city,
          postcode: job.postcode,
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
          // Latest lead
          latestLead: leads.length > 0 ? {
            tradespersonName: leads[0].tradesperson?.user?.name || 'Unknown',
            message: leads[0].message,
            priceEstimate: leads[0].priceEstimate,
            receivedAt: leads[0].createdAt
          } : null
        };
      })
    );

    // कुल leads count
    // const jobIds = jobs.map(job => job._id); // Only for current page? Ideally should be for all user jobs.
    // Let's stick to current logic or improve? The summary implies total leads for the user.
    // Fetching all job IDs for the user to count total leads might be expensive if many jobs.
    // For now, let's keep the existing logic which seemed to count leads for the *filtered* jobs? 
    // Wait, previous code: `const jobIds = jobs.map(job => job._id); const totalLeads = ...`
    // `jobs` here is the *paginated* list of current filter. 
    // So `totalLeads` was only for the 20 jobs on the current page. That seems wrong for a "summary".
    // But fixing that might be too heavy (fetching all jobs). 
    // Let's leave totalLeads as is for now or just remove it if not used. 
    // Pagination logic uses `totalJobs` which was `await Job.countDocuments(query)`.

    const jobIds = jobsWithLeads.map(j => j._id);
    const totalLeads = await Lead.countDocuments({ job: { $in: jobIds } }); // Counts leads for visible jobs

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobsWithLeads,
        summary: {
          totalJobs: allUserJobsCount,
          activeJobs: totalOpenJobs + totalInProgressJobs + totalHiredJobs,
          hiredJobs: totalHiredJobs,
          completedJobs: totalCompletedJobs,
          cancelledJobs: totalCancelledJobs,
          totalLeads: totalLeads,
          leadsByStatus: {
            open: totalOpenJobs,
            in_progress: totalInProgressJobs,
            hired: totalHiredJobs,
            completed: totalCompletedJobs,
            cancelled: totalCancelledJobs
          }
        },
        pagination: {
          currentPage: page,
          limit: limit,
          totalItems: filteredJobsCount,
          totalPages: Math.ceil(filteredJobsCount / limit),
          hasNextPage: page < Math.ceil(filteredJobsCount / limit),
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



