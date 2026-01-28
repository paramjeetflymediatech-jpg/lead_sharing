import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import Job from "@/models/Job";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const job = await Job.findById(params.jobId);
    if (!job || job.homeowner.toString() !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const leads = await Lead.find({ job: params.jobId })
      .populate("tradesperson")
      .sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
