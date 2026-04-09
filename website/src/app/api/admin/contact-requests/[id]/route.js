import { NextResponse } from "next/server";
import { ContactRequest } from "@/models/ContactRequest";
import { getCurrentUser } from "@/lib/serverAuth";
import { sendEmail } from "@/lib/mail";

export async function GET(req, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const request = await ContactRequest.findById(id);

        if (!request) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        return NextResponse.json(request, { status: 200 });

    } catch (error) {
        console.error("ADMIN CONTACT DETAIL ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, adminNotes } = body;

        // Fetch current request to get user's email
        const contactReq = await ContactRequest.findById(id);
        if (!contactReq) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        const updated = await ContactRequest.findByIdAndUpdate(id, {
            status,
            adminNotes
        });

        // 📧 Notify User if processed
        if (status === 'PROCESSED') {
            try {
                await sendEmail({
                    to: contactReq.email,
                    subject: `Update on your inquiry: ${contactReq.subject || 'All Care Pros Support'}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
                            <h2 style="color: #1149C7;">We've reviewed your inquiry</h2>
                            <p>Hi ${contactReq.name},</p>
                            <p>Thank you for contacting All Care Pros. Our team has reviewed your request regarding <strong>"${contactReq.subject || contactReq.category}"</strong>.</p>
                            
                            ${adminNotes ? `
                            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1149C7;">
                                <p style="margin: 0; font-weight: bold; color: #1149C7;">Our Response:</p>
                                <p style="margin: 10px 0 0 0; line-height: 1.6;">${adminNotes}</p>
                            </div>
                            ` : `
                            <p>Your inquiry has been marked as <strong>Processed</strong>. We hope we were able to assist you.</p>
                            `}
                            
                            <p>If you have any further questions, feel free to reply to this email or submit a new inquiry on our website.</p>
                            
                            <p style="margin-top: 30px; font-weight: bold;">Best regards,<br/>The All Care Pros Team</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Failed to send user notification email:", emailError);
            }
        }

        return NextResponse.json({
            message: "Request updated successfully",
            request: updated
        }, { status: 200 });

    } catch (error) {
        console.error("ADMIN CONTACT UPDATE ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const result = await ContactRequest.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Request deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("ADMIN CONTACT DELETE ERROR:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
