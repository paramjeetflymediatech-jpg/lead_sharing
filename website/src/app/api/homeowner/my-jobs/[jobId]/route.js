import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

import Job from "@/models/Job";
import { Lead } from "@/models/Lead";

// Register populate schemas
import "@/models/Category";
import "@/models/SubCategory";

export async function GET(req, context) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // ✅ FIX HERE
    const { jobId } = await context.params;

    console.log("JOB___ID", jobId);
    console.log("Homeowner Job Details API:", userId, role, jobId);

    // 🔐 Auth check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // 🔍 Find job (only homeowner's job)
    const job = await Job.findOne({
      _id: jobId,
      homeowner: userId
    })
      .populate("category", "name")
      .populate("subCategory", "name")
      .lean();

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // 📩 Leads
    const leads = await Lead.find({ job: jobId })
      .populate({
        path: "tradesperson",
        populate: {
          path: "user",
          select: "name email phone"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        job,
        leads,
        summary: {
          totalLeads: leads.length,
          hasLeads: leads.length > 0
        }
      },
      message: "Job details fetched successfully"
    });

  } catch (error) {
    console.error("JOB DETAILS API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message
      },
      { status: 500 }
    );
  }
}
