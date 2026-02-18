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

    // Get tradesperson profile using the model (which handles JSON parsing)
    // We can also join with user data if needed, but the model primarily returns profile data
    // The previous query joined with users table, so we might need to preserve that if the frontend uses user_name/email from here.
    // However, the model's findOne returns a normalized object. 
    // Let's use the model to get the profile, then fetch user details if needed, or rely on the join in the model if we add it.
    // For now, let's look at the original query: it joined users.
    // Let's stick to the raw query but APPLY THE PARSING manually or helper.
    // Actually, looking at the TradespersonProfile.js model, it has a findOne that does NOT join users by default.
    // But the frontend expects `email` in the response (ProfilePage.jsx line 35).

    // Let's use the raw query for the JOIN but parse the results.
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

      // Recursive call or just fetch what we just created
      const [newProfiles] = await pool.query(
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

      const profile = newProfiles[0];
      // PARSE JSON FIELDS
      try {
        profile.skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []);
        profile.serviceAreas = typeof profile.service_areas === 'string' ? JSON.parse(profile.service_areas) : (profile.service_areas || []); // map service_areas to serviceAreas for frontend?
        // The frontend expects camelCase 'serviceAreas' but DB has 'service_areas'. 
        // The previous code returned raw, so likely frontend accessed 'service_areas' OR 'serviceAreas' if it was consistent.
        // ProfilePage.jsx line 37 uses `data.data.serviceAreas`.
        // So we MUST map it.
        profile.serviceAreas = typeof profile.service_areas === 'string' ? JSON.parse(profile.service_areas) : (profile.service_areas || []);

        // Also map company_name to companyName if needed, but ProfilePage uses ...data, so maybe it uses snake_case?
        // ProfilePage line 14: companyName. Line 34: ...data.data.
        // If previous return was RAW, it returned `company_name`. 
        // ProfilePage line 34 spreads it.
        // ProfilePage state has `companyName`. 
        // Line 34: `setProfile({ ...data.data, ... })`
        // If data.data has company_name, but state expects companyName, the spread adds company_name to state but doesn't update companyName!
        // This implies the frontend might have been broken for companyName too, OR the previous backend query returned camelCase? 
        // No, `SELECT tp.*` returns snake_case.

        // Let's normalize the response to match what frontend likely expects (camelCase based on state variables).
        const normalized = {
          ...profile,
          companyName: profile.company_name,
          profileImage: profile.profile_image,
          serviceAreas: typeof profile.service_areas === 'string' ? JSON.parse(profile.service_areas) : (profile.service_areas || []),
          skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
        };

        return NextResponse.json({
          success: true,
          data: normalized
        });

      } catch (e) {
        console.error("Error parsing new profile JSON", e);
      }

      return NextResponse.json({ success: true, data: profile });
    }

    // Existing profile found
    const profile = profiles[0];

    // Normalize and parse
    const normalized = {
      ...profile,
      companyName: profile.company_name,
      profileImage: profile.profile_image,
      serviceAreas: typeof profile.service_areas === 'string' ? JSON.parse(profile.service_areas) : (profile.service_areas || []),
      skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
    };

    return NextResponse.json({
      success: true,
      data: normalized
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
    const [updatedProfiles] = await pool.query(
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

    const profile = updatedProfiles[0];

    // Normalize and parse
    const normalized = {
      ...profile,
      companyName: profile.company_name,
      profileImage: profile.profile_image,
      serviceAreas: typeof profile.service_areas === 'string' ? JSON.parse(profile.service_areas) : (profile.service_areas || []),
      skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: normalized
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
