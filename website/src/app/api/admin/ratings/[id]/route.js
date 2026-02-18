import { NextResponse } from "next/server";
import { TradespersonRating } from "@/models/TradespersonRating";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json(
                { message: "Invalid rating id" },
                { status: 400 }
            );
        }

        const rating = await TradespersonRating.findById(id);

        if (!rating) {
            return NextResponse.json(
                { message: "Rating not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(rating, { status: 200 });
    } catch (error) {
        console.error("ADMIN RATING GET ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (isNaN(Number(id))) {
            return NextResponse.json({ message: "Invalid rating id" }, { status: 400 });
        }

        const updatedRating = await TradespersonRating.findByIdAndUpdate(id, body);

        if (!updatedRating) {
            return NextResponse.json({ message: "Rating not found" }, { status: 404 });
        }

        return NextResponse.json(updatedRating, { status: 200 });
    } catch (error) {
        console.error("ADMIN RATING UPDATE ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json({ message: "Invalid rating id" }, { status: 400 });
        }

        const result = await TradespersonRating.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Rating not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Rating deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("ADMIN RATING DELETE ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
