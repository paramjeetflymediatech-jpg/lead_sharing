import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubCategory from "@/models/SubCategory";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectToDatabase();
        const subcategories = await SubCategory.find()
            .populate("category", "name")
            .sort({ createdAt: -1 });
        return NextResponse.json(subcategories);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDatabase();
        const { name, categoryId } = await req.json();

        if (!name || !categoryId) {
            return NextResponse.json(
                { message: "Name and Category are required" },
                { status: 400 }
            );
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

        const existing = await SubCategory.findOne({ slug });
        if (existing) {
            return NextResponse.json({ message: "Subcategory already exists" }, { status: 409 });
        }

        const subcategory = await SubCategory.create({
            name,
            slug,
            category: categoryId
        });

        const populated = await subcategory.populate("category", "name");

        return NextResponse.json(populated, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
