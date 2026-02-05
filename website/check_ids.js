
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

    let connection;
    try {
        connection = await mysql.createConnection(config);

        const [jobs] = await connection.query('SELECT id, description FROM jobs LIMIT 10');
        console.log('Available Jobs:', jobs.map(j => j.id));

        const [profiles] = await connection.query('SELECT id, company_name FROM tradesperson_profiles LIMIT 10');
        console.log('Available Tradesperson Profiles:', profiles.map(p => p.id));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
