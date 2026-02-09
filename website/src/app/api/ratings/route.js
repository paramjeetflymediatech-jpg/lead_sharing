// import { NextResponse } from "next/server";
// import { TradespersonRating } from "@/models/TradespersonRating";
// import db from "../../../../config/db";

// // POST - Create a rating
// export async function POST(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "HOMEOWNER") {
//       return NextResponse.json(
//         { success: false, message: "Only homeowners can submit ratings" },
//         { status: 403 }
//       );
//     }

//     const { jobId, tradespersonId, rating, review } = await req.json();

//     // Validation
//     if (!jobId || !tradespersonId || !rating) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (rating < 1 || rating > 5) {
//       return NextResponse.json(
//         { success: false, message: "Rating must be between 1 and 5" },
//         { status: 400 }
//       );
//     }

//     // Check if job belongs to homeowner
//     const [jobs] = await db.query(
//       `SELECT * FROM jobs 
//        WHERE id = ? AND homeowner_id = ? 
//        LIMIT 1`,
//       [jobId, userId]
//     );

//     if (!jobs || jobs.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Job not found or access denied" },
//         { status: 404 }
//       );
//     }

//     // Check if already rated
//     const existing = await TradespersonRating.findByJob(jobId);
//     if (existing) {
//       return NextResponse.json(
//         { success: false, message: "You have already rated this job" },
//         { status: 400 }
//       );
//     }

//     // Create rating
//     const ratingId = await TradespersonRating.create({
//       jobId,
//       homeownerId: userId,
//       tradespersonId,
//       rating,
//       review: review?.trim() || null
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Rating submitted successfully",
//       ratingId
//     }, { status: 201 });

//   } catch (error) {
//     console.error("Rating error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to submit rating" },
//       { status: 500 }
//     );
//   }
// }

// // GET - Fetch ratings
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");
//     const tradespersonId = searchParams.get("tradespersonId");


//     console.log("TradePersonId",tradespersonId)

//     if (jobId) {
//       const rating = await TradespersonRating.findByJob(jobId);
//       return NextResponse.json({
//         success: true,
//         rating,
//         hasRated: !!rating
//       });
//     }

//     if (tradespersonId) {
//       const ratings = await TradespersonRating.findByTradesperson(tradespersonId);
//       const stats = await TradespersonRating.getAverageRating(tradespersonId);
      
//       return NextResponse.json({
//         success: true,
//         ratings,
//         averageRating: parseFloat(stats.average_rating),
//         totalRatings: stats.total_ratings
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: "Provide jobId or tradespersonId" },
//       { status: 400 }
//     );

//   } catch (error) {
//     console.error("Fetch ratings error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch ratings" },
//       { status: 500 }
//     );
//   }
// }


///top api is working 





// import { NextResponse } from "next/server";
// import { TradespersonRating } from "@/models/TradespersonRating";
// import db from "../../../../config/db";


// // POST - Create a rating
// export async function POST(req) {
//   try {
//     // Get user info from headers
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "HOMEOWNER") {
//       return NextResponse.json(
//         { success: false, message: "Only homeowners can submit ratings" },
//         { status: 403 }
//       );
//     }

//     // Parse request body
//     const { jobId, tradespersonId, rating, review } = await req.json();

//     console.log("Received rating data:", {
//       userId,
//       userRole,
//       jobId,
//       tradespersonId,
//       rating,
//       review
//     });

//     // Validation
//     if (!jobId || !tradespersonId || !rating) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (rating < 1 || rating > 5) {
//       return NextResponse.json(
//         { success: false, message: "Rating must be between 1 and 5" },
//         { status: 400 }
//       );
//     }

//     // Validate job belongs to homeowner and is COMPLETED
//     const [jobs] = await db.query(
//       `SELECT * FROM jobs 
//        WHERE id = ? AND homeowner_id = ? AND status = 'COMPLETED'
//        LIMIT 1`,
//       [jobId, userId]
//     );

//     if (!jobs || jobs.length === 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Job not found, access denied, or job is not completed" 
//         },
//         { status: 404 }
//       );
//     }

//     const job = jobs[0];
    
//     // Check if job has hired tradesperson
//     if (!job.hired_tradesperson_id || job.hired_tradesperson_id !== tradespersonId) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "This tradesperson was not hired for this job" 
//         },
//         { status: 400 }
//       );
//     }

//     // Check if already rated
//     const existing = await TradespersonRating.findByJob(jobId);
//     if (existing) {
//       return NextResponse.json(
//         { success: false, message: "You have already rated this job" },
//         { status: 400 }
//       );
//     }

//     // Debug: Log what we're inserting
//     console.log("Creating rating with data:", {
//       jobId,
//       homeownerId: userId,
//       tradespersonId,
//       rating,
//       review: review?.trim() || null
//     });

//     // Create rating - Make sure this matches your model
//     const ratingId = await TradespersonRating.create({
//       jobId,
//       homeownerId: parseInt(userId), // Ensure it's integer
//       tradespersonId: parseInt(tradespersonId), // Ensure it's integer
//       rating,
//       review: review?.trim() || null
//     });

//     // Update job's has_rated flag
//     await db.query(
//       `UPDATE jobs SET has_rated = TRUE WHERE id = ?`,
//       [jobId]
//     );

//     // Update tradesperson profile stats
//     await db.query(
//       `UPDATE tradesperson_profiles 
//        SET average_rating = (
//          SELECT AVG(rating) FROM tradesperson_ratings 
//          WHERE tradesperson_id = ?
//        ),
//        total_ratings = (
//          SELECT COUNT(*) FROM tradesperson_ratings 
//          WHERE tradesperson_id = ?
//        )
//        WHERE user_id = ?`,
//       [tradespersonId, tradespersonId, tradespersonId]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Rating submitted successfully",
//       ratingId
//     }, { status: 201 });

//   } catch (error) {
//     console.error("Rating error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to submit rating" },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import db from "../../../../config/db";

// // POST - Create a rating
// export async function POST(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "HOMEOWNER") {
//       return NextResponse.json(
//         { success: false, message: "Only homeowners can submit ratings" },
//         { status: 403 }
//       );
//     }

//     const { jobId, tradespersonId, rating, review } = await req.json();

//     // Validation
//     if (!jobId || !tradespersonId || !rating) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (rating < 1 || rating > 5) {
//       return NextResponse.json(
//         { success: false, message: "Rating must be between 1 and 5" },
//         { status: 400 }
//       );
//     }

//     // Check job
//     const [jobs] = await db.query(
//       `SELECT * FROM jobs 
//        WHERE id = ? AND homeowner_id = ? AND status = 'COMPLETED'
//        LIMIT 1`,
//       [jobId, userId]
//     );

//     if (!jobs || jobs.length === 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Job not found or not completed" 
//         },
//         { status: 404 }
//       );
//     }

//     // Check if already rated
//     const [existing] = await db.query(
//       `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
//       [jobId]
//     );

//     if (existing && existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "You have already rated this job" },
//         { status: 400 }
//       );
//     }

//     console.log("📝 Creating rating...");
//     console.log("Job ID:", jobId);
//     console.log("Homeowner ID:", userId);
//     console.log("Tradesperson ID:", tradespersonId);
//     console.log("Rating:", rating);

//     // 1. INSERT THE RATING
//     const [result] = await db.query(
//       `INSERT INTO tradesperson_ratings 
//        (job_id, homeowner_id, tradesperson_id, rating, review, created_at)
//        VALUES (?, ?, ?, ?, ?, NOW())`,
//       [jobId, userId, tradespersonId, rating, review?.trim() || null]
//     );

//     const ratingId = result.insertId;
//     console.log("✅ Rating inserted with ID:", ratingId);

//     // 2. CALCULATE NEW STATS
//     const [stats] = await db.query(
//       `SELECT 
//          AVG(rating) as avg_rating,
//          COUNT(*) as total_count
//        FROM tradesperson_ratings 
//        WHERE tradesperson_id = ?`,
//       [tradespersonId]
//     );

//     // Convert to proper numbers
//     const avgRating = parseFloat(stats[0].avg_rating || 0).toFixed(1);
//     const totalRatings = parseInt(stats[0].total_count || 0);

//     console.log("📊 Calculated stats:");
//     console.log("  - Average Rating:", avgRating);
//     console.log("  - Total Ratings:", totalRatings);

//     // 3. UPDATE THE PROFILE - THIS IS THE KEY FIX
//     const [updateResult] = await db.query(
//       `UPDATE tradesperson_profiles 
//        SET average_rating = ?, 
//            total_ratings = ?, 
//            updated_at = NOW()
//        WHERE user_id = ?`,
//       [parseFloat(avgRating), totalRatings, tradespersonId]
//     );

//     console.log("✅ Profile update result:");
//     console.log("  - Rows affected:", updateResult.affectedRows);
//     console.log("  - Changed rows:", updateResult.changedRows);

//     // 4. VERIFY THE UPDATE
//     const [verification] = await db.query(
//       `SELECT user_id, average_rating, total_ratings 
//        FROM tradesperson_profiles 
//        WHERE user_id = ?`,
//       [tradespersonId]
//     );

//     console.log("🔍 Verification - Profile after update:", verification[0]);

//     // 5. UPDATE JOB
//     await db.query(
//       `UPDATE jobs SET has_rated = 1, updated_at = NOW() WHERE id = ?`,
//       [jobId]
//     );

//     console.log("✅ Job marked as rated");

//     return NextResponse.json({
//       success: true,
//       message: "Rating submitted successfully",
//       data: {
//         ratingId,
//         avgRating: parseFloat(avgRating),
//         totalRatings,
//         profileUpdated: updateResult.affectedRows > 0,
//         verification: verification[0]
//       }
//     }, { status: 201 });

//   } catch (error) {
//     console.error("❌ Rating error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to submit rating",
//         error: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET - Fetch ratings
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");
//     const tradespersonId = searchParams.get("tradespersonId");

//     if (jobId) {
//       const [rating] = await db.query(
//         `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
//         [jobId]
//       );
//       return NextResponse.json({
//         success: true,
//         rating: rating[0] || null,
//         hasRated: !!rating[0]
//       });
//     }

//     if (tradespersonId) {
//       const [ratings] = await db.query(
//         `SELECT tr.*, u.name as homeowner_name
//          FROM tradesperson_ratings tr
//          LEFT JOIN users u ON tr.homeowner_id = u.id
//          WHERE tradesperson_id = ? 
//          ORDER BY tr.created_at DESC`,
//         [tradespersonId]
//       );

//       const [stats] = await db.query(
//         `SELECT 
//            AVG(rating) as average_rating,
//            COUNT(*) as total_ratings
//          FROM tradesperson_ratings 
//          WHERE tradesperson_id = ?`,
//         [tradespersonId]
//       );

//       const avgRating = parseFloat(stats[0]?.average_rating || 0).toFixed(1);
//       const totalRatings = parseInt(stats[0]?.total_ratings || 0);

//       return NextResponse.json({
//         success: true,
//         ratings: ratings || [],
//         averageRating: parseFloat(avgRating),
//         totalRatings: totalRatings
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: "Provide jobId or tradespersonId" },
//       { status: 400 }
//     );

//   } catch (error) {
//     console.error("❌ Fetch ratings error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch ratings" },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from "next/server";
// import db from "../../../../config/db";

// // POST - Create a rating
// export async function POST(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "HOMEOWNER") {
//       return NextResponse.json(
//         { success: false, message: "Only homeowners can submit ratings" },
//         { status: 403 }
//       );
//     }

//     const { jobId, tradespersonId, rating, review } = await req.json();

//     // Validation
//     if (!jobId || !tradespersonId || !rating) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (rating < 1 || rating > 5) {
//       return NextResponse.json(
//         { success: false, message: "Rating must be between 1 and 5" },
//         { status: 400 }
//       );
//     }

//     console.log("📝 Starting rating submission...");
//     console.log("Job ID:", jobId);
//     console.log("Tradesperson User ID (from frontend):", tradespersonId);
//     console.log("Homeowner ID:", userId);
//     console.log("Rating:", rating);

//     // ⭐ CRITICAL FIX: Get tradesperson PROFILE ID from user_id
//     const [tradespersonProfile] = await db.query(
//       `SELECT id, user_id, company_name FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
//       [tradespersonId]
//     );

//     if (!tradespersonProfile || tradespersonProfile.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Tradesperson profile not found" },
//         { status: 404 }
//       );
//     }

//     const tradespersonProfileId = tradespersonProfile[0].id;
//     console.log("✅ Found tradesperson profile:");
//     console.log("   - Profile ID:", tradespersonProfileId);
//     console.log("   - User ID:", tradespersonProfile[0].user_id);
//     console.log("   - Company:", tradespersonProfile[0].company_name);

//     // Check job
//     const [jobs] = await db.query(
//       `SELECT * FROM jobs 
//        WHERE id = ? AND homeowner_id = ? AND status = 'COMPLETED'
//        LIMIT 1`,
//       [jobId, userId]
//     );

//     if (!jobs || jobs.length === 0) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: "Job not found or not completed" 
//         },
//         { status: 404 }
//       );
//     }

//     // Check if already rated
//     const [existing] = await db.query(
//       `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
//       [jobId]
//     );

//     if (existing && existing.length > 0) {
//       return NextResponse.json(
//         { success: false, message: "You have already rated this job" },
//         { status: 400 }
//       );
//     }

//     // ⭐ STEP 1: INSERT RATING with PROFILE ID (not user_id)
//     const [result] = await db.query(
//       `INSERT INTO tradesperson_ratings 
//        (job_id, homeowner_id, tradesperson_id, rating, review, created_at)
//        VALUES (?, ?, ?, ?, ?, NOW())`,
//       [jobId, userId, tradespersonProfileId, rating, review?.trim() || null]
//     );

//     const ratingId = result.insertId;
//     console.log("✅ Rating inserted with ID:", ratingId);
//     console.log("   - Stored tradesperson_id:", tradespersonProfileId, "(PROFILE ID)");

//     // ⭐ STEP 2: CALCULATE NEW STATS using PROFILE ID
//     const [stats] = await db.query(
//       `SELECT 
//          AVG(rating) as avg_rating,
//          COUNT(*) as total_count
//        FROM tradesperson_ratings 
//        WHERE tradesperson_id = ?`,
//       [tradespersonProfileId]
//     );

//     const avgRating = parseFloat(stats[0].avg_rating || 0).toFixed(1);
//     const totalRatings = parseInt(stats[0].total_count || 0);

//     console.log("📊 Calculated stats for profile ID", tradespersonProfileId);
//     console.log("   - Average Rating:", avgRating);
//     console.log("   - Total Ratings:", totalRatings);

//     // ⭐ STEP 3: UPDATE PROFILE using PROFILE ID
//     const [updateResult] = await db.query(
//       `UPDATE tradesperson_profiles 
//        SET average_rating = ?, 
//            total_ratings = ?, 
//            updated_at = NOW()
//        WHERE id = ?`,
//       [parseFloat(avgRating), totalRatings, tradespersonProfileId]
//     );

//     console.log("✅ Profile updated:");
//     console.log("   - Rows affected:", updateResult.affectedRows);
//     console.log("   - Changed rows:", updateResult.changedRows);

//     // ⭐ STEP 4: VERIFY THE UPDATE
//     const [verification] = await db.query(
//       `SELECT id, user_id, company_name, average_rating, total_ratings 
//        FROM tradesperson_profiles 
//        WHERE id = ?`,
//       [tradespersonProfileId]
//     );

//     console.log("🔍 Verification - Profile after update:");
//     console.log(verification[0]);

//     // ⭐ STEP 5: UPDATE JOB
//     await db.query(
//       `UPDATE jobs SET has_rated = 1, updated_at = NOW() WHERE id = ?`,
//       [jobId]
//     );

//     console.log("✅ Job marked as rated");
//     console.log("========================================");

//     return NextResponse.json({
//       success: true,
//       message: "Rating submitted successfully",
//       data: {
//         ratingId,
//         tradespersonProfileId,
//         tradespersonUserId: tradespersonId,
//         avgRating: parseFloat(avgRating),
//         totalRatings,
//         profileUpdated: updateResult.affectedRows > 0,
//         verification: verification[0]
//       }
//     }, { status: 201 });

//   } catch (error) {
//     console.error("❌ Rating error:", error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Failed to submit rating",
//         error: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET - Fetch ratings
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const jobId = searchParams.get("jobId");
//     const tradespersonId = searchParams.get("tradespersonId");

//     if (jobId) {
//       const [rating] = await db.query(
//         `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
//         [jobId]
//       );
//       return NextResponse.json({
//         success: true,
//         rating: rating[0] || null,
//         hasRated: !!rating[0]
//       });
//     }

//     if (tradespersonId) {
//       // ⭐ FIX: Get profile ID first if tradespersonId is user_id
//       const [profile] = await db.query(
//         `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
//         [tradespersonId]
//       );

//       if (!profile || profile.length === 0) {
//         return NextResponse.json({
//           success: true,
//           ratings: [],
//           averageRating: 0,
//           totalRatings: 0
//         });
//       }

//       const profileId = profile[0].id;

//       // Get ratings using profile ID
//       const [ratings] = await db.query(
//         `SELECT tr.*, u.name as homeowner_name
//          FROM tradesperson_ratings tr
//          LEFT JOIN users u ON tr.homeowner_id = u.id
//          WHERE tr.tradesperson_id = ? 
//          ORDER BY tr.created_at DESC`,
//         [profileId]
//       );

//       const [stats] = await db.query(
//         `SELECT 
//            AVG(rating) as average_rating,
//            COUNT(*) as total_ratings
//          FROM tradesperson_ratings 
//          WHERE tradesperson_id = ?`,
//         [profileId]
//       );

//       const avgRating = parseFloat(stats[0]?.average_rating || 0).toFixed(1);
//       const totalRatings = parseInt(stats[0]?.total_ratings || 0);

//       return NextResponse.json({
//         success: true,
//         ratings: ratings || [],
//         averageRating: parseFloat(avgRating),
//         totalRatings: totalRatings
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: "Provide jobId or tradespersonId" },
//       { status: 400 }
//     );

//   } catch (error) {
//     console.error("❌ Fetch ratings error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch ratings" },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import db from "../../../../config/db";

// POST - Create a rating
export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Only homeowners can submit ratings" },
        { status: 403 }
      );
    }

    const { jobId, tradespersonId, rating, review } = await req.json();

    // Validation
    if (!jobId || !tradespersonId || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    console.log("📝 Rating submission:");
    console.log("  Job ID:", jobId);
    console.log("  Tradesperson User ID:", tradespersonId);
    console.log("  Homeowner ID:", userId);
    console.log("  Rating:", rating);

    // Check job
    const [jobs] = await db.query(
      `SELECT * FROM jobs 
       WHERE id = ? AND homeowner_id = ? AND status = 'COMPLETED'
       LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found or not completed" },
        { status: 404 }
      );
    }

    // Check if already rated
    const [existing] = await db.query(
      `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
      [jobId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "You have already rated this job" },
        { status: 400 }
      );
    }

    // INSERT RATING (tradesperson_id = user_id due to foreign key)
    const [result] = await db.query(
      `INSERT INTO tradesperson_ratings 
       (job_id, homeowner_id, tradesperson_id, rating, review, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [jobId, userId, tradespersonId, rating, review?.trim() || null]
    );

    console.log("✅ Rating inserted with ID:", result.insertId);

    // CALCULATE NEW STATS
    const [stats] = await db.query(
      `SELECT 
         AVG(rating) as avg_rating,
         COUNT(*) as total_count
       FROM tradesperson_ratings 
       WHERE tradesperson_id = ?`,
      [tradespersonId]
    );

    const avgRating = parseFloat(stats[0].avg_rating || 0).toFixed(1);
    const totalRatings = parseInt(stats[0].total_count || 0);

    console.log("📊 Calculated stats:");
    console.log("  Average:", avgRating);
    console.log("  Total:", totalRatings);

    // FIRST: Find the tradesperson profile ID from user ID
    const [profile] = await db.query(
      `SELECT id, user_id, company_name FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
      [tradespersonId]
    );

    if (!profile || profile.length === 0) {
      console.error(`❌ No tradesperson profile found for user_id: ${tradespersonId}`);
      return NextResponse.json(
        { success: false, message: "Tradesperson profile not found" },
        { status: 404 }
      );
    }

    const profileId = profile[0].id;
    console.log(`✅ Found tradesperson profile: ID = ${profileId}, User ID = ${profile[0].user_id}, Name = ${profile[0].company_name}`);

    // UPDATE PROFILE (WHERE id = profileId)
    const [updateResult] = await db.query(
      `UPDATE tradesperson_profiles 
       SET average_rating = ?, 
           total_ratings = ?, 
           updated_at = NOW()
       WHERE id = ?`,
      [parseFloat(avgRating), totalRatings, profileId]
    );

    console.log("✅ Profile updated - Rows affected:", updateResult.affectedRows);

    // Verify the update
    if (updateResult.affectedRows > 0) {
      const [updatedProfile] = await db.query(
        `SELECT average_rating, total_ratings FROM tradesperson_profiles WHERE id = ?`,
        [profileId]
      );
      console.log(`✅ Verified update - New avg: ${updatedProfile[0].average_rating}, New total: ${updatedProfile[0].total_ratings}`);
    }

    // UPDATE JOB
    await db.query(
      `UPDATE jobs SET has_rated = 1, updated_at = NOW() WHERE id = ?`,
      [jobId]
    );

    console.log("✅ Job marked as rated");

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        ratingId: result.insertId,
        avgRating: parseFloat(avgRating),
        totalRatings
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Rating error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to submit rating",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// GET - Fetch ratings
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const tradespersonId = searchParams.get("tradespersonId");

    if (jobId) {
      const [rating] = await db.query(
        `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
        [jobId]
      );
      return NextResponse.json({
        success: true,
        rating: rating[0] || null,
        hasRated: !!rating[0]
      });
    }

    if (tradespersonId) {
      // First find the profile ID from user ID
      const [profile] = await db.query(
        `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
        [tradespersonId]
      );

      if (!profile || profile.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tradesperson profile not found" },
          { status: 404 }
        );
      }

      const profileId = profile[0].id;

      // Get ratings using the profile ID
      const [ratings] = await db.query(
        `SELECT tr.*, u.name as homeowner_name
         FROM tradesperson_ratings tr
         LEFT JOIN users u ON tr.homeowner_id = u.id
         LEFT JOIN tradesperson_profiles tp ON tr.tradesperson_id = tp.user_id
         WHERE tp.id = ? 
         ORDER BY tr.created_at DESC`,
        [profileId]
      );

      const [stats] = await db.query(
        `SELECT 
           AVG(rating) as average_rating,
           COUNT(*) as total_ratings
         FROM tradesperson_ratings tr
         LEFT JOIN tradesperson_profiles tp ON tr.tradesperson_id = tp.user_id
         WHERE tp.id = ?`,
        [profileId]
      );

      const avgRating = parseFloat(stats[0]?.average_rating || 0).toFixed(1);
      const totalRatings = parseInt(stats[0]?.total_ratings || 0);

      return NextResponse.json({
        success: true,
        ratings: ratings || [],
        averageRating: parseFloat(avgRating),
        totalRatings: totalRatings
      });
    }

    return NextResponse.json(
      { success: false, message: "Provide jobId or tradespersonId" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Fetch ratings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}