const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const { CATEGORIES_CONFIG, generateAllNewServices } = require("./generate_new_categories");

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

async function syncNewCategoriesToMySQL() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "lead_sharing",
    });

    try {
        console.log("🚀 Starting MySQL Sync for Movers & Cleaning Company services...");

        // 1. Ensure Categories and Subcategories exist
        const catMap = {}; // name/slug -> id
        const subMap = {}; // name/slug -> { id, category_id }

        for (const catConfig of CATEGORIES_CONFIG) {
            const catName = catConfig.category;
            const catSlug = slugify(catName);

            let [existingCat] = await connection.query("SELECT id FROM categories WHERE slug = ? OR name = ?", [catSlug, catName]);
            let categoryId;
            if (existingCat.length > 0) {
                categoryId = existingCat[0].id;
                console.log(`📁 Found category '${catName}' (ID: ${categoryId})`);
            } else {
                const [newCat] = await connection.query("INSERT INTO categories (name, slug) VALUES (?, ?)", [catName, catSlug]);
                categoryId = newCat.insertId;
                console.log(`🆕 Created category '${catName}' (ID: ${categoryId})`);
            }
            catMap[catSlug] = categoryId;
            catMap[catName.toLowerCase()] = categoryId;

            for (const subcat of catConfig.subcategories) {
                const subName = subcat.name;
                const subSlug = slugify(subName);

                let [existingSub] = await connection.query("SELECT id FROM sub_categories WHERE slug = ? OR name = ?", [subSlug, subName]);
                let subId;
                if (existingSub.length > 0) {
                    subId = existingSub[0].id;
                    console.log(`📎 Found subcategory '${subName}' (ID: ${subId})`);
                } else {
                    const [newSub] = await connection.query(
                        "INSERT INTO sub_categories (name, slug, category_id) VALUES (?, ?, ?)",
                        [subName, subSlug, categoryId]
                    );
                    subId = newSub.insertId;
                    console.log(`🆕 Created subcategory '${subName}' (ID: ${subId}, Category ID: ${categoryId})`);
                }
                subMap[subSlug] = { id: subId, category_id: categoryId };
                subMap[subName.toLowerCase()] = { id: subId, category_id: categoryId };
            }
        }

        // 2. Generate services for all cities
        const { TRADE_SERVICE_LINKS } = generateAllNewServices();

        let totalInserted = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;

        for (const [cityName, cityData] of Object.entries(TRADE_SERVICE_LINKS)) {
            const locationName = cityData.location || cityName;
            const services = cityData.services || [];

            for (const serviceData of services) {
                if (typeof serviceData !== "object") continue;

                const name = serviceData.name;
                const slug = slugify(name);

                // Check if this service belongs to Movers or Cleaning Company subcategories
                const parts = name.split(/\s+in\s+/i);
                const serviceType = parts[0].trim();
                const serviceTypeSlug = slugify(serviceType);

                if (!subMap[serviceTypeSlug] && !subMap[serviceType.toLowerCase()]) {
                    // Not one of our new categories/subcategories, skip
                    continue;
                }

                const categoryId = subMap[serviceTypeSlug]?.category_id || catMap[serviceTypeSlug] || null;
                const content = serviceData.content || "";
                const faq = JSON.stringify(serviceData.faq || []);
                const description = JSON.stringify([
                    { tag: 'p', text: serviceData.seo?.description || "" }
                ]);

                try {
                    const [existing] = await connection.query("SELECT id FROM services WHERE slug = ?", [slug]);
                    if (existing.length > 0) {
                        // Update existing service with rich content & FAQ
                        await connection.query(
                            `UPDATE services SET description = ?, content = ?, category_id = ?, faq = ?, location = ?, is_active = 1 WHERE id = ?`,
                            [description, content, categoryId, faq, locationName, existing[0].id]
                        );
                        totalUpdated++;
                    } else {
                        await connection.query(
                            `INSERT INTO services (name, slug, description, content, category_id, faq, location, is_active) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [name, slug, description, content, categoryId, faq, locationName, 1]
                        );
                        totalInserted++;
                    }

                    if ((totalInserted + totalUpdated) % 50 === 0) {
                        console.log(`⏳ Processed ${totalInserted + totalUpdated} services...`);
                    }
                } catch (err) {
                    console.error(`❌ Error inserting/updating service '${name}':`, err.message);
                }
            }
        }

        console.log(`\n✨ Sync Complete!`);
        console.log(`✅ Total Inserted: ${totalInserted}`);
        console.log(`🔄 Total Updated: ${totalUpdated}`);
        console.log(`⏩ Total Skipped: ${totalSkipped}`);

    } catch (error) {
        console.error("💥 Critical Error:", error);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    syncNewCategoriesToMySQL();
}

module.exports = { syncNewCategoriesToMySQL };
