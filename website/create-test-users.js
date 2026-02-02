const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUsers() {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    try {
        const connection = await mysql.createConnection({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE
        });

        console.log('Connected to MySQL database');
        console.log('Creating test users...\n');

        // Test users data
        const users = [
            {
                email: 'homeowner@test.com',
                password: 'password123',
                name: 'John Homeowner',
                role: 'HOMEOWNER'
            },
            {
                email: 'tradesperson@test.com',
                password: 'password123',
                name: 'Mike Tradesperson',
                role: 'TRADESPERSON'
            },
            {
                email: 'admin@test.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'ADMIN'
            }
        ];

        for (const user of users) {
            // Check if user already exists
            const [existing] = await connection.query(
                'SELECT * FROM users WHERE email = ?',
                [user.email]
            );

            if (existing.length > 0) {
                console.log(`✓ ${user.role} already exists: ${user.email}`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insert user
            const [result] = await connection.query(
                'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
                [user.email, hashedPassword, user.name, user.role]
            );

            console.log(`✓ Created ${user.role}: ${user.email}`);

            // If tradesperson, create profile
            if (user.role === 'TRADESPERSON') {
                await connection.query(
                    'INSERT INTO tradesperson_profiles (user_id, company_name, credits) VALUES (?, ?, ?)',
                    [result.insertId, 'Mike\'s Services', 10]
                );
                console.log(`  → Created tradesperson profile with 10 credits`);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('✅ TEST ACCOUNTS CREATED SUCCESSFULLY');
        console.log('═══════════════════════════════════════\n');

        console.log('🏠 HOMEOWNER ACCOUNT:');
        console.log('   Email: homeowner@test.com');
        console.log('   Password: password123\n');

        console.log('🔧 TRADESPERSON ACCOUNT:');
        console.log('   Email: tradesperson@test.com');
        console.log('   Password: password123\n');

        console.log('👑 ADMIN ACCOUNT:');
        console.log('   Email: admin@test.com');
        console.log('   Password: admin123\n');

        console.log('🌐 Login URL: http://localhost:3000/auth/login');
        console.log('═══════════════════════════════════════\n');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUsers();
