import { NextResponse } from "next/server";
import { DeletionRequest } from "@/models/DeletionRequest";
import { User } from "@/models/User";
import path from "path";
import fs from "fs";

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, adminNotes } = body;

        const request = await DeletionRequest.findById(id);
        if (!request) {
            return NextResponse.json({ message: "Deletion request not found" }, { status: 404 });
        }

        if (status === "APPROVED") {
            const user = request.user;
            if (user && user._id) {
                // 1. Fetch media paths before deletion
                const mediaPaths = await User.getAssociatedMedia(user._id);

                // 2. Delete the user
                await User.findByIdAndDelete(user._id);

                // 3. Clean up files on disk
                if (mediaPaths && mediaPaths.length > 0) {
                    mediaPaths.forEach((mediaPath) => {
                        if (typeof mediaPath === "string" && mediaPath.startsWith("/uploads/")) {
                            const absolutePath = path.join(process.cwd(), "public", mediaPath);
                            try {
                                if (fs.existsSync(absolutePath)) {
                                    fs.unlinkSync(absolutePath);
                                }
                            } catch (err) {
                                console.error(`[CLEANUP ERROR] Failed to delete ${absolutePath}:`, err);
                            }
                        }
                    });
                }
            }

            // 4. Update request status
            await DeletionRequest.findByIdAndUpdate(id, {
                status: "APPROVED",
                adminNotes: adminNotes || "Approved by admin",
                processedAt: new Date()
            });

            return NextResponse.json({
                success: true,
                message: "User account deleted and request approved",
            });
        } else if (status === "REJECTED") {
            await DeletionRequest.findByIdAndUpdate(id, {
                status: "REJECTED",
                adminNotes: adminNotes || "Rejected by admin",
                processedAt: new Date()
            });

            return NextResponse.json({
                success: true,
                message: "Deletion request rejected",
            });
        }

        return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    } catch (error) {
        console.error("ADMIN PROCESS DELETION REQUEST ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const result = await DeletionRequest.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Request deleted" });
    } catch (error) {
        console.error("ADMIN DELETE DELETION REQUEST ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
