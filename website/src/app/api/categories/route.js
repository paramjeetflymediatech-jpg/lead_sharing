import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    // ✅ CHECK FIRST
    let category = await Category.findOne({ slug });

    if (!category) {
      category = await Category.create({ name, slug });
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("CATEGORY ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json(categories);
}
