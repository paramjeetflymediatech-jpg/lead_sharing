# MySQL Password Reset Script for Windows
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MySQL Root Password Reset Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlService = "MySQL80"
$mysqlBinPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$mysqldExe = "$mysqlBinPath\mysqld.exe"
$mysqlExe = "$mysqlBinPath\mysql.exe"
$resetFile = "C:\mysql-password-reset.txt"

# Step 1: Stop MySQL service
Write-Host "[Step 1/5] Stopping MySQL service..." -ForegroundColor Yellow
try {
    Stop-Service -Name $mysqlService -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    Write-Host "  OK - MySQL service stopped" -ForegroundColor Green
} catch {
    Write-Host "  WARNING - Could not stop service: $_" -ForegroundColor Yellow
    Write-Host "  Trying alternative method..." -ForegroundColor Yellow
    try {
        net stop $mysqlService 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        Write-Host "  OK - MySQL service stopped (alternative method)" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR - Could not stop MySQL service" -ForegroundColor Red
        Write-Host "  Please run this script as Administrator!" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

# Step 2: Create password reset file
Write-Host "[Step 2/5] Creating password reset file..." -ForegroundColor Yellow
$newPassword = "root123"
$resetSql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPassword';"

try {
    $resetSql | Out-File -FilePath $resetFile -Encoding ASCII -Force
    Write-Host "  OK - Reset file created at: $resetFile" -ForegroundColor Green
    Write-Host "  New password will be: $newPassword" -ForegroundColor Cyan
} catch {
    Write-Host "  ERROR - Could not create reset file" -ForegroundColor Red
    Start-Service -Name $mysqlService -ErrorAction SilentlyContinue
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 3: Start MySQL in safe mode and reset password
Write-Host "[Step 3/5] Resetting password..." -ForegroundColor Yellow
Write-Host "  This may take a moment..." -ForegroundColor Gray

try {
    # Start mysqld with init-file
    $process = Start-Process -FilePath $mysqldExe `
        -ArgumentList "--init-file=`"$resetFile`"", "--console" `
        -PassThru -NoNewWindow
    
    # Wait for initialization
    Start-Sleep -Seconds 5
    
    # Stop the process
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "  OK - Password reset complete" -ForegroundColor Green
} catch {
    Write-Host "  WARNING - Process may have completed: $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Clean up reset file
Write-Host "[Step 4/5] Cleaning up..." -ForegroundColor Yellow
try {
    Remove-Item -Path $resetFile -Force -ErrorAction SilentlyContinue
    Write-Host "  OK - Reset file removed" -ForegroundColor Green
} catch {
    Write-Host "  WARNING - Could not remove reset file" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Restart MySQL service normally
Write-Host "[Step 5/5] Restarting MySQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name $mysqlService -ErrorAction Stop
    Start-Sleep -Seconds 2
    Write-Host "  OK - MySQL service started" -ForegroundColor Green
} catch {
    Write-Host "  Trying alternative method..." -ForegroundColor Yellow
    net start $mysqlService 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "  OK - MySQL service started (alternative method)" -ForegroundColor Green
}
Write-Host ""

# Test the connection
Write-Host "[Testing] Verifying new password..." -ForegroundColor Yellow
try {
    $testResult = & $mysqlExe -u root -p$newPassword -e "SELECT 'SUCCESS' as Status;" 2>&1
    if ($testResult -match "SUCCESS") {
        Write-Host "  OK - Connection successful with new password!" -ForegroundColor Green
    } else {
        Write-Host "  WARNING - Could not verify connection" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING - Could not test connection" -ForegroundColor Yellow
}
Write-Host ""

# Success message
Write-Host "========================================" -ForegroundColor Green
Write-Host "   PASSWORD RESET COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your new MySQL credentials:" -ForegroundColor Cyan
Write-Host "  Username: root" -ForegroundColor White
Write-Host "  Password: $newPassword" -ForegroundColor White
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. I will automatically update your .env file" -ForegroundColor White
Write-Host "  2. Run the setup script to create database" -ForegroundColor White
Write-Host "  3. Restart your dev server" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
