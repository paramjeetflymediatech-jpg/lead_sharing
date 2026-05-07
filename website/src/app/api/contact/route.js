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
            await sendEmail({
                to: "anujguptaflymedia@gmail.com",
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
