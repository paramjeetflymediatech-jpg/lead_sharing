// // // import { NextResponse } from "next/server";
// // // import { connectToDatabase } from "@/lib/mongodb";
// // // import { User } from "@/models/User";

// // // export async function GET(req) {
// // //     try {
// // //         await connectToDatabase();

// // //         const userId = req.headers.get("x-user-id");

// // //         if (!userId) {
// // //             return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// // //         }

// // //         const user = await User.findById(userId).select("-password").lean();

// // //         if (!user) {
// // //             return NextResponse.json({ message: "User not found" }, { status: 404 });
// // //         }

// // //         return NextResponse.json({ success: true, data: user }, { status: 200 });
// // //     } catch (error) {
// // //         console.error("Profile Fetch Error:", error);
// // //         return NextResponse.json({ message: "Server error" }, { status: 500 });
// // //     }
// // // }






















// // // //edit profile 


// // // import { NextResponse } from "next/server";
// // // import { TradespersonProfile } from "@/models/TradespersonProfile";
// // // import "@/models/User";

// // // /**
// // //  * UPDATE tradesperson profile
// // //  * Method: PUT
// // //  */
// // // export async function PUT(req) {
// // //   try {
// // //     // ✅ Middleware se aaya hua data
// // //     const userId = req.headers.get("x-user-id");
// // //     const role = req.headers.get("x-user-role");

// // //     if (!userId || role !== "TRADESPERSON") {
// // //       return NextResponse.json(
// // //         { success: false, message: "Unauthorized" },
// // //         { status: 401 }
// // //       );
// // //     }

// // //     const body = await req.json();
// // //     const {
// // //       companyName,
// // //       profileImage,
// // //       skills,
// // //       serviceAreas,
// // //     } = body;

// // //     // 🛑 Basic validation
// // //     if (!companyName) {
// // //       return NextResponse.json(
// // //         { success: false, message: "Company name is required" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // 🔄 Update profile
// // //     const profile = await TradespersonProfile.findOneAndUpdate(
// // //       { user: userId },
// // //       {
// // //         companyName,
// // //         profileImage,
// // //         skills,
// // //         serviceAreas,
// // //       },
// // //       { new: true, upsert: true } // create if not exists
// // //     );

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: "Profile updated successfully",
// // //       profile,
// // //     });
// // //   } catch (error) {
// // //     console.error("Edit profile error:", error);
// // //     return NextResponse.json(
// // //       { success: false, message: "Something went wrong" },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }




// // import { NextResponse } from "next/server";
// // import { connectToDatabase } from "@/lib/mongodb";
// // import { User } from "@/models/User";
// // import { TradespersonProfile } from "@/models/TradespersonProfile";
// // import "@/models/User";

// // /* =========================
// //    GET PROFILE (VIEW)
// // ========================= */
// // export async function GET(req) {
// //   try {
// //     await connectToDatabase();

// //     const userId = req.headers.get("x-user-id");
// //     const role = req.headers.get("x-user-role");

// //     if (!userId) {
// //       return NextResponse.json(
// //         { success: false, message: "Unauthorized" },
// //         { status: 401 }
// //       );
// //     }

// //     // 👤 Base user
// //     const user = await User.findById(userId)
// //       .select("-password")
// //       .lean();

// //     if (!user) {
// //       return NextResponse.json(
// //         { success: false, message: "User not found" },
// //         { status: 404 }
// //       );
// //     }

// //     let tradespersonProfile = null;

// //     // 🛠️ If tradesperson, fetch extra profile
// //     if (role === "TRADESPERSON") {
// //       tradespersonProfile = await TradespersonProfile.findOne({
// //         user: userId,
// //       }).lean();
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       user,
// //       tradespersonProfile,
// //     });
// //   } catch (error) {
// //     console.error("Profile Fetch Error:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Server error" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // /* =========================
// //    EDIT TRADESPERSON PROFILE
// // ========================= */
// // export async function PUT(req) {
// //   try {
// //     await connectToDatabase();

// //     const userId = req.headers.get("x-user-id");
// //     const role = req.headers.get("x-user-role");

// //     if (!userId || role !== "TRADESPERSON") {
// //       return NextResponse.json(
// //         { success: false, message: "Unauthorized" },
// //         { status: 401 }
// //       );
// //     }

// //     const body = await req.json();
// //     const { companyName, profileImage, skills, serviceAreas } = body;

// //     if (!companyName) {
// //       return NextResponse.json(
// //         { success: false, message: "Company name is required" },
// //         { status: 400 }
// //       );
// //     }

// //     const profile = await TradespersonProfile.findOneAndUpdate(
// //       { user: userId },
// //       {
// //         companyName,
// //         profileImage,
// //         skills,
// //         serviceAreas,
// //       },
// //       { new: true, upsert: true }
// //     );

// //     return NextResponse.json({
// //       success: true,
// //       message: "Profile updated successfully",
// //       profile,
// //     });
// //   } catch (error) {
// //     console.error("Edit profile error:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Something went wrong"},
// //       { status: 500 }
// //     );
// //   }
// // }







// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import { User } from "@/models/User";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import cloudinary from "@/lib/cloudinary";

// /* =========================
//    GET PROFILE
// ========================= */
// export async function GET(req) {
//   try {
//     await connectToDatabase();

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Get user
//     const user = await User.findById(userId)
//       .select("-password")
//       .lean();

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Get tradesperson profile if applicable
//     let profile = null;
//     if (role === "TRADESPERSON") {
//       profile = await TradespersonProfile.findOne({ user: userId }).lean();
//     }

//     return NextResponse.json({
//       success: true,
//       user,
//       profile,
//     });
//   } catch (error) {
//     console.error("Profile Fetch Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    UPDATE PROFILE
// ========================= */
// export async function PUT(req) {
//   try {
//     await connectToDatabase();

//     const userId = req.headers.get("x-user-id");
//     const role = req.headers.get("x-user-role");

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const body = await req.json();
//     const { 
//       companyName, 
//       profileImage, 
//       bio, 
//       phone, 
//       skills, 
//       serviceAreas 
//     } = body;

//     // Validate required fields
//     if (!companyName) {
//       return NextResponse.json(
//         { success: false, message: "Company name is required" },
//         { status: 400 }
//       );
//     }

//     // Update or create profile
//     const profile = await TradespersonProfile.findOneAndUpdate(
//       { user: userId },
//       {
//         companyName,
//         profileImage,
//         bio,
//         phone,
//         skills: skills || [],
//         serviceAreas: serviceAreas || [],
//       },
//       { 
//         new: true, 
//         upsert: true,
//         runValidators: true 
//       }
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Profile updated successfully",
//       profile,
//     });
//   } catch (error) {
//     console.error("Update Profile Error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message || "Update failed" },
//       { status: 500 }
//     );
//   }
// }

// /* =========================
//    UPLOAD IMAGE
// ========================= */
// export async function POST(req) {
//   try {
//     await connectToDatabase();

//     const userId = req.headers.get("x-user-id");
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!userId || !file) {
//       return NextResponse.json(
//         { success: false, message: "Missing data" },
//         { status: 400 }
//       );
//     }

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Upload to Cloudinary
//     const uploadResult = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream(
//         {
//           folder: "tradesperson-profiles",
//           resource_type: "auto",
//         },
//         (error, result) => {
//           if (error) reject(error);
//           resolve(result);
//         }
//       ).end(buffer);
//     });

//     // Return URL
//     return NextResponse.json({
//       success: true,
//       url: uploadResult.secure_url,
//       publicId: uploadResult.public_id,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Upload failed" },
//       { status: 500 }
//     );
//   }
// }








































// /api/profile/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let profile = null;
    if (role === "TRADESPERSON") {
      profile = await TradespersonProfile.findOne({ user: userId }).lean();
    }

    return NextResponse.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { companyName, profileImage, bio, phone, skills, serviceAreas } = body;

    if (!companyName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Company name is required" },
        { status: 400 }
      );
    }

    const profile = await TradespersonProfile.findOneAndUpdate(
      { user: userId },
      {
        companyName: companyName.trim(),
        profileImage: profileImage || "",
        bio: bio || "",
        phone: phone || "",
        skills: skills || [],
        serviceAreas: serviceAreas || [],
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 500 }
    );
  }
}