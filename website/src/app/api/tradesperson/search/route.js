import { NextResponse } from "next/server";
import pool from "@/config/db";

function normalizePostcode(postcode = "") {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postcode = searchParams.get("postcode");

    if (!postcode) {
      return NextResponse.json(
        { message: "Postcode is required" },
        { status: 400 }
      );
    }

    const normalized = normalizePostcode(postcode);

    // UK outward code: SW1A, E1, B12 etc
    const outwardCode = normalized.match(/^[A-Z]{1,2}\d[A-Z\d]?/)?.[0];

    let sql = `
      SELECT *
      FROM tradesperson_profiles
      WHERE postcode = ?
    `;

    const params = [normalized];

    if (outwardCode) {
      sql += ` OR postcode LIKE ?`;
      params.push(`${outwardCode}%`);
    }

    sql += ` LIMIT 20`;

    const [rows] = await pool.query(sql, params);

    const data = rows.map(row => ({
      _id: row.id,
      user: row.user_id,
      companyName: row.company_name,
      profileImage: row.profile_image,
      bio: row.bio,
      phone: row.phone,
      postcode: row.postcode,
      skills: row.skills ? JSON.parse(row.skills) : [],
      serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
      credits: row.credits,
      createdAt: row.created_at,
      updatedAt: row.updated_at,

      // ⭐ Dummy ratings (same as your Mongo API)
      rating: 5.0,
      ratingCount: Math.floor(Math.random() * 50) + 5
    }));

    return NextResponse.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("Tradespeople Search Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
