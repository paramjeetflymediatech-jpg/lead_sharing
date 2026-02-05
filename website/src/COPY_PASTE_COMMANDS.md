# COPY-PASTE COMMAND READY SOLUTION

## If You Want Password "root123" (Recommended - Easiest)

### Run these commands ONE BY ONE in ADMIN PowerShell:

# Step 1: Stop MySQL
net stop MySQL80

# Step 2: Create reset file (copy ALL 3 lines together)
@"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
"@ | Out-File -FilePath C:\mysql-reset.txt -Encoding ASCII

# Step 3: Reset password with this file
Start-Job -ScriptBlock { & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file="C:\mysql-reset.txt" --console }
Start-Sleep -Seconds 10
Get-Job | Stop-Job -PassThru | Remove-Job
Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 4: Start MySQL normally
net start MySQL80

# Step 5: Create database and tables (copy ALL lines together)
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
& $mysql -u root -proot123 -e "CREATE DATABASE IF NOT EXISTS lead_sharing;"
Get-Content schema.sql | & $mysql -u root -proot123 lead_sharing

# Step 6: Verify tables exist
& $mysql -u root -proot123 lead_sharing -e "SHOW TABLES;"

Write-Host "SUCCESS! Now update your .env file..." -ForegroundColor Green

---

## After Running Above Commands:

1. **Update `.env` file** - Change line 4 to:
   ```
   MYSQL_PASSWORD=root123
   ```

2. **Restart dev server:**
   - Go to terminal with `npm run dev`
   - Press Ctrl+C
   - Run: `npm run dev`

3. **Γ£à DONE! Error should be gone**

---

## Verify It Worked

Should see these tables:
- categories
- jobs
- leads
- seo_pages
- sub_categories
- tradesperson_profiles
- users
