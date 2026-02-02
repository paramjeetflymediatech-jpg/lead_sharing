
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '../../.env' }); // Adjust for script location

async function createAdmin() {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
        console.error("MySQL credentials missing in .env");
        process.exit(1);
    }

    try {
        const pool = await mysql.createConnection({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE
        });

        console.log(`Connected to MySQL (${MYSQL_DATABASE})`);

        const adminEmail = "admin@leadsharing.com";
        const password = "adminpassword123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if exists
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (rows.length > 0) {
            console.log(`Updating existing admin: ${adminEmail}`);
            await pool.query('UPDATE users SET password = ?, role = "ADMIN" WHERE email = ?', [hashedPassword, adminEmail]);
        } else {
            console.log(`Creating new admin: ${adminEmail}`);
            await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
                [adminEmail, hashedPassword, "Super Admin", "ADMIN"]
            );
        }

        console.log("Admin user ready.");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${password}`);

        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

createAdmin();
