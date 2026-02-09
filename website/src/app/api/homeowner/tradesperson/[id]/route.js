// import { NextResponse } from 'next/server';
// import pool from "../../../../../../config/db"


// export async function GET(request, { params }) {
//   try {
//     // ✅ Await params
//     const { id } = await params;
    
//     const userId = request.headers.get('x-user-id');
//     const role = request.headers.get('x-user-role');

//     if (!userId || role !== 'HOMEOWNER') {
//       return NextResponse.json(
//         { success: false, message: 'Unauthorized. Homeowner access required.' },
//         { status: 401 }
//       );
//     }

//     // First, determine if the id is a tradesperson profile id or user id
//     let tradespersonUserId = id;
    
//     // If id is a profile id, get the user_id from tradesperson_profiles
//     if (id && !isNaN(id) && id.length < 10) {
//       // Likely a numeric profile id
//       const [profileCheckRows] = await pool.query(`
//         SELECT user_id FROM tradesperson_profiles WHERE id = ?
//       `, [id]);
      
//       if (profileCheckRows.length > 0) {
//         tradespersonUserId = profileCheckRows[0].user_id;
//       }
//     }
    
//     // Now get tradesperson profile with user details using the correct user_id
//     const [profileRows] = await pool.query(`
//       SELECT 
//         tp.*,
//         u.name as full_name,
//         u.email,
//         u.created_at as member_since,
//         (
//           SELECT COUNT(*) 
//           FROM leads l 
//           INNER JOIN jobs j ON l.job_id = j.id 
//           WHERE l.tradesperson_id = tp.user_id 
//           AND j.status = 'COMPLETED'
//           AND l.status = 'HIRED'
//         ) as completed_jobs_count,
//         (
//           SELECT COUNT(*) 
//           FROM ratings r 
//           WHERE r.tradesperson_id = tp.user_id 
//           AND r.rating IS NOT NULL
//         ) as total_ratings_count,
//         (
//           SELECT ROUND(AVG(r.rating), 1)
//           FROM ratings r 
//           WHERE r.tradesperson_id = tp.user_id 
//           AND r.rating IS NOT NULL
//         ) as average_rating_score
//       FROM tradesperson_profiles tp
//       INNER JOIN users u ON tp.user_id = u.id
//       WHERE tp.user_id = ?
//       LIMIT 1
//     `, [tradespersonUserId]);

//     if (!profileRows.length) {
//       return NextResponse.json(
//         { success: false, message: 'Tradesperson profile not found' },
//         { status: 404 }
//       );
//     }

//     const profile = profileRows[0];

//     // Get recent reviews
//     const [reviewsRows] = await pool.query(`
//       SELECT 
//         r.*,
//         u.name as homeowner_name,
//         j.description as job_description,
//         sc.name as subcategory_name,
//         DATE_FORMAT(r.created_at, '%M %Y') as review_date
//       FROM ratings r
//       INNER JOIN users u ON r.homeowner_id = u.id
//       INNER JOIN jobs j ON r.job_id = j.id
//       LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
//       WHERE r.tradesperson_id = ?
//       AND r.rating IS NOT NULL
//       ORDER BY r.created_at DESC
//       LIMIT 3
//     `, [profile.user_id]);

//     // Get total jobs count
//     const [totalJobsRows] = await pool.query(`
//       SELECT COUNT(*) as count
//       FROM leads l
//       WHERE l.tradesperson_id = ?
//       AND l.status = 'HIRED'
//     `, [profile.user_id]);

//     // Get active jobs count
//     const [activeJobsRows] = await pool.query(`
//       SELECT COUNT(*) as count
//       FROM leads l
//       INNER JOIN jobs j ON l.job_id = j.id
//       WHERE l.tradesperson_id = ?
//       AND l.status = 'HIRED'
//       AND j.status IN ('HIRED', 'IN_PROGRESS')
//     `, [profile.user_id]);

//     // Parse JSON fields
//     const safeJsonParse = (str) => {
//       if (!str || str === 'null' || str === '' || str === '[]') return [];
//       try {
//         const parsed = JSON.parse(str);
//         return Array.isArray(parsed) ? parsed : [];
//       } catch (e) {
//         console.warn('JSON parse error:', e.message, 'Input:', str);
//         return [];
//       }
//     };

//     const skills = safeJsonParse(profile.skills);
//     const serviceAreas = safeJsonParse(profile.service_areas);

//     // Calculate response time based on leads
//     let responseTime = 'Within 48 hours';
//     const [responseTimeRows] = await pool.query(`
//       SELECT AVG(TIMESTAMPDIFF(HOUR, j.created_at, l.created_at)) as avg_response_hours
//       FROM leads l
//       INNER JOIN jobs j ON l.job_id = j.id
//       WHERE l.tradesperson_id = ?
//       AND l.created_at IS NOT NULL
//       AND j.created_at IS NOT NULL
//       LIMIT 1
//     `, [profile.user_id]);

//     if (responseTimeRows[0]?.avg_response_hours) {
//       const avgHours = responseTimeRows[0].avg_response_hours;
//       if (avgHours < 24) responseTime = 'Within 24 hours';
//       else if (avgHours < 48) responseTime = 'Within 48 hours';
//       else responseTime = 'Within a week';
//     }

//     // Format response
//     const response = {
//       success: true,
//       data: {
//         id: profile.id,
//         userId: profile.user_id,
//         name: profile.full_name,
//         email: profile.email,
//         companyName: profile.company_name || profile.full_name,
//         profileImage: profile.profile_image || '/default-avatar.png',
//         bio: profile.bio || 'No bio provided',
//         phone: profile.phone || 'Not provided',
//         postcode: profile.postcode || 'Not specified',
//         skills: skills,
//         serviceAreas: serviceAreas,
//         averageRating: parseFloat(profile.average_rating_score || profile.average_rating || 0).toFixed(1),
//         totalRatings: profile.total_ratings_count || profile.total_ratings || 0,
//         completedJobs: profile.completed_jobs_count || 0,
//         totalJobs: totalJobsRows[0]?.count || 0,
//         activeJobs: activeJobsRows[0]?.count || 0,
//         memberSince: new Date(profile.member_since).getFullYear(),
//         responseTime: responseTime,
//         verified: profile.credits > 10,
//         insurance: profile.credits > 20,
//         reviews: reviewsRows.map(review => ({
//           id: review.id,
//           rating: review.rating,
//           comment: review.comment || 'No comment provided',
//           homeownerName: review.homeowner_name || 'Homeowner',
//           jobTitle: review.subcategory_name || 'General work',
//           jobDescription: review.job_description?.substring(0, 100) + (review.job_description?.length > 100 ? '...' : ''),
//           date: review.review_date || 'Recently',
//           helpful: Math.floor(Math.random() * 10)
//         }))
//       },
//       stats: {
//         totalJobs: totalJobsRows[0]?.count || 0,
//         completionRate: profile.completed_jobs_count > 0 
//           ? Math.round((profile.completed_jobs_count / (totalJobsRows[0]?.count || 1)) * 100) 
//           : 0,
//         repeatClients: Math.floor((profile.total_ratings_count || 0) * 0.3)
//       }
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('Error fetching tradesperson profile:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Internal server error',
//         error: error.message,
//         sqlMessage: error.sqlMessage
//       },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from 'next/server';
import pool from "../../../../../../config/db"

export async function GET(request, { params }) {
  try {
    // ✅ Await params
    const { id } = await params;
    
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'HOMEOWNER') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Homeowner access required.' },
        { status: 401 }
      );
    }

    // First, determine if the id is a tradesperson profile id or user id
    let tradespersonUserId = id;
    
    // If id is a profile id, get the user_id from tradesperson_profiles
    if (id && !isNaN(id) && id.length < 10) {
      // Likely a numeric profile id
      const [profileCheckRows] = await pool.query(`
        SELECT user_id FROM tradesperson_profiles WHERE id = ?
      `, [id]);
      
      if (profileCheckRows.length > 0) {
        tradespersonUserId = profileCheckRows[0].user_id;
      }
    }
    
    // Now get tradesperson profile with user details using the correct user_id
    const [profileRows] = await pool.query(`
      SELECT 
        tp.*,
        u.name as full_name,
        u.email,
        u.created_at as member_since,
        (
          SELECT COUNT(*) 
          FROM leads l 
          INNER JOIN jobs j ON l.job_id = j.id 
          WHERE l.tradesperson_id = tp.user_id 
          AND j.status = 'COMPLETED'
          AND l.status = 'HIRED'
        ) as completed_jobs_count,
        (
          SELECT COUNT(*) 
          FROM tradesperson_ratings tr 
          WHERE tr.tradesperson_id = tp.user_id 
          AND tr.rating IS NOT NULL
        ) as total_ratings_count,
        (
          SELECT ROUND(AVG(tr.rating), 1)
          FROM tradesperson_ratings tr 
          WHERE tr.tradesperson_id = tp.user_id 
          AND tr.rating IS NOT NULL
        ) as average_rating_score
      FROM tradesperson_profiles tp
      INNER JOIN users u ON tp.user_id = u.id
      WHERE tp.user_id = ?
      LIMIT 1
    `, [tradespersonUserId]);

    if (!profileRows.length) {
      return NextResponse.json(
        { success: false, message: 'Tradesperson profile not found' },
        { status: 404 }
      );
    }

    const profile = profileRows[0];

    // Get recent reviews with job details
    const [reviewsRows] = await pool.query(`
      SELECT 
        tr.*,
        u.name as homeowner_name,
        j.description as job_description,
        sc.name as subcategory_name,
        c.name as category_name,
        DATE_FORMAT(tr.created_at, '%d %b %Y') as review_date
      FROM tradesperson_ratings tr
      INNER JOIN users u ON tr.homeowner_id = u.id
      INNER JOIN jobs j ON tr.job_id = j.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE tr.tradesperson_id = ?
      AND tr.rating IS NOT NULL
      ORDER BY tr.created_at DESC
      LIMIT 10
    `, [profile.user_id]);

    // Get total jobs count (all leads where tradesperson was hired)
    const [totalJobsRows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM leads l
      WHERE l.tradesperson_id = ?
      AND l.status = 'HIRED'
    `, [profile.user_id]);

    // Get active jobs count (currently in progress)
    const [activeJobsRows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM leads l
      INNER JOIN jobs j ON l.job_id = j.id
      WHERE l.tradesperson_id = ?
      AND l.status = 'HIRED'
      AND j.status IN ('HIRED', 'IN_PROGRESS')
    `, [profile.user_id]);

    // Parse JSON fields safely
    const safeJsonParse = (str) => {
      if (!str || str === 'null' || str === '' || str === '[]') return [];
      try {
        const parsed = JSON.parse(str);
        // Filter out empty strings
        return Array.isArray(parsed) ? parsed.filter(item => item && item.trim() !== '') : [];
      } catch (e) {
        console.warn('JSON parse error:', e.message, 'Input:', str);
        return [];
      }
    };

    const skills = safeJsonParse(profile.skills);
    const serviceAreas = safeJsonParse(profile.service_areas);

    // Calculate response time based on leads
    let responseTime = 'Within 48 hours';
    const [responseTimeRows] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, j.created_at, l.created_at)) as avg_response_hours
      FROM leads l
      INNER JOIN jobs j ON l.job_id = j.id
      WHERE l.tradesperson_id = ?
      AND l.created_at IS NOT NULL
      AND j.created_at IS NOT NULL
      LIMIT 1
    `, [profile.user_id]);

    if (responseTimeRows[0]?.avg_response_hours) {
      const avgHours = responseTimeRows[0].avg_response_hours;
      if (avgHours < 24) responseTime = 'Within 24 hours';
      else if (avgHours < 48) responseTime = 'Within 48 hours';
      else responseTime = 'Within a week';
    }

    // Calculate rating distribution
    const [ratingDistribution] = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM tradesperson_ratings
      WHERE tradesperson_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [profile.user_id]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(row => {
      distribution[row.rating] = row.count;
    });

    // Format response
    const response = {
      success: true,
      data: {
        id: profile.id,
        userId: profile.user_id,
        name: profile.full_name,
        email: profile.email,
        companyName: profile.company_name || profile.full_name,
        profileImage: profile.profile_image || '/default-avatar.png',
        bio: profile.bio || 'No bio provided',
        phone: profile.phone || 'Not provided',
        postcode: profile.postcode || 'Not specified',
        skills: skills.length > 0 ? skills : ['General services'],
        serviceAreas: serviceAreas.length > 0 ? serviceAreas : ['Various locations'],
        averageRating: parseFloat(profile.average_rating_score || profile.average_rating || 0).toFixed(1),
        totalRatings: profile.total_ratings_count || profile.total_ratings || 0,
        completedJobs: profile.completed_jobs_count || 0,
        totalJobs: totalJobsRows[0]?.count || 0,
        activeJobs: activeJobsRows[0]?.count || 0,
        memberSince: new Date(profile.member_since).getFullYear(),
        responseTime: responseTime,
        verified: profile.credits > 10,
        insurance: profile.credits > 20,
        ratingDistribution: distribution,
        reviews: reviewsRows.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.review || 'No comment provided',
          homeownerName: review.homeowner_name || 'Homeowner',
          jobTitle: review.category_name && review.subcategory_name 
            ? `${review.category_name} - ${review.subcategory_name}` 
            : review.subcategory_name || 'General work',
          jobDescription: review.job_description?.substring(0, 100) + (review.job_description?.length > 100 ? '...' : ''),
          date: review.review_date || 'Recently',
          helpful: Math.floor(Math.random() * 5)
        }))
      },
      stats: {
        totalJobs: totalJobsRows[0]?.count || 0,
        completionRate: profile.completed_jobs_count > 0 
          ? Math.round((profile.completed_jobs_count / (totalJobsRows[0]?.count || 1)) * 100) 
          : 0,
        repeatClients: Math.floor((profile.total_ratings_count || 0) * 0.3),
        averageRating: parseFloat(profile.average_rating_score || profile.average_rating || 0).toFixed(1),
        ratingBreakdown: distribution
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tradesperson profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message,
        sqlMessage: error.sqlMessage
      },
      { status: 500 }
    );
  }
}








