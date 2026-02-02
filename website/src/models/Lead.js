
import pool from '../../config/db';

const simpleLeadMapper = (row) => ({
  _id: row.id,
  job: row.job_id,
  tradesperson: row.tradesperson_id,
  message: row.message,
  priceEstimate: row.price_estimate,
  isUnlocked: row.is_unlocked,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const Lead = {
  async find(query = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (query.job) {
      sql += ' AND job_id = ?';
      params.push(query.job);
    }
    if (query.tradesperson) {
      sql += ' AND tradesperson_id = ?';
      params.push(query.tradesperson);
    }
    if (query.isUnlocked !== undefined) {
      sql += ' AND is_unlocked = ?';
      params.push(query.isUnlocked);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows.map(simpleLeadMapper);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows[0] ? simpleLeadMapper(rows[0]) : null;
  },

  async findOne(query) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (query._id) { sql += ' AND id = ?'; params.push(query._id); }
    if (query.job) { sql += ' AND job_id = ?'; params.push(query.job); }
    if (query.tradesperson) { sql += ' AND tradesperson_id = ?'; params.push(query.tradesperson); }
    if (query.isUnlocked !== undefined) { sql += ' AND is_unlocked = ?'; params.push(query.isUnlocked); }

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return rows[0] ? simpleLeadMapper(rows[0]) : null;
  },

  async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM leads WHERE 1=1';
    const params = [];

    // Handle job query with $in operator (MongoDB style)
    if (query.job) {
      if (query.job.$in && Array.isArray(query.job.$in)) {
        if (query.job.$in.length === 0) {
          // Empty array - no results
          return 0;
        }
        const placeholders = query.job.$in.map(() => '?').join(',');
        sql += ` AND job_id IN (${placeholders})`;
        params.push(...query.job.$in);
      } else {
        sql += ' AND job_id = ?';
        params.push(query.job);
      }
    }

    if (query.tradesperson) {
      sql += ' AND tradesperson_id = ?';
      params.push(query.tradesperson);
    }
    if (query.isUnlocked !== undefined) {
      sql += ' AND is_unlocked = ?';
      params.push(query.isUnlocked);
    }

    // Support for date range queries (MongoDB $gte style)
    if (query.createdAt) {
      if (query.createdAt.$gte) {
        sql += ' AND created_at >= ?';
        params.push(query.createdAt.$gte);
      }
      if (query.createdAt.$lte) {
        sql += ' AND created_at <= ?';
        params.push(query.createdAt.$lte);
      }
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  },

  async create(leadData) {
    const { job, tradesperson, message, priceEstimate, isUnlocked } = leadData;
    const [result] = await pool.query(
      'INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked) VALUES (?, ?, ?, ?, ?)',
      [job, tradesperson, message || '', priceEstimate || null, isUnlocked || false]
    );
    return {
      _id: result.insertId,
      job,
      tradesperson,
      message,
      priceEstimate,
      isUnlocked: isUnlocked || false
    };
  },

  async findByIdAndUpdate(id, updateData) {
    const updates = [];
    const values = [];

    if (updateData.isUnlocked !== undefined) {
      updates.push('is_unlocked = ?');
      values.push(updateData.isUnlocked);
    }
    if (updateData.message !== undefined) {
      updates.push('message = ?');
      values.push(updateData.message);
    }
    if (updateData.priceEstimate !== undefined) {
      updates.push('price_estimate = ?');
      values.push(updateData.priceEstimate);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.findById(id);
  }
};

export default Lead;
