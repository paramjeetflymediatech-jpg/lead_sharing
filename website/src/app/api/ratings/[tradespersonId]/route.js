import { NextResponse } from "next/server";
import { TradespersonRating } from "@/models/TradespersonRating";

export async function GET(req, { params }) {
  try {
    const { tradespersonId } = params;

    if (!tradespersonId) {
      return NextResponse.json(
        { success: false, message: "Tradesperson ID required" },
        { status: 400 }
      );
    }

    // Get all ratings
    const ratings = await TradespersonRating.findByTradesperson(tradespersonId);
    
    // Get statistics
    const stats = await TradespersonRating.getTradespersonStats(tradespersonId);
    
    // Get average
    const averageData = await TradespersonRating.getAverageRating(tradespersonId);

    return NextResponse.json({
      success: true,
      data: {
        ratings,
        stats,
        average: parseFloat(averageData.average_rating),
        totalRatings: averageData.total_ratings
      }
    });

  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}