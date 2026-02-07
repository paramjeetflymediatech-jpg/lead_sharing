const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

async function checkUser() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        port: process.env.MYSQL_PORT || 3306,
        database: process.env.MYSQL_DATABASE || "lead_sharing",
        user: process.env.MYSQL_USER || "aman",
        password: process.env.MYSQL_PASSWORD || "aman1234",
    });

    try {
        const [rows] = await connection.query("SELECT id, email, role, name FROM users");
        console.log("Current Users in DB:", JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await connection.end();
    }
}

checkUser();
