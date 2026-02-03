import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const tradesperson = await TradespersonProfile.findById(id)
      .select(
        "companyName profileImage bio phone postcode skills serviceAreas createdAt updatedAt"
      );

    if (!tradesperson) {
      return NextResponse.json(
        { message: "Tradesperson not found" },
        { status: 404 }
      );
    }

    // Add mock data for demo
    const tradespersonWithMockData = {
      ...tradesperson.toObject(),
      rating: 5.0,
      ratingCount: 27,
      reviews: [
        { author: "Sarah M.", rating: 5, comment: "Excellent work, very professional!" },
        { author: "James L.", rating: 5, comment: "Completed the job on time and within budget." },
        { author: "Emma R.", rating: 5, comment: "Highly recommended, will use again." }
      ]
    };

    return NextResponse.json({
      success: true,
      data: tradespersonWithMockData,
    });
  } catch (error) {
    console.error("Tradesperson Profile Error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}