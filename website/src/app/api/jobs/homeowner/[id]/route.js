// app/api/jobs/homeowner/[id]/route.js
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

    // Find job and check ownership
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

    // Return full job details with contact info
    return NextResponse.json({
      success: true,
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
      contactName: job.contactName,
      contactPhone: job.contactPhone,
      contactEmail: job.contactEmail,
      contact: {
        name: job.contactName,
        phone: job.contactPhone,
        email: job.contactEmail,
      },
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
    if (
      !body.category ||
      !body.subCategory ||
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
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare updates
    const updates = {
      category: body.category,
      subCategory: body.subCategory,
      description: body.description,
      location: {
        postcode: body.location.postcode,
        city: body.location.city || ""
      },
      startTime: body.startTime,
      jobStage: body.jobStage,
      ownership: body.ownership,
      budgetMin: body.budgetMin || 0,
      budgetMax: body.budgetMax || 0,
      media: body.media || [],
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
    };

    // Update the job
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
        location: updatedJob.location,
        startTime: updatedJob.startTime,
        jobStage: updatedJob.jobStage,
        ownership: updatedJob.ownership,
        budgetMin: updatedJob.budgetMin,
        budgetMax: updatedJob.budgetMax,
        media: updatedJob.media,
        status: updatedJob.status,
        createdAt: updatedJob.createdAt,
        contactName: updatedJob.contactName,
        contactPhone: updatedJob.contactPhone,
        contactEmail: updatedJob.contactEmail,
        contact: {
          name: updatedJob.contactName,
          phone: updatedJob.contactPhone,
          email: updatedJob.contactEmail,
        }
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