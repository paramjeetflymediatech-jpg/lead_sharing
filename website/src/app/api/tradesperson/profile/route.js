import { NextResponse } from "next/server";
import pool from "../../../../../config/db";

// GET - Fetch tradesperson's own profile
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get tradesperson profile with user details
    const [profiles] = await pool.query(
      `SELECT 
        tp.*,
        u.email,
        u.name as user_name
      FROM tradesperson_profiles tp
      INNER JOIN users u ON tp.user_id = u.id
      WHERE tp.user_id = ?
      LIMIT 1`,
      [userId]
    );

    if (!profiles || profiles.length === 0) {
      // Create a default profile if it doesn't exist
      const [user] = await pool.query(
        `SELECT id, name, email FROM users WHERE id = ? AND role = 'TRADESPERSON' LIMIT 1`,
        [userId]
      );

      if (!user || user.length === 0) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Create default profile
      const [result] = await pool.query(
        `INSERT INTO tradesperson_profiles 
        (user_id, company_name, phone, postcode, bio, skills, service_areas, profile_image, created_at, updated_at)
        VALUES (?, ?, '', '', '', '[]', '[]', '', NOW(), NOW())`,
        [userId, user[0].name + "'s Services"]
      );

      // Fetch the newly created profile
      const [newProfile] = await pool.query(
        `SELECT 
          tp.*,
          u.email,
          u.name as user_name
        FROM tradesperson_profiles tp
        INNER JOIN users u ON tp.user_id = u.id
        WHERE tp.id = ?
        LIMIT 1`,
        [result.insertId]
      );

      return NextResponse.json({
        success: true,
        data: newProfile[0]
      });
    }

    return NextResponse.json({
      success: true,
      data: profiles[0]
    });
  } catch (error) {
    console.error("❌ Tradesperson Profile Fetch Error:", error);
    return NextResponse.json({
      message: "Server error",
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update tradesperson profile
export async function PUT(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, phone, postcode, bio, skills, serviceAreas, profileImage } = body;

    console.log("📝 Updating tradesperson profile for user:", userId);

    // Convert arrays to JSON strings for MySQL storage
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []));
    const serviceAreasJson = JSON.stringify(Array.isArray(serviceAreas) ? serviceAreas : (serviceAreas ? serviceAreas.split(",").map(s => s.trim()) : []));

    // Check if profile exists
    const [existing] = await pool.query(
      `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (existing && existing.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE tradesperson_profiles 
        SET company_name = ?,
            phone = ?,
            postcode = ?,
            bio = ?,
            skills = ?,
            service_areas = ?,
            profile_image = ?,
            updated_at = NOW()
        WHERE user_id = ?`,
        [companyName, phone, postcode, bio, skillsJson, serviceAreasJson, profileImage || '', userId]
      );

      console.log("✅ Profile updated successfully");
    } else {
      // Create new profile
      await pool.query(
        `INSERT INTO tradesperson_profiles 
        (user_id, company_name, phone, postcode, bio, skills, service_areas, profile_image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, companyName, phone, postcode, bio, skillsJson, serviceAreasJson, profileImage || '']
      );

      console.log("✅ Profile created successfully");
    }

    // Fetch updated profile
    const [updatedProfile] = await pool.query(
      `SELECT 
        tp.*,
        u.email,
        u.name as user_name
      FROM tradesperson_profiles tp
      INNER JOIN users u ON tp.user_id = u.id
      WHERE tp.user_id = ?
      LIMIT 1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile[0]
    });
  } catch (error) {
    console.error("❌ Tradesperson Profile Update Error:", error);
    return NextResponse.json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
