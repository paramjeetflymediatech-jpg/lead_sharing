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





import { NextResponse } from "next/server";
import { TradespersonRating } from "@/models/TradespersonRating";
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

    // Check if job belongs to homeowner
    const [jobs] = await db.query(
      `SELECT * FROM jobs 
       WHERE id = ? AND homeowner_id = ? 
       LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    // Check if already rated
    const existing = await TradespersonRating.findByJob(jobId);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already rated this job" },
        { status: 400 }
      );
    }

    // Create rating
    const ratingId = await TradespersonRating.create({
      jobId,
      homeownerId: userId,
      tradespersonId,
      rating,
      review: review?.trim() || null
    });

    // IMPORTANT: Mark job as rated so the rating button disappears
    await db.query(
      `UPDATE jobs SET has_rated = TRUE WHERE id = ?`,
      [jobId]
    );

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      ratingId
    }, { status: 201 });

  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit rating" },
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
      const rating = await TradespersonRating.findByJob(jobId);
      return NextResponse.json({
        success: true,
        rating,
        hasRated: !!rating
      });
    }

    if (tradespersonId) {
      const ratings = await TradespersonRating.findByTradesperson(tradespersonId);
      const stats = await TradespersonRating.getAverageRating(tradespersonId);
      
      return NextResponse.json({
        success: true,
        ratings,
        averageRating: parseFloat(stats.average_rating),
        totalRatings: stats.total_ratings
      });
    }

    return NextResponse.json(
      { success: false, message: "Provide jobId or tradespersonId" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Fetch ratings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

















// import { NextResponse } from "next/server";
// import db from "../../../../config/db";

// // GET - Fetch ratings for tradesperson or admin
// export async function GET(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const tradespersonId = searchParams.get("tradespersonId");

//     // ADMIN - View all tradesperson ratings
//     if (userRole === "ADMIN") {
//       if (tradespersonId) {
//         // Get specific tradesperson's ratings
//         const ratings = await getTradespersonRatings(tradespersonId);
//         return NextResponse.json({
//           success: true,
//           ...ratings
//         });
//       } else {
//         // Get all tradespeople with their ratings
//         const allRatings = await getAllTradespersonRatings();
//         return NextResponse.json({
//           success: true,
//           data: allRatings
//         });
//       }
//     }

//     // TRADESPERSON - View their own ratings
//     if (userRole === "TRADESPERSON") {
//       // Get tradesperson profile to find their tradesperson_id
//       const [profiles] = await db.query(
//         `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
//         [userId]
//       );

//       if (!profiles || profiles.length === 0) {
//         return NextResponse.json(
//           { success: false, message: "Tradesperson profile not found" },
//           { status: 404 }
//         );
//       }

//       const tradespersonProfileId = profiles[0].id;
//       const ratings = await getTradespersonRatings(tradespersonProfileId);

//       return NextResponse.json({
//         success: true,
//         ...ratings
//       });
//     }

//     return NextResponse.json(
//       { success: false, message: "Unauthorized access" },
//       { status: 403 }
//     );

//   } catch (error) {
//     console.error("Get ratings error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch ratings" },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to get specific tradesperson ratings
// async function getTradespersonRatings(tradespersonId) {
//   // Get all ratings with job and homeowner details
//   const [ratings] = await db.query(
//     `SELECT 
//       tr.id,
//       tr.job_id,
//       tr.rating,
//       tr.review,
//       tr.created_at,
//       j.description as job_description,
//       sc.name as job_category,
//       u.name as homeowner_name
//     FROM tradesperson_ratings tr
//     LEFT JOIN jobs j ON tr.job_id = j.id
//     LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
//     LEFT JOIN users u ON tr.homeowner_id = u.id
//     WHERE tr.tradesperson_id = ?
//     ORDER BY tr.created_at DESC`,
//     [tradespersonId]
//   );

//   // Get rating statistics
//   const [stats] = await db.query(
//     `SELECT 
//       AVG(rating) as average_rating,
//       COUNT(*) as total_ratings,
//       SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
//       SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
//       SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
//       SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
//       SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
//     FROM tradesperson_ratings
//     WHERE tradesperson_id = ?`,
//     [tradespersonId]
//   );

//   const statsData = stats[0];

//   return {
//     ratings: ratings.map(r => ({
//       id: r.id,
//       jobId: r.job_id,
//       rating: r.rating,
//       review: r.review,
//       jobDescription: r.job_description,
//       jobCategory: r.job_category,
//       homeownerName: r.homeowner_name,
//       createdAt: r.created_at
//     })),
//     statistics: {
//       averageRating: statsData.average_rating ? parseFloat(statsData.average_rating).toFixed(1) : 0,
//       totalRatings: statsData.total_ratings || 0,
//       distribution: {
//         5: statsData.five_star || 0,
//         4: statsData.four_star || 0,
//         3: statsData.three_star || 0,
//         2: statsData.two_star || 0,
//         1: statsData.one_star || 0
//       }
//     }
//   };
// }

// // Helper function to get all tradespeople with ratings (Admin only)
// async function getAllTradespersonRatings() {
//   const [tradespeople] = await db.query(
//     `SELECT 
//       tp.id,
//       tp.user_id,
//       tp.company_name,
//       tp.average_rating,
//       tp.total_ratings,
//       u.name as user_name,
//       u.email as user_email
//     FROM tradesperson_profiles tp
//     LEFT JOIN users u ON tp.user_id = u.id
//     ORDER BY tp.average_rating DESC, tp.total_ratings DESC`
//   );

//   // Get detailed ratings for each tradesperson
//   const tradespeopleWithRatings = await Promise.all(
//     tradespeople.map(async (tp) => {
//       const [recentRatings] = await db.query(
//         `SELECT 
//           tr.rating,
//           tr.review,
//           tr.created_at,
//           j.description as job_description,
//           u.name as homeowner_name
//         FROM tradesperson_ratings tr
//         LEFT JOIN jobs j ON tr.job_id = j.id
//         LEFT JOIN users u ON tr.homeowner_id = u.id
//         WHERE tr.tradesperson_id = ?
//         ORDER BY tr.created_at DESC
//         LIMIT 5`,
//         [tp.id]
//       );

//       return {
//         id: tp.id,
//         userId: tp.user_id,
//         companyName: tp.company_name,
//         userName: tp.user_name,
//         userEmail: tp.user_email,
//         averageRating: tp.average_rating || 0,
//         totalRatings: tp.total_ratings || 0,
//         recentRatings: recentRatings.map(r => ({
//           rating: r.rating,
//           review: r.review,
//           jobDescription: r.job_description,
//           homeownerName: r.homeowner_name,
//           createdAt: r.created_at
//         }))
//       };
//     })
//   );

//   return tradespeopleWithRatings;
// }