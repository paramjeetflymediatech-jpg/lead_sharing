# ✅ MySQL Workbench - Quick Setup (Your Data IS There!)

## 🎯 **Your Database is Working!**

I just verified - you have:
- ✅ **MySQL80 is RUNNING**
- ✅ **Database `lead_sharing` exists**
- ✅ **3 users in database**
- ✅ **All tables created**

**The data IS there - you just need to connect properly!**

---

## 🚀 **5-Minute Setup Guide**

### **STEP 1: Open MySQL Workbench**
- Double-click MySQL Workbench icon on desktop (or from Start menu)

---

### **STEP 2: Create Connection (Do This ONCE)**

1. On the home screen, click the **[+]** button next to "MySQL Connections"

2. **Fill in EXACTLY:**
   ```
   Connection Name:  Lead Sharing
   Hostname:         localhost
   Port:             3306
   Username:         aman
   ```

3. **Set Password:**
   - Click "Store in Vault..." button
   - Type: `aman1234`
   - Click OK

4. **Test Connection:**
   - Click "Test Connection" button at bottom
   - Should say: "Successfully made the MySQL connection"
   - Click OK
   
5. **Save:**
   - Click OK to save the connection

---

### **STEP 3: Connect**

1. **Double-click** on "Lead Sharing" connection (you just created)
2. Wait 2-3 seconds for connection

---

### **STEP 4: View Your Data**

#### **Method 1: Using Navigator (Easiest)**

Look at **LEFT SIDEBAR** (Navigator panel):

1. Find "Schemas" section
2. **IF YOU DON'T SEE `lead_sharing`:**
   - Click the 🔄 refresh button (top of Navigator)
   
3. Click the **▶ arrow** next to `lead_sharing` to expand

4. Click the **▶ arrow** next to **"Tables"**

5. You'll see all your tables:
   - categories
   - jobs
   - leads
   - seo_pages
   - sub_categories
   - tradesperson_profiles
   - **users** ← Start here!

6. **Right-click on `users`** → Select **"Select Rows - Limit 1000"**

**BOOM!** You'll see your 3 users:
```
| id | email                 | role         |
|----|-----------------------|--------------|
| 1  | homeowner@test.com    | HOMEOWNER    |
| 2  | tradesperson@test.com | TRADESPERSON |
| 3  | admin@test.com        | ADMIN        |
```

---

#### **Method 2: Using SQL Query (Alternative)**

In the main SQL editor window, type:

```sql
USE lead_sharing;
SELECT * FROM users;
```

Then click the **⚡ lightning bolt icon** (or press `Ctrl + Enter`)

---

### **STEP 5: Explore Other Tables**

Try these queries to see all your data:

```sql
-- Use your database
USE lead_sharing;

-- View all tables
SHOW TABLES;

-- Count records in each table
SELECT 'Users' as Table_Name, COUNT(*) as Records FROM users
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Tradesperson Profiles', COUNT(*) FROM tradesperson_profiles;

-- View all user details
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- View tradesperson profiles
SELECT * FROM tradesperson_profiles;
```

---

## 🔴 **Common Issues & Quick Fixes**

### **Issue: "Can't see lead_sharing in Navigator"**

**Fix:** Click the 🔄 **refresh icon** at top of Navigator panel

---

### **Issue: "Access Denied"**

**Fix:** Wrong password. When creating connection:
- Click "Store in Vault"
- Type exactly: `aman1234`
- Make sure no extra spaces!

---

### **Issue: "Can't connect to MySQL server"**

**Fix:** MySQL not running

```powershell
# Open PowerShell as Administrator
Start-Service -Name "MySQL80"
```

Or:
1. Press `Win + R`
2. Type: `services.msc`
3. Find "MySQL80"
4. Right-click → Start

---

### **Issue: "Navigator panel is empty"**

**Fix:**
1. Click anywhere in the SQL editor
2. Type: `SHOW DATABASES;`
3. Press `Ctrl + Enter`
4. You should see `lead_sharing` in results
5. Then refresh Navigator (🔄 icon)

---

## 📋 **What You Should See:**

### **Left Sidebar (Navigator):**
```
├─ 🔍 SCHEMAS
│  └─ 🗄️ lead_sharing               ← Your database
│     ├─ 📋 Tables                   ← Expand this
│     │  ├─ categories
│     │  ├─ jobs
│     │  ├─ leads
│     │  ├─ seo_pages
│     │  ├─ sub_categories
│     │  ├─ tradesperson_profiles
│     │  └─ users                    ← Right-click this
```

### **After Right-Click → "Select Rows":**
```
Result Grid showing:
╔════╦═══════════════════════╦══════════════╦════════════╗
║ id ║ email                 ║ role         ║ name       ║
╠════╬═══════════════════════╬══════════════╬════════════╣
║ 1  ║ homeowner@test.com    ║ HOMEOWNER    ║ Test Home  ║
║ 2  ║ tradesperson@test.com ║ TRADESPERSON ║ Test Trade ║
║ 3  ║ admin@test.com        ║ ADMIN        ║ Admin User ║
╚════╩═══════════════════════╩══════════════╩════════════╝
```

---

## ✅ **Success Checklist:**

- [ ] MySQL Workbench opened
- [ ] Connection "Lead Sharing" created
- [ ] Test Connection → Success
- [ ] Connected (double-clicked connection)
- [ ] Navigator shows `lead_sharing` database
- [ ] Expanded Tables folder
- [ ] Can see 7 tables listed
- [ ] Right-clicked `users` → Select Rows
- [ ] See 3 users displayed

**All done?** Perfect! You can now:
- ✅ View all data
- ✅ Edit records (double-click cells)
- ✅ Add new records
- ✅ Export to Excel (right-click table → "Table Data Export Wizard")
- ✅ Run custom queries

---

## 💡 **Quick Tips:**

### **To Export Data to Excel:**
1. Right-click any table
2. "Table Data Export Wizard"
3. Choose CSV or JSON
4. Open in Excel

### **To Edit a Record:**
1. View table data (Select Rows)
2. Double-click any cell
3. Edit the value
4. Press Enter
5. Click "Apply" button (bottom right)

### **To Add New User:**
1. Right-click `users` table
2. "Select Rows"
3. Click in the empty row at bottom
4. Fill in: email, password, name, role
5. Click "Apply"

---

## 🎉 **You're All Set!**

Your database has:
- ✅ 3 test users ready
- ✅ All tables created
- ✅ Ready for jobs and leads

**Start here:**
1. Open MySQL Workbench
2. Double-click "Lead Sharing" connection
3. Expand `lead_sharing` → Tables in Navigator
4. Right-click `users` → "Select Rows - Limit 1000"
5. See your data! 🚀
