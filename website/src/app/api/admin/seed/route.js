
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function GET() {
    try {
        // await connectToDatabase();

        // Check if admin exists
        const adminEmail = "admin@leadsharing.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            const password = "adminpassword123";
            const hashedPassword = await hashPassword(password);

            existingAdmin.password = hashedPassword;
            existingAdmin.role = "ADMIN"; // ensure role is correct
            await existingAdmin.save();

            return NextResponse.json({
                message: "Admin user updated",
                credentials: {
                    email: adminEmail,
                    password: password
                }
            });
        }

        // Create admin user
        const password = "adminpassword123";
        const hashedPassword = await hashPassword(password);

        const admin = await User.create({
            name: "Super Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN"
        });

        return NextResponse.json({
            success: true,
            message: "Admin created",
            credentials: {
                email: adminEmail,
                password: password
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
