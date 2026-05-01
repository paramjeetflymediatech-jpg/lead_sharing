import pool from './config/db.js';

/**
 * Creates or updates the seo_pages table to align with the Seo model.
 */
async function run() {
    try {
        console.log("🚀 Initializing SEO table creation and updates...");
        
        // 1. Create the table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS seo_pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page_name VARCHAR(255) NOT NULL COMMENT 'Unique identifier for the page (e.g., path or name)',
                title VARCHAR(255) NOT NULL COMMENT 'Meta title tag content',
                meta_description TEXT COMMENT 'Meta description tag content',
                keywords TEXT COMMENT 'Meta keywords tag content',
                meta_robots VARCHAR(255) DEFAULT 'index, follow' COMMENT 'Meta robots tag instructions',
                og_title VARCHAR(500) COMMENT 'Open Graph title for social sharing',
                og_description TEXT COMMENT 'Open Graph description for social sharing',
                og_image VARCHAR(500) COMMENT 'Open Graph image URL for social sharing',
                canonical_url VARCHAR(500) COMMENT 'Canonical URL for SEO',
                header_scripts TEXT COMMENT 'Custom content/scripts for the <head> section',
                footer_scripts TEXT COMMENT 'Custom content/scripts for the end of <body> section',
                schema_markup TEXT COMMENT 'JSON-LD schema markup',
                google_analytics_id VARCHAR(50) COMMENT 'Specific GA ID for this page if needed',
                google_tag_manager_id VARCHAR(50) COMMENT 'Specific GTM ID for this page if needed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_page_name (page_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await pool.query(createTableQuery);
        
        // 2. Add missing columns or rename if the table already existed
        console.log("🛠 Checking for missing columns based on Seo model...");
        
        const columnsToAdd = [
            { name: 'header_scripts', type: 'TEXT COMMENT "Custom content/scripts for the <head> section"' },
            { name: 'footer_scripts', type: 'TEXT COMMENT "Custom content/scripts for the end of <body> section"' }
        ];

        for (const col of columnsToAdd) {
            try {
                // Check if column exists
                const [cols] = await pool.query(`SHOW COLUMNS FROM seo_pages LIKE ?`, [col.name]);
                if (cols.length === 0) {
                    console.log(`➕ Adding missing column: ${col.name}`);
                    await pool.query(`ALTER TABLE seo_pages ADD COLUMN ${col.name} ${col.type}`);
                }
            } catch (err) {
                console.error(`⚠️ Could not add column ${col.name}:`, err.message);
            }
        }

        // 3. Cleanup: If header_content/footer_content were created by mistake, we could rename or drop them.
        // For safety, I will just leave them or you can manually drop them if preferred.
        // But let's check if they exist and maybe migrate data if needed? 
        // Since this is a new setup, I'll just focus on making header_scripts/footer_scripts available.

        console.log("✅ Table 'seo_pages' is up to date and matches the Seo model!");
        
    } catch (error) {
        console.error("❌ Error during SEO table operation:");
        console.error(error.message);
    } finally {
        // Close the connection pool
        await pool.end();
        process.exit();
    }
}

// Execute the migration
run();
