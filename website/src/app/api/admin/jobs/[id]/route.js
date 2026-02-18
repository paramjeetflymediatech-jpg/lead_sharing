import { NextResponse } from "next/server";
import Job from "@/models/Job";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (isNaN(Number(id))) {
            return NextResponse.json(
                { message: "Invalid job id" },
                { status: 400 }
            );
        }

        const job = await Job.findById(id);

        if (!job) {
            return NextResponse.json(
                { message: "Job not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        console.error("ADMIN JOB GET ERROR:", error);
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
            return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
        }

        const updatedJob = await Job.findByIdAndUpdate(id, body, { new: true });

        if (!updatedJob) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        return NextResponse.json(updatedJob, { status: 200 });
    } catch (error) {
        console.error("ADMIN JOB UPDATE ERROR:", error);
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
            return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
        }

        // 1. Fetch job to get media paths before deletion
        const job = await Job.findById(id);
        if (!job) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        const mediaPaths = job.media || [];

        // 2. Delete the job (Job.deleteOne handles cascading database deletes)
        const result = await Job.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        // 3. Clean up files on disk
        if (mediaPaths && mediaPaths.length > 0) {
            mediaPaths.forEach(mediaPath => {
                // Only delete if it's a local upload
                if (typeof mediaPath === 'string' && mediaPath.startsWith('/uploads/')) {
                    const absolutePath = path.join(process.cwd(), 'public', mediaPath);
                    try {
                        if (fs.existsSync(absolutePath)) {
                            fs.unlinkSync(absolutePath);
                            console.log(`[CLEANUP] Deleted file: ${absolutePath}`);
                        }
                    } catch (err) {
                        console.error(`[CLEANUP ERROR] Failed to delete ${absolutePath}:`, err);
                    }
                }
            });
        }

        return NextResponse.json({ message: "Job and all associated data deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("ADMIN JOB DELETE ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
