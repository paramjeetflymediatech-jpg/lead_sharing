const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const { TRADE_SERVICE_LINKS } = require("../constants/locations");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function slugify(text) {
    if (!text) return "";
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
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "lead_sharing",
    });

    try {
        console.log("🚀 Starting dynamic services migration...");

        let totalInserted = 0;
        let totalSkipped = 0;
        let categoriesCreated = 0;

        // Cache for category IDs to avoid repeated queries
        const categoryCache = {};

        // Get all existing categories and subcategories for faster lookup
        const [allCats] = await connection.query("SELECT id, name, slug FROM categories");
        const [allSubs] = await connection.query("SELECT id, name, slug, category_id FROM sub_categories");

        for (const [cityName, cityData] of Object.entries(TRADE_SERVICE_LINKS)) {
            const locationName = cityData.location || cityName;
            const services = cityData.services || [];

            for (const serviceData of services) {
                if (typeof serviceData !== 'object') continue;

                const name = serviceData.name;
                const slug = slugify(name);
                
                // Extract service type from name (before " in " - case insensitive)
                const parts = name.split(/\s+in\s+/i);
                const serviceType = parts[0].trim();
                const serviceTypeSlug = slugify(serviceType);

                let categoryId = null;

                // 1. Check Cache
                if (categoryCache[serviceTypeSlug]) {
                    categoryId = categoryCache[serviceTypeSlug];
                } else {
                    // 2. Check sub_categories (Case insensitive name match or slug match)
                    const subMatch = allSubs.find(s => 
                        s.name.toLowerCase() === serviceType.toLowerCase() || 
                        s.slug === serviceTypeSlug
                    );

                    if (subMatch) {
                        categoryId = subMatch.category_id;
                        console.log(`📎 Matched subcategory '${serviceType}' to category ID ${categoryId}`);
                    } else {
                        // 3. Check categories
                        const catMatch = allCats.find(c => 
                            c.name.toLowerCase() === serviceType.toLowerCase() || 
                            c.slug === serviceTypeSlug
                        );

                        if (catMatch) {
                            categoryId = catMatch.id;
                            console.log(`📁 Matched category '${serviceType}' (ID: ${categoryId})`);
                        } else {
                            // 4. Create new category if not found
                            const [newCat] = await connection.query(
                                "INSERT INTO categories (name, slug) VALUES (?, ?)",
                                [serviceType, serviceTypeSlug]
                            );
                            categoryId = newCat.insertId;
                            categoriesCreated++;
                            
                            // Update local list for future matches
                            allCats.push({ id: categoryId, name: serviceType, slug: serviceTypeSlug });
                            console.log(`🆕 Created new category: ${serviceType} (ID: ${categoryId})`);
                        }
                    }
                    // Add to cache
                    categoryCache[serviceTypeSlug] = categoryId;
                }

                const content = serviceData.content || "";
                const faq = JSON.stringify(serviceData.faq || []);
                
                // Construct description blocks from SEO description
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
        console.log(`📂 Categories Created: ${categoriesCreated}`);

    } catch (error) {
        console.error("💥 Critical Error:", error);
    } finally {
        await connection.end();
    }
}

insertServices();
