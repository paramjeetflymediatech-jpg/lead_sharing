import { NextResponse } from "next/server";
import { Service } from "@/models/Service";

export async function GET() {
  try {
    const services = await Service.find({ isActive: true });
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 });
  }
}
