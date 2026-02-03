# Check if admin user exists in the database

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$password = "root123"

Write-Host "Checking for admin users in the database..." -ForegroundColor Cyan

& $mysqlPath -u root -p$password -e "USE lead_sharing; SELECT id, email, name, role FROM users WHERE role='ADMIN';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nIf no results shown above, no admin user exists!" -ForegroundColor Yellow
    Write-Host "You need to create an admin user to login." -ForegroundColor Yellow
} else {
    Write-Host "Failed to query database. Check MySQL connection." -ForegroundColor Red
}
