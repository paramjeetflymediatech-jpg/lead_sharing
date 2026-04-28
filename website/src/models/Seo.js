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
        metaRobots: row.meta_robots,
        ogTitle: row.og_title,
        ogDescription: row.og_description,
        ogImage: row.og_image,
        canonicalUrl: row.canonical_url,
        schemaMarkup: row.schema_markup,
        googleAnalyticsId: row.google_analytics_id,
        googleTagManagerId: row.google_tag_manager_id,
        headerScripts: row.header_scripts,
        footerScripts: row.footer_scripts,
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
        const {
            pageName, title, metaDescription, keywords,
            metaRobots, ogTitle, ogDescription, ogImage,
            canonicalUrl, schemaMarkup, googleAnalyticsId, googleTagManagerId,
            headerScripts, footerScripts
        } = data;

        const [result] = await pool.query(
            `INSERT INTO seo_pages (
                page_name, title, meta_description, keywords,
                meta_robots, og_title, og_description, og_image,
                canonical_url, schema_markup, google_analytics_id, google_tag_manager_id,
                header_scripts, footer_scripts
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pageName, title, metaDescription, keywords,
                metaRobots || 'index, follow', ogTitle, ogDescription, ogImage,
                canonicalUrl, schemaMarkup, googleAnalyticsId, googleTagManagerId,
                headerScripts, footerScripts
            ]
        );
        return { _id: result.insertId, ...data };
    },

    async findByIdAndUpdate(id, data, options = {}) {
        const updates = [];
        const values = [];

        const fieldMap = {
            pageName: 'page_name',
            title: 'title',
            metaDescription: 'meta_description',
            keywords: 'keywords',
            metaRobots: 'meta_robots',
            ogTitle: 'og_title',
            ogDescription: 'og_description',
            ogImage: 'og_image',
            canonicalUrl: 'canonical_url',
            schemaMarkup: 'schema_markup',
            googleAnalyticsId: 'google_analytics_id',
            googleTagManagerId: 'google_tag_manager_id',
            headerScripts: 'header_scripts',
            footerScripts: 'footer_scripts'
        };

        for (const [key, value] of Object.entries(data)) {
            const col = fieldMap[key];
            if (col && value !== undefined) {
                updates.push(`${col} = ?`);
                values.push(value);
            }
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE seo_pages SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        if (options.new) {
            return await this.findById(id);
        }
    },

    async findByIdAndDelete(id) {
        const [result] = await pool.query('DELETE FROM seo_pages WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

// Default export for compatibility where `import Seo from ...` is used
export default Seo;
