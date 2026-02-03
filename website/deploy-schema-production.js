#!/usr/bin/env node
/**
 * Database Schema Deployment Script for Production
 * 
 * This script safely creates missing database tables on production.
 * Run this on your production server after deployment.
 * 
 * Usage: node deploy-schema-production.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deploySchema() {
    console.log('==================================================');
    console.log('  Database Schema Deployment Script');
    console.log('==================================================\n');

    // Show environment info (without sensitive data)
    console.log('📋 Configuration:');
    console.log('  Host:', process.env.MYSQL_HOST || '127.0.0.1');
    console.log('  User:', process.env.MYSQL_USER || 'root');
    console.log('  Database:', process.env.MYSQL_DATABASE || 'lead_sharing');
    console.log('  Port:', process.env.MYSQL_PORT || '3306');
    console.log('');

    let connection;

    try {
        // Attempt connection
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || '127.0.0.1',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'lead_sharing',
            port: process.env.MYSQL_PORT || 3306
        });
        console.log('✅ Connected successfully!\n');

        // Check existing tables
        console.log('📊 Checking current database state...');
        const [existingTables] = await connection.query('SHOW TABLES');
        const tableNames = existingTables.map(t => Object.values(t)[0]);

        console.log('Current tables:', tableNames.length > 0 ? tableNames.join(', ') : 'None');
        console.log('');

        // Read schema file
        console.log('📁 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');

        if (!fs.existsSync(schemaPath)) {
            throw new Error('schema.sql file not found! Please ensure it exists in the same directory.');
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split and execute statements
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`🔄 Executing ${statements.length} SQL statements...\n`);

        let created = 0;
        let skipped = 0;

        for (const statement of statements) {
            try {
                await connection.query(statement);
                const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                if (tableName) {
                    const name = tableName[1];
                    if (tableNames.includes(name)) {
                        console.log(`  ⏭️  ${name} (already exists)`);
                        skipped++;
                    } else {
                        console.log(`  ✅ ${name} (created)`);
                        created++;
                    }
                }
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('already exists')) {
                    console.error('  ❌ Error executing statement:', err.message);
                }
            }
        }

        console.log('');
        console.log('📊 Summary:');
        console.log('  Tables created:', created);
        console.log('  Tables skipped:', skipped);
        console.log('');

        // Verify final state
        console.log('📊 Verifying final database state...');
        const [finalTables] = await connection.query('SHOW TABLES');
        const finalTableNames = finalTables.map(t => Object.values(t)[0]);

        console.log('\nAll tables in database:');
        finalTableNames.forEach(table => {
            const isNew = !tableNames.includes(table);
            console.log(`  ${isNew ? '🆕' : '✓'}  ${table}`);
        });

        // Check for required tables
        const requiredTables = [
            'users',
            'categories',
            'sub_categories',
            'tradesperson_profiles',
            'jobs',
            'leads',
            'seo_pages'
        ];

        console.log('\n✅ Checking required tables...');
        const missingTables = requiredTables.filter(t => !finalTableNames.includes(t));

        if (missingTables.length > 0) {
            console.log('⚠️  Missing tables:', missingTables.join(', '));
            console.log('');
            console.log('Please check your schema.sql file and try again.');
        } else {
            console.log('✅ All required tables are present!');
        }

        console.log('');
        console.log('==================================================');
        console.log('✅ Schema deployment completed successfully!');
        console.log('==================================================');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Restart your application: pm2 restart leadsharing');
        console.log('  2. Check the error logs: pm2 logs leadsharing --lines 50');
        console.log('');

    } catch (error) {
        console.error('\n❌ Deployment failed!');
        console.error('Error:', error.message);
        console.error('');

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Possible solutions:');
            console.error('  1. Check your .env file has correct MySQL credentials');
            console.error('  2. Verify MySQL user has proper permissions');
            console.error('  3. Try connecting to MySQL manually to test credentials');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 Possible solutions:');
            console.error('  1. Check if MySQL server is running');
            console.error('  2. Verify the MYSQL_HOST and MYSQL_PORT in .env');
        }

        console.error('');
        process.exit(1);

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the deployment
deploySchema();
