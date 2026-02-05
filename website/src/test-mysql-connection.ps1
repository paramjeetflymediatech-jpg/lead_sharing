# Simple MySQL Connection Test Script
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

Write-Host "Testing MySQL Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: No password
Write-Host "[Test 1] Trying root with no password..." -ForegroundColor Yellow
try {
    $result = & $mysqlExe -u root -e "SELECT 'Connection successful!' as Status;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS - Connected with no password!" -ForegroundColor Green
        Write-Host "  Result: $result" -ForegroundColor White
        Write-Host ""
        Write-Host "Your .env should use:" -ForegroundColor Cyan
        Write-Host "  MYSQL_PASSWORD=" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Root requires a password" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "If the connection failed, you need to either:" -ForegroundColor Yellow
Write-Host "  1. Find your MySQL root password and update .env file" -ForegroundColor White
Write-Host "  2. Reset your MySQL root password" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
