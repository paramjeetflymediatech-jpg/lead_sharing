# PowerShell Script to Create MySQL Tables
Write-Host "Creating MySQL Database Tables..." -ForegroundColor Cyan
Write-Host ""

# MySQL Configuration (change these if needed)
$mysqlUser = "root"
$mysqlPassword = ""  # Add your password here if you have one
$mysqlDatabase = "lead_sharing"
$schemaFile = "schema.sql"

# Check if schema.sql exists
if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: schema.sql file not found!" -ForegroundColor Red
    exit 1
}

# Build MySQL command
if ($mysqlPassword -eq "") {
    $cmd = "mysql -u $mysqlUser $mysqlDatabase"
} else {
    $cmd = "mysql -u $mysqlUser -p$mysqlPassword $mysqlDatabase"
}

# Execute SQL file
try {
    Get-Content $schemaFile | & mysql -u $mysqlUser $mysqlDatabase
    Write-Host ""
    Write-Host "SUCCESS! All tables created successfully." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: npm run dev" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "ERROR! Failed to create tables." -ForegroundColor Red
    Write-Host "Please check your MySQL credentials and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
