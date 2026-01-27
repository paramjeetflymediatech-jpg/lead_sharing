import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    // ✅ IMPORTANT: await params
    const { id } = await params;

    const job = await Job.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("GET JOB ERROR:", error);
    return NextResponse.json(
      { message: "Invalid Job ID" },
      { status: 400 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  const body = await req.json();
  const job = await Job.findByIdAndUpdate(id, body, { new: true });

  return NextResponse.json(job);
}

export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  await Job.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
