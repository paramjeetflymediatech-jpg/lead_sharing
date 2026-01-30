import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: Return success even if user doesn't exist to prevent email harvesting
    if (!user) {
      console.log("Forgot PW: User not found in DB");
      return NextResponse.json({
        success: true,
        message: "If this email is registered, you will receive a reset link shortly.",
      });
    }

    // 🔑 Generate and Save Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // 🔗 Construct URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${resetToken}`;

    // 📧 SMTP Config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_PORT == 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 🚀 Send Email
    try {
      await transporter.sendMail({
        from: `"Lead Sharing Support" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family:sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #e4e4e7; border-radius:12px;">
            <h2 style="color:#155DFC;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background:#155DFC; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Reset Password</a>
            </div>
            <p style="font-size:12px; color:#71717a;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log("✅ Reset email sent to:", user.email);
    } catch (mailError) {
      console.error("❌ Nodemailer Error:", mailError);
      // We don't throw here so the user still sees the success message (security)
    }

    return NextResponse.json({
      success: true,
      message: "Reset link sent successfully",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}