const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function testAndCreateTables() {
    let connection;
    try {
        console.log('🔌 Testing database connection...');
        connection = await pool.getConnection();
        console.log('✅ Database connection successful!');

        // Check existing tables
        console.log('\n📊 Checking existing tables...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Current tables:');
        const tableNames = tables.map(t => Object.values(t)[0]);
        tableNames.forEach(table => console.log('  ✓', table));

        // Check if sub_categories exists
        if (!tableNames.includes('sub_categories')) {
            console.log('\n⚠️  Table "sub_categories" is missing!');
            console.log('🔄 Creating missing tables from schema.sql...\n');

            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

            // Split by semicolons and execute each statement
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                try {
                    await connection.query(statement);
                    const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
                    if (tableName) {
                        console.log('  ✅ Created/verified table:', tableName[1]);
                    }
                } catch (err) {
                    console.error('  ❌ Error executing statement:', err.message);
                }
            }

            console.log('\n📊 Verifying tables again...');
            const [newTables] = await connection.query('SHOW TABLES');
            console.log('Tables after creation:');
            newTables.forEach(table => console.log('  ✓', Object.values(table)[0]));

        } else {
            console.log('\n✅ Table "sub_categories" already exists!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

testAndCreateTables();
