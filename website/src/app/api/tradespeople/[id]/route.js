import { NextResponse } from "next/server";
import pool from "../../../../../config/db";

export async function GET(req, { params }) {
  try {
    // ✅ FIX: await params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Tradesperson ID is required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT
        id,
        user_id,
        company_name,
        profile_image,
        bio,
        phone,
        postcode,
        skills,
        service_areas,
        created_at,
        updated_at
       FROM tradesperson_profiles
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Tradesperson not found" },
        { status: 404 }
      );
    }

    const row = rows[0];

    const tradespersonWithMockData = {
      _id: row.id,
      user: row.user_id,
      companyName: row.company_name,
      profileImage: row.profile_image,
      bio: row.bio,
      phone: row.phone,
      postcode: row.postcode,
      skills: row.skills ? JSON.parse(row.skills) : [],
      serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,

      // ⭐ mock demo data
      rating: 5.0,
      ratingCount: 27,
      reviews: [
        { author: "Sarah M.", rating: 5, comment: "Excellent work, very professional!" },
        { author: "James L.", rating: 5, comment: "Completed the job on time and within budget." },
        { author: "Emma R.", rating: 5, comment: "Highly recommended, will use again." }
      ]
    };

    return NextResponse.json({
      success: true,
      data: tradespersonWithMockData
    });

  } catch (error) {
    console.error("Tradesperson Profile Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
