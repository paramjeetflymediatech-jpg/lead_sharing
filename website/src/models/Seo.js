
import pool from '../../config/db';

const seoToMongoStyle = (row) => {
    if (!row) return null;
    return {
        ...row,
        _id: row.id,
        pageName: row.page_name,
        title: row.title,
        metaDescription: row.meta_description,
        keywords: row.keywords,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
};

export const Seo = {
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM seo_pages WHERE id = ?', [id]);
            return seoToMongoStyle(rows[0]);
        } catch (error) {
            console.warn('Database query failed in Seo.findById:', error.message);
            return null;
        }
    },

    async find(query) {
        try {
            // Mock find all or filtered
            let sql = 'SELECT * FROM seo_pages WHERE 1=1';
            const params = [];
            const [rows] = await pool.query(sql, params);
            return rows.map(seoToMongoStyle);
        } catch (error) {
            console.warn('Database query failed in Seo.find:', error.message);
            return [];
        }
    },

    async findOne(query) {
        try {
            let sql = 'SELECT * FROM seo_pages WHERE 1=1';
            const params = [];
            if (query.pageName) {
                sql += ' AND page_name = ?';
                params.push(query.pageName);
            }
            sql += ' LIMIT 1';
            const [rows] = await pool.query(sql, params);
            return seoToMongoStyle(rows[0]);
        } catch (error) {
            // During build time or if DB is unavailable, return null
            // The seo-helper will provide default values
            console.warn('Database query failed in Seo.findOne:', error.message);
            return null;
        }
    },

    async create(data) {
        const { pageName, title, metaDescription, keywords } = data;
        const [result] = await pool.query(
            'INSERT INTO seo_pages (page_name, title, meta_description, keywords) VALUES (?, ?, ?, ?)',
            [pageName, title, metaDescription, keywords]
        );
        return { _id: result.insertId, ...data };
    },

    async findByIdAndUpdate(id, data, options = {}) {
        const updates = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            let col = null;
            if (key === 'pageName') col = 'page_name';
            else if (key === 'title') col = 'title';
            else if (key === 'metaDescription') col = 'meta_description';
            else if (key === 'keywords') col = 'keywords';

            if (col) {
                updates.push(`${col} = ?`);
                values.push(value);
            }
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE seo_pages SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        if (options.new) {
            // fetch again...
        }
    },

    async findByIdAndDelete(id) {
        await pool.query('DELETE FROM seo_pages WHERE id = ?', [id]);
    }
};

// Default export for compatibility where `import Seo from ...` is used
export default Seo;
