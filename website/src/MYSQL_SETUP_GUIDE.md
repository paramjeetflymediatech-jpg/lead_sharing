# MySQL Database Setup Guide

## Step 1: Set Up MySQL Database

### Option 1: Using phpMyAdmin (XAMPP/WAMP)
1. Open phpMyAdmin in your browser (usually http://localhost/phpmyadmin)
2. Click on "New" to create a new database
3. Database name: `lead_sharing`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Create a new schema named `lead_sharing`

### Option 3: Using Command Line
```bash
mysql -u root -p
CREATE DATABASE lead_sharing;
USE lead_sharing;
```

## Step 2: Create Database Tables

1. In phpMyAdmin:
   - Select the `lead_sharing` database
   - Click on the "SQL" tab
   - Copy the entire contents of `schema.sql` file
   - Paste it into the SQL query box
   - Click "Go" to execute

2. In MySQL Workbench:
   - Select the `lead_sharing` schema
   - Click "File" > "Open SQL Script"
   - Select the `schema.sql` file
   - Click "Execute"

3. Using Command Line:
   ```bash
   mysql -u root -p lead_sharing < schema.sql
   ```

## Step 3: Configure MySQL User & Password

Your `.env` file currently has:
```
MYSQL_USER=aman
MYSQL_PASSWORD=aman1234
```

### Option A: Use these credentials
Create MySQL user 'aman' with password 'aman1234':
```sql
CREATE USER 'aman'@'localhost' IDENTIFIED BY 'aman1234';
GRANT ALL PRIVILEGES ON lead_sharing.* TO 'aman'@'localhost';
FLUSH PRIVILEGES;
```

### Option B: Use root (easier for local development)
Update your `.env` file:
```
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
```

## Step 4: Create Admin User (Optional)

After tables are created, run:
```bash
node src/scripts/create-admin.js
```

This will create an admin user:
- Email: admin@leadsharing.com
- Password: adminpassword123

## Step 5: Verify Everything Works

Run the development server:
```bash
npm run dev
```

The application should start without errors!

## Common Issues

### Error: Access denied for user
- Check your MySQL username and password in `.env`
- Make sure the user has permissions for the database

### Error: Table doesn't exist
- Run the `schema.sql` file to create all tables
- Make sure you selected the correct database

### Error: Can't connect to MySQL server
- Make sure MySQL/XAMPP/WAMP is running
- Check if MySQL is running on port 3306 (default)
