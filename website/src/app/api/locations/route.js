import { NextResponse } from "next/server";
import { Location } from "@/models/Location";

export async function GET() {
  try {
    const locations = await Location.find();
    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ message: "Failed to fetch locations" }, { status: 500 });
  }
}
