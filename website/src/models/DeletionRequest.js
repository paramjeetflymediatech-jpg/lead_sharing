import pool from '@/../config/db.js';

export const DeletionRequest = {
    async find(query = {}) {
        let sql = `
            SELECT dr.*, u.name as linked_user_name, u.email as linked_user_email, u.role as linked_user_role 
            FROM deletion_requests dr 
            LEFT JOIN users u ON dr.user_id = u.id 
            WHERE 1=1
        `;
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
            user: row.user_id ? {
                _id: row.user_id,
                name: row.linked_user_name,
                email: row.linked_user_email,
                role: row.linked_user_role
            } : null
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
        const { userId, email, name, phone, reason } = data;
        const [result] = await pool.query(
            'INSERT INTO deletion_requests (user_id, email, name, phone, reason) VALUES (?, ?, ?, ?, ?)',
            [userId || null, email, name || null, phone || null, reason]
        );
        return {
            id: result.insertId,
            user_id: userId || null,
            email,
            name: name || null,
            phone: phone || null,
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
    },
    async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT * FROM deletion_requests WHERE email = ? AND status='PENDING'`,
            [email]
        );
        return rows[0] || null;
    }
};
