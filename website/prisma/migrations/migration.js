/**
 * MySQL Migration Script
 * Creates initial tables for lead_sharing app
 *
 * Run with:
 * node src/database/migrations/001_create_initial_tables.js
 */

const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root (2 levels up from migrations folder)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("✅ Connected to .env file");
console.log(`🔌 Database: ${process.env.MYSQL_DATABASE}@${process.env.MYSQL_HOST}`);

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
    console.log("🧹 Dropping existing tables...");

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Drop tables in reverse order of dependencies
    await connection.query("DROP TABLE IF EXISTS reviews");
    await connection.query("DROP TABLE IF EXISTS tradesperson_ratings");
    await connection.query("DROP TABLE IF EXISTS messages");
    await connection.query("DROP TABLE IF EXISTS payments");
    await connection.query("DROP TABLE IF EXISTS leads");
    await connection.query("DROP TABLE IF EXISTS jobs");
    await connection.query("DROP TABLE IF EXISTS tradesperson_profiles");
    await connection.query("DROP TABLE IF EXISTS sub_categories");
    await connection.query("DROP TABLE IF EXISTS categories");
    await connection.query("DROP TABLE IF EXISTS seo_pages");
    await connection.query("DROP TABLE IF EXISTS users");

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    /* ================= USERS ================= */
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('ADMIN','HOMEOWNER','TRADESPERSON') DEFAULT 'HOMEOWNER',
        password_reset_token VARCHAR(255),
        password_reset_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      );
    `);
    console.log("✅ Created users table");

    /* ================= SEO PAGES ================= */
    await connection.query(`
      CREATE TABLE seo_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(500),
        meta_description TEXT,
        keywords TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_name (page_name)
      );
    `);
    console.log("✅ Created seo_pages table");

    /* ================= CATEGORIES ================= */
    await connection.query(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
      );
    `);
    console.log("✅ Created categories table");

    await connection.query(`
      CREATE TABLE sub_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_category_id (category_id),
        INDEX idx_slug (slug)
      );
    `);
    console.log("✅ Created sub_categories table");

    /* ================= TRADESPERSON PROFILES ================= */
    await connection.query(`
      CREATE TABLE tradesperson_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        company_name VARCHAR(255),
        profile_image VARCHAR(500),
        bio TEXT,
        phone VARCHAR(50),
        postcode VARCHAR(50),
        skills JSON,
        service_areas JSON,
        credits INT DEFAULT 5,
        average_rating FLOAT DEFAULT 0,
        total_ratings INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      );
    `);
    console.log("✅ Created tradesperson_profiles table");

    /* ================= JOBS ================= */
    await connection.query(`
      CREATE TABLE jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT NOT NULL,
        homeowner_id INT NOT NULL,
        category_id INT NOT NULL,
        sub_category_id INT,
        budget_min DECIMAL(10, 2) DEFAULT 0,
        budget_max DECIMAL(10, 2) DEFAULT 0,
        city VARCHAR(255),
        postcode VARCHAR(50),
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        job_stage ENUM('PLANNING', 'READY_TO_HIRE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNING',
        ownership ENUM('OWN', 'RENTED') DEFAULT 'OWN',
        start_time ENUM('IMMEDIATELY', 'WITHIN_1_MONTH', 'FLEXIBLE') DEFAULT 'FLEXIBLE',
        status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
        is_rated BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE SET NULL,
        INDEX idx_homeowner_id (homeowner_id),
        INDEX idx_category_id (category_id),
        INDEX idx_status (status)
      );
    `);
    console.log("✅ Created jobs table");

    /* ================= LEADS ================= */
    await connection.query(`
      CREATE TABLE leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        message TEXT,
        price_estimate DECIMAL(10, 2),
        is_unlocked BOOLEAN DEFAULT FALSE,
        status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'HIRED') DEFAULT 'PENDING',
        unlocked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_job_id (job_id),
        INDEX idx_tradesperson_id (tradesperson_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_job_tradesperson (job_id, tradesperson_id)
      );
    `);
    console.log("✅ Created leads table");

    /* ================= PAYMENTS ================= */
    await connection.query(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tradesperson_id INT NOT NULL,
        user_id INT NOT NULL,
        stripe_session_id VARCHAR(255) NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        plan VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        credits INT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tradesperson_id (tradesperson_id),
        INDEX idx_stripe_session (stripe_session_id)
      );
    `);
    console.log("✅ Created payments table");

    /* ================= MESSAGES ================= */
    await connection.query(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        job_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        INDEX idx_sender_id (sender_id),
        INDEX idx_receiver_id (receiver_id),
        INDEX idx_job_id (job_id)
      );
    `);
    console.log("✅ Created messages table");

    /* ================= TRADESPERSON RATINGS ================= */
    await connection.query(`
      CREATE TABLE tradesperson_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL UNIQUE,
        homeowner_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tradesperson (tradesperson_id),
        INDEX idx_homeowner (homeowner_id)
      );
    `);
    console.log("✅ Created tradesperson_ratings table");

    /* ================= REVIEWS (Optional - alternative to tradesperson_ratings) ================= */
    await connection.query(`
      CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_job_id (job_id),
        INDEX idx_tradesperson_id (tradesperson_id)
      );
    `);
    console.log("✅ Created reviews table");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(255),
  status ENUM('DRAFT', 'PUBLISHED') DEFAULT 'DRAFT',
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
    console.log("🎉 All tables created successfully!");

    // Optional: Insert some initial data
    console.log("📝 Inserting initial data...");


    // Insert an admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.query(`
      INSERT INTO users (email, password, name, role) 
      VALUES (?, ?, ?, 'ADMIN')
      ON DUPLICATE KEY UPDATE email=email
    `, ['leadsharing@gmail.com', hashedPassword, 'Admin User']);

    // Insert some categories
    await connection.query(`
      INSERT INTO categories (name, slug) VALUES
      ('Roofing', 'roofing'),
      ('Plumbing', 'plumbing'),
      ('Electrical', 'electrical'),
      ('Carpentry', 'carpentry'),
      ('Painting & Decorating', 'painting-decorating')
      ON DUPLICATE KEY UPDATE name=name
    `);

    console.log("✅ Initial data inserted");
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

//ALTER TABLE FILDS

// ALTER TABLE tradesperson_profiles
// ADD COLUMN average_rating FLOAT DEFAULT 0,
// ADD COLUMN total_ratings INT DEFAULT 0;

// ALTER TABLE jobs ADD COLUMN has_rated BOOLEAN DEFAULT FALSE AFTER hired_at;
