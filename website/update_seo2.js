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

        const [rows] = await connection.execute("SELECT id, page_name, header_scripts FROM seo_pages WHERE page_name = 'global'");
        
        if (rows.length > 0 && rows[0].header_scripts) {
            let scripts = rows[0].header_scripts;
            console.log('Old scripts:', scripts);
            
            scripts = scripts.replace(/platfrom/g, 'platform');
            scripts = scripts.replace(/there job/g, 'their job');
            scripts = scripts.replace(/repliable/g, 'reliable');
            
            await connection.execute("UPDATE seo_pages SET header_scripts = ? WHERE id = ?", [scripts, rows[0].id]);
            console.log('Successfully updated the header_scripts.');
        } else {
            console.log('No global header_scripts found.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixSEO();
