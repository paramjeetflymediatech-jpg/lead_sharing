const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "lead_sharing",
    });

    console.log("🔌 Connected to database:", process.env.MYSQL_DATABASE);

    try {
        console.log("🔍 Checking for 'category_id' column in 'tradesperson_profiles'...");

        const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = ? 
      AND table_name = 'tradesperson_profiles' 
      AND column_name = 'category_id'
    `, [process.env.MYSQL_DATABASE || "lead_sharing"]);

        if (columns.length === 0) {
            console.log("➕ Adding missing column 'category_id' to 'tradesperson_profiles'...");
            await connection.query(`
        ALTER TABLE tradesperson_profiles 
        ADD COLUMN category_id INT DEFAULT NULL AFTER rejection_reason,
        ADD CONSTRAINT fk_tp_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      `);
            console.log("✅ Column 'category_id' added successfully.");
        } else {
            console.log("ℹ️ Column 'category_id' already exists. No changes needed.");
        }

    } catch (error) {
        console.error("❌ Migration failed:", error.message);
    } finally {
        await connection.end();
        console.log("🔌 Connection closed.");
    }
}

migrate();
