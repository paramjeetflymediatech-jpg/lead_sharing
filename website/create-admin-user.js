// Create Admin User with Hashed Password
require('dotenv').config();

const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        console.log('🔐 Creating admin user with hashed password...\n');

        // Admin credentials
        const email = 'admin@example.com';
        const password = 'admin123';  // Change this to your desired password
        const name = 'Admin User';
        const role = 'ADMIN';

        // Hash the password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if admin already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Update existing admin user
            console.log('Admin user already exists. Updating password...');
            await pool.query(
                'UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?',
                [hashedPassword, name, role, email]
            );
            console.log('✅ Admin user password updated successfully!\n');
        } else {
            // Create new admin user
            console.log('Creating new admin user...');
            await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, name, role]
            );
            console.log('✅ Admin user created successfully!\n');
        }

        console.log('=========================================');
        console.log('   ADMIN LOGIN CREDENTIALS');
        console.log('=========================================');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('=========================================\n');
        console.log('🎉 You can now login at: http://localhost:3000/admin/login\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
