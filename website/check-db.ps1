# Quick Database Check Script
# Run with: .\check-db.ps1

$password = "aman1234"
$user = "aman"
$db = "lead_sharing"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 MySQL Database Status Check" -ForegroundColor Cyan
Write-Host "  Database: $db" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

try {
    # Count users
    $users = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "👥 USERS" -ForegroundColor Green
        Write-Host "   Total: $users" -ForegroundColor White
        
        $homeowners = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='HOMEOWNER';"
        $tradespeople = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='TRADESPERSON';"
        $admins = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='ADMIN';"
        
        Write-Host "   🏠 Homeowners: $homeowners" -ForegroundColor Yellow
        Write-Host "   🔧 Tradespeople: $tradespeople" -ForegroundColor Yellow
        Write-Host "   👑 Admins: $admins" -ForegroundColor Yellow
        Write-Host ""
        
        # Count jobs
        $jobs = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM jobs;"
        Write-Host "💼 JOBS" -ForegroundColor Green
        Write-Host "   Total: $jobs" -ForegroundColor White
        
        if ($jobs -gt 0) {
            $openJobs = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM jobs WHERE status='OPEN';"
            Write-Host "   📂 Open: $openJobs" -ForegroundColor Yellow
        }
        Write-Host ""
        
        # Count leads
        $leads = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM leads;"
        Write-Host "📋 LEADS" -ForegroundColor Green
        Write-Host "   Total: $leads" -ForegroundColor White
        Write-Host ""
        
        # Count categories
        $categories = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM categories;"
        Write-Host "📁 CATEGORIES" -ForegroundColor Green
        Write-Host "   Total: $categories" -ForegroundColor White
        
        $subcategories = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM sub_categories;"
        Write-Host "   Sub-categories: $subcategories" -ForegroundColor Yellow
        Write-Host ""
        
        # Show recent users
        Write-Host "Recent Users:" -ForegroundColor Cyan
        mysql -u $user -p$password $db -e "SELECT id, email, name, role, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created FROM users ORDER BY created_at DESC LIMIT 5;" -t
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  ✅ Database check complete!" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 To view in GUI, open MySQL Workbench" -ForegroundColor Yellow
        Write-Host "   Connection: localhost:3306" -ForegroundColor Gray
        Write-Host "   User: $user" -ForegroundColor Gray
        Write-Host "   Database: $db" -ForegroundColor Gray
        Write-Host ""
        
    }
    else {
        Write-Host "❌ Could not connect to MySQL database" -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Check if MySQL service is running:" -ForegroundColor White
        Write-Host "   Get-Service -Name 'MySQL*'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Start MySQL if it's stopped:" -ForegroundColor White
        Write-Host "   Start-Service -Name 'MySQL80'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Verify credentials in .env file" -ForegroundColor White
        Write-Host ""
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. MySQL is installed and running" -ForegroundColor White
    Write-Host "2. mysql command is in your PATH" -ForegroundColor White
    Write-Host "3. Database 'lead_sharing' exists" -ForegroundColor White
    Write-Host ""
}
