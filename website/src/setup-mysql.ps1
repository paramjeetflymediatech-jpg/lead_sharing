# PowerShell Script to Setup MySQL Database for Lead Sharing
# This script automatically detects MySQL installation and sets up the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MySQL Database Setup - Lead Sharing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to find MySQL installation
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.21\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.21\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "[FOUND] MySQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "[ERROR] Could not find MySQL installation!" -ForegroundColor Red
    Write-Host "" 
    Write-Host "Please install MySQL or XAMPP, or add MySQL to your system PATH" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Configuration
$mysqlUser = "root"
$mysqlPassword = ""
$mysqlDatabase = "lead_sharing"
$schemaFile = "schema.sql"

# Check if schema.sql exists
Write-Host "[Step 1/3] Checking schema.sql..." -ForegroundColor Yellow
if (-not (Test-Path $schemaFile)) {
    Write-Host "  ERROR: schema.sql not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  OK - Found schema.sql" -ForegroundColor Green
Write-Host ""

# Create database
Write-Host "[Step 2/3] Creating database '$mysqlDatabase'..." -ForegroundColor Yellow
try {
    $createDbQuery = "CREATE DATABASE IF NOT EXISTS $mysqlDatabase;"
    
    if ($mysqlPassword -eq "") {
        & $mysqlExe -u $mysqlUser -e $createDbQuery 2>&1 | Out-Null
    }
    else {
        & $mysqlExe -u $mysqlUser -p$mysqlPassword -e $createDbQuery 2>&1 | Out-Null
    }
    
    Write-Host "  OK - Database '$mysqlDatabase' created/verified" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to create database" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Make sure MySQL service is running" -ForegroundColor White
    Write-Host "  2. Update MYSQL_PASSWORD in .env if root has a password" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Create tables
Write-Host "[Step 3/3] Creating tables from schema.sql..." -ForegroundColor Yellow
try {
    if ($mysqlPassword -eq "") {
        Get-Content $schemaFile | & $mysqlExe -u $mysqlUser $mysqlDatabase 2>&1 | Out-Null
    }
    else {
        Get-Content $schemaFile | & $mysqlExe -u $mysqlUser -p$mysqlPassword $mysqlDatabase 2>&1 | Out-Null
    }
    
    Write-Host "  OK - All tables created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to create tables" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Verify tables
Write-Host "[Verification] Listing created tables..." -ForegroundColor Yellow
Write-Host ""
try {
    if ($mysqlPassword -eq "") {
        $tables = & $mysqlExe -u $mysqlUser $mysqlDatabase -e "SHOW TABLES;" 2>&1
    }
    else {
        $tables = & $mysqlExe -u $mysqlUser -p$mysqlPassword $mysqlDatabase -e "SHOW TABLES;" 2>&1
    }
    
    Write-Host "Tables in database '$mysqlDatabase':" -ForegroundColor Cyan
    Write-Host $tables
}
catch {
    Write-Host "  Could not list tables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS! Database Setup Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your database is ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
Write-Host "  2. Your app should now connect to MySQL successfully" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
