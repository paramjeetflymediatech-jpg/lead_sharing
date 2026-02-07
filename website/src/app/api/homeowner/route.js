// import { NextResponse } from "next/server";
// // import { connectToDatabase } from "@/lib/mongodb";

// import Job from "@/models/Job";
// import { Lead } from "@/models/Lead";

// // ✅ IMPORTANT: register populate schemas
// import "@/models/Category";
// import "@/models/SubCategory";

// export async function GET(req) {
//   try {
//     // await connectToDatabase();

//     // Get user ID from headers (authentication से)
//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     console.log("Homeowner My Jobs API - User ID:", userId, "Role:", role);

//     // Authentication check
//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Only homeowners can view their jobs."
//         },
//         { status: 401 }
//       );
//     }

//     // Get query parameters for filtering
//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get("status"); // Optional: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 20;
//     const skip = (page - 1) * limit;

//     // Build query - सिर्फ इस homeowner के jobs
//     const query = { homeowner: userId };

//     // Status filter (अगर दिया गया हो)
//     if (status && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
//       query.status = status;
//     }

//     // Get jobs with pagination
//     const jobs = await Job.find(query) // नए jobs पहले
//       ;

//     // Get total count for pagination
//     const totalJobs = await Job.countDocuments(query);

//     // हर job के leads की जानकारी लें
//     const jobsWithLeads = await Promise.all(
//       jobs.map(async (job) => {
//         const leads = await Lead.find({ job: job._id }) // नए leads पहले
//           ;

//         return {
//           _id: job._id,
//           // Job details
//           category: job.category,
//           subCategory: job.subCategory,
//           description: job.description,
//           location: job.location,
//           startTime: job.startTime,
//           jobStage: job.jobStage,
//           ownership: job.ownership,
//           budgetMin: job.budgetMin,
//           budgetMax: job.budgetMax,
//           media: job.media || [],
//           status: job.status,
//           createdAt: job.createdAt,
//           updatedAt: job.updatedAt,
//           // Leads information
//           leads: leads,
//           leadCount: leads.length,
//           hasLeads: leads.length > 0,
//           // Latest lead (अगर हो)
//           latestLead: leads.length > 0 ? {
//             tradespersonName: leads[0].tradesperson?.user?.name || 'Unknown',
//             message: leads[0].message,
//             priceEstimate: leads[0].priceEstimate,
//             receivedAt: leads[0].createdAt
//           } : null
//         };
//       })
//     );

//     // Statistics calculate करें
//     const totalOpenJobs = await Job.countDocuments({ homeowner: userId, status: "OPEN" });
//     const totalInProgressJobs = await Job.countDocuments({ homeowner: userId, status: "IN_PROGRESS" });
//     const totalCompletedJobs = await Job.countDocuments({ homeowner: userId, status: "COMPLETED" });
//     const totalCancelledJobs = await Job.countDocuments({ homeowner: userId, status: "CANCELLED" });

//     // कुल leads count
//     const jobIds = jobs.map(job => job._id);
//     const totalLeads = await Lead.countDocuments({ job: { $in: jobIds } });

//     return NextResponse.json({
//       success: true,
//       data: {
//         jobs: jobsWithLeads,
//         summary: {
//           totalJobs: totalJobs,
//           activeJobs: totalOpenJobs + totalInProgressJobs,
//           completedJobs: totalCompletedJobs,
//           cancelledJobs: totalCancelledJobs,
//           totalLeads: totalLeads,
//           leadsByStatus: {
//             open: totalOpenJobs,
//             in_progress: totalInProgressJobs,
//             completed: totalCompletedJobs,
//             cancelled: totalCancelledJobs
//           }
//         },
//         pagination: {
//           currentPage: page,
//           limit: limit,
//           totalItems: totalJobs,
//           totalPages: Math.ceil(totalJobs / limit),
//           hasNextPage: page < Math.ceil(totalJobs / limit),
//           hasPrevPage: page > 1
//         },
//         filters: {
//           appliedStatus: status || 'all',
//           userId: userId
//         }
//       },
//       message: "Jobs retrieved successfully"
//     });

//   } catch (error) {
//     console.error("HOMEOWNER MY JOBS API ERROR:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error",
//         error: error.message
//       },
//       { status: 500 }
//     );
//   }
// }











import { NextResponse } from "next/server";
import db from "../../../../config/db"

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let whereClause = "j.homeowner_id = ?";
    const params = [userId];
    
    if (status && status !== "all") {
      whereClause += " AND j.status = ?";
      params.push(status.toUpperCase());
    }

    // Get jobs with lead count and rating status
    const [jobs] = await db.query(
      `SELECT 
        j.*,
        c.name as category_name,
        sc.name as subcategory_name,
        COUNT(DISTINCT l.id) as leadCount,
        r.rating,
        CASE WHEN j.has_rated = 1 THEN 1 ELSE 0 END as hasRated,
        tp.company_name as hired_tradesperson_name
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN leads l ON j.id = l.job_id
      LEFT JOIN tradesperson_ratings r ON j.id = r.job_id
      LEFT JOIN tradesperson_profiles tp ON j.hired_tradesperson_id = tp.id
      WHERE ${whereClause}
      GROUP BY j.id
      ORDER BY j.created_at DESC`,
      params
    );

    // Format jobs
    const formattedJobs = jobs.map(job => ({
      _id: job.id,
      status: job.status,
      description: job.description,
      budgetMin: job.budget_min,
      budgetMax: job.budget_max,
      createdAt: job.created_at,
      leadCount: job.leadCount || 0,
      hasRated: Boolean(job.hasRated),
      rating: job.rating || null,
      
      category: { name: job.category_name },
      subCategory: { name: job.subcategory_name },
      location: {
        city: job.city,
        postcode: job.postcode
      }
    }));

    // Summary stats
    const summary = {
      totalJobs: formattedJobs.length,
      activeJobs: formattedJobs.filter(j => j.status === 'OPEN').length,
      hiredJobs: formattedJobs.filter(j => j.status === 'HIRED').length,
      completedJobs: formattedJobs.filter(j => j.status === 'COMPLETED').length,
      cancelledJobs: formattedJobs.filter(j => j.status === 'CANCELLED').length,
      totalLeads: formattedJobs.reduce((sum, j) => sum + j.leadCount, 0)
    };

    return NextResponse.json({
      success: true,
      data: { jobs: formattedJobs, summary }
    });
    
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


