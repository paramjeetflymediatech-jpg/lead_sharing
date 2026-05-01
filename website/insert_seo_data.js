import { TRADE_SERVICE_LINKS } from './src/constants/locations.js';
import pool from './config/db.js';

/**
 * Generates a URL-friendly slug
 */
function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generates JSON-LD FAQ Schema
 */
function generateFaqSchema(faq) {
    if (!faq || faq.length === 0) return null;
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };
    return JSON.stringify(schema);
}

async function run() {
    try {
        console.log("🚀 Starting SEO Data Migration...");
        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        const entries = Object.entries(TRADE_SERVICE_LINKS);
        console.log(`📦 Found ${entries.length} main locations to process.`);

        for (const [locationName, data] of entries) {
            // 1. Process Main Location Page SEO
            const locationSlug = generateSlug(locationName);
            const locationPath = `/local-tradespeople/${locationSlug}`;
            
            if (data.seo) {
                try {
                    const schema = generateFaqSchema(data.faq);
                    // Using INSERT IGNORE to avoid overwriting manual changes if script is re-run
                    const [result] = await pool.query(`
                        INSERT IGNORE INTO seo_pages (
                            page_name, title, meta_description, keywords, schema_markup, meta_robots
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        locationPath, 
                        data.seo.title, 
                        data.seo.description, 
                        data.seo.keywords, 
                        schema,
                        'index, follow'
                    ]);
                    
                    if (result.affectedRows > 0) {
                        inserted++;
                    } else {
                        skipped++;
                    }
                } catch (err) {
                    console.error(`❌ Error inserting location SEO for ${locationName}:`, err.message);
                    errors++;
                }
            }

            // 2. Process Individual Service Pages within this location
            if (data.services && Array.isArray(data.services)) {
                for (const service of data.services) {
                    const serviceSlug = generateSlug(service.name);
                    const servicePath = `/local-tradespeople/${serviceSlug}`;
                    
                    if (service.seo) {
                        try {
                            const serviceSchema = generateFaqSchema(service.faq);
                            const [result] = await pool.query(`
                                INSERT IGNORE INTO seo_pages (
                                    page_name, title, meta_description, keywords, schema_markup, meta_robots
                                ) VALUES (?, ?, ?, ?, ?, ?)
                            `, [
                                servicePath, 
                                service.seo.title, 
                                service.seo.description, 
                                service.seo.keywords, 
                                serviceSchema,
                                'index, follow'
                            ]);
                            
                            if (result.affectedRows > 0) {
                                inserted++;
                            } else {
                                skipped++;
                            }

                            if (inserted % 100 === 0) {
                                console.log(`⏳ Progress: ${inserted} records inserted...`);
                            }
                        } catch (err) {
                            console.error(`❌ Error inserting service SEO for ${service.name}:`, err.message);
                            errors++;
                        }
                    }
                }
            }
        }

        console.log(`\n✨ SEO Migration Complete!`);
        console.log(`✅ Successfully inserted: ${inserted} new records`);
        console.log(`⏩ Skipped (Already existed): ${skipped}`);
        console.log(`❌ Errors: ${errors}`);

    } catch (err) {
        console.error('💥 Critical Error during SEO migration:', err);
    } finally {
        // Close the connection pool and exit
        await pool.end();
        process.exit();
    }
}

run();
