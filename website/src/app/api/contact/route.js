import { NextResponse } from "next/server";
import { ContactRequest } from "@/models/ContactRequest";
import { sendEmail } from "@/lib/mail";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, subject, message, category } = body;

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Save to Database
        const newRequest = await ContactRequest.create({
            name,
            email,
            subject,
            message,
            category
        });

        // 📧 Notify Admin
        try {
            const supportEmails = process.env.SUPPORT_EMAILS || "anujguptaflymedia@gmail.com, support@allcarepros.com";
            await sendEmail({
                to: supportEmails,
                subject: `New Support Inquiry: ${subject || 'No Subject'}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
                        <h2 style="color: #1149C7;">New Contact Inquiry Received</h2>
                        <p><strong>From:</strong> ${name} (${email})</p>
                        <p><strong>Category:</strong> ${category}</p>
                        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                        <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-top: 10px;">
                            <p style="margin: 0;"><strong>Message:</strong></p>
                            <p style="margin: 10px 0 0 0; line-height: 1.5;">${message}</p>
                        </div>
                        <p style="margin-top: 20px; font-size: 12px; color: #71717a;">
                            You can manage this inquiry in the admin dashboard.
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Failed to send admin notification email:", emailError);
            // We don't fail the request if email fails
        }

        // 📧 Auto-reply to User
        try {
            await sendEmail({
                to: email,
                subject: `We've received your support request: ${subject || 'General Support'}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
                        <h2 style="color: #1149C7; text-align: center;">Support Request Received</h2>
                        <p>Hi ${name || "there"},</p>
                        <p>Thank you for reaching out to the AllCarePros support team. We have received your request and will get back to you within 24-48 hours.</p>
                        
                        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Your Request Details:</strong></p>
                            <p style="margin: 5px 0;"><strong>Category:</strong> ${category || "General Support"}</p>
                            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject || "No Subject"}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Message:</strong></p>
                            <p style="margin: 5px 0; font-style: italic; color: #555;">${message}</p>
                        </div>
                        
                        <p>If you have any additional details to add, please feel free to contact us at <a href="mailto:support@allcarepros.com" style="color: #1149C7; text-decoration: none;">support@allcarepros.com</a>.</p>
                        
                        <p style="font-size: 12px; color: #71717a; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 15px; margin-top: 30px;">
                            This is an automated confirmation of your request.
                        </p>
                    </div>
                `
            });
            console.log(`✅ Support auto-reply sent to ${email}`);
        } catch (autoReplyError) {
            console.error("❌ Failed to send user auto-reply email:", autoReplyError);
        }

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully. We will get back to you soon!"
        });

    } catch (error) {
        console.error("Contact API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
