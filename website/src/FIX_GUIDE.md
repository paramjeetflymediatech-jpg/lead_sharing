# COMPLETE FIX GUIDE - MySQL Access Denied Error

## Current Problem
- Error: `Access denied for user 'root'@'localhost' (using password: NO)`  
- Cause: `.env` file has empty password but MySQL requires one

## Γ£à SOLUTION - Choose ONE Option Below

---

### OPTION 1: If You Know Your MySQL Root Password

**Just update `.env` and create database:**

1. Open `.env` file and add your password on line 4:
   ```
   MYSQL_PASSWORD=your_actual_password
   ```

2. Run this command to create database and tables:
   ```powershell
   .\setup-database-simple.ps1
   ```
   (It will ask for password - enter the same one you put in `.env`)

3. Restart dev server:
   ```powershell
   npm run dev
   ```

---

### OPTION 2: Reset MySQL Password (Requires Admin)

**If you forgot your password, reset it to "root123":**

1. **Right-click PowerShell** ΓåÆ Select **"Run as Administrator"**

2. Navigate and run:
   ```powershell
   cd D:\CODE\lead_sharing\website
   .\complete-mysql-setup.ps1
   ```

3. This will:
   - Reset password to `root123`
   - Create database
   - Create tables  
   - Update `.env` file

4. Restart dev server:
   ```powershell
   npm run dev
   ```

---

### OPTION 3: Manual Command-Line Setup

**Do it manually step-by-step:**

1. **Set a new root password** (Run PowerShell as Admin):
   ```powershell
   net stop MySQL80
   ```

2. Create file `C:\temp-mysql.txt` with this content:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
   ```

3. Run MySQL with the reset file:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file="C:\temp-mysql.txt" --console
   ```
   Wait 10 seconds, then press `Ctrl+C`

4. Start MySQL normally:
   ```powershell
   net start MySQL80
   ```

5. **Create database and tables:**
   ```powershell
   $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
   & $mysql -u root -proot123 -e "CREATE DATABASE IF NOT EXISTS lead_sharing;"
   Get-Content schema.sql | & $mysql -u root -proot123 lead_sharing
   ```

6. **Update `.env` file** (line 4):
   ```
   MYSQL_PASSWORD=root123
   ```

7. **Restart dev server:**
   ```powershell
   npm run dev
   ```

---

## Quick Reference Commands

### Check if MySQL is running:
```powershell
Get-Service MySQL80
```

### Start MySQL:
```powershell
net start MySQL80
```

### Stop MySQL:
```powershell
net stop MySQL80
```

### Test connection (replace PASSWORD):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPASSWORD -e "SELECT VERSION();"
```

### View tables in database:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPASSWORD lead_sharing -e "SHOW TABLES;"
```

---

## After Setup Checklist

- [ ] `.env` file has `MYSQL_PASSWORD=your_password` (not empty)
- [ ] Database `lead_sharing` exists
- [ ] Tables are created (run: `SHOW TABLES;` in MySQL)
- [ ] Dev server restarted
- [ ] No more "Access denied" errors

---

## Troubleshooting

**"Access is denied" when running PowerShell script**
ΓåÆ Must run PowerShell as Administrator

**"Execution policy" error**
ΓåÆ Run: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`

**Script says "MySQL not found"**
ΓåÆ Check if MySQL is at: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

**Password still doesn't work after reset**  
ΓåÆ Make sure MySQL service restarted: `net stop MySQL80` then `net start MySQL80`

**Dev server still shows error**
ΓåÆ MUST restart dev server (Ctrl+C then `npm run dev`) after changing `.env`
