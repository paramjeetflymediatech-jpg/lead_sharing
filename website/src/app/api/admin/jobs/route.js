import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  try {
    await connectToDatabase();

    const jobs = await Job.find()
      .populate("homeowner", "name email")
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("ADMIN JOBS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
