const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    const connection = await mysql.createConnection({
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE
    });

    console.log('🔄 Adding slug column to sub_categories...');

    try {
        await connection.query(`
            ALTER TABLE sub_categories 
            ADD COLUMN slug VARCHAR(255) NOT NULL UNIQUE AFTER name;
        `);
        console.log('✅ Column `slug` added successfully to `sub_categories`.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ Column `slug` already exists.');
        } else {
            console.error('❌ Error adding column:', error.message);
        }
    }

    await connection.end();
}

migrate();
