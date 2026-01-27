import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

export async function GET(req, context) {
  try {
    await connectToDatabase();

    // 🔐 from middleware
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { message: "Only homeowner allowed" },
        { status: 403 }
      );
    }

    // ✅ await params (Next.js fix)
    const { id: jobId } = await context.params;

    // 1️⃣ Job exists?
    const job = await Job.findById(jobId);

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Ownership check (✅ FIXED FIELD)
    if (job.homeowner.toString() !== userId) {
      return NextResponse.json(
        { message: "Not your job" },
        { status: 403 }
      );
    }

    // 3️⃣ Fetch leads
    const leads = await Lead.find({ job: jobId })
      .populate({
        path: "tradesperson",
        select: "user",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("FETCH JOB LEADS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
