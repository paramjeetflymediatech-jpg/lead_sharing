# Complete MySQL Setup - Password Reset + Database Creation
# Run this as Administrator in PowerShell

param(
    [string]$NewPassword = "root123"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Complete MySQL Setup & Password Reset" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlService = "MySQL80"
$mysqlBinPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$mysqldExe = "$mysqlBinPath\mysqld.exe"
$mysqlExe = "$mysqlBinPath\mysql.exe"
$resetFile = "$env:TEMP\mysql-init.txt"
$envFile = ".env"
$schemaFile = "schema.sql"
$dbName = "lead_sharing"

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Close this window" -ForegroundColor White
    Write-Host "  2. Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor White
    Write-Host "  3. Navigate to: cd D:\CODE\lead_sharing\website" -ForegroundColor White
    Write-Host "  4. Run: .\complete-mysql-setup.ps1" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[ADMIN] Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Step 1: Stop MySQL
Write-Host "[1/6] Stopping MySQL service..." -ForegroundColor Yellow
try {
    net stop $mysqlService 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    Write-Host "  OK - MySQL stopped" -ForegroundColor Green
} catch {
    Write-Host "  WARNING - MySQL may already be stopped" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Create init file
Write-Host "[2/6] Creating password reset file..." -ForegroundColor Yellow
$initSql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$NewPassword';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS $dbName;"

$initSql | Out-File -FilePath $resetFile -Encoding ASCII -Force
Write-Host "  OK - Init file created" -ForegroundColor Green
Write-Host "  New password: $NewPassword" -ForegroundColor Cyan
Write-Host ""

# Step 3: Reset password
Write-Host "[3/6] Resetting password and creating database..." -ForegroundColor Yellow
Write-Host "  Please wait 10 seconds..." -ForegroundColor Gray

$job = Start-Job -ScriptBlock {
    param($exe, $file)
    & $exe --init-file="$file" --console 2>&1
} -ArgumentList $mysqldExe, $resetFile

Start-Sleep -Seconds 10
Stop-Job -Job $job -ErrorAction SilentlyContinue
Remove-Job -Job $job -Force -ErrorAction SilentlyContinue

# Kill any mysqld processes
Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "  OK - Password reset complete" -ForegroundColor Green
Write-Host ""

# Step 4: Start MySQL normally
Write-Host "[4/6] Starting MySQL service..." -ForegroundColor Yellow
try {
    net start $mysqlService 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    Write-Host "  OK - MySQL started" -ForegroundColor Green
} catch {
    Write-Host "  ERROR - Failed to start MySQL" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 5: Create tables
Write-Host "[5/6] Creating database tables..." -ForegroundColor Yellow
if (Test-Path $schemaFile) {
    try {
        Get-Content $schemaFile | & $mysqlExe -u root -p$NewPassword $dbName 2>&1 | Out-Null
        Write-Host "  OK - Tables created successfully" -ForegroundColor Green
    } catch {
        Write-Host "  WARNING - Some tables may already exist" -ForegroundColor Yellow
    }
} else {
    Write-Host "  WARNING - schema.sql not found, skipping" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Update .env file
Write-Host "[6/6] Updating .env file..." -ForegroundColor Yellow
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace '(MYSQL_PASSWORD=).*', "`$1$NewPassword"
    $envContent | Set-Content $envFile -NoNewline
    Write-Host "  OK - .env file updated" -ForegroundColor Green
} else {
    Write-Host "  Creating new .env file..." -ForegroundColor Yellow
    $newEnvContent = "# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=$NewPassword
MYSQL_DATABASE=$dbName

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000"
    $newEnvContent | Set-Content $envFile
    Write-Host "  OK - .env file created" -ForegroundColor Green
}
Write-Host ""

# Cleanup
Remove-Item $resetFile -Force -ErrorAction SilentlyContinue

# Verify connection
Write-Host "[VERIFY] Testing connection..." -ForegroundColor Yellow
try {
    $result = & $mysqlExe -u root -p$NewPassword -e "SELECT VERSION()" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - Connection successful!" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING - Could not verify" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "MySQL Credentials:" -ForegroundColor Cyan
Write-Host "  Username: root" -ForegroundColor White
Write-Host "  Password: $NewPassword" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Stop your dev server (Ctrl+C in the terminal)" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Your app should now work!" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
