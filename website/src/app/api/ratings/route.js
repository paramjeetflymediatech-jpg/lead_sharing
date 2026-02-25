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

    if (!jobId || !tradespersonId || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: jobId, tradespersonId, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify job is completed and belongs to this homeowner
    const [jobs] = await db.query(
      `SELECT id FROM jobs WHERE id = ? AND homeowner_id = ? AND status = 'COMPLETED' LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found or not yet completed" },
        { status: 404 }
      );
    }

    // ✅ KEY FIX: tradespersonId from frontend may be tradesperson_profiles.id
    // We need users.id for the FK constraint on tradesperson_ratings.tradesperson_id
    // Strategy: look up by user_id first, then fallback to profile id lookup
    let tradespersonUserId = tradespersonId;

    // Check if tradespersonId is actually a profile ID (not a user ID)
    const [userCheck] = await db.query(
      `SELECT id FROM users WHERE id = ? AND role = 'TRADESPERSON' LIMIT 1`,
      [tradespersonId]
    );

    if (!userCheck || userCheck.length === 0) {
      // tradespersonId is likely a tradesperson_profiles.id — resolve to users.id
      const [profileRow] = await db.query(
        `SELECT user_id FROM tradesperson_profiles WHERE id = ? LIMIT 1`,
        [tradespersonId]
      );

      if (!profileRow || profileRow.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tradesperson not found" },
          { status: 404 }
        );
      }
      tradespersonUserId = profileRow[0].user_id;
      console.log(`[Rating] Resolved tradesperson_profiles.id=${tradespersonId} → users.id=${tradespersonUserId}`);
    }

    // Check if already rated for this job
    const [existing] = await db.query(
      `SELECT id FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
      [jobId]
    );

    let ratingId;
    if (existing && existing.length > 0) {
      // Update existing rating
      await db.query(
        `UPDATE tradesperson_ratings SET rating = ?, review = ? WHERE job_id = ?`,
        [rating, review?.trim() || null, jobId]
      );
      ratingId = existing[0].id;
      console.log(`[Rating] Updated existing rating ID: ${ratingId}`);
    } else {
      // Insert new rating — tradesperson_id references users.id
      const [result] = await db.query(
        `INSERT INTO tradesperson_ratings 
         (job_id, homeowner_id, tradesperson_id, rating, review, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [jobId, userId, tradespersonUserId, rating, review?.trim() || null]
      );
      ratingId = result.insertId;
      console.log(`[Rating] Inserted rating ID: ${ratingId}`);
    }

    // Recalculate and update profile stats
    const [stats] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
       FROM tradesperson_ratings WHERE tradesperson_id = ?`,
      [tradespersonUserId]
    );

    const avgRating = parseFloat(stats[0].avg_rating || 0).toFixed(1);
    const totalRatings = parseInt(stats[0].total_count || 0);

    await db.query(
      `UPDATE tradesperson_profiles 
       SET average_rating = ?, total_ratings = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [parseFloat(avgRating), totalRatings, tradespersonUserId]
    );

    // Mark job as rated
    await db.query(
      `UPDATE jobs SET has_rated = 1, updated_at = NOW() WHERE id = ?`,
      [jobId]
    );

    console.log(`[Rating] ✅ Done. avg=${avgRating},  total=${totalRatings}`);

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      data: { ratingId, avgRating: parseFloat(avgRating), totalRatings }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Rating error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit rating", error: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch ratings by jobId or tradespersonId
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
      // Resolve to users.id if needed
      let userIdForQuery = tradespersonId;
      const [userCheck] = await db.query(
        `SELECT id FROM users WHERE id = ? AND role = 'TRADESPERSON' LIMIT 1`,
        [tradespersonId]
      );
      if (!userCheck || userCheck.length === 0) {
        const [profileRow] = await db.query(
          `SELECT user_id FROM tradesperson_profiles WHERE id = ? LIMIT 1`,
          [tradespersonId]
        );
        if (profileRow && profileRow.length > 0) {
          userIdForQuery = profileRow[0].user_id;
        }
      }

      const [ratings] = await db.query(
        `SELECT tr.*, u.name as homeowner_name
         FROM tradesperson_ratings tr
         LEFT JOIN users u ON tr.homeowner_id = u.id
         WHERE tr.tradesperson_id = ?
         ORDER BY tr.created_at DESC`,
        [userIdForQuery]
      );

      const [stats] = await db.query(
        `SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
         FROM tradesperson_ratings WHERE tradesperson_id = ?`,
        [userIdForQuery]
      );

      return NextResponse.json({
        success: true,
        ratings: ratings || [],
        averageRating: parseFloat(stats[0]?.average_rating || 0),
        totalRatings: parseInt(stats[0]?.total_ratings || 0)
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