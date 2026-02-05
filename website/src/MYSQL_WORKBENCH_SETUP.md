# ≡ƒöº MySQL Workbench Setup - Step by Step Guide

## ≡ƒôï **Problem:** MySQL Workbench installed but not showing data

## Γ£à **Solution:** Follow these exact steps

---

## **STEP 1: Check if MySQL is Running**

### Option A: Check MySQL Service
```powershell
# Open PowerShell and run:
Get-Service -Name "MySQL*"
```

**Should show:**
```
Status   Name               DisplayName
------   ----               -----------
Running  MySQL80            MySQL80
```

**If it says "Stopped", start it:**
```powershell
Start-Service -Name "MySQL80"
```

### Option B: Check from Task Manager
1. Press `Ctrl + Shift + Esc` (open Task Manager)
2. Go to "Services" tab
3. Look for "MySQL80" or "MySQL"
4. Status should be "Running"
5. If stopped, right-click ΓåÆ Start

---

## **STEP 2: Open MySQL Workbench**

1. Open MySQL Workbench application
2. You should see the main screen

---

## **STEP 3: Create New Connection**

### **Click the "+" button** (next to "MySQL Connections")

### **Fill in EXACTLY like this:**

```
Connection Name:    Lead Sharing Database
Connection Method:  Standard (TCP/IP)
Hostname:          localhost
Port:              3306
Username:          aman
```

### **For Password:**
1. Click **"Store in Vault..."** button (or "Store in Keychain" on Mac)
2. Enter password: `aman1234`
3. Click **OK**

### **Click "Test Connection"**

**If Successful:** You'll see "Successfully made the MySQL connection"
- Click **OK**
- Then click **OK** again to save

**If Failed:** See troubleshooting section below

---

## **STEP 4: Connect to Database**

1. **Double-click** on your new connection ("Lead Sharing Database")
2. Wait for it to connect (few seconds)
3. You should see the SQL editor window

---

## **STEP 5: View Your Data**

### **Method A: Using Navigator (Left Sidebar)**

1. Look at **left sidebar** (Navigator panel)
2. Under "Schemas", you should see databases
3. **Click on the arrow** next to `lead_sharing` to expand it
4. Click arrow next to **"Tables"** to see all tables:
   - categories
   - jobs
   - leads
   - seo_pages
   - sub_categories
   - tradesperson_profiles
   - users

5. **To view data in a table:**
   - Right-click on `users` table
   - Select **"Select Rows - Limit 1000"**
   - Data appears in the main window!

### **Method B: Using SQL Query**

In the SQL editor (main window), type:

```sql
USE lead_sharing;

-- View all users
SELECT * FROM users;
```

Then click the **lightning bolt ΓÜí icon** (Execute) or press `Ctrl + Enter`

---

## **STEP 6: Browse All Tables**

Run these queries to see all your data:

```sql
-- Use the database
USE lead_sharing;

-- View all users
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- View tradesperson profiles
SELECT * FROM tradesperson_profiles;

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;
```

---

## ≡ƒö┤ **TROUBLESHOOTING**

### **Issue 1: "Access denied for user 'aman'@'localhost'"**

**Solution:** Reset user permissions

1. Open Command Prompt as Administrator
2. Login as root:
```bash
mysql -u root -p
```
3. Enter root password (if you have one)
4. Run these commands:
```sql
CREATE USER IF NOT EXISTS 'aman'@'localhost' IDENTIFIED BY 'aman1234';
GRANT ALL PRIVILEGES ON lead_sharing.* TO 'aman'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### **Issue 2: "Can't connect to MySQL server on 'localhost'"**

**Solution:** MySQL service is not running

**Fix:**
```powershell
# PowerShell (Run as Administrator)
Start-Service -Name "MySQL80"

# Or restart it
Restart-Service -Name "MySQL80"
```

**Or manually:**
1. Press `Win + R`
2. Type: `services.msc`
3. Find "MySQL80" in the list
4. Right-click ΓåÆ Start (or Restart)

---

### **Issue 3: "Database 'lead_sharing' not found"**

**Solution:** Database doesn't exist yet

**Fix:** Create the database and tables

```bash
# In terminal:
mysql -u aman -paman1234

# Then run:
CREATE DATABASE IF NOT EXISTS lead_sharing;
USE lead_sharing;
SOURCE schema.sql;
```

**Or from Workbench:**
1. File ΓåÆ Run SQL Script
2. Select `schema.sql` from your project
3. Execute

---

### **Issue 4: "Navigator panel is empty / No schemas showing"**

**Solution:** Refresh the schemas

1. In Navigator panel (left sidebar)
2. Click the **refresh icon** ≡ƒöä (at the top of Navigator)
3. Look for "Schemas" section
4. If still empty, try reconnecting

---

### **Issue 5: "I see the database but tables are empty"**

**Solution:** You need to run the test user creation script

```bash
node create-test-users.js
```

This creates:
- 3 test users (homeowner, tradesperson, admin)
- 1 tradesperson profile

---

## Γ£à **Quick Verification Script**

Save this and run it to check everything:

```sql
-- Run in MySQL Workbench SQL Editor

USE lead_sharing;

-- Check all tables exist
SHOW TABLES;

-- Check if data exists
SELECT 
    'users' as table_name, 
    COUNT(*) as records,
    CASE WHEN COUNT(*) > 0 THEN 'Γ£à' ELSE 'Γ¥î' END as status
FROM users
UNION ALL
SELECT 'jobs', COUNT(*), CASE WHEN COUNT(*) > 0 THEN 'Γ£à' ELSE 'Γ¥î' END FROM jobs
UNION ALL
SELECT 'leads', COUNT(*), CASE WHEN COUNT(*) > 0 THEN 'Γ£à' ELSE 'Γ¥î' END FROM leads
UNION ALL
SELECT 'categories', COUNT(*), CASE WHEN COUNT(*) > 0 THEN 'Γ£à' ELSE 'Γ¥î' END FROM categories
UNION ALL
SELECT 'tradesperson_profiles', COUNT(*), CASE WHEN COUNT(*) > 0 THEN 'Γ£à' ELSE 'Γ¥î' END FROM tradesperson_profiles;

-- View your users
SELECT id, name, email, role FROM users;
```

---

## ≡ƒô╕ **Visual Guide**

### **What You Should See:**

**1. Main Screen:**
```
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé  MySQL Connections                  Γöé
Γöé  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ    Γöé
Γöé  Γöé Lead Sharing Database      Γöé ΓåÉΓöÇΓöÇ Your connection
Γöé  Γöé localhost:3306             Γöé    Γöé
Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ    Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

**2. After Connecting - Left Sidebar:**
```
Navigator
Γö£ΓöÇ ≡ƒôè Schemas
Γöé  ΓööΓöÇ ≡ƒùä∩╕Å lead_sharing  ΓåÉΓöÇΓöÇ Your database
Γöé     Γö£ΓöÇ ≡ƒôï Tables
Γöé     Γöé  Γö£ΓöÇ users  ΓåÉΓöÇΓöÇ Click here!
Γöé     Γöé  Γö£ΓöÇ jobs
Γöé     Γöé  Γö£ΓöÇ leads
Γöé     Γöé  ΓööΓöÇ ...
Γöé     ΓööΓöÇ ≡ƒæü∩╕Å Views
```

**3. Right-click on 'users' table:**
```
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé Select Rows - Limit 1000     Γöé ΓåÉΓöÇΓöÇ Click this!
Γöé Select Rows (Custom)         Γöé
Γöé ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ      Γöé
Γöé Create Table...              Γöé
Γöé Alter Table...               Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

---

## ≡ƒÄ» **Expected Result:**

You should see a table with your data:

| id | name | email | role | created_at |
|----|------|-------|------|------------|
| 1 | Test Homeowner | homeowner@test.com | HOMEOWNER | 2026-02-02 |
| 2 | Test Tradesperson | tradesperson@test.com | TRADESPERSON | 2026-02-02 |
| 3 | Admin User | admin@test.com | ADMIN | 2026-02-02 |

---

## ≡ƒÆí **Pro Tips:**

1. **Refresh Schema:** Click ≡ƒöä icon in Navigator if you don't see `lead_sharing`
2. **Expand All:** Double-click `lead_sharing` to expand
3. **Keep Connection Open:** Don't close the SQL editor window
4. **Auto-Refresh:** Go to Edit ΓåÆ Preferences ΓåÆ SQL Editor ΓåÆ Check "Auto-refresh"

---

## ≡ƒåÿ **Still Not Working?**

Run this diagnostic command and send me the output:

```bash
mysql -u aman -paman1234 -e "SHOW DATABASES; USE lead_sharing; SHOW TABLES; SELECT COUNT(*) FROM users;"
```

---

## ≡ƒÄë **Success Checklist:**

- [ ] MySQL service is running
- [ ] MySQL Workbench connection created
- [ ] Connection test successful
- [ ] `lead_sharing` database visible in Navigator
- [ ] Can expand Tables folder
- [ ] Can see `users` table
- [ ] Can view data in users table (3 rows)

**All checked?** You're all set! ≡ƒÜÇ
