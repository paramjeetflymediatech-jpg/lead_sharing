
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // commonjs requires simple require

// Check both local and root .env
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '../.env' });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['HOMEOWNER', 'TRADESPERSON', 'ADMIN'], default: 'HOMEOWNER', required: true }
}, { timestamps: true });

// Prevent overwrite model error
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error("MONGODB_URI missing in .env");
        process.exit(1);
    }

    try {
        // Force the same dbName as the app uses
        await mongoose.connect(MONGODB_URI, { dbName: 'lead_sharing' });
        console.log("Connected to MongoDB (lead_sharing)");

        const adminEmail = "admin@leadsharing.com";
        const password = "adminpassword123";

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log(`Updating existing admin: ${adminEmail}`);
            user.password = await bcrypt.hash(password, 10);
            user.role = "ADMIN";
            await user.save();
        } else {
            console.log(`Creating new admin: ${adminEmail}`);
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                email: adminEmail,
                password: hashedPassword,
                name: "Super Admin",
                role: "ADMIN"
            });
        }

        console.log("Admin user ready.");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

createAdmin();
