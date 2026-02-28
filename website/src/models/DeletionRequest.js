import pool from '@/../config/db.js';

export const DeletionRequest = {
    async find(query = {}) {
        let sql = 'SELECT dr.*, u.name as user_name, u.email as user_email, u.role as user_role FROM deletion_requests dr JOIN users u ON dr.user_id = u.id WHERE 1=1';
        const params = [];

        if (query.userId) {
            sql += ' AND dr.user_id = ?';
            params.push(query.userId);
        }

        if (query.status) {
            sql += ' AND dr.status = ?';
            params.push(query.status);
        }

        sql += ' ORDER BY dr.created_at DESC';

        const [rows] = await pool.query(sql, params);
        return rows.map(row => ({
            ...row,
            _id: row.id,
            user: {
                _id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                role: row.user_role
            }
        }));
    },

    async findById(id) {
        const [rows] = await pool.query(
            'SELECT dr.*, u.name as user_name, u.email as user_email, u.role as user_role FROM deletion_requests dr JOIN users u ON dr.user_id = u.id WHERE dr.id = ?',
            [id]
        );
        if (!rows[0]) return null;
        const row = rows[0];
        return {
            ...row,
            _id: row.id,
            user: {
                _id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                role: row.user_role
            }
        };
    },

    async create(data) {
        const { userId, reason } = data;
        const [result] = await pool.query(
            'INSERT INTO deletion_requests (user_id, reason) VALUES (?, ?)',
            [userId, reason]
        );
        return {
            id: result.insertId,
            user_id: userId,
            reason,
            status: 'PENDING',
            created_at: new Date()
        };
    },

    async findOne(query) {
        let sql = 'SELECT * FROM deletion_requests WHERE 1=1';
        const params = [];

        if (query.user_id) {
            sql += ' AND user_id = ?';
            params.push(query.user_id);
        }

        if (query.status) {
            sql += ' AND status = ?';
            params.push(query.status);
        }

        sql += ' LIMIT 1';
        const [rows] = await pool.query(sql, params);
        return rows[0] || null;
    },

    async findByIdAndUpdate(id, data) {
        const fields = [];
        const values = [];

        if (data.status) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.adminNotes) {
            fields.push('admin_notes = ?');
            values.push(data.adminNotes);
        }
        if (data.processedAt) {
            fields.push('processed_at = ?');
            values.push(data.processedAt);
        }

        if (fields.length === 0) return null;

        values.push(id);
        await pool.query(
            `UPDATE deletion_requests SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return this.findById(id);
    },

    async findByIdAndDelete(id) {
        const [result] = await pool.query('DELETE FROM deletion_requests WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
