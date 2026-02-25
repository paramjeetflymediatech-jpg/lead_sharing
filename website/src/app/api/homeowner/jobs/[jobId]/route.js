// import { NextResponse } from "next/server";
// // import { connectToDatabase } from "@/lib/mongodb";
// import Job from "@/models/Job"; // ✅ IMPORTANT: Import Job model first
// import { Lead } from "@/models/Lead";

// export async function GET(req, context) {
//   try {
//     // await connectToDatabase();

//     // ✅ Await params in Next.js 15+
//     const params = await context.params;
//     const jobId = params.jobId;

//     // ✅ Validate jobId exists
//     if (!jobId || jobId === 'undefined') {
//       return NextResponse.json(
//         { success: false, message: "Invalid job ID" },
//         { status: 400 }
//       );
//     }

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     // 🔐 Auth check
//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 403 }
//       );
//     }

//     console.log("Fetching job details for jobId:", jobId, "userId:", userId);

//     // 🔎 Fetch job with populated fields
//     const job = await Job.findOne({
//       _id: jobId,
//       homeowner: userId,
//     })
//       ;

//     if (!job) {
//       return NextResponse.json(
//         { success: false, message: "Job not found or access denied" },
//         { status: 404 }
//       );
//     }

//     // Count leads for this job
//     const leadCount = await Lead.countDocuments({ job: jobId });

//     return NextResponse.json({
//       success: true,
//       data: {
//         ...job,
//         leadCount,
//       },
//     });
//   } catch (err) {
//     console.error("GET JOB DETAILS ERROR:", err);
//     return NextResponse.json(
//       { success: false, message: "Server error", error: err.message },
//       { status: 500 }
//     );
//   }
// }












import { NextResponse } from "next/server";
import db from "../../../../../../config/db"

export async function GET(req, context) {
  try {
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

    const [jobs] = await db.query(
      `SELECT 
        j.id,
        j.homeowner_id,
        j.category_id,
        j.sub_category_id,
        j.postcode,
        j.city,
        j.description,
        j.budget_min,
        j.budget_max,
        j.status,
        j.media,
        j.hired_tradesperson_id,
        j.hired_at,
        j.has_rated,
        j.created_at,
        j.updated_at,
        c.id as category_id,
        c.name as category_name,
        sc.id as subcategory_id,
        sc.name as subcategory_name,
        tp.company_name as hired_tradesperson_name
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN tradesperson_profiles tp ON j.hired_tradesperson_id = tp.user_id
      WHERE j.id = ? AND j.homeowner_id = ?
      LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    const job = jobs[0];

    // Parse media JSON
    try {
      if (job.media && typeof job.media === 'string') {
        job.media = JSON.parse(job.media);
      } else if (!Array.isArray(job.media)) {
        job.media = [];
      }
    } catch (e) {
      job.media = [];
    }

    // Build flat image URLs array
    const mediaList = Array.isArray(job.media) ? job.media : [];
    const images = mediaList
      .filter(m => m && (typeof m === 'string' ? m : m.url))
      .map(m => (typeof m === 'string' ? m : m.url));

    // Count leads for this job
    const [leadCountResult] = await db.query(
      `SELECT COUNT(*) as count FROM leads WHERE job_id = ?`,
      [jobId]
    );

    const leadCount = leadCountResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        media: mediaList,
        images,
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