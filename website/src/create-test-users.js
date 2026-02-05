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
                console.log(`Γ£ô ${user.role} already exists: ${user.email}`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insert user
            const [result] = await connection.query(
                'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
                [user.email, hashedPassword, user.name, user.role]
            );

            console.log(`Γ£ô Created ${user.role}: ${user.email}`);

            // If tradesperson, create profile
            if (user.role === 'TRADESPERSON') {
                await connection.query(
                    'INSERT INTO tradesperson_profiles (user_id, company_name, credits) VALUES (?, ?, ?)',
                    [result.insertId, 'Mike\'s Services', 10]
                );
                console.log(`  ΓåÆ Created tradesperson profile with 10 credits`);
            }
        }

        console.log('\nΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ');
        console.log('Γ£à TEST ACCOUNTS CREATED SUCCESSFULLY');
        console.log('ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ\n');

        console.log('≡ƒÅá HOMEOWNER ACCOUNT:');
        console.log('   Email: homeowner@test.com');
        console.log('   Password: password123\n');

        console.log('≡ƒöº TRADESPERSON ACCOUNT:');
        console.log('   Email: tradesperson@test.com');
        console.log('   Password: password123\n');

        console.log('≡ƒææ ADMIN ACCOUNT:');
        console.log('   Email: admin@test.com');
        console.log('   Password: admin123\n');

        console.log('≡ƒîÉ Login URL: http://localhost:3000/auth/login');
        console.log('ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ\n');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUsers();
