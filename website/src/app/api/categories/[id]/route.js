import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);
    return NextResponse.json(
      { message: "Invalid category id" },
      { status: 400 }
    );
  }
}

export async function PUT(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
