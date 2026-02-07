import { NextResponse } from "next/server";
import Job from "@/models/Job";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if job exists and belongs to user
    const job = await Job.findOne({ _id: id, homeowner: userId });
    
    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    // Only allow HIRED → COMPLETED transition
    if (job.status !== 'HIRED' && status === 'COMPLETED') {
      return NextResponse.json(
        { message: "Only HIRED jobs can be marked as completed" },
        { status: 400 }
      );
    }

    // Update status
    await Job.findByIdAndUpdate(id, { $set: { status } });

    return NextResponse.json({
      success: true,
      message: `Job status updated to ${status}`
    });

  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}