import { NextResponse } from "next/server";
import pool from "../../../../../config/db.js";
import fs from "fs";
import path from "path";

export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "PENDING_APPROVAL";

        const [rows] = await pool.query(
            `SELECT 
                tp.*, 
                u.name, 
                u.email, 
                u.phone,
                u.phone_verified
            FROM tradesperson_profiles tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.verification_status = ?
            ORDER BY tp.updated_at DESC`,
            [status]
        );

        return NextResponse.json({ success: true, data: rows });

    } catch (error) {
        console.error("Admin Fetch Tradespersons Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { profileId, status, rejectionReason } = await req.json();

        if (!profileId || !status) {
            return NextResponse.json({ error: "Profile ID and Status are required" }, { status: 400 });
        }

        // Fetch tradesperson's user info (email, name) for notification + file cleanup
        const [profileRows] = await pool.query(
            `SELECT tp.id, tp.id_document, tp.license_document, tp.insurance_document, tp.company_name,
                    u.email, u.name
             FROM tradesperson_profiles tp
             JOIN users u ON tp.user_id = u.id
             WHERE tp.id = ?`,
            [profileId]
        );

        const profile = profileRows?.[0];

        // If REJECTED, delete physical files and clear DB fields
        if (status === "REJECTED") {
            if (profile) {
                const docs = [profile.id_document, profile.license_document, profile.insurance_document];

                docs.forEach(docPath => {
                    if (docPath) {
                        try {
                            const fullPath = path.join(process.cwd(), "public", docPath);
                            if (fs.existsSync(fullPath)) {
                                fs.unlinkSync(fullPath);
                                console.log(`Deleted file: ${fullPath}`);
                            }
                        } catch (err) {
                            console.error(`Error deleting file: ${docPath}`, err);
                        }
                    }
                });

                await pool.query(
                    `UPDATE tradesperson_profiles 
                     SET verification_status = ?, 
                         rejection_reason = ?,
                         id_document = NULL,
                         license_document = NULL,
                         insurance_document = NULL,
                         updated_at = NOW() 
                     WHERE id = ?`,
                    [status, rejectionReason || null, profileId]
                );
            }
        } else {
            await pool.query(
                `UPDATE tradesperson_profiles 
                 SET verification_status = ?, 
                     rejection_reason = ?,
                     updated_at = NOW() 
                 WHERE id = ?`,
                [status, rejectionReason || null, profileId]
            );
        }

        // ✅ Send email notification after DB update
        if (profile?.email) {
            try {
                const { sendEmail } = await import("@/lib/mail");
                const tradespersonName = profile.name || profile.company_name || "Tradesperson";
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

                if (status === "REJECTED") {
                    await sendEmail({
                        to: profile.email,
                        subject: "⚠️ Your Verification Application Has Been Rejected – AllCarePros",
                        html: `
                            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;border:1px solid #eee;">
                                <div style="background:#c0392b;padding:32px 40px;text-align:center;">
                                    <h1 style="color:white;margin:0;font-size:24px;font-weight:bold;">Verification Rejected</h1>
                                </div>
                                <div style="padding:36px 40px;">
                                    <p style="font-size:16px;color:#333;">Hi <strong>${tradespersonName}</strong>,</p>
                                    <p style="font-size:15px;color:#555;line-height:1.7;">
                                        Your tradesperson verification application on <strong>AllCarePros</strong> has been reviewed and 
                                        <span style="color:#c0392b;font-weight:bold;">rejected</span> by our admin team.
                                    </p>

                                    ${rejectionReason ? `
                                    <div style="background:#fff5f5;border-left:4px solid #c0392b;border-radius:6px;padding:16px 20px;margin:24px 0;">
                                        <p style="margin:0 0 8px 0;font-weight:bold;color:#c0392b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection:</p>
                                        <p style="margin:0;color:#333;font-size:15px;line-height:1.6;">${rejectionReason}</p>
                                    </div>
                                    ` : ""}

                                    <p style="font-size:15px;color:#555;line-height:1.7;">
                                        Please review the reason above, make the necessary corrections, and re-submit your documents 
                                        through your onboarding page.
                                    </p>

                                    <div style="text-align:center;margin:32px 0;">
                                        <a href="${appUrl}/onboarding" 
                                           style="background:#1149C7;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                                            Re-submit Documents →
                                        </a>
                                    </div>

                                    <p style="font-size:13px;color:#aaa;border-top:1px solid #eee;padding-top:20px;margin-top:8px;text-align:center;">
                                        If you have questions, contact our support team. &nbsp;|&nbsp; © 2026 AllCarePros
                                    </p>
                                </div>
                            </div>
                        `
                    });
                    console.log(`[Admin] Rejection email sent to: ${profile.email}`);

                } else if (status === "APPROVED") {
                    await sendEmail({
                        to: profile.email,
                        subject: "🎉 Congratulations! Your Verification Is Approved – AllCarePros",
                        html: `
                            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;border:1px solid #eee;">
                                <div style="background:#1149C7;padding:32px 40px;text-align:center;">
                                    <h1 style="color:white;margin:0;font-size:24px;font-weight:bold;">🎉 You're Approved!</h1>
                                </div>
                                <div style="padding:36px 40px;">
                                    <p style="font-size:16px;color:#333;">Hi <strong>${tradespersonName}</strong>,</p>
                                    <p style="font-size:15px;color:#555;line-height:1.7;">
                                        Your tradesperson verification application has been 
                                        <span style="color:#27ae60;font-weight:bold;">approved</span>! 
                                        Your profile is now live and visible to potential customers.
                                    </p>

                                    <div style="background:#f0fff4;border-left:4px solid #27ae60;border-radius:6px;padding:16px 20px;margin:24px 0;">
                                        <p style="margin:0;color:#2d6a4f;font-size:15px;line-height:1.6;">
                                            ✅ You can now view and apply for available jobs on your dashboard.
                                        </p>
                                    </div>

                                    <div style="text-align:center;margin:32px 0;">
                                        <a href="${appUrl}/tradesperson" 
                                           style="background:#1149C7;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                                            Go to Dashboard →
                                        </a>
                                    </div>

                                    <p style="font-size:13px;color:#aaa;border-top:1px solid #eee;padding-top:20px;margin-top:8px;text-align:center;">
                                        © 2026 AllCarePros
                                    </p>
                                </div>
                            </div>
                        `
                    });
                    console.log(`[Admin] Approval email sent to: ${profile.email}`);
                }
            } catch (emailErr) {
                // Email failure should NOT block the admin action
                console.error("[Admin] Failed to send email notification:", emailErr.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Tradesperson profile ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error("Admin Update Tradesperson Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
