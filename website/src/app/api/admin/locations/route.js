import { NextResponse } from "next/server";
import { Location } from "@/models/Location";

export async function GET() {
  try {
    const locations = await Location.find();
    return NextResponse.json(locations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and Slug are required" }, { status: 400 });
    }

    const newLocation = await Location.create(body);
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create location" }, { status: 500 });
  }
}
