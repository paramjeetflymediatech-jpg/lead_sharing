const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'lead_sharing',
            port: process.env.MYSQL_PORT || 3306
        });

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables found:');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkTables();
