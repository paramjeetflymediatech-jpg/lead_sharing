import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
};

// Use globalThis to persist the pool across hot-reloads in Next.js dev
const pool = globalThis.mysqlPool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
    globalThis.mysqlPool = pool;
}

pool.getConnection()
    .then(connection => {
        console.log(`✅ MySQL Connected to [${dbConfig.host}] database [${dbConfig.database}] as [${dbConfig.user}]`);
        connection.release();
    })
    .catch(error => {
        console.error('❌ Error connecting to MySQL Database:', error);
    });

export default pool;
 
