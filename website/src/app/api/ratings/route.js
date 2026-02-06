import { NextResponse } from "next/server";
import { TradespersonRating } from "@/models/TradespersonRating";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    // Check authentication
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Only homeowners can rate
    if (userRole !== "homeowner") {
      return NextResponse.json(
        { success: false, message: "Only homeowners can submit ratings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { jobId, tradespersonId, rating, review } = body;

    // Validation
    if (!jobId || !tradespersonId || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if already rated
    const existingRating = await TradespersonRating.findByJob(jobId);
    if (existingRating) {
      return NextResponse.json(
        { success: false, message: "You have already rated this job" },
        { status: 400 }
      );
    }

    // Create rating
    const ratingId = await TradespersonRating.create({
      jobId,
      homeownerId: userId,
      tradespersonId,
      rating,
      review: review || null
    });

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      ratingId
    }, { status: 201 });

  } catch (error) {
    console.error("Rating submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit rating" },
      { status: 500 }
    );
  }
}