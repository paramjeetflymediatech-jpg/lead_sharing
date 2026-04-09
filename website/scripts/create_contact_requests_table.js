const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

async function createTable() {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = `
        CREATE TABLE IF NOT EXISTS contact_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            subject VARCHAR(255),
            message TEXT NOT NULL,
            status ENUM('PENDING', 'PROCESSED', 'ARCHIVED') DEFAULT 'PENDING',
            admin_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
        console.log(`📡 Connecting to ${dbConfig.host}...`);
        await connection.query(sql);
        console.log("✅ Table 'contact_requests' created or already exists.");
    } catch (error) {
        console.error("❌ Error creating table:", error);
    } finally {
        await connection.end();
    }
}

createTable();
