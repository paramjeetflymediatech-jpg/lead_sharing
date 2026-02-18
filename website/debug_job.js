const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    try {
        console.log("--- JOB 3 DETAILS ---");
        const [jobs] = await connection.query('SELECT * FROM jobs WHERE id = 3');
        console.log(JSON.stringify(jobs[0], null, 2));

        console.log("\n--- LEADS FOR JOB 3 ---");
        const [leads] = await connection.query('SELECT * FROM leads WHERE job_id = 3');
        console.log(JSON.stringify(leads, null, 2));

        if (jobs[0] && jobs[0].hired_tradesperson_id) {
            console.log("\n--- HIRED TRADESPERSON PROFILE (by id) ---");
            const [profileById] = await connection.query('SELECT * FROM tradesperson_profiles WHERE id = ?', [jobs[0].hired_tradesperson_id]);
            console.log(JSON.stringify(profileById[0], null, 2));

            console.log("\n--- HIRED TRADESPERSON PROFILE (by user_id) ---");
            const [profileByUserId] = await connection.query('SELECT * FROM tradesperson_profiles WHERE user_id = ?', [jobs[0].hired_tradesperson_id]);
            console.log(JSON.stringify(profileByUserId[0], null, 2));
        }

        console.log("\n--- TRADESPERSON RATINGS FOR JOB 3 ---");
        const [ratings] = await connection.query('SELECT * FROM tradesperson_ratings WHERE job_id = 3');
        console.log(JSON.stringify(ratings, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

debug();
