
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import "@/models/Job";
import "@/models/TradespersonProfile";
import "@/models/User";

export async function GET() {
    try {
        const leads = await Lead.findDetailed({});
        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEADS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { job, tradesperson, message, priceEstimate, isUnlocked, status } = body;

        if (!job || !tradesperson) {
            return NextResponse.json(
                { message: "Missing required fields: job or tradesperson" },
                { status: 400 }
            );
        }

        const newLead = await Lead.create({
            job,
            tradesperson,
            message,
            priceEstimate,
            isUnlocked,
            status: status || 'PENDING'
        });

        return NextResponse.json(
            { message: "Lead created successfully", lead: newLead },
            { status: 201 }
        );
    } catch (error) {
        console.error("ADMIN CREATE LEAD ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
