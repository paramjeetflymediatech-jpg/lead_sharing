// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import Job from "@/models/Job";
// import { Lead } from "@/models/Lead";

// export async function POST(req, context) {
//   try {
//     await connectToDatabase();

//     // ✅ IMPORTANT FIX (Next.js App Router)
//     const { jobId } = await context.params;

//     const { leadId } = await req.json();

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     // 🔐 Auth check
//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 403 }
//       );
//     }

//     // ❌ Missing leadId
//     if (!leadId) {
//       return NextResponse.json(
//         { message: "leadId is required" },
//         { status: 400 }
//       );
//     }

//     // 🔎 Check job (OPEN only)
//     const job = await Job.findOne({
//       _id: jobId,
//       homeowner: userId,
//       status: "OPEN",
//     });

//     if (!job) {
//       return NextResponse.json(
//         { message: "Job not found or already hired" },
//         { status: 400 }
//       );
//     }

//     // 🔎 Check lead
//     const lead = await Lead.findOne({
//       _id: leadId,
//       job: jobId,
//     });

//     if (!lead) {
//       return NextResponse.json(
//         { message: "Lead not found for this job" },
//         { status: 404 }
//       );
//     }

//     // ✅ UPDATE JOB (NO VALIDATION ISSUE)
//     await Job.updateOne(
//       { _id: jobId },
//       {
//         $set: {
//           status: "HIRED",
//           hiredTradesperson: lead.tradesperson,
//           hiredAt: new Date(),
//         },
//       }
//     );

//     // ✅ UPDATE LEADS
//     await Lead.updateMany(
//       { job: jobId },
//       { status: "REJECTED" }
//     );

//     await Lead.updateOne(
//       { _id: leadId },
//       { status: "HIRED" }
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Tradesperson hired successfully",
//       hiredTradesperson: lead.tradesperson,
//     });

//   } catch (error) {
//     console.error("HIRE API ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }








import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job"; // ✅ IMPORTANT: Import Job model first
import { Lead } from "@/models/Lead";

export async function POST(req, context) {
  try {
    await connectToDatabase();

    // ✅ Await params in Next.js 15+
    const params = await context.params;
    const jobId = params.jobId;

    const { leadId } = await req.json();

    // ✅ Validate jobId
    if (!jobId || jobId === 'undefined') {
      return NextResponse.json(
        { success: false, message: "Invalid job ID" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // 🔐 Auth check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // ❌ Validate leadId
    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "leadId is required" },
        { status: 400 }
      );
    }

    console.log("Hiring for jobId:", jobId, "leadId:", leadId, "userId:", userId);

    // 🔎 Check if job exists and belongs to this homeowner
    const job = await Job.findOne({
      _id: jobId,
      homeowner: userId,
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    // 🔎 Check if job is already hired
    if (job.status === "HIRED") {
      return NextResponse.json(
        { success: false, message: "This job already has a hired tradesperson" },
        { status: 400 }
      );
    }

    // 🔎 Verify lead exists for this job
    const lead = await Lead.findOne({
      _id: leadId,
      job: jobId,
    }).populate("tradesperson");

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found for this job" },
        { status: 404 }
      );
    }

    // ✅ UPDATE JOB STATUS TO HIRED
    job.status = "HIRED";
    job.hiredTradesperson = lead.tradesperson._id;
    job.hiredAt = new Date();
    await job.save();

    // ✅ UPDATE ALL LEADS FOR THIS JOB
    // Mark all leads as REJECTED
    await Lead.updateMany(
      { job: jobId },
      { $set: { status: "REJECTED" } }
    );

    // Mark the selected lead as HIRED
    await Lead.updateOne(
      { _id: leadId },
      { $set: { status: "HIRED" } }
    );

    console.log("Successfully hired tradesperson for job:", jobId);

    return NextResponse.json({
      success: true,
      message: "Tradesperson hired successfully",
      data: {
        job: {
          _id: job._id,
          status: job.status,
          hiredTradesperson: job.hiredTradesperson,
          hiredAt: job.hiredAt,
        },
        hiredTradesperson: {
          _id: lead.tradesperson._id,
          companyName: lead.tradesperson.companyName,
        },
      },
    });
  } catch (error) {
    console.error("HIRE API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}