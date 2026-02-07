const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path to point to website/.env
const fs = require('fs');
const path = require('path');

async function updateSchema() {
    console.log('Using config:', {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'lead_sharing',
            port: process.env.MYSQL_PORT || 3306,
            multipleStatements: true
        });

        console.log('Matched connected to database successfully.');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon but ignore semicolons inside constraints/triggers if any (simple split is okay for this schema)
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                // Determine table name for logging
                const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
                const tableName = match ? match[1] : 'unknown';

                await connection.query(statement);
                console.log(`Executed statement for ${tableName}`);
            } catch (err) {
                console.error(`Error executing statement: ${err.message}`);
            }
        }

        console.log('Schema update completed.');
        await connection.end();

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

updateSchema();
