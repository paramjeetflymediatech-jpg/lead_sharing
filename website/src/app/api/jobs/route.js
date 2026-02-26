import { NextResponse } from "next/server";
import pool from "../../../../config/db";

const MAX_LEADS_PER_JOB = 3;

/* =========================
   GET JOB LIST WITH LEAD INFO (FOR TRADESPERSON)
========================= */
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "OPEN";
    const limit = parseInt(searchParams.get("limit")) || 20;

    console.log(`📋 Fetching jobs for user ${userId} with status: ${status}`);

    // Get tradesperson profile ID if logged in as tradesperson
    let tradespersonProfileId = null;
    if (userId && role === "TRADESPERSON") {
      const [profileRows] = await pool.query(
        `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
        [userId]
      );

      if (profileRows && profileRows.length > 0) {
        tradespersonProfileId = profileRows[0].id;
      } else {
        // Create default profile if it doesn't exist
        const [userRows] = await pool.query(
          `SELECT id, name FROM users WHERE id = ? AND role = 'TRADESPERSON' LIMIT 1`,
          [userId]
        );

        if (userRows && userRows.length > 0) {
          const [insertResult] = await pool.query(
            `INSERT INTO tradesperson_profiles 
            (user_id, company_name, phone, postcode, bio, skills, service_areas, profile_image, created_at, updated_at)
            VALUES (?, ?, '', '', 'Profile not yet completed', '[]', '[]', '', NOW(), NOW())`,
            [userId, userRows[0].name + "'s Services"]
          );
          tradespersonProfileId = insertResult.insertId;
          console.log(`✅ Created default profile with ID: ${tradespersonProfileId}`);
        }
      }
    }

    // Build query (include category and subcategory names)
    let query = `
      SELECT 
        j.*,
        u.name as homeowner_name,
        c.name as category_name,
        sc.name as subcategory_name
      FROM jobs j
      LEFT JOIN users u ON j.homeowner_id = u.id
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      WHERE j.status = ?
    `;
    const queryParams = [status];

    if (category && !isNaN(Number(category))) {
      query += ` AND j.category_id = ?`;
      queryParams.push(category);
    }

    query += ` ORDER BY j.created_at DESC LIMIT ?`;
    queryParams.push(limit);

    const [jobs] = await pool.query(query, queryParams);

    // For each job, get lead count and check if current tradesperson unlocked it
    const jobsWithLeadInfo = await Promise.all(
      jobs.map(async (job) => {
        // Count total unlocked leads for this job
        const [leadCountRows] = await pool.query(
          `SELECT COUNT(*) as count FROM leads WHERE job_id = ? AND is_unlocked = 1`,
          [job.id]
        );
        const leadCount = leadCountRows[0]?.count || 0;

        // Check if current tradesperson unlocked this job
        let isUnlockedByMe = false;
        if (tradespersonProfileId) {
          const [myLeadRows] = await pool.query(
            `SELECT id FROM leads WHERE job_id = ? AND tradesperson_id = ? AND is_unlocked = 1 LIMIT 1`,
            [job.id, tradespersonProfileId]
          );
          isUnlockedByMe = myLeadRows && myLeadRows.length > 0;
        }

        // Return job data (without sensitive contact info for non-unlocked jobs)
        return {
          _id: job.id, // Keep MongoDB style for mobile app compatibility
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
          homeowner: {
            name: job.homeowner_name || "Homeowner",
          },
          // Lead information
          leadCount: leadCount,
          maxLeads: MAX_LEADS_PER_JOB,
          is_unlocked: isUnlockedByMe, // ⭐ Important for mobile app
          isUnlockedByMe: isUnlockedByMe,
          canUnlock: leadCount < MAX_LEADS_PER_JOB && !isUnlockedByMe,
        };
      })
    );

    console.log(`✅ Returning ${jobsWithLeadInfo.length} jobs`);

    return NextResponse.json({
      success: true,
      jobs: jobsWithLeadInfo,
      data: jobsWithLeadInfo, // Also include as data for compatibility
      total: jobsWithLeadInfo.length,
    });
  } catch (error) {
    console.error("❌ JOB LIST ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE NEW JOB
========================= */
export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Unauthorized. Only homeowners can post jobs." },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("📥 Received Job Body:", body); // Debug log

    const {
      category,
      subCategory,
      description,
      propertyType,
      postcode: dataPostcode,
      location,
      city,
      startTime,
      start_time: startTimeSnake,
      jobStage,
      job_stage: jobStageSnake,
      ownership = "OWNER",
      budgetMin,
      budgetMax,
      media,
      contactName,
      contactPhone,
      contactEmail,
    } = body;
    const start_time = startTimeSnake || startTime || "WITHIN_2_WEEKS";
    const job_stage = (jobStageSnake || jobStage || "PLANNING").replace("INSURANCE_WORK", "INSURANCE");

    const postcode = dataPostcode || location?.postcode;
    const finalCity = city || location?.city || '';

    // Validate required fields
    const missingFields = [];
    if (!category) missingFields.push("category");
    if (!description) missingFields.push("description");
    if (!postcode) missingFields.push("postcode");
    if (!contactName) missingFields.push("contactName");
    if (!contactPhone) missingFields.push("contactPhone");
    if (!contactEmail) missingFields.push("contactEmail");

    if (missingFields.length > 0) {
      console.error("❌ Missing fields:", missingFields);
      console.error("📥 Body keys:", Object.keys(body)); // Log keys to see what was received
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          debug: { receivedKeys: Object.keys(body), location: location }
        },
        { status: 400 }
      );
    }

    const subCategoryId = subCategory || 0;
    const mediaJson = media ? JSON.stringify(media) : "[]";

    console.log(`📝 Creating job for user ${userId}`);

    const [result] = await pool.query(
      `INSERT INTO jobs (
        homeowner_id, 
        category_id, 
        sub_category_id, 
        description, 
        postcode, 
        city, 
        start_time, 
        job_stage, 
        ownership, 
        budget_min, 
        budget_max, 
        media, 
        contact_name, 
        contact_phone, 
        contact_email,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', NOW(), NOW())`,
      [
        userId,
        category,
        subCategoryId,
        description,
        postcode,
        city || '',
        start_time,
        job_stage,
        ownership,
        budgetMin || null,
        budgetMax || null,
        mediaJson,
        contactName,
        contactPhone,
        contactEmail
      ]
    );

    console.log(`✅ Job created with ID: ${result.insertId}`);

    // 🚀 TRIGGER NOTIFICATIONS TO RELEVANT TRADESPEOPLE
    try {
      const { sendNotification } = await import("@/lib/notifications");

      // DEBUG: Verify table structure
      const [columns] = await pool.query("SHOW COLUMNS FROM tradesperson_profiles");
      console.log("🛠️ tradesperson_profiles columns:", columns.map(c => c.Field));

      // Find tradespeople who have this category in their profile
      const [tradespeople] = await pool.query(`
        SELECT DISTINCT u.id 
        FROM users u
        JOIN tradesperson_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'TRADESPERSON' 
        AND tp.verification_status = 'APPROVED'
        AND tp.category_id = ?
      `, [category]);

      if (tradespeople.length > 0) {
        // Fetch category name
        const [catRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [category]);
        const categoryName = catRows[0]?.name || "New category";

        for (const tp of tradespeople) {
          await sendNotification(
            tp.id,
            'New Job Posted!',
            `A new ${categoryName} job has been posted in your area.`,
            { jobId: result.insertId },
            'NEW_JOB'
          );
        }
      }
    } catch (notifyErr) {
      console.error("NOTIFICATION ERROR (NEW JOB):", notifyErr);
    }

    return NextResponse.json({
      success: true,
      message: "Job posted successfully",
      jobId: result.insertId,
    });

  } catch (error) {
    console.error("❌ JOB CREATION ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}