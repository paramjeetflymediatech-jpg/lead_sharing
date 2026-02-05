
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'aman',
        password: process.env.MYSQL_PASSWORD || 'aman1234',
        database: process.env.MYSQL_DATABASE || 'lead_sharing',
        port: process.env.MYSQL_PORT || 3306
    };

    console.log('Connecting to database...', config.database);

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('Connected.');

        // Add status column
        try {
            console.log('Adding status column...');
            await connection.query("ALTER TABLE leads ADD COLUMN status ENUM('PENDING', 'HIRED', 'REJECTED') DEFAULT 'PENDING'");
            console.log('Successfully added status column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column status already exists.');
            } else {
                console.error('Error adding status column:', err.message);
            }
        }

        // Add unlocked_at column
        try {
            console.log('Adding unlocked_at column...');
            await connection.query("ALTER TABLE leads ADD COLUMN unlocked_at DATETIME DEFAULT NULL");
            console.log('Successfully added unlocked_at column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column unlocked_at already exists.');
            } else {
                console.error('Error adding unlocked_at column:', err.message);
            }
        }

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
