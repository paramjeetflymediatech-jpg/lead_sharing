# Simple Database Setup Script (No Admin Required)
# This script will guide you through setting up the database

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MySQL Database Setup Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schemaFile = "schema.sql"
$dbName = "lead_sharing"

# Check if MySQL exists
if (-not (Test-Path $mysqlExe)) {
    Write-Host "[ERROR] MySQL not found at: $mysqlExe" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "This script will help you set up the database." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your MySQL root password:" -ForegroundColor Cyan
Write-Host "(If you don't know it, press Ctrl+C and see instructions below)" -ForegroundColor Gray
Write-Host ""

$password = Read-Host -AsSecureString "MySQL root password"
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "[Step 1/3] Testing connection..." -ForegroundColor Yellow

# Test connection
try {
    $testResult = & $mysqlExe -u root -p$passwordPlain -e "SELECT 1" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR - Could not connect to MySQL" -ForegroundColor Red
        Write-Host "  The password may be incorrect" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "  OK - Connected successfully!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR - Connection failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Create database
Write-Host "[Step 2/3] Creating database '$dbName'..." -ForegroundColor Yellow
try {
    & $mysqlExe -u root -p$passwordPlain -e "CREATE DATABASE IF NOT EXISTS $dbName;" 2>&1 | Out-Null
    Write-Host "  OK - Database created" -ForegroundColor Green
} catch {
    Write-Host "  WARNING - Database may already exist" -ForegroundColor Yellow
}
Write-Host ""

# Create tables
Write-Host "[Step 3/3] Creating tables..." -ForegroundColor Yellow
if (Test-Path $schemaFile) {
    try {
        Get-Content $schemaFile | & $mysqlExe -u root -p$passwordPlain $dbName 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK - All tables created!" -ForegroundColor Green
        } else {
            Write-Host "  WARNING - Some tables may already exist" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  WARNING - Error creating tables" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERROR - schema.sql not found!" -ForegroundColor Red
}
Write-Host ""

# List tables
Write-Host "[Verification] Checking tables..." -ForegroundColor Yellow
try {
    $tables = & $mysqlExe -u root -p$passwordPlain $dbName -e "SHOW TABLES;" 2>&1
    Write-Host ""
    Write-Host "Tables in database:" -ForegroundColor Cyan
    Write-Host $tables
} catch {
    Write-Host "  Could not list tables" -ForegroundColor Yellow
}
Write-Host ""

# Update .env
Write-Host "[Final Step] Updating .env file..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace '(MYSQL_PASSWORD=).*', "`$1$passwordPlain"
    $envContent | Set-Content $envFile -NoNewline
    Write-Host "  OK - .env file updated with your password" -ForegroundColor Green
} else {
    $newEnv = "# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=$passwordPlain
MYSQL_DATABASE=$dbName

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000"
    $newEnv | Set-Content $envFile
    Write-Host "  OK - .env file created" -ForegroundColor Green
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Stop your dev server (Ctrl+C)" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. The error should be gone!" -ForegroundColor White
Write-Host ""
Write-Host "If you don't know your MySQL password:" -ForegroundColor Yellow
Write-Host "  You need to run the admin script to reset it:" -ForegroundColor White
Write-Host "  1. Right-click PowerShell -> 'Run as Administrator'" -ForegroundColor White
Write-Host "  2. cd D:\CODE\lead_sharing\website" -ForegroundColor White
Write-Host "  3. .\complete-mysql-setup.ps1" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
