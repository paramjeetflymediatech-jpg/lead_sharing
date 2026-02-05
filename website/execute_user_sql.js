
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

    console.log('Connecting to database...');
    let connection;
    try {
        connection = await mysql.createConnection(config);

        // 1. Modify the status column to include User's requested values AND existing app values
        // Existing: PENDING, HIRED, REJECTED
        // Requested: PENDING, UNLOCKED, COMPLETED, CANCELLED
        // Combined: PENDING, HIRED, REJECTED, UNLOCKED, COMPLETED, CANCELLED
        console.log('Updating status column definition...');
        await connection.query(`
      ALTER TABLE leads 
      MODIFY COLUMN status ENUM('PENDING', 'HIRED', 'REJECTED', 'UNLOCKED', 'COMPLETED', 'CANCELLED') 
      DEFAULT 'PENDING'
    `);
        console.log('✅ Status column updated.');

        // 2. Execute the INSERT statement
        console.log('Inserting new lead...');
        // Note: 'true' in SQL is usually 1. 
        const [result] = await connection.query(`
      INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked)
      VALUES (?, ?, ?, ?, ?)
    `, [4, 9, 'imran', 1, true]);

        console.log('✅ Insert successful. New Lead ID:', result.insertId);

    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            console.error('❌ Insert Failed: Job ID 4 or Tradesperson ID 9 does not exist.');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}

main();
