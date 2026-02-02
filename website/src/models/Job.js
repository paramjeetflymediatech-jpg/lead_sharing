
import pool from '../../config/db';

const simpleJobMapper = (row) => ({
  _id: row.id,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  homeowner: row.homeowner_id,
  category: row.category_id,
  subCategory: row.sub_category_id,
  location: { city: row.city || '', postcode: row.postcode || '' },
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  jobStage: row.job_stage,
  ownership: row.ownership,
  startTime: row.start_time,
});

export const Job = {
  async find(query = {}) {
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }
    if (query.homeowner) {
      sql += ' AND homeowner_id = ?';
      params.push(query.homeowner);
    }
    if (query._id) {
      sql += ' AND id = ?';
      params.push(query._id);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows.map(simpleJobMapper);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    return rows[0] ? simpleJobMapper(rows[0]) : null;
  },

  async findOne(query) {
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (query._id) {
      sql += ' AND id = ?';
      params.push(query._id);
    }
    if (query.homeowner) {
      sql += ' AND homeowner_id = ?';
      params.push(query.homeowner);
    }
    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return rows[0] ? simpleJobMapper(rows[0]) : null;
  },

  async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
    const params = [];

    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }
    if (query.homeowner) {
      sql += ' AND homeowner_id = ?';
      params.push(query.homeowner);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  },

  async create(data) {
    const {
      description,
      homeowner,
      category,
      subCategory,
      budgetMin,
      budgetMax,
      city,
      postcode,
      contactName,
      contactEmail,
      contactPhone,
      jobStage,
      ownership,
      startTime,
      status = 'OPEN'
    } = data;

    const [result] = await pool.query(
      `INSERT INTO jobs (description, homeowner_id, category_id, sub_category_id, budget_min, budget_max, city, postcode, contact_name, contact_email, contact_phone, job_stage, ownership, start_time, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        description,
        homeowner,
        category,
        subCategory,
        budgetMin || 0,
        budgetMax || 0,
        city || '',
        postcode || '',
        contactName || '',
        contactEmail || '',
        contactPhone || '',
        jobStage || 'PLANNING',
        ownership || 'OWN',
        startTime || 'FLEXIBLE',
        status
      ]
    );

    return {
      _id: result.insertId,
      ...data,
      status
    };
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const updates = [];
    const values = [];

    if (updateData.status) {
      updates.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.description) {
      updates.push('description = ?');
      values.push(updateData.description);
    }
    if (updateData.budgetMin !== undefined) {
      updates.push('budget_min = ?');
      values.push(updateData.budgetMin);
    }
    if (updateData.budgetMax !== undefined) {
      updates.push('budget_max = ?');
      values.push(updateData.budgetMax);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (options.new) {
      return this.findById(id);
    }
  }
};

export default Job;
