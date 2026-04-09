import { NextResponse } from "next/server";
import { DeletionRequest } from "@/models/DeletionRequest";
import { User } from "@/models/User";

export async function POST(req) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { reason } = await req.json();

        if (!reason) {
            return NextResponse.json({ message: "Reason is required" }, { status: 400 });
        }

        // Check if a pending request already exists
        const existingRequest = await DeletionRequest.findOne({
            user_id: userId,
            status: "PENDING",
        });

        if (existingRequest) {
            return NextResponse.json(
                { message: "You already have a pending deletion request" },
                { status: 409 }
            );
        }

        const user = await User.findById(userId);
      // Mark user as pending deletion
      await User.findByIdAndUpdate(userId, { isDeletionPending: true, deletionRequestedAt: new Date() });

        const newRequest = await DeletionRequest.create({
            userId,
            email: user?.email || null,
            name: user?.name || null,
            phone: user?.phone || null,
            reason,
        });

        return NextResponse.json(
            { message: "Deletion request submitted successfully", data: newRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE DELETION REQUEST ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
