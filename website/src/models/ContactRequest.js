import pool from '@/../config/db.js';

const toMongoStyle = (row) => {
    if (!row) return null;
    return {
        ...row,
        _id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
};

export const ContactRequest = {
    async create(data) {
        const { name, email, category, subject, message } = data;
        const [result] = await pool.query(
            'INSERT INTO contact_requests (name, email, category, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, category || null, subject || null, message]
        );
        return { id: result.insertId, ...data };
    },

    async find(query = {}, options = {}) {
        let sql = 'SELECT * FROM contact_requests WHERE 1=1';
        const params = [];

        if (query.status) {
            sql += ' AND status = ?';
            params.push(query.status);
        }

        if (query.search) {
            sql += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)';
            const searchPattern = `%${query.search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        sql += ' ORDER BY created_at DESC';

        if (options.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(options.limit));
            if (options.skip) {
                sql += ' OFFSET ?';
                params.push(parseInt(options.skip));
            }
        }

        const [rows] = await pool.query(sql, params);
        return rows.map(toMongoStyle);
    },

    async count(query = {}) {
        let sql = 'SELECT COUNT(*) as count FROM contact_requests WHERE 1=1';
        const params = [];

        if (query.status) {
            sql += ' AND status = ?';
            params.push(query.status);
        }

        if (query.search) {
            sql += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)';
            const searchPattern = `%${query.search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const [rows] = await pool.query(sql, params);
        return rows[0].count;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM contact_requests WHERE id = ? LIMIT 1', [id]);
        return toMongoStyle(rows[0]);
    },

    async findByIdAndUpdate(id, updateData) {
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            let column = key;
            if (key === 'adminNotes') column = 'admin_notes';
            
            updates.push(`${column} = ?`);
            values.push(value);
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE contact_requests SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        return this.findById(id);
    },

    async findByIdAndDelete(id) {
        const [result] = await pool.query('DELETE FROM contact_requests WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
