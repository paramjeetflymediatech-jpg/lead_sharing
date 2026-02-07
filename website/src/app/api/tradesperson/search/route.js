import { NextResponse } from "next/server";
import pool from "../../../../../config/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postcode = searchParams.get("postcode");

    console.log("🔍 SEARCH REQUEST - Postcode:", postcode);

    if (!postcode) {
      return NextResponse.json(
        { message: "Postcode is required" },
        { status: 400 }
      );
    }

    // Normalize: remove spaces and uppercase
    const normalized = postcode.replace(/\s+/g, "").toUpperCase();
    console.log("🔍 Normalized postcode:", normalized);

    // Extract outward code (e.g., "SW1A" from "SW1A1AA")
    const outwardCode = normalized.match(/^[A-Z]{1,2}\d[A-Z\d]?/)?.[0];
    console.log("🔍 Outward code:", outwardCode);

    // SIMPLE QUERY - Just get ALL profiles and filter in JS
    const [allRows] = await pool.query(`
      SELECT 
        id,
        user_id,
        company_name,
        profile_image,
        bio,
        phone,
        postcode,
        skills,
        service_areas,
        average_rating,
        total_ratings,
        created_at,
        updated_at
      FROM tradesperson_profiles
    `);

    console.log("📊 Total profiles in database:", allRows.length);

    // Filter in JavaScript (more reliable than SQL with postcode formats)
    const filteredRows = allRows.filter(row => {
      const dbPostcode = (row.postcode || "").replace(/\s+/g, "").toUpperCase();
      
      // Exact match
      if (dbPostcode === normalized) {
        console.log("✅ EXACT MATCH:", row.company_name, "-", row.postcode);
        return true;
      }
      
      // Outward code match (e.g., SW1A matches SW1A1AA)
      if (outwardCode && dbPostcode.startsWith(outwardCode)) {
        console.log("✅ AREA MATCH:", row.company_name, "-", row.postcode);
        return true;
      }
      
      return false;
    });

    console.log("✅ Filtered results:", filteredRows.length);

    const data = filteredRows.map(row => ({
      _id: row.id,
      user: row.user_id,
      companyName: row.company_name,
      profileImage: row.profile_image,
      bio: row.bio,
      phone: row.phone,
      postcode: row.postcode,
      skills: row.skills ? JSON.parse(row.skills) : [],
      serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
      average_rating: row.average_rating || 0,
      total_ratings: row.total_ratings || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    // Sort by rating
    data.sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.total_ratings - a.total_ratings;
    });

    console.log("📤 Sending response:", data.length, "results");

    return NextResponse.json({
      success: true,
      count: data.length,
      data: data.slice(0, 20) // Limit to 20 results
    });

  } catch (error) {
    console.error("❌ SEARCH ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}