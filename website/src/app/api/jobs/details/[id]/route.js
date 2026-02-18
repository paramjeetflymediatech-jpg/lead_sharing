import { NextResponse } from "next/server";
import db from "../../../../../../config/db";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const jobId = params.id;

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get job with hired tradesperson info and rating
    const [jobs] = await db.query(
      `SELECT 
        j.*,
        c.name as category_name,
        sc.name as subcategory_name,
        tp.id as hired_tradesperson_id,
        tp.company_name as hired_tradesperson_name,
        tr.rating as rating_value,
        tr.review as rating_review
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN tradesperson_profiles tp ON j.hired_tradesperson_id = tp.user_id
      LEFT JOIN tradesperson_ratings tr ON j.id = tr.job_id
      WHERE j.id = ? AND j.homeowner_id = ?
      LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    const job = jobs[0];

    // Format response
    const response = {
      _id: job.id,
      status: job.status,
      description: job.description,
      budgetMin: job.budget_min,
      budgetMax: job.budget_max,
      createdAt: job.created_at,
      rating: job.rating_value,

      category: { name: job.category_name },
      subCategory: { name: job.subcategory_name },
      location: {
        city: job.city,
        postcode: job.postcode
      },

      // Hired tradesperson info
      hiredTradesperson: job.hired_tradesperson_id ? {
        _id: job.hired_tradesperson_id,
        companyName: job.hired_tradesperson_name || 'Tradesperson'
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch job" },
      { status: 500 }
    );
  }
}