import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { isValidObjectId } from "mongoose";

export async function PATCH(req, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { name } = await req.json();

        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const slug = name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") : undefined;
        const updateData = { name };
        if (slug) updateData.slug = slug;

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        // Optional: Check if used in subcategories
        const hasSubs = await SubCategory.findOne({ category: id });
        if (hasSubs) {
            return NextResponse.json({ message: "Cannot delete category with existing subcategories" }, { status: 400 });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
