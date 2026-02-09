/**
 * MySQL Migration Script
 * Adds hired_tradesperson_id, hired_at columns to jobs table
 * and updates status enum to include 'HIRED'
 *
 * Run with:
 * node prisma/migrations/add_hired_fields_to_jobs.js
 */

const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2/promise");

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: process.env.MYSQL_PORT || 3306,
        database: process.env.MYSQL_DATABASE || "lead_sharing",
        user: process.env.MYSQL_USER || "aman",
        password: process.env.MYSQL_PASSWORD || "aman1234",
    });

    console.log("✅ Connected to MySQL");

    try {
        console.log("🔄 Checking if columns exist...");

        // Check if columns already exist
        const [columns] = await connection.query(`
      SHOW COLUMNS FROM jobs LIKE 'hired_tradesperson_id'
    `);

        if (columns.length === 0) {
            console.log("➕ Adding hired_tradesperson_id column...");
            await connection.query(`
        ALTER TABLE jobs 
        ADD COLUMN hired_tradesperson_id INT NULL AFTER status,
        ADD FOREIGN KEY (hired_tradesperson_id) REFERENCES users(id) ON DELETE SET NULL
      `);
            console.log("✅ Added hired_tradesperson_id column");
        } else {
            console.log("⏭️  hired_tradesperson_id column already exists");
        }

        // Check if hired_at exists
        const [hiredAtColumns] = await connection.query(`
      SHOW COLUMNS FROM jobs LIKE 'hired_at'
    `);

        if (hiredAtColumns.length === 0) {
            console.log("➕ Adding hired_at column...");
            await connection.query(`
        ALTER TABLE jobs 
        ADD COLUMN hired_at DATETIME NULL AFTER hired_tradesperson_id
      `);
            console.log("✅ Added hired_at column");
        } else {
            console.log("⏭️  hired_at column already exists");
        }

        // Update status enum to include HIRED
        console.log("🔄 Updating status enum to include HIRED...");
        await connection.query(`
      ALTER TABLE jobs 
      MODIFY COLUMN status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'HIRED') DEFAULT 'OPEN'
    `);
        console.log("✅ Updated status enum");

        console.log("🎉 Migration completed successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        throw err;
    } finally {
        await connection.end();
        console.log("🔌 Database connection closed");
    }
}

// Run the migration
runMigration().catch(console.error);
