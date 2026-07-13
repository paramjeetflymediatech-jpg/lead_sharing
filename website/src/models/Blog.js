
import pool from '../../config/db';

const blogToMongoStyle = (row) => {
    if (!row) return null;
    return {
        ...row,
        _id: row.id,
        featuredImage: row.featured_image,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        seoRobots: row.seo_robots,
        canonicalUrl: row.canonical_url,
        ogTitle: row.og_title,
        ogDescription: row.og_description,
        ogImage: row.og_image,
        schemaMarkup: row.schema_markup,
        gaId: row.ga_id,
        gtmId: row.gtm_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
};

export const Blog = {
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
            return blogToMongoStyle(rows[0]);
        } catch (error) {
            console.error('Database query failed in Blog.findById:', error.message);
            return null;
        }
    },

    async findOne(query) {
        try {
            let sql = 'SELECT * FROM blogs WHERE 1=1';
            const params = [];

            if (query.slug) {
                sql += ' AND slug = ?';
                params.push(query.slug);
            }
            if (query.status) {
                sql += ' AND status = ?';
                params.push(query.status);
            }

            sql += ' LIMIT 1';
            const [rows] = await pool.query(sql, params);
            return blogToMongoStyle(rows[0]);
        } catch (error) {
            console.error('Database query failed in Blog.findOne:', error.message);
            return null;
        }
    },

    async find(query = {}, options = {}) {
        try {
            let sql = 'SELECT * FROM blogs WHERE 1=1';
            const params = [];

            if (query.status) {
                sql += ' AND status = ?';
                params.push(query.status);
            }

            if (query.author) {
                sql += ' AND author = ?';
                params.push(query.author);
            }

            if (query.search) {
                sql += ' AND (title LIKE ? OR content LIKE ?)';
                params.push(`%${query.search}%`, `%${query.search}%`);
            }

            // Order by created_at DESC by default
            sql += ' ORDER BY created_at DESC';

            // Pagination
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const offset = (page - 1) * limit;

            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.query(sql, params);

            // Get total count for pagination
            let countSql = 'SELECT COUNT(*) as total FROM blogs WHERE 1=1';
            const countParams = [];
            if (query.status) {
                countSql += ' AND status = ?';
                countParams.push(query.status);
            }
            if (query.author) {
                countSql += ' AND author = ?';
                countParams.push(query.author);
            }
            if (query.search) {
                countSql += ' AND (title LIKE ? OR content LIKE ?)';
                countParams.push(`%${query.search}%`, `%${query.search}%`);
            }

            const [countRows] = await pool.query(countSql, countParams);
            const total = countRows[0].total;

            return {
                blogs: rows.map(blogToMongoStyle),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Database query failed in Blog.find:', error.message);
            return { blogs: [], total: 0, page: 1, limit: 10, totalPages: 0 };
        }
    },

    async create(data) {
        try {
            const {
                title, slug, content, excerpt, featured_image, status, author, tags,
                seo_title, seo_description, seo_robots, canonical_url,
                og_title, og_description, og_image, schema_markup, ga_id, gtm_id
            } = data;

            const [result] = await pool.query(
                `INSERT INTO blogs 
                (title, slug, content, excerpt, featured_image, status, author, tags, 
                seo_title, seo_description, seo_robots, canonical_url, 
                og_title, og_description, og_image, schema_markup, ga_id, gtm_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, slug, content, excerpt || null, featured_image || null, status || 'DRAFT', author || 'Admin', tags || null,
                    seo_title || null, seo_description || null, seo_robots || 'index, follow', canonical_url || null,
                    og_title || null, og_description || null, og_image || null, schema_markup || null, ga_id || null, gtm_id || null
                ]
            );
            return { _id: result.insertId, ...data };
        } catch (error) {
            console.error('Database query failed in Blog.create:', error.message);
            throw error;
        }
    },

    async findByIdAndUpdate(id, data) {
        try {
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(data)) {
                // Map camelCase to snake_case if needed
                let col = key;
                if (key === 'featuredImage') col = 'featured_image';
                else if (key === 'seoTitle') col = 'seo_title';
                else if (key === 'seoDescription') col = 'seo_description';
                else if (key === 'seoRobots') col = 'seo_robots';
                else if (key === 'canonicalUrl') col = 'canonical_url';
                else if (key === 'ogTitle') col = 'og_title';
                else if (key === 'ogDescription') col = 'og_description';
                else if (key === 'ogImage') col = 'og_image';
                else if (key === 'schemaMarkup') col = 'schema_markup';
                else if (key === 'gaId') col = 'ga_id';
                else if (key === 'gtmId') col = 'gtm_id';

                updates.push(`${col} = ?`);
                values.push(value);
            }

            if (updates.length === 0) return null;

            updates.push('updated_at = CURRENT_TIMESTAMP');

            values.push(id);
            await pool.query(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`, values);
            return this.findById(id);
        } catch (error) {
            console.error('Database query failed in Blog.findByIdAndUpdate:', error.message);
            throw error;
        }
    },

    async findByIdAndDelete(id) {
        try {
            await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Database query failed in Blog.findByIdAndDelete:', error.message);
            return false;
        }
    }
};

export default Blog;
