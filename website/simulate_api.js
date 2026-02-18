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
        const jobId = 3;
        const userId = 4; // homeowner_id for job 3

        const query = `SELECT 
        j.id,
        j.homeowner_id,
        j.category_id,
        j.sub_category_id,
        j.postcode,
        j.description,
        j.budget_min,
        j.budget_max,
        j.status,
        j.hired_tradesperson_id,
        j.has_rated,
        j.created_at,
        j.updated_at,
        c.id as category_id_alias,
        c.name as category_name,
        sc.id as subcategory_id,
        sc.name as subcategory_name,
        tp.company_name as hired_tradesperson_name
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN tradesperson_profiles tp ON j.hired_tradesperson_id = tp.id
      WHERE j.id = ? AND j.homeowner_id = ?
      LIMIT 1`;

        console.log("--- EXECUTING API QUERY FOR JOB 3 ---");
        const [jobs] = await connection.query(query, [jobId, userId]);
        console.log(JSON.stringify(jobs[0], null, 2));

        const queryWithUserId = query.replace('tp.id', 'tp.user_id');
        console.log("\n--- EXECUTING QUERY WITH tp.user_id JOIN ---");
        const [jobsWithUserId] = await connection.query(queryWithUserId, [jobId, userId]);
        console.log(JSON.stringify(jobsWithUserId[0], null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

debug();
