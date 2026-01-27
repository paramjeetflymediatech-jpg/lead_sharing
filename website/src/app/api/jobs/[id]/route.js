import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

/* =========================
   GET JOB (PUBLIC, NO CONTACT)
========================= */
export async function GET(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const job = await Job.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .lean();

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    // REMOVE CONTACT DETAILS
    const safeJob = {
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
    };

    return NextResponse.json(safeJob);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid Job ID" },
      { status: 400 }
    );
  }
}

/* =========================
   UPDATE JOB (OWNER ONLY)
========================= */
export async function PUT(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    if (job.homeowner.toString() !== userId) {
      return NextResponse.json(
        { message: "Not your job" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // PROTECT SENSITIVE FIELDS
    delete body.contactName;
    delete body.contactPhone;
    delete body.contactEmail;
    delete body.homeowner;

    const updatedJob = await Job.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE JOB (OWNER ONLY)
========================= */
export async function DELETE(req, context) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    if (job.homeowner.toString() !== userId) {
      return NextResponse.json(
        { message: "Not your job" },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
