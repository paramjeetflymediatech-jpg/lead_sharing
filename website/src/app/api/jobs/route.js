import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { isValidObjectId } from "mongoose";

/* =========================
   CREATE JOB (HOMEOWNER)
========================= */
export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
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

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("JOB CREATE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   GET JOB LIST (PUBLIC)
   ❌ CONTACT HIDDEN
========================= */
export async function GET() {
  try {
    await connectToDatabase();

    const jobs = await Job.find({
      status: "OPEN",
    })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    // 🔒 DO NOT EXPOSE CONTACT
    const safeJobs = jobs.map((job) => ({
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
    }));

    return NextResponse.json(safeJobs, { status: 200 });
  } catch (error) {
    console.error("JOB LIST ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
