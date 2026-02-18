import { NextResponse } from "next/server";
import db from "../../../../../config/db"

// GET - Fetch ratings for tradesperson or admin
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tradespersonId = searchParams.get("tradespersonId");

    // ADMIN - View all tradesperson ratings
    if (userRole === "ADMIN") {
      if (tradespersonId) {
        // Get specific tradesperson's ratings
        const ratings = await getTradespersonRatings(tradespersonId);
        return NextResponse.json({
          success: true,
          ...ratings
        });
      } else {
        // Get all tradespeople with their ratings
        const allRatings = await getAllTradespersonRatings();
        return NextResponse.json({
          success: true,
          data: allRatings
        });
      }
    }

    // TRADESPERSON - View their own ratings
    if (userRole === "TRADESPERSON") {
      // Use userId directly as tradesperson_id in ratings table refers to user_id
      const ratings = await getTradespersonRatings(userId);

      return NextResponse.json({
        success: true,
        ...ratings
      });
    }

    return NextResponse.json(
      { success: false, message: "Unauthorized access" },
      { status: 403 }
    );

  } catch (error) {
    console.error("Get ratings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

// Helper function to get specific tradesperson ratings
async function getTradespersonRatings(tradespersonId) {
  // Get all ratings with job and homeowner details
  const [ratings] = await db.query(
    `SELECT 
      tr.id,
      tr.job_id,
      tr.rating,
      tr.review,
      tr.created_at,
      j.description as job_description,
      sc.name as job_category,
      u.name as homeowner_name
    FROM tradesperson_ratings tr
    LEFT JOIN jobs j ON tr.job_id = j.id
    LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
    LEFT JOIN users u ON tr.homeowner_id = u.id
    WHERE tr.tradesperson_id = ?
    ORDER BY tr.created_at DESC`,
    [tradespersonId]
  );

  // Get rating statistics
  const [stats] = await db.query(
    `SELECT 
      AVG(rating) as average_rating,
      COUNT(*) as total_ratings,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
    FROM tradesperson_ratings
    WHERE tradesperson_id = ?`,
    [tradespersonId]
  );

  const statsData = stats[0];

  return {
    ratings: ratings.map(r => ({
      id: r.id,
      jobId: r.job_id,
      rating: r.rating,
      review: r.review,
      jobDescription: r.job_description,
      jobCategory: r.job_category,
      homeownerName: r.homeowner_name,
      createdAt: r.created_at
    })),
    statistics: {
      averageRating: statsData.average_rating ? parseFloat(statsData.average_rating).toFixed(1) : 0,
      totalRatings: statsData.total_ratings || 0,
      distribution: {
        5: statsData.five_star || 0,
        4: statsData.four_star || 0,
        3: statsData.three_star || 0,
        2: statsData.two_star || 0,
        1: statsData.one_star || 0
      }
    }
  };
}

// Helper function to get all tradespeople with ratings (Admin only)
async function getAllTradespersonRatings() {
  const [tradespeople] = await db.query(
    `SELECT 
      tp.id,
      tp.user_id,
      tp.company_name,
      tp.average_rating,
      tp.total_ratings,
      u.name as user_name,
      u.email as user_email
    FROM tradesperson_profiles tp
    LEFT JOIN users u ON tp.user_id = u.id
    ORDER BY tp.average_rating DESC, tp.total_ratings DESC`
  );

  // Get detailed ratings for each tradesperson
  const tradespeopleWithRatings = await Promise.all(
    tradespeople.map(async (tp) => {
      const [recentRatings] = await db.query(
        `SELECT 
          tr.rating,
          tr.review,
          tr.created_at,
          j.description as job_description,
          u.name as homeowner_name
        FROM tradesperson_ratings tr
        LEFT JOIN jobs j ON tr.job_id = j.id
        LEFT JOIN users u ON tr.homeowner_id = u.id
        WHERE tr.tradesperson_id = ?
        ORDER BY tr.created_at DESC
        LIMIT 5`,
        [tp.id]
      );

      return {
        id: tp.id,
        userId: tp.user_id,
        companyName: tp.company_name,
        userName: tp.user_name,
        userEmail: tp.user_email,
        averageRating: tp.average_rating || 0,
        totalRatings: tp.total_ratings || 0,
        recentRatings: recentRatings.map(r => ({
          rating: r.rating,
          review: r.review,
          jobDescription: r.job_description,
          homeownerName: r.homeowner_name,
          createdAt: r.created_at
        }))
      };
    })
  );

  return tradespeopleWithRatings;
}