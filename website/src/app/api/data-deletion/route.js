import { NextResponse } from "next/server";
import { DeletionRequest } from "@/models/DeletionRequest";
import { User } from "@/models/User";

export async function POST(req) {
    try {
        const { email, reason } = await req.json();

        if (!email || !reason) {
            return NextResponse.json(
                { message: "Email and Reason are required" },
                { status: 400 }
            );
        }

        // Check if a pending request already exists for this email
        const existingRequest = await DeletionRequest.findByEmail(email);

        if (existingRequest) {
            return NextResponse.json(
                { message: "A pending deletion request already exists for this email" },
                { status: 409 }
            );
        }

        // Attempt to find user by email to link the request
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "You are not registered with us." },
                { status: 404 }
            );
        }

        const userId = user.id;

        const newRequest = await DeletionRequest.create({
            userId: user.id,
            email: user.email,
            reason: reason,
            name: user.name,
            phone: user.phone || null,
        });

        return NextResponse.json(
            { message: "Deletion request submitted successfully", data: newRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error("PUBLIC DATA DELETION ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
