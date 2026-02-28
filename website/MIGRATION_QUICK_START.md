# Complete Migration - Single File

## जल्दी शुरू करें (Quick Start)

### Step 1: एक ही फाइल से सब कुछ करें (Run Single Migration)
```bash
cd website
node src/migrations/complete_migration.js
```

## यह क्या करेगा (What It Does)

✅ **18 Existing Tables को रखेगा** (Keep your existing data):
- auth_tokens, blogs, categories, credit_plans
- deletion_requests, jobs, leads, messages
- migrations, notifications, payments, pending_users
- push_tokens, seo_pages, sub_categories
- tradesperson_profiles, tradesperson_ratings, users

➕ **13 नई Tables बनाएगा** (Add new tables):
- service_categories, services, service_providers
- bookings, booking_status_history, booking_time_logs
- booking_photos, job_photos, chat_messages
- invoices, provider_documents, provider_bank_accounts
- provider_reviews, provider_rating_summary

**= कुल 31 Tables** ✅

## Output उदाहरण (Expected Output)

```
🔌 Database: lead_sharing@localhost
👤 User: root

✅ Connected to MySQL

📋 Creating missing tables...

✅ service_categories
✅ services
✅ service_providers
✅ bookings
✅ booking_status_history
✅ booking_time_logs
✅ booking_photos
✅ job_photos
✅ chat_messages
✅ invoices
✅ provider_documents
✅ provider_bank_accounts
✅ provider_reviews
✅ provider_rating_summary

============================================================
🎉 MIGRATION COMPLETED SUCCESSFULLY
============================================================

📊 Existing Tables (18):
   ✓ auth_tokens, blogs, categories, credit_plans
   ✓ deletion_requests, jobs, leads, messages
   ✓ migrations, notifications, payments, pending_users
   ✓ push_tokens, seo_pages, sub_categories
   ✓ tradesperson_profiles, tradesperson_ratings, users

📊 New Tables Added (13):
   ✓ service_categories, services, service_providers
   ✓ bookings, booking_status_history, booking_time_logs
   ✓ booking_photos, job_photos, chat_messages, invoices
   ✓ provider_documents, provider_bank_accounts
   ✓ provider_reviews, provider_rating_summary

📈 Total Tables: 18 (existing) + 13 (new) = 31 tables

✅ All tables created with proper foreign keys and indexes

🔌 DB connection closed
```

## Verify कमांड (Verify Tables)

```bash
mysql -h localhost -u root -p -e "USE lead_sharing; SHOW TABLES;"
```

Expected: **31 tables** 👍

## Features

✅ **पहले वाले data को नहीं मिटाता** - Keeps all existing 18 tables
✅ **एक ही फाइल** - Single file to run
✅ **पूरा समाधान** - Complete solution with all missing tables
✅ **Proper Relationships** - Foreign keys configured correctly
✅ **Performance Optimized** - Indexes added for fast queries
✅ **UTF-8 Support** - Full unicode support

## यदि Error आए (If Error Occurs)

**Error: Table already exists**
- यह ठीक है! Migration फिर भी काम करेगा
- `CREATE TABLE IF NOT EXISTS` का मतलब यह है कि यह existing tables को skip करेगा

**Error: Foreign key constraint fails**
- पहले `.env` file check करें कि database सही है
- `mysql -h localhost -u root -p -e "SELECT 1"` - Connection test करें

**Error: Table connection failed**
- Ensure .env file में सही credentials हैं:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=lead_sharing
```

## फाइл Location (File Location)

```
website/
└── src/
    └── migrations/
        └── complete_migration.js  ← यह फाइल चलाएं (Run this)
```

## Now Run करें (Now Run It)

```bash
cd d:\latestcode\lead_sharing\website
node src/migrations/complete_migration.js
```

Done! ✅
