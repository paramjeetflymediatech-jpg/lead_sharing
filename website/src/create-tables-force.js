const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function createTables() {
    let connection;

    // Try different connection approaches
    const configs = [
        // Config 1: Try with explicit password
        {
            host: '127.0.0.1',
            user: 'root',
            password: 'Yn9S5iCFQR8n4C0J',
            database: 'lead_sharing',
            port: 3306
        },
        // Config 2: Try without password
        {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'lead_sharing',
            port: 3306
        }
    ];

    for (let i = 0; i < configs.length; i++) {
        try {
            console.log(`\n≡ƒöä Attempt ${i + 1}: Trying to connect with config ${i + 1}...`);
            connection = await mysql.createConnection(configs[i]);
            console.log('Γ£à Connected successfully!');

            // Read and execute schema
            console.log('\n≡ƒôü Reading schema.sql...');
            const schema = fs.readFileSync('schema.sql', 'utf8');

            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            console.log(`\n≡ƒöä Executing ${statements.length} SQL statements...\n`);

            for (const statement of statements) {
                try {
                    await connection.query(statement);
                    const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
                    if (tableName) {
                        console.log('  Γ£à', tableName[1]);
                    }
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.error('  Γ¥î Error:', err.message);
                    }
                }
            }

            console.log('\n≡ƒôè Verifying tables...');
            const [tables] = await connection.query('SHOW TABLES');
            console.log('\nTables in database:');
            tables.forEach(table => console.log('  Γ£ô', Object.values(table)[0]));

            await connection.end();
            console.log('\nΓ£à All done! Tables created successfully.');
            process.exit(0);

        } catch (error) {
            console.error(`Γ¥î Config ${i + 1} failed:`, error.message);
            if (connection) {
                try {
                    await connection.end();
                } catch (e) { }
            }
        }
    }

    console.error('\nΓ¥î All connection attempts failed!');
    console.error('Please check your MySQL credentials or try setting the MySQL root password.');
    process.exit(1);
}

createTables();
