// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import { Lead } from "@/models/Lead";

// import Job from "@/models/Job";


// export async function GET(req, { params }) {
//   try {
//     await connectToDatabase();

//     // 🔥 FIX HERE
//     const { jobId } = await params;

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
//     }

//     const job = await Job.findById(jobId);
//     if (!job || job.homeowner.toString() !== userId) {
//       return NextResponse.json({ message: "Access denied" }, { status: 403 });
//     }

//     const leads = await Lead.find({ job: jobId })
//       .populate("tradesperson")
//       .sort({ createdAt: -1 });

//     return NextResponse.json(leads);
//   } catch (err) {
//     console.error("HOMEOWNER LEADS ERROR:", err);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job"; // ✅ IMPORTANT: Import Job model first
import { Lead } from "@/models/Lead";

export async function GET(req, context) {
  try {
    await connectToDatabase();

    // ✅ Await params in Next.js 15+
    const params = await context.params;
    const jobId = params.jobId;

    // ✅ Validate jobId exists
    if (!jobId || jobId === 'undefined') {
      return NextResponse.json(
        { success: false, message: "Invalid job ID" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // 🔐 Auth check - only homeowners can view their job leads
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("Fetching leads for jobId:", jobId, "userId:", userId);

    // 🔎 Verify the job belongs to this homeowner
    const job = await Job.findById(jobId);
    if (!job || job.homeowner.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 📋 Fetch all leads for this job with tradesperson details
    const leads = await Lead.find({ job: jobId })
      .populate({
        path: "tradesperson",
        select: "companyName phone bio skills serviceAreas credits user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    console.log(`Found ${leads.length} leads for job ${jobId}`);

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (err) {
    console.error("GET LEADS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}