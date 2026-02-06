import { NextResponse } from "next/server";
import { TradespersonRating } from "@/models/TradespersonRating";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID required" },
        { status: 400 }
      );
    }

    const existingRating = await TradespersonRating.findByJob(jobId);

    return NextResponse.json({
      success: true,
      canRate: !existingRating,
      alreadyRated: !!existingRating,
      rating: existingRating || null
    });

  } catch (error) {
    console.error("Error checking rating status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check rating status" },
      { status: 500 }
    );
  }
}