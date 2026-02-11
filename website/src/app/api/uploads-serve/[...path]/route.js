import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getContentType = (ext) => {
    const map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".svg": "image/svg+xml",
    };
    return map[ext.toLowerCase()] || "application/octet-stream";
};

export async function GET(req, { params }) {
    try {
        // params.path is an array because of [...path]
        const resolvedParams = await params;
        const filePathParams = resolvedParams.path;

        if (!filePathParams || filePathParams.length === 0) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileName = filePathParams.join("/");
        // Normalize path to prevent directory traversal
        const requestedPath = path.normalize(fileName).replace(/^(\.\.(\/|\\|$))+/, '');
        const uploadsDir = path.join(process.cwd(), "public/uploads");
        const filePath = path.join(uploadsDir, requestedPath);

        // Security check: ensure the resolved path is within public/uploads
        if (!filePath.startsWith(uploadsDir)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = getContentType(ext);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
