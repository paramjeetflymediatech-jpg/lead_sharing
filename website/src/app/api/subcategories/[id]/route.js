import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import SubCategory from "@/models/SubCategory";
// import mongoose from "mongoose";

/* =========================
   GET SUBCATEGORY BY ID
========================= */
export async function GET(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX

    if (isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid subcategory id" },
        { status: 400 }
      );
    }

    const subCategory = await SubCategory.findById(id);
    //; // Removed for MySQL compatibility

    if (!subCategory) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory, { status: 200 });
  } catch (error) {
    console.error("GET SUBCATEGORY ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE SUBCATEGORY
========================= */
export async function PUT(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX
    const { name } = await req.json();

    if (isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid subcategory id" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );
    // ... existing code continues ...
    if (!subCategory) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory, { status: 200 });
  } catch (error) {
    console.error("UPDATE SUBCATEGORY ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE SUBCATEGORY
========================= */
export async function DELETE(req, context) {
  try {
    // await connectToDatabase();

    const { id } = await context.params; // ✅ FIX

    if (isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Invalid subcategory id" },
        { status: 400 }
      );
    }


    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE SUBCATEGORY ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
