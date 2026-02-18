import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  try {
    // MySQL model find() returns a promise that resolves to an array of jobs
    const jobs = await Job.find({});

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("ADMIN JOBS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      description,
      homeowner,
      category,
      subCategory,
      budgetMin,
      budgetMax,
      location,
      contactName,
      contactEmail,
      contactPhone,
      jobStage,
      ownership,
      startTime,
      status
    } = body;

    if (!description || !homeowner || !category || !subCategory) {
      return NextResponse.json(
        { message: "Missing required fields: description, homeowner, category, or subCategory" },
        { status: 400 }
      );
    }

    const data = {
      description,
      homeowner,
      category,
      subCategory,
      budgetMin,
      budgetMax,
      city: location?.city,
      postcode: location?.postcode,
      contactName,
      contactEmail,
      contactPhone,
      jobStage,
      ownership,
      startTime,
      status: status || 'OPEN'
    };

    const newJob = await Job.create(data);

    return NextResponse.json(
      { message: "Job created successfully", job: newJob },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN CREATE JOB ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
