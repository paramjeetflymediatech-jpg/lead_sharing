# MySQL Root Password Reset Instructions

## Current Issue
Your `.env` file has an empty password, but MySQL requires authentication.

Error: `Access denied for user 'root'@'localhost' (using password: NO)`

## Quick Fix - Reset MySQL Password

### Step 1: Run the Password Reset Script

**IMPORTANT**: Run PowerShell as Administrator!

1. Right-click on PowerShell
2. Select "Run as Administrator"
3. Navigate to your project:
   ```powershell
   cd D:\CODE\lead_sharing\website
   ```
4. Run the reset script:
   ```powershell
   .\reset-mysql-password.ps1
   ```

This script will:
- Stop MySQL service
- Reset root password to: `root123`
- Restart MySQL service
- Verify the connection

### Step 2: Update .env File

After the password is reset, your `.env` will be automatically updated to:
```bash
MYSQL_PASSWORD=root123
```

### Step 3: Setup Database

Run the setup script:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-mysql.ps1
```

### Step 4: Restart Your App

1. Stop the current dev server (Ctrl+C)
2. Start it again:
   ```powershell
   npm run dev
   ```

## Alternative: Manual Password Reset

If the script doesn't work, follow these manual steps:

1. **Stop MySQL:**
   ```powershell
   net stop MySQL80
   ```

2. **Create reset file** `C:\mysql-reset.txt`:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
   ```

3. **Reset password:**
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file="C:\mysql-reset.txt" --console
   ```
   
   Wait 5 seconds, then press Ctrl+C

4. **Start MySQL normally:**
   ```powershell
   net start MySQL80
   ```

5. **Update .env:**
   ```bash
   MYSQL_PASSWORD=root123
   ```

## Troubleshooting

### "Access is denied" when running script
- You need to run PowerShell as Administrator

### Script execution policy error
- Run: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`

### Service won't stop/start
- Check Windows Services (services.msc)
- Make sure you have admin rights
