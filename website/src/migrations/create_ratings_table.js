/**
 * Database Reset & Seed Script
 * Drops all tables and recreates from scratch using the complete schema.
 * Run: node src/migrations/create_ratings_table.js
 */

const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

console.log(`🔌 Database: ${process.env.MYSQL_DATABASE}@${process.env.MYSQL_HOST}`);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "lead_sharing",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("✅ Connected to MySQL");

  try {
    /* ===== DROP ALL TABLES ===== */
    console.log("🧹 Dropping existing tables...");
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
    const tables = [
      "pending_users", "blogs", "tradesperson_ratings", "messages",
      "payments", "leads", "jobs", "tradesperson_profiles",
      "sub_categories", "categories", "credit_plans", "seo_pages",
      "push_tokens", "auth_tokens", "migrations", "users",
    ];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);

    /* ===== USERS ===== */
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('HOMEOWNER','TRADESPERSON','ADMIN') DEFAULT 'HOMEOWNER',
        password_reset_token VARCHAR(255),
        password_reset_expires DATETIME,
        auth_token VARCHAR(1000),
        auth_token_expires DATETIME,
        profile_image VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        postcode VARCHAR(20) DEFAULT NULL,
        address_line1 VARCHAR(255) DEFAULT NULL,
        address_line2 VARCHAR(255) DEFAULT NULL,
        phone_verified BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(10) DEFAULT NULL,
        otp_expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ users");

    /* ===== PENDING USERS ===== */
    await connection.query(`
      CREATE TABLE pending_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        company_name VARCHAR(255),
        otp_code VARCHAR(10),
        otp_expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✅ pending_users");

    /* ===== PUSH TOKENS ===== */
    await connection.query(`
      CREATE TABLE push_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        platform VARCHAR(50) DEFAULT 'mobile',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ push_tokens");

    /* ===== AUTH TOKENS ===== */
    await connection.query(`
      CREATE TABLE auth_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(1000) NOT NULL,
        device_id VARCHAR(255),
        device_type VARCHAR(50),
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token(255))
      );
    `);
    console.log("✅ auth_tokens");

    /* ===== SEO PAGES ===== */
    await connection.query(`
      CREATE TABLE seo_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        meta_description TEXT,
        keywords TEXT,
        meta_robots VARCHAR(255) DEFAULT 'index, follow',
        og_title VARCHAR(500),
        og_description TEXT,
        og_image VARCHAR(500),
        canonical_url VARCHAR(500),
        schema_markup TEXT,
        google_analytics_id VARCHAR(50),
        google_tag_manager_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ seo_pages");

    /* ===== CATEGORIES ===== */
    await connection.query(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ categories");

    /* ===== SUB CATEGORIES ===== */
    await connection.query(`
      CREATE TABLE sub_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ sub_categories");

    /* ===== TRADESPERSON PROFILES ===== */
    await connection.query(`
      CREATE TABLE tradesperson_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255) DEFAULT '',
        bio TEXT,
        phone VARCHAR(50) DEFAULT '',
        postcode VARCHAR(20) DEFAULT '',
        skills TEXT,
        service_areas TEXT,
        credits INT DEFAULT 5,
        average_rating FLOAT DEFAULT 0,
        total_ratings INT DEFAULT 0,
        experience_years INT DEFAULT 0,
        verification_status ENUM('NOT_STARTED','IN_PROGRESS','PENDING_APPROVAL','APPROVED','REJECTED') DEFAULT 'NOT_STARTED',
        id_document VARCHAR(255) DEFAULT NULL,
        license_document VARCHAR(255) DEFAULT NULL,
        insurance_document VARCHAR(255) DEFAULT NULL,
        stripe_connect_id VARCHAR(255) DEFAULT NULL,
        payouts_enabled BOOLEAN DEFAULT FALSE,
        rejection_reason TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ tradesperson_profiles");

    /* ===== JOBS ===== */
    await connection.query(`
      CREATE TABLE jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        homeowner_id INT NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        sub_category_id INT NOT NULL,
        description TEXT NOT NULL,
        postcode VARCHAR(20) NOT NULL,
        city VARCHAR(255),
        start_time ENUM('URGENT','WITHIN_2_DAYS','WITHIN_2_WEEKS','WITHIN_2_MONTHS','FLEXIBLE') NOT NULL,
        job_stage ENUM('READY_TO_HIRE','PLANNING','INSURANCE') NOT NULL,
        ownership ENUM('OWNER','LANDLORD','AUTHORIZED','BUYING') NOT NULL,
        budget_min BIGINT,
        budget_max BIGINT,
        media TEXT,
        status ENUM('OPEN','HIRED','COMPLETED','CANCELLED') DEFAULT 'OPEN',
        hired_tradesperson_id INT DEFAULT NULL,
        hired_at DATETIME DEFAULT NULL,
        has_rated TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id),
        FOREIGN KEY (hired_tradesperson_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ jobs");

    /* ===== LEADS ===== */
    await connection.query(`
      CREATE TABLE leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        message TEXT NOT NULL,
        price_estimate DECIMAL(10,2),
        is_unlocked TINYINT(1) DEFAULT 0,
        status ENUM('PENDING','HIRED','REJECTED') DEFAULT 'PENDING',
        unlocked_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (tradesperson_id) REFERENCES tradesperson_profiles(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ leads");

    /* ===== CREDIT PLANS ===== */
    await connection.query(`
      CREATE TABLE credit_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        plan_key VARCHAR(50) NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        credits INT NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ credit_plans");

    /* ===== PAYMENTS ===== */
    await connection.query(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tradesperson_id INT NOT NULL,
        user_id INT NOT NULL,
        plan_id INT,
        stripe_session_id VARCHAR(255) NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        plan VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        credits INT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tradesperson (tradesperson_id),
        INDEX idx_user (user_id),
        INDEX idx_session (stripe_session_id),
        FOREIGN KEY (tradesperson_id) REFERENCES tradesperson_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES credit_plans(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("✅ payments");

    /* ===== TRADESPERSON RATINGS ===== */
    await connection.query(`
      CREATE TABLE tradesperson_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL UNIQUE,
        homeowner_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        rating INT NOT NULL,
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (homeowner_id) REFERENCES users(id),
        FOREIGN KEY (tradesperson_id) REFERENCES users(id)
      );
    `);
    console.log("✅ tradesperson_ratings");

    /* ===== BLOGS ===== */
    await connection.query(`
      CREATE TABLE blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image VARCHAR(255),
        status ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
        author VARCHAR(255) DEFAULT 'Admin',
        tags TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_robots VARCHAR(255) DEFAULT 'index, follow',
        canonical_url VARCHAR(255),
        og_title VARCHAR(255),
        og_description TEXT,
        og_image VARCHAR(255),
        schema_markup TEXT,
        ga_id VARCHAR(50),
        gtm_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ blogs");

    /* ===== MESSAGES ===== */
    await connection.query(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        conversation_status ENUM('PENDING_HOMEOWNER_ACCEPTANCE','PENDING_TRADESPERSON_ACCEPTANCE','ACTIVE','CLOSED') DEFAULT 'ACTIVE',
        conversation_accepted_by_homeowner BOOLEAN DEFAULT FALSE,
        conversation_accepted_by_tradesperson BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ messages");

    /* ===== MIGRATIONS LOG ===== */
    await connection.query(`
      CREATE TABLE migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ migrations");

    /* ===== SEED DATA ===== */
    console.log("🌱 Inserting seed data...");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await connection.query(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, 'ADMIN')`,
      ["admin@allcarepros.com", hashedPassword, "Admin User"]
    );

    await connection.query(`
      INSERT INTO categories (name, slug) VALUES
      ('Roofing', 'roofing'),
      ('Plumbing', 'plumbing'),
      ('Electrical', 'electrical'),
      ('Carpentry', 'carpentry'),
      ('Painting & Decorating', 'painting-decorating'),
      ('Landscaping', 'landscaping'),
      ('HVAC', 'hvac'),
      ('General Building', 'general-building')
    `);

    await connection.query(`
      INSERT INTO credit_plans (name, plan_key, price, credits, description) VALUES
      ('Basic Plan', 'basic_plan', 10.00, 10, 'Starter pack with 10 credits'),
      ('Standard Plan', 'standard_plan', 25.00, 30, 'Best seller with 30 credits'),
      ('Premium Plan', 'premium_plan', 50.00, 70, 'Bulk pack with 70 credits')
    `);

    console.log("🎉 MIGRATION COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    await connection.end();
    console.log("🔌 DB connection closed");
  }
}

runMigration().catch(console.error);
