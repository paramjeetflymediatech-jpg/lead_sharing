
// import { NextResponse } from "next/server";
// import crypto from "crypto";
// // import { connectToDatabase } from "@/lib/mongodb";
// import { User } from "@/models/User";
// import { hashPassword } from "@/lib/auth";

// export async function POST(req) {
//     try {
//         // await connectToDatabase();
//         const { token, password } = await req.json();

//         if (!token || !password) {
//             return NextResponse.json(
//                 { success: false, message: "Token and password are required" },
//                 { status: 400 }
//             );
//         }

//         const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//         const user = await User.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetExpires: { $gt: new Date() },
//         });

//         if (!user) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid or expired token" },
//                 { status: 400 }
//             );
//         }

//         // Set new password
//         const hashedPassword = await hashPassword(password);
//         user.password = hashedPassword;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         await user.save();

//         return NextResponse.json({
//             success: true,
//             message: "Password reset successful"
//         });

//     } catch (error) {
//         console.error("Reset Password Error:", error);
//         return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//     }
// }




import { NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import pool from "../../../../../config/db"

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    // 🔐 Hash token (must match DB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 🔍 Find user with valid token + expiry (MySQL)
    const [rows] = await pool.query(
      `
      SELECT * FROM users
      WHERE password_reset_token = ?
        AND password_reset_expires > NOW()
      LIMIT 1
      `,
      [hashedToken]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 🔑 Hash new password
    const hashedPassword = await hashPassword(password);

    // 💾 Update password + clear reset token
    await pool.query(
      `
      UPDATE users
      SET
        password = ?,
        password_reset_token = NULL,
        password_reset_expires = NULL
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
