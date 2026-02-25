import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "File missing" },
        { status: 400 }
      );
    }

    // ✅ Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Supported: JPG, PNG, PDF, DOC" },
        { status: 400 }
      );
    }

    // ✅ Max size limits
    const isImage = file.type.startsWith("image/");
    const isDoc = file.type.includes("pdf") || file.type.includes("word") || file.type.includes("officedocument");

    let maxSize = 10 * 1024 * 1024; // Default 10MB
    if (isImage) maxSize = 5 * 1024 * 1024; // 5MB for images
    if (isDoc) maxSize = 10 * 1024 * 1024; // 10MB for documents

    if (file.size > maxSize) {
      const sizeInMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { message: `File too large. Max limit for this type is ${sizeInMB}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Upload directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Safe filename
    const ext = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;

    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      type: file.type.startsWith("image") ? "IMAGE" : "DOCUMENT",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}
