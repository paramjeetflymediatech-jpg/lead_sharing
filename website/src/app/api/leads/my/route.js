// import { NextResponse } from "next/server";
// // import { connectToDatabase } from "@/lib/mongodb";
// import { Lead } from "@/models/Lead";
// import { TradespersonProfile } from "@/models/TradespersonProfile";

// export async function GET(req) {
//   try {
//     // await connectToDatabase();

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "TRADESPERSON") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
//     }

//     const profile = await TradespersonProfile.findOne({ user: userId });
//     if (!profile) {
//       return NextResponse.json({ message: "Profile not found" }, { status: 404 });
//     }

//     const leads = await Lead.find({ tradesperson: profile._id });

//     return NextResponse.json(leads);
//   } catch (err) {
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }


// // src/app/api/leads/my/route.js
// import { NextResponse } from "next/server";
// import db from "../../../../../config/db"
// export async function GET(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "TRADESPERSON") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
//     }

//     // Get connection
//     const connection = await db.getConnection();

//     // Fetch leads with ALL necessary contact information
//     const [leads] = await connection.query(`
//       SELECT 
//         l.*,
//         j.title,
//         j.description,
//         j.location,
//         j.budget_min,
//         j.budget_max,
//         j.start_time,
//         j.status as job_status,
//         j.created_at as job_created_at,
//         j.contact_name,
//         j.contact_email,
//         j.contact_phone,
//         j.contact_address,
//         c.name as category_name,
//         sc.name as subcategory_name,
//         h.full_name as homeowner_name,
//         h.email as homeowner_email,
//         h.phone as homeowner_phone,
//         tp.company_name as tradesperson_company
//       FROM leads l
//       INNER JOIN jobs j ON l.job_id = j.id
//       LEFT JOIN categories c ON j.category_id = c.id
//       LEFT JOIN subcategories sc ON j.subcategory_id = sc.id
//       LEFT JOIN homeowners h ON j.homeowner_id = h.id
//       LEFT JOIN tradesperson_profiles tp ON l.tradesperson_id = tp.id
//       WHERE l.tradesperson_id = ?
//       AND l.is_unlocked = 1
//       ORDER BY l.unlocked_at DESC
//     `, [userId]);

//     connection.release();

//     // Format the response
//     const formattedLeads = leads.map(lead => ({
//       id: lead.id,
//       jobId: lead.job_id,
//       isUnlocked: lead.is_unlocked,
//       message: lead.message,
//       priceEstimate: lead.price_estimate,
//       status: lead.status,
//       unlockedAt: lead.unlocked_at,
//       createdAt: lead.created_at,
//       job: {
//         id: lead.job_id,
//         title: lead.title,
//         description: lead.description,
//         location: lead.location,
//         budgetMin: lead.budget_min,
//         budgetMax: lead.budget_max,
//         startTime: lead.start_time,
//         status: lead.job_status,
//         createdAt: lead.job_created_at,
//         category: {
//           name: lead.category_name
//         },
//         subCategory: {
//           name: lead.subcategory_name
//         },
//         // Contact info from job table
//         contactName: lead.contact_name,
//         contactEmail: lead.contact_email,
//         contactPhone: lead.contact_phone,
//         contactAddress: lead.contact_address,
//         // OR from homeowner table (use whichever has data)
//         homeownerName: lead.homeowner_name,
//         homeownerEmail: lead.homeowner_email,
//         homeownerPhone: lead.homeowner_phone
//       },
//       tradesperson: {
//         companyName: lead.tradesperson_company
//       }
//     }));

//     return NextResponse.json({
//       success: true,
//       data: formattedLeads
//     });

//   } catch (err) {
//     console.error("Error fetching leads:", err);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
//

// import { NextResponse } from "next/server";
// import db from "../../../../../config/db";

// export async function GET(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "TRADESPERSON") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
//     }

//     // 1. Get tradeperson profile ID
//     const [profileRows] = await db.query(
//       `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
//       [userId]
//     );

//     if (!profileRows || profileRows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "Tradeperson profile not found" },
//         { status: 404 }
//       );
//     }

//     const tradespersonId = profileRows[0].id;

//     // 2. SIMPLE QUERY - Only using columns that definitely exist
//     const [leads] = await db.query(`
//       SELECT 
//         l.*,
//         j.id as job_id,
//         j.description,
//         j.postcode,
//         j.city,
//         j.budget_min,
//         j.budget_max,
//         j.status as job_status,
//         j.hired_tradesperson_id,
//         j.hired_at,
//         j.created_at as job_created_at,
//         j.contact_name,
//         j.contact_email,
//         j.contact_phone,
//         u.name as homeowner_name,
//         u.email as homeowner_email,
//         tp.company_name as tradesperson_company
//       FROM leads l
//       INNER JOIN jobs j ON l.job_id = j.id
//       LEFT JOIN users u ON j.homeowner_id = u.id
//       LEFT JOIN tradesperson_profiles tp ON l.tradesperson_id = tp.id
//       WHERE l.tradesperson_id = ?
//       AND l.is_unlocked = 1
//       ORDER BY 
//         CASE 
//           WHEN l.status = 'HIRED' THEN 1
//           WHEN l.status = 'PENDING' THEN 2
//           WHEN l.status = 'REJECTED' THEN 3
//           ELSE 4
//         END,
//         l.unlocked_at DESC
//     `, [tradespersonId]);

//     // 3. Format the response
//     const formattedLeads = leads.map(lead => {
//       // Build location from postcode and city
//       const locationParts = [];
//       if (lead.city) locationParts.push(lead.city);
//       if (lead.postcode) locationParts.push(lead.postcode);
//       const location = locationParts.length > 0 ? locationParts.join(', ') : 'Not specified';

//       // Contact info - job contact fields are already populated
//       const contactName = lead.contact_name || lead.homeowner_name || 'Not provided';
//       const contactEmail = lead.contact_email || lead.homeowner_email || 'Not provided';
//       const contactPhone = lead.contact_phone || 'Not provided'; // No phone in users table

//       return {
//         id: lead.id,
//         jobId: lead.job_id,
//         message: lead.message || '',
//         priceEstimate: lead.price_estimate || '',
//         status: lead.status || 'PENDING',
//         unlockedAt: lead.unlocked_at,
//         createdAt: lead.created_at,
//         job: {
//           id: lead.job_id,
//           title: lead.description ? (lead.description.length > 50 ? lead.description.substring(0, 50) + '...' : lead.description) : 'Job Request',
//           description: lead.description || '',
//           location: location,
//           budgetMin: lead.budget_min || 0,
//           budgetMax: lead.budget_max || 0,
//           status: lead.job_status || 'OPEN',
//           isHired: lead.job_status === 'HIRED',
//           hiredTradespersonId: lead.hired_tradesperson_id,
//           hiredAt: lead.hired_at,
//           createdAt: lead.job_created_at,
//           contactName: contactName,
//           contactEmail: contactEmail,
//           contactPhone: contactPhone
//         },
//         tradesperson: {
//           companyName: lead.tradesperson_company || 'My Company'
//         }
//       };
//     });

//     // 4. Simple stats
//     const stats = {
//       total: formattedLeads.length,
//       hired: formattedLeads.filter(l => l.status === 'HIRED').length,
//       pending: formattedLeads.filter(l => l.status === 'PENDING').length,
//       rejected: formattedLeads.filter(l => l.status === 'REJECTED').length
//     };

//     return NextResponse.json({
//       success: true,
//       data: {
//         leads: formattedLeads,
//         stats: stats
//       }
//     });

//   } catch (err) {
//     console.error("Error fetching leads:", err.message);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: "Server error"
//       },
//       { status: 500 }
//     );
//   }
// }






import { NextResponse } from "next/server";
import db from "../../../../../config/db";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // 1. Get tradeperson profile ID
    const [profileRows] = await db.query(
      `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    let tradespersonId;

    if (!profileRows || profileRows.length === 0) {
      console.log(`⚠️ No profile found for user ${userId}, creating default profile...`);

      // Get user info to create profile
      const [userRows] = await db.query(
        `SELECT id, name FROM users WHERE id = ? AND role = 'TRADESPERSON' LIMIT 1`,
        [userId]
      );

      if (!userRows || userRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tradesperson user not found" },
          { status: 404 }
        );
      }

      // Create default profile
      const [insertResult] = await db.query(
        `INSERT INTO tradesperson_profiles 
        (user_id, company_name, phone, postcode, bio, skills, service_areas, profile_image, created_at, updated_at)
        VALUES (?, ?, '', '', 'Profile not yet completed', '[]', '[]', '', NOW(), NOW())`,
        [userId, userRows[0].name + "'s Services"]
      );

      tradespersonId = insertResult.insertId;
      console.log(`✅ Created default profile with ID: ${tradespersonId}`);
    } else {
      tradespersonId = profileRows[0].id;
    }

    // 2. SIMPLE QUERY - Using your actual columns from jobs table
    const [leads] = await db.query(`
      SELECT 
        l.*,
        j.id as job_id,
        j.description,
        j.postcode,
        j.city,
        j.budget_min,
        j.budget_max,
        j.status as job_status,
        j.hired_tradesperson_id,
        j.hired_at,
        j.created_at as job_created_at,
        j.contact_name,
        j.contact_email,
        j.contact_phone,
        j.category_id,
        j.sub_category_id,
        c.name as category_name,
        sc.name as sub_category_name,
        u.name as homeowner_name,
        u.email as homeowner_email,
        tp.company_name as tradesperson_company
      FROM leads l
      INNER JOIN jobs j ON l.job_id = j.id
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN users u ON j.homeowner_id = u.id
      LEFT JOIN tradesperson_profiles tp ON l.tradesperson_id = tp.user_id
      WHERE l.tradesperson_id = ?
      AND l.is_unlocked = 1
      ORDER BY 
        CASE 
          WHEN l.status = 'HIRED' THEN 1
          WHEN l.status = 'PENDING' THEN 2
          WHEN l.status = 'REJECTED' THEN 3
          ELSE 4
        END,
        l.unlocked_at DESC
    `, [userId]);

    // 3. Format the response
    const formattedLeads = leads.map(lead => {
      // Build location from postcode and city
      const locationParts = [];
      if (lead.city) locationParts.push(lead.city);
      if (lead.postcode) locationParts.push(lead.postcode);
      const location = locationParts.length > 0 ? locationParts.join(', ') : 'Not specified';

      // Contact info - job contact fields are already populated
      const contactName = lead.contact_name || lead.homeowner_name || 'Not provided';
      const contactEmail = lead.contact_email || lead.homeowner_email || 'Not provided';
      const contactPhone = lead.contact_phone || 'Not provided';

      // Create job title from category and description
      let jobTitle = '';
      if (lead.category_name) {
        jobTitle = lead.category_name;
        if (lead.sub_category_name) {
          jobTitle += ` - ${lead.sub_category_name}`;
        }
      } else {
        // Fallback to first 50 chars of description
        jobTitle = lead.description ?
          (lead.description.length > 50 ? lead.description.substring(0, 50) + '...' : lead.description)
          : 'Job Request';
      }

      return {
        id: lead.id,
        jobId: lead.job_id,
        message: lead.message || '',
        priceEstimate: lead.price_estimate || '',
        status: lead.status || 'PENDING',
        unlockedAt: lead.unlocked_at,
        createdAt: lead.created_at,
        job: {
          id: lead.job_id,
          title: jobTitle, // Using category + subcategory as title
          categoryName: lead.category_name || '',
          subCategoryName: lead.sub_category_name || '',
          description: lead.description || '',
          location: location,
          budgetMin: lead.budget_min || 0,
          budgetMax: lead.budget_max || 0,
          status: lead.job_status || 'OPEN',
          isHired: lead.job_status === 'HIRED',
          hiredTradespersonId: lead.hired_tradesperson_id,
          hiredAt: lead.hired_at,
          createdAt: lead.job_created_at,
          contactName: contactName,
          contactEmail: contactEmail,
          contactPhone: contactPhone,
          categoryId: lead.category_id,
          subCategoryId: lead.sub_category_id
        },
        tradesperson: {
          companyName: lead.tradesperson_company || 'My Company'
        }
      };
    });

    // 4. Simple stats
    const stats = {
      total: formattedLeads.length,
      hired: formattedLeads.filter(l => l.status === 'HIRED').length,
      pending: formattedLeads.filter(l => l.status === 'PENDING').length,
      rejected: formattedLeads.filter(l => l.status === 'REJECTED').length
    };

    return NextResponse.json({
      success: true,
      data: {
        leads: formattedLeads,
        stats: stats
      }
    });

  } catch (err) {
    console.error("Error fetching leads:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: "Server error"
      },
      { status: 500 }
    );
  }
}