// import { NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json(
//         { message: "File missing" },
//         { status: 400 }
//       );
//     }

//     // 10MB limit
//     if (file.size > 10 * 1024 * 1024) {
//       return NextResponse.json(
//         { message: "File too large (max 10MB)" },
//         { status: 400 }
//       );
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     const uploadResult = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream(
//         {
//           folder: "jobs",
//           resource_type: "auto",
//         },
//         (error, result) => {
//           if (error) reject(error);
//           resolve(result);
//         }
//       ).end(buffer);
//     });

//     return NextResponse.json({
//       url: uploadResult.secure_url,
//       publicId: uploadResult.public_id,
//       type: uploadResult.resource_type === "video" ? "VIDEO" : "IMAGE",
//     });
//   } catch (error) {
//     console.error("CLOUDINARY UPLOAD ERROR:", error);
//     return NextResponse.json(
//       { message: "Upload failed" },
//       { status: 500 }
//     );
//   }
// }
















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
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type" },
        { status: 400 }
      );
    }

    // ✅ Max size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File too large (max 10MB)" },
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
      type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}
