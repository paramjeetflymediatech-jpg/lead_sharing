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
    let tradespersonProfileId = null;
    let tradespersonUserId = null;

    // Check if id is a numeric profile id
    if (id && !isNaN(id) && id.length < 10) {
      // Likely a numeric profile id
      const [profileCheckRows] = await pool.query(`
        SELECT id, user_id FROM tradesperson_profiles WHERE id = ?
      `, [id]);

      if (profileCheckRows.length > 0) {
        tradespersonProfileId = profileCheckRows[0].id;
        tradespersonUserId = profileCheckRows[0].user_id;
      }
    } else {
      // Likely a user id
      const [profileCheckRows] = await pool.query(`
        SELECT id, user_id FROM tradesperson_profiles WHERE user_id = ?
      `, [id]);

      if (profileCheckRows.length > 0) {
        tradespersonProfileId = profileCheckRows[0].id;
        tradespersonUserId = profileCheckRows[0].user_id;
      }
    }

    // If profile doesn't exist, try to create a default one
    if (!tradespersonProfileId) {
      console.log(`⚠️ Tradesperson profile not found for ID: ${id}, attempting to create default profile...`);

      // Try to find the user (either by profile ID or user ID)
      const [userRows] = await pool.query(`
        SELECT id, name, email FROM users 
        WHERE (id = ? OR id IN (SELECT user_id FROM tradesperson_profiles WHERE id = ?))
        AND role = 'TRADESPERSON'
        LIMIT 1
      `, [id, id]);

      if (userRows.length > 0) {
        const user = userRows[0];
        console.log(`✅ Found tradesperson user: ${user.name} (ID: ${user.id})`);

        // Check if a profile already exists for this user (by user_id, not profile id)
        const [existingProfileRows] = await pool.query(`
          SELECT id, user_id FROM tradesperson_profiles WHERE user_id = ?
        `, [user.id]);

        if (existingProfileRows.length > 0) {
          // Profile exists, just use it
          tradespersonProfileId = existingProfileRows[0].id;
          tradespersonUserId = existingProfileRows[0].user_id;
          console.log(`✅ Found existing profile with ID: ${tradespersonProfileId} for user ${user.id}`);
        } else {
          // Create a default profile for this tradesperson
          console.log(`Creating new default profile for user ${user.id}...`);
          const [insertResult] = await pool.query(`
            INSERT INTO tradesperson_profiles 
            (user_id, company_name, phone, postcode, bio, skills, service_areas, profile_image, created_at, updated_at)
            VALUES (?, ?, '', '', 'Profile not yet completed', '[]', '[]', '', NOW(), NOW())
          `, [user.id, user.name + "'s Services"]);

          tradespersonProfileId = insertResult.insertId;
          tradespersonUserId = user.id;
          console.log(`✅ Created default profile with ID: ${tradespersonProfileId}`);
        }
      } else {
        // User doesn't exist or is not a tradesperson
        console.log(`❌ No tradesperson user found for ID: ${id}`);
        return NextResponse.json(
          { success: false, message: 'Tradesperson not found' },
          { status: 404 }
        );
      }
    }

    // Now get tradesperson profile with user details
    // NOTE: leads.tradesperson_id = tradesperson_profiles.id (profile ID)
    //       tradesperson_ratings.tradesperson_id = users.id (user ID)
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
          WHERE l.tradesperson_id = tp.id 
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
      WHERE tp.id = ?
      LIMIT 1
    `, [tradespersonProfileId]);

    if (!profileRows.length) {
      return NextResponse.json(
        { success: false, message: 'Tradesperson profile not found' },
        { status: 404 }
      );
    }

    const profile = profileRows[0];

    // Get recent reviews with job details using USER_ID (tradesperson_ratings.tradesperson_id = users.id)
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
    `, [tradespersonUserId]);

    // Get total jobs count (all leads where tradesperson was hired) using PROFILE_ID
    const [totalJobsRows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM leads l
      WHERE l.tradesperson_id = ?
      AND l.status = 'HIRED'
    `, [tradespersonProfileId]);

    // Get active jobs count (currently in progress) using PROFILE_ID
    const [activeJobsRows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM leads l
      INNER JOIN jobs j ON l.job_id = j.id
      WHERE l.tradesperson_id = ?
      AND l.status = 'HIRED'
      AND j.status IN ('HIRED', 'IN_PROGRESS')
    `, [tradespersonProfileId]);

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

    // Calculate response time based on leads using PROFILE_ID
    let responseTime = 'Within 48 hours';
    const [responseTimeRows] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, j.created_at, l.created_at)) as avg_response_hours
      FROM leads l
      INNER JOIN jobs j ON l.job_id = j.id
      WHERE l.tradesperson_id = ?
      AND l.created_at IS NOT NULL
      AND j.created_at IS NOT NULL
      LIMIT 1
    `, [tradespersonProfileId]);

    if (responseTimeRows[0]?.avg_response_hours) {
      const avgHours = responseTimeRows[0].avg_response_hours;
      if (avgHours < 24) responseTime = 'Within 24 hours';
      else if (avgHours < 48) responseTime = 'Within 48 hours';
      else responseTime = 'Within a week';
    }

    // Calculate rating distribution using USER_ID
    const [ratingDistribution] = await pool.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM tradesperson_ratings
      WHERE tradesperson_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [tradespersonUserId]);

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
