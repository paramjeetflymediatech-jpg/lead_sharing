const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSchema() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('📁 Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

        console.log('🔄 Executing schema...');
        await connection.query(schema);

        console.log('✅ Schema executed successfully!');
        console.log('✅ All tables created/verified.');

        // Verify tables exist
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n📊 Tables in database:');
        tables.forEach(table => {
            console.log('  ✓', Object.values(table)[0]);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runSchema();
