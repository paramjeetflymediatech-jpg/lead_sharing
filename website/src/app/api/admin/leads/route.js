
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import "@/models/Job";
import "@/models/TradespersonProfile";
import "@/models/User";

export async function GET() {
    try {
        // await connectToDatabase();

        const leads = await Lead.find({});
        // .populate(...) // Removed population for MySQL compatibility stub
        //
        // ;

        // Manual population or simplified return for now
        // A complete migration would require JOINs or manual fetches here.

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("ADMIN LEADS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
