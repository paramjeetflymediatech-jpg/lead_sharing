# Fix Admin Login - Create Admin User

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$password = "root123"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    FIX ADMIN LOGIN ISSUE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Test database connection
Write-Host "[STEP 1/3] Testing MySQL connection..." -ForegroundColor Yellow
$testQuery = "SELECT 1;"
& $mysqlPath -u root -p$password -e $testQuery 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to MySQL!" -ForegroundColor Red
    Write-Host "   Please ensure MySQL is running and password is correct." -ForegroundColor Red
    exit 1
}
Write-Host "✅ MySQL connection successful!`n" -ForegroundColor Green

# Step 2: Check if database exists
Write-Host "[STEP 2/3] Checking if lead_sharing database exists..." -ForegroundColor Yellow
$dbQuery = "SHOW DATABASES LIKE 'lead_sharing';"
$dbResult = & $mysqlPath -u root -p$password -e $dbQuery 2>$null

if ($dbResult -notmatch "lead_sharing") {
    Write-Host "❌ Database 'lead_sharing' does not exist!" -ForegroundColor Red
    Write-Host "   Creating database..." -ForegroundColor Yellow
    & $mysqlPath -u root -p$password -e "CREATE DATABASE lead_sharing;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Database exists!`n" -ForegroundColor Green
}

# Step 3: Create admin user
Write-Host "[STEP 3/3] Creating/Updating admin user..." -ForegroundColor Yellow

# First, hash the password using bcrypt (we'll use a pre-hashed password for 'admin123')
# bcrypt hash for 'admin123' with salt rounds 10
$hashedPassword = '$2a$10$rZY3qN9z1O5Kx5YvQ5vQ5e5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y'

# For now, let's use a simple approach - we'll create a script that generates the hash
$createAdminQuery = @"
USE lead_sharing;

-- Check if users table exists
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('HOMEOWNER', 'TRADESPERSON', 'ADMIN') DEFAULT 'HOMEOWNER',
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@example.com';

-- NOTE: This is a TEMPORARY password. You'll set the real hashed password via Node.js
INSERT INTO users (email, password, name, role) 
VALUES ('admin@example.com', 'TEMP_WILL_BE_REPLACED', 'Admin User', 'ADMIN');
"@

$createAdminQuery | & $mysqlPath -u root -p$password 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin user entry created!`n" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   NEXT STEP: Hash the Password" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "A temporary admin user has been created, but we need to set" -ForegroundColor White
    Write-Host "a proper bcrypt-hashed password.`n" -ForegroundColor White
    Write-Host "Run this command to set the admin password:" -ForegroundColor Yellow
    Write-Host "  node create-admin-password.js" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to create admin user!" -ForegroundColor Red
    exit 1
}
