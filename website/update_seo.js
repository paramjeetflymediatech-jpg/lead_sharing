import mysql from 'mysql2/promise';

async function fixSEO() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'lead_sharing',
            port: 3306
        });

        console.log('Connected to MySQL!');

        const query = `
            UPDATE seo_pages 
            SET meta_description = REPLACE(
                REPLACE(
                    REPLACE(meta_description, 'platfrom', 'platform'),
                    'there job', 'their job'
                ),
                'repliable', 'reliable'
            )
            WHERE meta_description LIKE '%platfrom%';
        `;

        const [result] = await connection.execute(query);
        console.log('Update result:', result);

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixSEO();
