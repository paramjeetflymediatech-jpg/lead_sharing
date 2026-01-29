import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubCategory from "@/models/SubCategory";
import { isValidObjectId } from "mongoose";

export async function PATCH(req, { params }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { name, categoryId } = await req.json();

        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
        }
        if (categoryId) updateData.category = categoryId;

        const subcategory = await SubCategory.findByIdAndUpdate(id, updateData, { new: true }).populate('category', 'name');

        if (!subcategory) {
            return NextResponse.json({ message: "SubCategory not found" }, { status: 404 });
        }

        return NextResponse.json(subcategory);
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

        const subcategory = await SubCategory.findByIdAndDelete(id);

        if (!subcategory) {
            return NextResponse.json({ message: "SubCategory not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "SubCategory deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
