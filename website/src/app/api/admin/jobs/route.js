import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  try {
    // await connectToDatabase();

    // MySQL model find() returns a promise that resolves to an array of jobs
    // and does not support Mongoose chaining like .populate().sort()
    const jobs = await Job.find({});

    // In a real MySQL implementation, we would use JOINs to get homeowner/category names
    // For now, we return the jobs as is. The frontend might show IDs or empty names until we implement JOINs.

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("ADMIN JOBS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
