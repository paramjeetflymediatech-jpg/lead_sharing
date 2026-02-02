
import { NextResponse } from "next/server";
import SubCategory from "@/models/SubCategory";

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const { name, categoryId } = await req.json();

        if (isNaN(Number(id))) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const updateData = {};
        if (name) {
            updateData.name = name;
            // updateData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
            // Assuming slug logic if needed or just name
        }
        if (categoryId) updateData.category = categoryId;

        const subcategory = await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
        //; // Removed

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
        const { id } = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const success = await SubCategory.findByIdAndDelete(id);

        if (!success) {
            return NextResponse.json({ message: "SubCategory not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "SubCategory deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
