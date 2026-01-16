import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req) {
  try {
    let body;

    // ✅ Safe JSON parsing
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    // 🔐 Always return success
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If this email is registered, you will receive a reset link shortly.",
        },
        { status: 200 }
      );
    }

    // 🔑 Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`;

    // 📧 SMTP config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Lead Sharing Support" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e4e4e7;border-radius:12px;padding:20px">
          <h2 style="color:#155DFC">Password Reset</h2>
          <p>You requested a password reset.</p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 24px;background:#155DFC;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
             Reset Password
          </a>
          <p style="margin-top:16px;font-size:12px;color:#666">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Reset link sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
