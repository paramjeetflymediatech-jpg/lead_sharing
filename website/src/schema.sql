-- =====================================================
--  Lead Sharing Platform - Complete Database Schema
--  Single source of truth. Run create_ratings_table.js
--  to rebuild from scratch.
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('HOMEOWNER', 'TRADESPERSON', 'ADMIN') DEFAULT 'HOMEOWNER',
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
  is_deletion_pending BOOLEAN DEFAULT FALSE,
  deletion_requested_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pending_users (
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

CREATE TABLE IF NOT EXISTS deletion_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  reason TEXT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  admin_notes TEXT,
  processed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to store hashed identifiers of deleted users for fraud prevention
CREATE TABLE IF NOT EXISTS retained_identifiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS push_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(50) DEFAULT 'mobile',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_tokens (
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

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tradesperson_profiles (
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
  verification_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') DEFAULT 'NOT_STARTED',
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

CREATE TABLE IF NOT EXISTS jobs (
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
  start_time ENUM('URGENT', 'WITHIN_2_DAYS', 'WITHIN_2_WEEKS', 'WITHIN_2_MONTHS', 'FLEXIBLE') NOT NULL,
  job_stage ENUM('READY_TO_HIRE', 'PLANNING', 'INSURANCE') NOT NULL,
  ownership ENUM('OWNER', 'LANDLORD', 'AUTHORIZED', 'BUYING') NOT NULL,
  budget_min BIGINT,
  budget_max BIGINT,
  media TEXT,
  status ENUM('OPEN', 'HIRED', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
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

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  tradesperson_id INT NOT NULL,
  message TEXT NOT NULL,
  price_estimate DECIMAL(10, 2),
  is_unlocked TINYINT(1) DEFAULT 0,
  status ENUM('PENDING', 'HIRED', 'REJECTED') DEFAULT 'PENDING',
  unlocked_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (tradesperson_id) REFERENCES tradesperson_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_plans (
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

CREATE TABLE IF NOT EXISTS payments (
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

CREATE TABLE IF NOT EXISTS tradesperson_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL UNIQUE,
  homeowner_id INT NOT NULL,
  tradesperson_id INT NOT NULL,
  rating INT NOT NULL,
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tradesperson_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
--  Automated Cleanup Event
--  Runs every 1 hour to delete users with expired 
--  deletion requests (older than 24 hours).
-- =====================================================
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_expired_deletions
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM users 
  WHERE is_deletion_pending = TRUE 
  AND deletion_requested_at <= NOW() - INTERVAL 24 HOUR;


CREATE TABLE IF NOT EXISTS seo_pages (
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

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  conversation_status ENUM('PENDING_HOMEOWNER_ACCEPTANCE', 'PENDING_TRADESPERSON_ACCEPTANCE', 'ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
  conversation_accepted_by_homeowner BOOLEAN DEFAULT FALSE,
  conversation_accepted_by_tradesperson BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSON,
  type VARCHAR(50),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
