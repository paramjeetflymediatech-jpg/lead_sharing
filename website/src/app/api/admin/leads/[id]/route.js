import { NextResponse } from "next/server";
import Lead from "@/models/Lead";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json(
                { message: "Invalid lead id" },
                { status: 400 }
            );
        }

        const lead = await Lead.findById(id);

        if (!lead) {
            return NextResponse.json(
                { message: "Lead not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(lead, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEAD GET ERROR:", error);
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
            return NextResponse.json({ message: "Invalid lead id" }, { status: 400 });
        }

        const updatedLead = await Lead.findByIdAndUpdate(id, body);

        if (!updatedLead) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 });
        }

        return NextResponse.json(updatedLead, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEAD UPDATE ERROR:", error);
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
            return NextResponse.json({ message: "Invalid lead id" }, { status: 400 });
        }

        const result = await Lead.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEAD DELETE ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
