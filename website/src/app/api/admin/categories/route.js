import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectToDatabase();
        const categories = await Category.find().sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDatabase();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { message: "Name is required" },
                { status: 400 }
            );
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

        // Check duplicate
        const existing = await Category.findOne({ slug });
        if (existing) {
            return NextResponse.json({ message: "Category already exists" }, { status: 409 });
        }

        const category = await Category.create({ name, slug });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
