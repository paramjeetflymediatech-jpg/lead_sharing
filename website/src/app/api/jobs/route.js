import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

// register schemas
import "@/models/User";
import "@/models/Category";
import "@/models/SubCategory";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // 🔐 strict validation
    if (
      !isValidObjectId(body.homeowner) ||
      !isValidObjectId(body.category) ||
      !isValidObjectId(body.subCategory) ||
      !body.description ||
      !body.location?.postcode ||
      !body.startTime ||
      !body.jobStage ||
      !body.ownership
    ) {
      return NextResponse.json(
        { message: "Invalid or missing required fields" },
        { status: 400 }
      );
    }

    const media = (body.media || []).map((item) => ({
      url: item.url,
      type: item.type?.toUpperCase(), // IMAGE | VIDEO
    }));

    const job = await Job.create({
      homeowner: body.homeowner,
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
      media,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("JOB CREATE ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const jobs = await Job.find({
      subCategory: { $type: "objectId" }, // 💥 SAFETY FILTER
      category: { $type: "objectId" },
      homeowner: { $type: "objectId" },
    })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("homeowner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("JOB GET ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
