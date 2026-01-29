
const mongoose = require('mongoose');
const { hash } = require('bcryptjs');
require('dotenv').config({ path: '.env' }); // Load env from .env

// Minimal User Schema Definition for script (avoiding import issues with Next.js/ESM)
const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['HOMEOWNER', 'TRADESPERSON', 'ADMIN'],
            default: 'HOMEOWNER',
            required: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('Error: MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'lead_sharing' });
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@leadsharing.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin user alrady exists: ${adminEmail}`);
            // Optionally update role to ensure they are admin
            if (existingAdmin.role !== 'ADMIN') {
                existingAdmin.role = 'ADMIN';
                await existingAdmin.save();
                console.log(`Updated existing user ${adminEmail} to ADMIN role.`);
            }
        } else {
            const hashedPassword = await hash('admin123', 12);
            const newAdmin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
            });
            console.log(`Created new Admin user: ${newAdmin.email}`);
        }

        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
