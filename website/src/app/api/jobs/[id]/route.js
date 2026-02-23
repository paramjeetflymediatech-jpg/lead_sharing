import { NextResponse } from "next/server";
import pool from "../../../../../config/db";

const MAX_LEADS_PER_JOB = 3;

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // Fetch the job (with category and subcategory names)
    const [jobs] = await pool.query(
      `SELECT 
        j.*,
        u.name as homeowner_name,
        u.email as homeowner_email,
        u.phone as homeowner_phone,
        c.name as category_name,
        sc.name as subcategory_name
      FROM jobs j
      LEFT JOIN users u ON j.homeowner_id = u.id
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      WHERE j.id = ?`,
      [id]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const job = jobs[0];

    // Parse media JSON if it's a string
    try {
      if (job.media && typeof job.media === 'string') {
        job.media = JSON.parse(job.media);
      } else if (!Array.isArray(job.media)) {
        job.media = [];
      }
    } catch (e) {
      console.error("Error parsing media JSON:", e);
      job.media = [];
    }

    // Check if this tradesperson has unlocked this job
    let isUnlocked = false;
    let contactInfo = null;

    if (userId && role === "TRADESPERSON") {
      // Get tradesperson profile ID
      const [profileRows] = await pool.query(
        `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );

      if (profileRows && profileRows.length > 0) {
        const tradespersonProfileId = profileRows[0].id;
        // Check for unlocked lead using profile id
        const [leadRows] = await pool.query(
          `SELECT id FROM leads WHERE job_id = ? AND tradesperson_id = ? AND is_unlocked = 1 LIMIT 1`,
          [id, tradespersonProfileId]
        );

        if (leadRows && leadRows.length > 0) {
          isUnlocked = true;
          // Return contact info if unlocked
          contactInfo = {
            name: job.contact_name || job.homeowner_name,
            email: job.contact_email || job.homeowner_email,
            phone: job.contact_phone || job.homeowner_phone,
          };
        }
      }
    }

    // For homeowners, show contact info if it's their job
    if (role === "HOMEOWNER") {
      // Check if current user is the homeowner
      const [homeownerCheck] = await pool.query(
        `SELECT id FROM jobs WHERE id = ? AND homeowner_id = ?`,
        [id, userId]
      );

      if (homeownerCheck && homeownerCheck.length > 0) {
        isUnlocked = true;
        contactInfo = {
          name: job.contact_name || job.homeowner_name,
          email: job.contact_email || job.homeowner_email,
          phone: job.contact_phone || job.homeowner_phone,
        };
      }
    }

    // Get unlocked lead count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as count FROM leads WHERE job_id = ? AND is_unlocked = 1`,
      [id]
    );
    const leadCount = countRows[0]?.count || 0;

    // Build media array (urls for images)
    const mediaList = Array.isArray(job.media) ? job.media : [];
    const imageUrls = mediaList
      .filter((m) => m && (typeof m === "string" ? m : m.url))
      .map((m) => (typeof m === "string" ? m : m.url));

    // Construct response
    const response = {
      _id: job.id, // For mobile app compatibility
      id: job.id,
      category_id: job.category_id,
      sub_category_id: job.sub_category_id,
      category_name: job.category_name || null,
      subcategory_name: job.subcategory_name || null,
      description: job.description,
      postcode: job.postcode,
      city: job.city,
      start_time: job.start_time,
      job_stage: job.job_stage,
      ownership: job.ownership,
      property_type: job.property_type,
      budget_min: job.budget_min,
      budget_max: job.budget_max,
      status: job.status,
      created_at: job.created_at,
      media: mediaList,
      images: imageUrls,
      homeowner: {
        name: job.homeowner_name || "Homeowner",
        // Don't include ID/email/phone unless unlocked or authorized
      },
      leadCount: leadCount,
      maxLeads: MAX_LEADS_PER_JOB,
      is_unlocked: isUnlocked, // ⭐ Important for mobile app
      isUnlocked: isUnlocked,   // CamelCase alternative
      canUnlock: leadCount < MAX_LEADS_PER_JOB && !isUnlocked,
    };

    // Add contact info if unlocked
    if (isUnlocked && contactInfo) {
      response.contact = contactInfo;
      response.homeowner_phone = contactInfo.phone; // Direct access for some app versions
      response.homeowner_email = contactInfo.email;
      response.homeowner_name = contactInfo.name;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("❌ JOB DETAIL ERROR:", err);
    console.error("Error stack:", err.stack); // Log stack trace
    return NextResponse.json(
      { message: "Invalid job id or server error", error: err.message },
      { status: 500 }
    );
  }
}
