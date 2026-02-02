# 🚀 QUICK FIX - Run This Script!

## The Problem
`.env` file has empty password → MySQL denies access

## The Solution
Run the all-in-one setup script that will:
✅ Reset MySQL root password to `root123`
✅ Create database `lead_sharing`  
✅ Create all tables
✅ Update your `.env` file
✅ Verify everything works

## How to Run

### Step 1: Open PowerShell as Administrator
1. Click Start
2. Type "PowerShell"
3. **Right-click** on "Windows PowerShell"
4. Select **"Run as Administrator"**

### Step 2: Navigate to Your Project
```powershell
cd D:\CODE\lead_sharing\website
```

### Step 3: Run the Setup Script  
```powershell
.\complete-mysql-setup.ps1
```

### Step 4: Restart Your Dev Server
1. Go to your terminal running `npm run dev`
2. Press `Ctrl+C` to stop it
3. Run: `npm run dev`
4. ✅ Error should be GONE!

## What This Script Does
1. Stops MySQL service
2. Resets root password to: `root123`
3. Creates database: `lead_sharing`
4. Creates all tables from `schema.sql`
5. Updates `.env` with: `MYSQL_PASSWORD=root123`
6. Starts MySQL service
7. Verifies connection

## Troubleshooting

**"Cannot run script - not Administrator"**
→ You must run PowerShell as Administrator (see Step 1)

**"Execution policy error"**  
→ Run first: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`

**Script completes but error persists**
→ Make sure you restarted the dev server (Ctrl+C then `npm run dev`)

---

**Your new MySQL password will be: `root123`**
