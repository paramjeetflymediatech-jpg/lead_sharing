import { NextResponse } from "next/server";
import { DeletionRequest } from "@/models/DeletionRequest";
import { User } from "@/models/User";

export async function GET(req) {
    try {
        const requests = await DeletionRequest.find();

        return NextResponse.json({ success: true, requests }, { status: 200 });
    } catch (error) {
        console.error("ADMIN GET DELETION REQUESTS ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
