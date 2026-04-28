import { NextResponse } from "next/server";
import { Service } from "@/models/Service";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await Service.findByIdAndUpdate(id, body);
    
    if (!updated) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const deleted = await Service.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete service" }, { status: 500 });
  }
}
