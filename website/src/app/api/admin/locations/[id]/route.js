import { NextResponse } from "next/server";
import { Location } from "@/models/Location";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await Location.findByIdAndUpdate(id, body);
    
    if (!updated) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const deleted = await Location.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete location" }, { status: 500 });
  }
}
