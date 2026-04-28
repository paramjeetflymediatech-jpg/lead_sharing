import { LOCATION_DATA } from './src/constants/locations.js';
import pool from './config/db.js';

function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function run() {
    try {
        const locations = Object.keys(LOCATION_DATA);
        let inserted = 0;
        let skipped = 0;

        for (const locName of locations) {
            const slug = generateSlug(locName);
            try {
                await pool.query('INSERT INTO locations (name, slug) VALUES (?, ?)', [locName, slug]);
                inserted++;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    skipped++;
                } else {
                    console.error(`Error inserting ${locName}:`, err.message);
                }
            }
        }

        console.log(`Successfully inserted ${inserted} locations.`);
        if (skipped > 0) console.log(`Skipped ${skipped} locations (already exist).`);
    } catch (e) {
        console.error("Global error:", e);
    } finally {
        process.exit(0);
    }
}

run();
