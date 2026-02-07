// // app/api/jobs/homeowner/[id]/route.js
// import { NextResponse } from "next/server";
// import Job from "@/models/Job";

// /* =========================
//    GET SINGLE JOB (HOMEOWNER ONLY)
// ========================= */
// export async function GET(req, { params }) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { message: "Job ID is required" },
//         { status: 400 }
//       );
//     }

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { message: "Only homeowner can view this" },
//         { status: 403 }
//       );
//     }

//     // Find job and check ownership
//     const job = await Job.findOne({ 
//       _id: id, 
//       homeowner: userId 
//     });
    
//     if (!job) {
//       return NextResponse.json(
//         { message: "Job not found or you don't have access" },
//         { status: 404 }
//       );
//     }

//     // Return full job details with contact info
//     return NextResponse.json({
//       success: true,
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
//       contactName: job.contactName,
//       contactPhone: job.contactPhone,
//       contactEmail: job.contactEmail,
//       contact: {
//         name: job.contactName,
//         phone: job.contactPhone,
//         email: job.contactEmail,
//       },
//     });
    
//   } catch (error) {
//     console.error("GET JOB ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    UPDATE JOB (HOMEOWNER ONLY)
// ========================= */
// export async function PUT(req, { params }) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { message: "Job ID is required" },
//         { status: 400 }
//       );
//     }

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { message: "Only homeowner can update jobs" },
//         { status: 403 }
//       );
//     }

//     const body = await req.json();
//     console.log("Update body:", body);

//     // Check if job exists and belongs to this homeowner
//     const existingJob = await Job.findOne({ 
//       _id: id, 
//       homeowner: userId 
//     });

//     if (!existingJob) {
//       return NextResponse.json(
//         { message: "Job not found or you don't have permission" },
//         { status: 404 }
//       );
//     }

//     // Check if job is editable
//     const editableStatuses = ["OPEN", "PENDING"];
//     if (!editableStatuses.includes(existingJob.status)) {
//       return NextResponse.json(
//         { message: `Cannot edit job with status: ${existingJob.status}` },
//         { status: 400 }
//       );
//     }

//     // Validate required fields
//     if (
//       !body.category ||
//       !body.subCategory ||
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
//         { message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Prepare updates
//     const updates = {
//       category: body.category,
//       subCategory: body.subCategory,
//       description: body.description,
//       location: {
//         postcode: body.location.postcode,
//         city: body.location.city || ""
//       },
//       startTime: body.startTime,
//       jobStage: body.jobStage,
//       ownership: body.ownership,
//       budgetMin: body.budgetMin || 0,
//       budgetMax: body.budgetMax || 0,
//       media: body.media || [],
//       contactName: body.contactName,
//       contactPhone: body.contactPhone,
//       contactEmail: body.contactEmail,
//     };

//     // Update the job
//     const updatedJob = await Job.findByIdAndUpdate(
//       id,
//       { $set: updates },
//       { new: true }
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Job updated successfully",
//       job: {
//         _id: updatedJob._id,
//         category: updatedJob.category,
//         subCategory: updatedJob.subCategory,
//         description: updatedJob.description,
//         location: updatedJob.location,
//         startTime: updatedJob.startTime,
//         jobStage: updatedJob.jobStage,
//         ownership: updatedJob.ownership,
//         budgetMin: updatedJob.budgetMin,
//         budgetMax: updatedJob.budgetMax,
//         media: updatedJob.media,
//         status: updatedJob.status,
//         createdAt: updatedJob.createdAt,
//         contactName: updatedJob.contactName,
//         contactPhone: updatedJob.contactPhone,
//         contactEmail: updatedJob.contactEmail,
//         contact: {
//           name: updatedJob.contactName,
//           phone: updatedJob.contactPhone,
//           email: updatedJob.contactEmail,
//         }
//       }
//     }, { status: 200 });

//   } catch (error) {
//     console.error("UPDATE JOB ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    DELETE JOB (HOMEOWNER ONLY)
// ========================= */
// export async function DELETE(req, { params }) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { message: "Job ID is required" },
//         { status: 400 }
//       );
//     }

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId || role !== "HOMEOWNER") {
//       return NextResponse.json(
//         { message: "Only homeowner can delete jobs" },
//         { status: 403 }
//       );
//     }

//     // Check if job exists and belongs to this homeowner
//     const existingJob = await Job.findOne({ 
//       _id: id, 
//       homeowner: userId 
//     });

//     if (!existingJob) {
//       return NextResponse.json(
//         { message: "Job not found or you don't have permission" },
//         { status: 404 }
//       );
//     }

//     // Delete the job
//     await Job.deleteOne({ _id: id });

//     return NextResponse.json({
//       success: true,
//       message: "Job deleted successfully"
//     }, { status: 200 });

//   } catch (error) {
//     console.error("DELETE JOB ERROR:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }




























import { NextResponse } from "next/server";
import Job from "@/models/Job";

/* =========================
   GET SINGLE JOB (HOMEOWNER ONLY)
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Job ID is required" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Only homeowner can view this" },
        { status: 403 }
      );
    }

    // Find job and check ownership - MySQL model के according
    const job = await Job.findOne({ 
      _id: id, 
      homeowner: userId 
    });
    
    if (!job) {
      return NextResponse.json(
        { message: "Job not found or you don't have access" },
        { status: 404 }
      );
    }

    console.log("Job from DB:", job); // Debug log

    // Return full job details with contact info - MySQL structure के according
    return NextResponse.json({
      success: true,
      _id: job._id,
      category: job.category?._id || job.category, // ID लौटाएं, object नहीं
      subCategory: job.subCategory?._id || job.subCategory, // ID लौटाएं
      description: job.description,
      location: job.location || {
        city: job.city || '',
        postcode: job.postcode || ''
      },
      startTime: job.startTime || job.start_time,
      jobStage: job.jobStage || job.job_stage,
      ownership: job.ownership,
      budgetMin: job.budgetMin || job.budget_min,
      budgetMax: job.budgetMax || job.budget_max,
      media: job.media || [],
      status: job.status,
      createdAt: job.createdAt || job.created_at,
      contactName: job.contactName || job.contact_name,
      contactPhone: job.contactPhone || job.contact_phone,
      contactEmail: job.contactEmail || job.contact_email,
      // Additional fields from your jobs list API
      homeowner: job.homeowner,
      leadCount: job.leadCount || 0,
      maxLeads: job.maxLeads || 3,
      isUnlockedByMe: job.isUnlockedByMe || false,
      canUnlock: job.canUnlock || true
    });
    
  } catch (error) {
    console.error("GET JOB ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE JOB (HOMEOWNER ONLY)
========================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Job ID is required" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Only homeowner can update jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Update body:", body);

    // Check if job exists and belongs to this homeowner
    const existingJob = await Job.findOne({ 
      _id: id, 
      homeowner: userId 
    });

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Check if job is editable
    const editableStatuses = ["OPEN", "PENDING"];
    if (!editableStatuses.includes(existingJob.status)) {
      return NextResponse.json(
        { message: `Cannot edit job with status: ${existingJob.status}` },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'category', 'subCategory', 'description', 
      'location', 'startTime', 'jobStage', 'ownership',
      'contactName', 'contactPhone', 'contactEmail'
    ];
    
    for (const field of requiredFields) {
      if (field === 'location') {
        if (!body.location?.postcode) {
          return NextResponse.json(
            { message: "Postcode is required in location" },
            { status: 400 }
          );
        }
      } else if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Prepare updates for MySQL
    const updates = {
      category: body.category,
      subCategory: body.subCategory,
      description: body.description,
      location: body.location, // MySQL model location को object के रूप में handle करता है
      city: body.location?.city || "",
      postcode: body.location?.postcode || "",
      startTime: body.startTime,
      jobStage: body.jobStage,
      ownership: body.ownership,
      budgetMin: body.budgetMin || 0,
      budgetMax: body.budgetMax || 0,
      media: body.media || [],
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      status: body.status || existingJob.status // Status भी update हो सकता है
    };

    console.log("Updates for MySQL:", updates);

    // Update the job - MySQL model के according
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: {
        _id: updatedJob._id,
        category: updatedJob.category,
        subCategory: updatedJob.subCategory,
        description: updatedJob.description,
        location: updatedJob.location || {
          city: updatedJob.city || '',
          postcode: updatedJob.postcode || ''
        },
        startTime: updatedJob.startTime || updatedJob.start_time,
        jobStage: updatedJob.jobStage || updatedJob.job_stage,
        ownership: updatedJob.ownership,
        budgetMin: updatedJob.budgetMin || updatedJob.budget_min,
        budgetMax: updatedJob.budgetMax || updatedJob.budget_max,
        media: updatedJob.media || [],
        status: updatedJob.status,
        createdAt: updatedJob.createdAt || updatedJob.created_at,
        contactName: updatedJob.contactName || updatedJob.contact_name,
        contactPhone: updatedJob.contactPhone || updatedJob.contact_phone,
        contactEmail: updatedJob.contactEmail || updatedJob.contact_email,
        homeowner: updatedJob.homeowner,
        leadCount: updatedJob.leadCount || 0,
        maxLeads: updatedJob.maxLeads || 3
      }
    }, { status: 200 });

  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE JOB (HOMEOWNER ONLY)
========================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Job ID is required" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Only homeowner can delete jobs" },
        { status: 403 }
      );
    }

    // Check if job exists and belongs to this homeowner
    const existingJob = await Job.findOne({ 
      _id: id, 
      homeowner: userId 
    });

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Delete the job
    await Job.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}