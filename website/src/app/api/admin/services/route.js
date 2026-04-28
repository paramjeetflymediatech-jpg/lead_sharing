import { NextResponse } from "next/server";
import { Service } from "@/models/Service";

export async function GET() {
  try {
    const services = await Service.find({});
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, slug, category_id } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and Slug are required" }, { status: 400 });
    }

    const newService = await Service.create(body);
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create service" }, { status: 500 });
  }
}
