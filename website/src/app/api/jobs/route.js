// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import Job from "@/models/Job";
// import { isValidObjectId } from "mongoose";

// /* =========================
//    CREATE JOB (HOMEOWNER)
// ========================= */
// export async function POST(req) {
//   try {
//     await connectToDatabase();

//     const body = await req.json();
//     console.log("bodyData",body)
//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { message: "Only homeowner can create job" },
//         { status: 403 }
//       );
//     }

//     if (
//       !isValidObjectId(body.category) ||
//       !isValidObjectId(body.subCategory) ||
//       !body.description ||
//       !body.location?.postcode ||
//       !body.startTime ||
//       !body.jobStage ||
//       !body.ownership ||
//       !body.contactName ||
//       !body.contactPhone ||
//       !body.contactEmail
//     ) {
//       return NextResponse.json(
//         { message: "Invalid or missing required fields" },
//         { status: 400 }
//       );
//     }

//     const job = await Job.create({
//       homeowner: userId,

//       // 🔐 stored but never exposed publicly
//       contactName: body.contactName,
//       contactPhone: body.contactPhone,
//       contactEmail: body.contactEmail,

//       category: body.category,
//       subCategory: body.subCategory,
//       description: body.description,

//       location: {
//         postcode: body.location.postcode,
//         city: body.location.city || "",
//       },

//       startTime: body.startTime,
//       jobStage: body.jobStage,
//       ownership: body.ownership,

//       budgetMin: body.budgetMin || 0,
//       budgetMax: body.budgetMax || 0,

//       media: body.media || [],
//       status: "OPEN",
//     });

//     return NextResponse.json(job, { status: 201 });
//   } catch (error) {
//     console.error("JOB CREATE ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    GET JOB LIST (PUBLIC)
//    ❌ CONTACT HIDDEN
// ========================= */
// export async function GET() {
//   try {
//     await connectToDatabase();

//     const jobs = await Job.find({
//       status: "OPEN",
//     })
//       .populate("category", "name slug")
//       .populate("subCategory", "name slug")
//       .sort({ createdAt: -1 })
//       .lean();

//     // 🔒 DO NOT EXPOSE CONTACT
//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       category: job.category,
//       subCategory: job.subCategory,
//       description: job.description,
//       location: job.location,
//       startTime: job.startTime,
//       jobStage: job.jobStage,
//       ownership: job.ownership,
//       budgetMin: job.budgetMin,
//       budgetMax: job.budgetMax,
//       media: job.media,
//       status: job.status,
//       createdAt: job.createdAt,
//     }));

//     return NextResponse.json(safeJobs, { status: 200 });
//   } catch (error) {
//     console.error("JOB LIST ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

















import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { isValidObjectId } from "mongoose";

const MAX_LEADS_PER_JOB = 3;

/* =========================
   GET JOB LIST WITH LEAD INFO (FOR TRADESPERSON)
========================= */
export async function GET(req) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "OPEN";
    const limit = parseInt(searchParams.get("limit")) || 20;

    const query = { status };
    if (category && isValidObjectId(category)) {
      query.category = category;
    }

    const jobs = await Job.find(query)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("homeowner", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // If tradesperson is logged in, add lead information
    let tradespersonProfile = null;
    if (userId && role === "TRADESPERSON") {
      tradespersonProfile = await TradespersonProfile.findOne({
        user: userId,
      }).lean();
    }

    // For each job, get lead count and check if current tradesperson unlocked it
    const jobsWithLeadInfo = await Promise.all(
      jobs.map(async (job) => {
        // Count total leads for this job
        const leadCount = await Lead.countDocuments({
          job: job._id,
          isUnlocked: true,
        });

        // Check if current tradesperson unlocked this job
        let isUnlockedByMe = false;
        if (tradespersonProfile) {
          const myLead = await Lead.findOne({
            job: job._id,
            tradesperson: tradespersonProfile._id,
            isUnlocked: true,
          });
          isUnlockedByMe = !!myLead;
        }

        // Return job without contact info
        return {
          _id: job._id,
          category: job.category,
          subCategory: job.subCategory,
          description: job.description,
          location: job.location,
          startTime: job.startTime,
          jobStage: job.jobStage,
          ownership: job.ownership,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          media: job.media,
          status: job.status,
          createdAt: job.createdAt,
          homeowner: {
            name: job.homeowner?.name || "Homeowner",
          },
          // Lead information
          leadCount: leadCount,
          maxLeads: MAX_LEADS_PER_JOB,
          isUnlockedByMe: isUnlockedByMe,
          canUnlock: leadCount < MAX_LEADS_PER_JOB && !isUnlockedByMe,
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithLeadInfo,
      total: jobsWithLeadInfo.length,
    });
  } catch (error) {
    console.error("JOB LIST ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE JOB (HOMEOWNER)
========================= */
export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    console.log("bodyData", body);
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Only homeowner can create job" },
        { status: 403 }
      );
    }

    if (
      !isValidObjectId(body.category) ||
      !isValidObjectId(body.subCategory) ||
      !body.description ||
      !body.location?.postcode ||
      !body.startTime ||
      !body.jobStage ||
      !body.ownership ||
      !body.contactName ||
      !body.contactPhone ||
      !body.contactEmail
    ) {
      return NextResponse.json(
        { message: "Invalid or missing required fields" },
        { status: 400 }
      );
    }

    const job = await Job.create({
      homeowner: userId,

      // 🔐 stored but never exposed publicly
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,

      category: body.category,
      subCategory: body.subCategory,
      description: body.description,

      location: {
        postcode: body.location.postcode,
        city: body.location.city || "",
      },

      startTime: body.startTime,
      jobStage: body.jobStage,
      ownership: body.ownership,

      budgetMin: body.budgetMin || 0,
      budgetMax: body.budgetMax || 0,

      media: body.media || [],
      status: "OPEN",
    });

    // Populate the created job before returning
    await job.populate([
      { path: "category", select: "name slug" },
      { path: "subCategory", select: "name slug" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Job created successfully",
        job: {
          id: job._id,
          category: job.category?.name,
          subCategory: job.subCategory?.name,
          status: job.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("JOB CREATE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}