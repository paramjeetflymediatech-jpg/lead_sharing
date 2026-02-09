const dotenv = require("dotenv");
dotenv.config();

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "lead_sharing",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    multipleStatements: true,
  });

  console.log("✅ Connected to MySQL");

  try {
    console.log("🧹 Dropping existing tables...");
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);

    const tables = [
      'blogs',
      'reviews',
      'tradesperson_ratings',
      'messages',
      'payments',
      'leads',
      'jobs',
      'tradesperson_profiles',
      'sub_categories',
      'categories',
      'seo_pages',
      'users'
    ];

    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }

    await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);

    /* ================= USERS ================= */
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('HOMEOWNER','TRADESPERSON','ADMIN') DEFAULT 'HOMEOWNER',
        password_reset_token VARCHAR(255),
        password_reset_expires DATETIME,
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        postcode VARCHAR(20),
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ users");

    /* ================= SEO PAGES ================= */
    await connection.query(`
      CREATE TABLE seo_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        meta_description TEXT,
        keywords TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ seo_pages");

    /* ================= CATEGORIES ================= */
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

    /* ================= SUB CATEGORIES ================= */
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

    /* ================= TRADESPERSON PROFILES ================= */
    await connection.query(`
      CREATE TABLE tradesperson_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        bio TEXT,
        phone VARCHAR(50),
        postcode VARCHAR(20),
        skills TEXT,
        service_areas TEXT,
        credits INT DEFAULT 5,
        average_rating FLOAT DEFAULT 0,
        total_ratings INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ tradesperson_profiles");

    /* ================= JOBS ================= */
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
        start_time ENUM(
          'URGENT',
          'WITHIN_2_DAYS',
          'WITHIN_2_WEEKS',
          'WITHIN_2_MONTHS',
          'FLEXIBLE'
        ) NOT NULL,
        job_stage ENUM(
          'READY_TO_HIRE',
          'PLANNING',
          'INSURANCE'
        ) NOT NULL,
        ownership ENUM(
          'OWNER',
          'LANDLORD',
          'AUTHORIZED',
          'BUYING'
        ) NOT NULL,
        budget_min INT,
        budget_max INT,
        media TEXT,
        status ENUM('OPEN','HIRED','COMPLETED','CANCELLED') DEFAULT 'OPEN',
        hired_tradesperson_id INT,
        hired_at DATETIME,
        has_rated TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
        FOREIGN KEY (homeowner_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id),
        FOREIGN KEY (hired_tradesperson_id) REFERENCES users(id)
      );
    `);
    console.log("✅ jobs");

    /* ================= LEADS ================= */
    await connection.query(`
      CREATE TABLE leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        tradesperson_id INT NOT NULL,
        message TEXT NOT NULL,
        price_estimate DECIMAL(10,2),
        is_unlocked TINYINT(1) DEFAULT 0,
        status ENUM('PENDING','HIRED','REJECTED') DEFAULT 'PENDING',
        unlocked_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ leads");

    /* ================= PAYMENTS ================= */
    await connection.query(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tradesperson_id INT NOT NULL,
        user_id INT NOT NULL,
        stripe_session_id VARCHAR(255) NOT NULL,
        stripe_payment_intent_id VARCHAR(255),
        plan VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        credits INT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tradesperson_id) REFERENCES users(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log("✅ payments");

    /* ================= TRADESPERSON RATINGS ================= */
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

    /* ================= BLOGS ================= */
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

    /* ================= SEED DATA ================= */
    console.log("🌱 Inserting seed data...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await connection.query(
      `INSERT INTO users (email, password, name, role)
       VALUES (?, ?, ?, 'ADMIN')`,
      ["leadsharing@gmail.com", hashedPassword, "Admin User"]
    );

    await connection.query(`
      INSERT INTO categories (name, slug) VALUES
      ('Roofing', 'roofing'),
      ('Plumbing', 'plumbing'),
      ('Electrical', 'electrical'),
      ('Carpentry', 'carpentry'),
      ('Painting & Decorating', 'painting-decorating')
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

