# ≡ƒöì How to Check Your MySQL Database Locally

## ≡ƒôè **Your Database Credentials**

From your `.env` file:
```
MYSQL_HOST=localhost
MYSQL_USER=aman
MYSQL_PASSWORD=aman1234
MYSQL_DATABASE=lead_sharing
```

---

## ≡ƒûÑ∩╕Å **Method 1: Command Line (MySQL CLI)**

### **Option A: Direct MySQL Command**

```bash
mysql -u aman -paman1234 lead_sharing
```

**Common Commands:**
```sql
-- Show all tables
SHOW TABLES;

-- View table structure
DESCRIBE users;
DESCRIBE jobs;
DESCRIBE leads;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;
SELECT COUNT(*) FROM leads;

-- View all users
SELECT * FROM users;

-- View specific user by email
SELECT * FROM users WHERE email = 'homeowner@test.com';

-- View all jobs
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;

-- View leads
SELECT * FROM leads;

-- Check database size
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'lead_sharing'
ORDER BY (data_length + index_length) DESC;

-- Exit
EXIT;
```

---

### **Option B: Quick PowerShell Script**

I'll create a script for you to run instantly:

```powershell
# Save as check-database.ps1
$env:MYSQL_PWD="aman1234"
mysql -u aman lead_sharing -e "SHOW TABLES;"
```

---

## ≡ƒÄ¿ **Method 2: GUI Tools (Recommended)**

### **Option A: MySQL Workbench** Γ¡É (Most Popular)

**Download:** https://dev.mysql.com/downloads/workbench/

**Setup:**
1. Open MySQL Workbench
2. Click "+" to create new connection
3. Enter:
   - Connection Name: `Lead Sharing Local`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `aman`
   - Password: `aman1234` (Store in vault)
4. Click "Test Connection"
5. Click "OK"

**Features:**
- Γ£à Visual table browser
- Γ£à Query editor with autocomplete
- Γ£à ER diagrams
- Γ£à Data export/import
- Γ£à Performance monitoring

---

### **Option B: HeidiSQL** (Lightweight)

**Download:** https://www.heidisql.com/download.php

**Setup:**
1. Open HeidiSQL
2. Click "New" session
3. Enter:
   - Network type: `MySQL (TCP/IP)`
   - Hostname: `localhost`
   - User: `aman`
   - Password: `aman1234`
   - Port: `3306`
4. Click "Open"
5. Select `lead_sharing` database

**Features:**
- Γ£à Very lightweight
- Γ£à Fast and simple
- Γ£à Good for quick queries
- Γ£à Export to CSV, SQL, etc.

---

### **Option C: phpMyAdmin** (Web-based)

**If using XAMPP/WAMP:**
1. Open browser: `http://localhost/phpmyadmin`
2. Login with credentials:
   - Username: `aman`
   - Password: `aman1234`
3. Click on `lead_sharing` database

**Features:**
- Γ£à Web-based (no install)
- Γ£à Familiar interface
- Γ£à Import/Export
- Γ£à Easy database management

---

### **Option D: DBeaver** (All-in-One)

**Download:** https://dbeaver.io/download/

**Setup:**
1. Download Community Edition
2. Create new MySQL connection
3. Enter your credentials
4. Browse database

**Features:**
- Γ£à Supports many databases
- Γ£à Free and open source
- Γ£à Advanced features
- Γ£à ER diagrams

---

## ≡ƒÜÇ **Method 3: Quick Check Scripts**

### **PowerShell Script** (Windows)

```powershell
# check-db.ps1
$password = "aman1234"
$user = "aman"
$db = "lead_sharing"

Write-Host "≡ƒôè Checking MySQL Database: $db" -ForegroundColor Cyan
Write-Host ""

# Count users
$users = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users;"
Write-Host "≡ƒæÑ Total Users: $users" -ForegroundColor Green

# Count by role
$homeowners = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='HOMEOWNER';"
$tradespeople = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='TRADESPERSON';"
$admins = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM users WHERE role='ADMIN';"

Write-Host "  ≡ƒÅá Homeowners: $homeowners" -ForegroundColor Yellow
Write-Host "  ≡ƒöº Tradespeople: $tradespeople" -ForegroundColor Yellow
Write-Host "  ≡ƒææ Admins: $admins" -ForegroundColor Yellow
Write-Host ""

# Count jobs
$jobs = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM jobs;"
Write-Host "≡ƒÆ╝ Total Jobs: $jobs" -ForegroundColor Green

# Count leads
$leads = mysql -u $user -p$password $db -se "SELECT COUNT(*) FROM leads;"
Write-Host "≡ƒôï Total Leads: $leads" -ForegroundColor Green

Write-Host ""
Write-Host "Γ£à Database check complete!" -ForegroundColor Cyan
```

**Save and run:**
```powershell
# Save the above as check-db.ps1
# Then run:
.\check-db.ps1
```

---

## ≡ƒô¥ **Common Queries to Run**

### **View Test Users:**
```sql
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

### **View Jobs:**
```sql
SELECT 
    j.id,
    j.description,
    j.status,
    j.budget_min,
    j.budget_max,
    j.created_at,
    u.name as homeowner_name
FROM jobs j
LEFT JOIN users u ON j.homeowner_id = u.id
ORDER BY j.created_at DESC
LIMIT 10;
```

### **View Leads:**
```sql
SELECT 
    l.id,
    l.message,
    l.price_estimate,
    l.is_unlocked,
    l.created_at
FROM leads l
ORDER BY l.created_at DESC;
```

### **View Categories:**
```sql
SELECT * FROM categories ORDER BY name;
```

### **View Subcategories with Categories:**
```sql
SELECT 
    sc.id,
    sc.name as subcategory_name,
    c.name as category_name
FROM sub_categories sc
LEFT JOIN categories c ON sc.category_id = c.id
ORDER BY c.name, sc.name;
```

---

## ≡ƒöº **Troubleshooting**

### **Can't Connect to MySQL?**

**Check if MySQL is running:**
```powershell
# Check MySQL service status
Get-Service -Name "MySQL*"

# Start MySQL if it's stopped
Start-Service -Name "MySQL80"  # Or your MySQL version
```

**Check if port 3306 is open:**
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

**Restart MySQL:**
```powershell
Restart-Service -Name "MySQL80"
```

---

### **Access Denied Error?**

**Create/Reset user:**
```sql
-- Login as root first
mysql -u root -p

-- Then run:
CREATE USER 'aman'@'localhost' IDENTIFIED BY 'aman1234';
GRANT ALL PRIVILEGES ON lead_sharing.* TO 'aman'@'localhost';
FLUSH PRIVILEGES;
```

---

## ΓÜí **Quick Start (Easiest)**

### **1. Install MySQL Workbench**
Download: https://dev.mysql.com/downloads/workbench/

### **2. Create Connection**
- Host: `localhost`
- User: `aman`
- Password: `aman1234`

### **3. Open `lead_sharing` Database**
- Browse tables visually
- Run queries in the editor
- View data in tables

---

## ≡ƒôè **Your Current Database Status**

Based on your setup, you should have these tables:

Γ£à **users** - 3 test accounts created
Γ£à **categories** - Empty (needs seeding)
Γ£à **sub_categories** - Empty (needs seeding)
Γ£à **jobs** - Empty
Γ£à **leads** - Empty
Γ£à **tradesperson_profiles** - 1 profile (tradesperson@test.com)
Γ£à **seo_pages** - Empty

---

## ≡ƒÄ» **Recommended Setup**

**For daily use:**
1. **MySQL Workbench** - Best for development and management
2. **HeidiSQL** - Great for quick queries
3. **Command Line** - Fast checks

**My recommendation:** Start with **MySQL Workbench** - it's the most user-friendly and powerful.

---

**Need help?** Run the PowerShell script above for a quick health check! ≡ƒÜÇ
