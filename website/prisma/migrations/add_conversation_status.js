/**
 * MySQL Migration Script
 * Adds conversation status fields to messages table
 *
 * Run with:
 * node prisma/migrations/add_conversation_status.js
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
        console.log("🔄 Checking messages table columns...");

        // Check if conversation_status exists
        const [statusColumns] = await connection.query(`
      SHOW COLUMNS FROM messages LIKE 'conversation_status'
    `);

        if (statusColumns.length === 0) {
            console.log("➕ Adding conversation_status column...");
            await connection.query(`
        ALTER TABLE messages 
        ADD COLUMN conversation_status ENUM(
          'PENDING_HOMEOWNER_ACCEPTANCE',
          'PENDING_TRADESPERSON_ACCEPTANCE',
          'ACTIVE',
          'CLOSED'
        ) DEFAULT 'ACTIVE' AFTER is_read
      `);
            console.log("✅ Added conversation_status column");
        } else {
            console.log("⏭️  conversation_status column already exists");
        }

        // Check if conversation_accepted_by_homeowner exists
        const [homeownerAcceptColumns] = await connection.query(`
      SHOW COLUMNS FROM messages LIKE 'conversation_accepted_by_homeowner'
    `);

        if (homeownerAcceptColumns.length === 0) {
            console.log("➕ Adding conversation_accepted_by_homeowner column...");
            await connection.query(`
        ALTER TABLE messages 
        ADD COLUMN conversation_accepted_by_homeowner BOOLEAN DEFAULT FALSE AFTER conversation_status
      `);
            console.log("✅ Added conversation_accepted_by_homeowner column");
        } else {
            console.log("⏭️  conversation_accepted_by_homeowner column already exists");
        }

        // Check if conversation_accepted_by_tradesperson exists
        const [tradespersonAcceptColumns] = await connection.query(`
      SHOW COLUMNS FROM messages LIKE 'conversation_accepted_by_tradesperson'
    `);

        if (tradespersonAcceptColumns.length === 0) {
            console.log("➕ Adding conversation_accepted_by_tradesperson column...");
            await connection.query(`
        ALTER TABLE messages 
        ADD COLUMN conversation_accepted_by_tradesperson BOOLEAN DEFAULT FALSE AFTER conversation_accepted_by_homeowner
      `);
            console.log("✅ Added conversation_accepted_by_tradesperson column");
        } else {
            console.log("⏭️  conversation_accepted_by_tradesperson column already exists");
        }

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
