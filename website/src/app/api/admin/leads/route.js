import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import "@/models/Job";
import "@/models/TradespersonProfile";
import "@/models/User";

export async function GET() {
    try {
        await connectToDatabase();

        const leads = await Lead.find()
            .populate({
                path: "job",
                select: "description location status",
                populate: {
                    path: "category",
                    select: "name"
                }
            })
            .populate({
                path: "tradesperson",
                select: "companyName user",
                populate: {
                    path: "user",
                    select: "name email",
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEADS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
