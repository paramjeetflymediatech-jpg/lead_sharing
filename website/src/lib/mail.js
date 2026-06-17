
import nodemailer from "nodemailer";
import pool from "../../config/db.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_PORT === "465",
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        let recipientList = [];
        
        if (Array.isArray(to)) {
            recipientList = to
                .map(email => (email !== null && email !== undefined) ? String(email).trim() : "")
                .filter(Boolean);
        } else if (typeof to === "string") {
            recipientList = to.split(/[,;]/).map(email => email.trim()).filter(Boolean);
        } else if (to) {
            recipientList = [String(to).trim()];
        }

        if (recipientList.length === 0) {
            throw new Error("No recipients specified for sendEmail");
        }

        // Send individually to each recipient so they only see their own email address
        const sendPromises = recipientList.map(async (recipient) => {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"AllCarePros" <no-reply@allcarepros.ca>',
                to: recipient,
                subject,
                html,
            });
            console.log("Message sent to %s: %s", recipient, info.messageId);
            return info;
        });

        const results = await Promise.all(sendPromises);
        return results[0]; // Return the first result for compatibility
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const sendWelcomeTempPasswordEmail = async (email, name, tempPassword) => {
    const loginUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;
    const subject = "Welcome to AllCarePros - Your Account Details";
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
            <h2 style="color: #1149C7; text-align: center;">Welcome to AllCarePros!</h2>
            <p>Hi ${name || "there"},</p>
            <p>Thank you for posting your job. We have automatically created an account for you so you can easily track quotes and manage your job details.</p>
            
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 14px;">${tempPassword}</code></p>
            </div>
            
            <p>We highly recommend updating your password after logging in for security.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background: #1149C7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Log In to Your Account
                </a>
            </div>
            
            <p style="font-size: 12px; color: #71717a; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 15px; margin-top: 30px;">
                If you have any questions, feel free to contact our support team.
            </p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
};

export const sendNewJobAdminNotificationEmail = async (job) => {
    try {
        // Retrieve emails of all admin users from the DB
        const [adminRows] = await pool.query("SELECT email FROM users WHERE role = 'ADMIN'");
        const adminEmails = adminRows.map(row => row.email).filter(Boolean);

        // Combine DB admins with support/admin emails from environment variables
        const supportEmailsStr = process.env.SUPPORT_EMAILS || "anujguptaflymedia@gmail.com, support@allcarepros.com";
        const envEmails = supportEmailsStr.split(/[,;]/).map(email => email.trim()).filter(Boolean);
        
        // Use a Set to remove duplicate email addresses
        const uniqueRecipients = Array.from(new Set([...adminEmails, ...envEmails]));

        if (uniqueRecipients.length === 0) {
            console.warn("No admin recipients found for new job notification");
            return;
        }

        const adminUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/jobs`;
        const subject = `New Job Created #${job.id}: ${job.categoryName || "New Category"} in ${job.city || "Canada"}`;
        
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
                <h2 style="color: #1149C7; text-align: center;">New Job Posted</h2>
                <p>Hello Admin,</p>
                <p>A new job has been successfully created on AllCarePros. Below are the job details:</p>
                
                <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Job ID:</strong> #${job.id}</p>
                    <p style="margin: 5px 0;"><strong>Category:</strong> ${job.categoryName || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>City:</strong> ${job.city || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Postcode:</strong> ${job.postcode || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Start Time:</strong> ${job.startTime || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Job Stage:</strong> ${job.jobStage || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Budget:</strong> ${job.budgetMin ? `$${job.budgetMin}` : 'N/A'} - ${job.budgetMax ? `$${job.budgetMax}` : 'N/A'}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Description:</strong></p>
                    <p style="margin: 5px 0; font-style: italic; color: #555;">${job.description || "N/A"}</p>
                </div>
                
                <div style="background-color: #eef2ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1149C7;">
                    <p style="margin: 0 0 5px 0;"><strong>Contact Information:</strong></p>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${job.contactName || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${job.contactPhone || "N/A"}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${job.contactEmail || "N/A"}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${adminUrl}" style="background: #1149C7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        View in Admin Dashboard
                    </a>
                </div>
                
                <p style="font-size: 12px; color: #71717a; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 15px; margin-top: 30px;">
                    This is an automated notification from the AllCarePros system.
                </p>
            </div>
        `;

        return sendEmail({ to: uniqueRecipients, subject, html });
    } catch (error) {
        console.error("Error sending admin job email notification:", error);
        throw error;
    }
};

