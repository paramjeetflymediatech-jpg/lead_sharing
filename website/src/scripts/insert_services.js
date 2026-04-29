const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const { TRADE_SERVICE_LINKS } = require("../constants/locations");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
}

async function insertServices() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "root",
        database: process.env.MYSQL_DATABASE || "lead_sharing",
    });

    try {
        console.log("🚀 Starting services migration...");

        // 1. Ensure Roofing Category exists
        const [catRows] = await connection.query("SELECT id FROM categories WHERE slug = 'roofing'");
        let categoryId;
        if (catRows.length > 0) {
            categoryId = catRows[0].id;
        } else {
            const [catResult] = await connection.query(
                "INSERT INTO categories (name, slug) VALUES (?, ?)",
                ["Roofing", "roofing"]
            );
            categoryId = catResult.insertId;
            console.log(`✅ Created 'Roofing' category (ID: ${categoryId})`);
        }

        let totalInserted = 0;
        let totalSkipped = 0;

        for (const [cityName, cityData] of Object.entries(TRADE_SERVICE_LINKS)) {
            const locationName = cityData.location || cityName;
            const services = cityData.services || [];

            for (const serviceData of services) {
                // In some cases service might be just a string in legacy data, but based on view_file it's an object
                if (typeof serviceData !== 'object') continue;

                const name = serviceData.name;
                const slug = slugify(name);
                const content = serviceData.content || "";
                const faq = JSON.stringify(serviceData.faq || []);
                
                // Construct description blocks from SEO description if standard description is missing
                const description = JSON.stringify([
                    { tag: 'p', text: serviceData.seo?.description || "" }
                ]);

                try {
                    // Check if slug already exists to avoid unique constraint error
                    const [existing] = await connection.query("SELECT id FROM services WHERE slug = ?", [slug]);
                    if (existing.length > 0) {
                        totalSkipped++;
                        continue;
                    }

                    await connection.query(
                        `INSERT INTO services (name, slug, description, content, category_id, faq, location, is_active) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [name, slug, description, content, categoryId, faq, locationName, 1]
                    );
                    totalInserted++;
                    if (totalInserted % 50 === 0) {
                        console.log(`⏳ Inserted ${totalInserted} services...`);
                    }
                } catch (err) {
                    console.error(`❌ Error inserting service '${name}':`, err.message);
                }
            }
        }

        console.log(`\n✨ Migration Complete!`);
        console.log(`✅ Total Inserted: ${totalInserted}`);
        console.log(`⏩ Total Skipped (Duplicates): ${totalSkipped}`);

    } catch (error) {
        console.error("💥 Critical Error:", error);
    } finally {
        await connection.end();
    }
}

insertServices();
