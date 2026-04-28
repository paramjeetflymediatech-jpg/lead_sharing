import pool from './config/db.js';
async function run() {
    try {
        await pool.query('ALTER TABLE services ADD COLUMN location VARCHAR(255) DEFAULT NULL;');
        console.log("Added location column");
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
        } else {
            console.error(e);
        }
    }
    process.exit();
}
run();
