// import { NextResponse } from "next/server";
// import pool from "../../../../../config/db";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const postcode = searchParams.get("postcode");
//     const query = searchParams.get("query") || searchParams.get("q"); // Text search
//     const skill = searchParams.get("skill") || searchParams.get("category");
//     const limit = parseInt(searchParams.get("limit") || "20");
//     const page = parseInt(searchParams.get("page") || "1");
//     const offset = (page - 1) * limit;

//     console.log("🔍 SEARCH REQUEST:", { postcode, query, skill, limit, page });

//     // If no search criteria provided, return defaults or empty?
//     // Let's return defaults (all) if nothing provided, but let's be careful about volume.
//     // For now, fetching all is fine as per previous logic.

//     // 1. Fetch potential matches from DB
//     // We join with users to get full name if needed, though profiles should have most data.
//     const [allRows] = await pool.query(`
//       SELECT
//         tp.id,
//         tp.user_id,
//         tp.company_name,
//         tp.profile_image,
//         tp.bio,
//         tp.phone,
//         tp.postcode,
//         tp.skills,
//         tp.service_areas,
//         tp.average_rating,
//         tp.total_ratings,
//         tp.created_at,
//         tp.updated_at,
//         u.name as user_full_name,
//         u.email as user_email
//       FROM tradesperson_profiles tp
//       LEFT JOIN users u ON tp.user_id = u.id
//     `);

//     console.log("📊 Total profiles scanned:", allRows.length);

//     let filteredRows = allRows;

//     // 2. Filter by Postcode (if provided)
//     if (postcode) {
//       const normalizedPostcode = postcode.replace(/\s+/g, "").toUpperCase();
//       const outwardCode = normalizedPostcode.match(/^[A-Z]{1,2}\d[A-Z\d]?/)?.[0];

//       filteredRows = filteredRows.filter(row => {
//         const dbPostcode = (row.postcode || "").replace(/\s+/g, "").toUpperCase();
//         // Exact match OR Outward code match
//         if (dbPostcode === normalizedPostcode) return true;
//         if (outwardCode && dbPostcode.startsWith(outwardCode)) return true;
//         return false;
//       });
//     }

//     // 3. Filter by Text Query (Name, Bio, etc.)
//     if (query) {
//       const lowerQuery = query.toLowerCase();
//       filteredRows = filteredRows.filter(row => {
//         const company = (row.company_name || "").toLowerCase();
//         const bio = (row.bio || "").toLowerCase();
//         const name = (row.user_full_name || "").toLowerCase();

//         // Also search in skills array string
//         const skillsStr = (row.skills || "").toLowerCase();

//         return company.includes(lowerQuery) ||
//           bio.includes(lowerQuery) ||
//           name.includes(lowerQuery) ||
//           skillsStr.includes(lowerQuery);
//       });
//     }

//     // 4. Filter by Specific Skill
//     if (skill) {
//       const lowerSkill = skill.toLowerCase();
//       filteredRows = filteredRows.filter(row => {
//         if (!row.skills) return false;
//         try {
//           // Handle both JSON string or if it's somehow already an object (should be string from DB)
//           const skillsArray = typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills;
//           if (Array.isArray(skillsArray)) {
//             return skillsArray.some(s => s.toLowerCase().includes(lowerSkill));
//           }
//           return false;
//         } catch (e) {
//           return false;
//         }
//       });
//     }

//     // 5. Sort results
//     // Default sort: Rating DESC, then Total Ratings DESC
//     filteredRows.sort((a, b) => {
//       const ratingA = parseFloat(a.average_rating || 0);
//       const ratingB = parseFloat(b.average_rating || 0);
//       if (ratingB !== ratingA) return ratingB - ratingA;
//       return (b.total_ratings || 0) - (a.total_ratings || 0);
//     });

//     // 6. Pagination
//     const totalCount = filteredRows.length;
//     const paginatedRows = filteredRows.slice(offset, offset + limit);

//     // 7. Format Response
//     const data = paginatedRows.map(row => ({
//       id: row.id,
//       _id: row.id, // Compatibility for frontend
//       userId: row.user_id,
//       companyName: row.company_name || row.user_full_name || "Professional",
//       profileImage: row.profile_image,
//       bio: row.bio,
//       phone: row.phone,
//       postcode: row.postcode,
//       skills: row.skills ? (typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills) : [],
//       serviceAreas: row.service_areas ? (typeof row.service_areas === 'string' ? JSON.parse(row.service_areas) : row.service_areas) : [],
//       averageRating: row.average_rating || 0,
//       totalRatings: row.total_ratings || 0,
//       memberSince: row.created_at,
//       verified: true
//     }));

//     return NextResponse.json({
//       success: true,
//       count: totalCount,
//       page,
//       limit,
//       data
//     });

//   } catch (error) {
//     console.error("❌ SEARCH ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import pool from "../../../../../config/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const postcode = searchParams.get("postcode");
    const query = searchParams.get("query") || searchParams.get("q");
    const skill = searchParams.get("skill") || searchParams.get("category");

    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let values = [];

    // 🔎 Postcode filter (exact OR starts with outward code)
    if (postcode) {
      const normalized = postcode.replace(/\s+/g, "").toUpperCase();
      const outward = normalized.match(/^[A-Z]{1,2}\d[A-Z\d]?/)?.[0];

      whereConditions.push(`
        (
          REPLACE(UPPER(tp.postcode), ' ', '') = ?
          ${outward ? "OR REPLACE(UPPER(tp.postcode), ' ', '') LIKE ?" : ""}
        )
      `);

      values.push(normalized);
      if (outward) values.push(`${outward}%`);
    }

    // 🔎 Text search (company, bio, name, skills)
    if (query) {
      whereConditions.push(`
        (
          tp.company_name LIKE ?
          OR tp.bio LIKE ?
          OR u.name LIKE ?
          OR tp.skills LIKE ?
        )
      `);

      const searchValue = `%${query}%`;
      values.push(searchValue, searchValue, searchValue, searchValue);
    }

    // 🔎 Skill filter (JSON stored as string)
    if (skill) {
      whereConditions.push(`tp.skills LIKE ?`);
      values.push(`%${skill}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // 🔹 Get total count
    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM tradesperson_profiles tp
      LEFT JOIN users u ON tp.user_id = u.id
      ${whereClause}
    `,
      values,
    );

    const totalCount = countRows[0].total;

    // 🔹 Get paginated results
    const [rows] = await pool.query(
      `
      SELECT 
        tp.id,
        tp.user_id,
        tp.company_name,
        tp.profile_image,
        tp.bio,
        tp.phone,
        tp.postcode,
        tp.skills,
        tp.service_areas,
        tp.average_rating,
        tp.total_ratings,
        tp.created_at,
        u.name as user_full_name
      FROM tradesperson_profiles tp
      LEFT JOIN users u ON tp.user_id = u.id
      ${whereClause}
      ORDER BY tp.average_rating DESC, tp.total_ratings DESC
      LIMIT ? OFFSET ?
    `,
      [...values, limit, offset],
    );

    const data = rows.map((row) => ({
      id: row.id,
      _id: row.id,
      userId: row.user_id,
      companyName: row.company_name || row.user_full_name || "Professional",
      profileImage: row.profile_image,
      bio: row.bio,
      phone: row.phone,
      postcode: row.postcode,
      skills: row.skills ? JSON.parse(row.skills) : [],
      serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
      averageRating: parseFloat(row.average_rating || 0),
      totalRatings: row.total_ratings || 0,
      memberSince: row.created_at,
      verified: true,
    }));

    return NextResponse.json({
      success: true,
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data,
    });
  } catch (error) {
    console.error("❌ SEARCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}