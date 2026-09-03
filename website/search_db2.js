import mysql from 'mysql2/promise';

async function searchDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'lead_sharing',
            port: 3306
        });

        const [tables] = await connection.execute('SHOW TABLES');
        
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${tableName}\``);
            
            for (const col of columns) {
                if (col.Type.includes('char') || col.Type.includes('text') || col.Type.includes('json')) {
                    try {
                        const [results] = await connection.execute(`SELECT * FROM \`${tableName}\` WHERE \`${col.Field}\` LIKE '%One Stop%' OR \`${col.Field}\` LIKE '%repliable%'`);
                        if (results.length > 0) {
                            console.log(`Found in table ${tableName}, column ${col.Field}:`, results);
                        }
                    } catch(e) {}
                }
            }
        }
        await connection.end();
    } catch (err) {
        console.error(err);
    }
}
searchDB();
