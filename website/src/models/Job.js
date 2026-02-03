
import pool from '../../config/db';

const detailedJobMapper = (row) => ({
  _id: row.id,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  // Populate objects if names exist, otherwise fall back to ID
  homeowner: row.homeowner_name ? { _id: row.homeowner_id, name: row.homeowner_name, email: row.homeowner_email } : row.homeowner_id,
  category: row.category_name ? { _id: row.category_id, name: row.category_name } : row.category_id,
  subCategory: row.sub_category_name ? { _id: row.sub_category_id, name: row.sub_category_name } : row.sub_category_id,

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
    let sql = `
      SELECT 
        j.*,
        c.name as category_name,
        sc.name as sub_category_name,
        u.name as homeowner_name,
        u.email as homeowner_email
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN users u ON j.homeowner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (query.status) {
      sql += ' AND j.status = ?';
      params.push(query.status);
    }
    if (query.homeowner) {
      sql += ' AND j.homeowner_id = ?';
      params.push(query.homeowner);
    }
    if (query._id) {
      sql += ' AND j.id = ?';
      params.push(query._id);
    }

    sql += ' ORDER BY j.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows.map(detailedJobMapper);
  },

  async findById(id) {
    const results = await this.find({ _id: id });
    return results[0] || null;
  },

  async findOne(query) {
    const results = await this.find(query);
    return results[0] || null;
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

    // Return the created job, ideally fetching it to get all fields including defaults
    return this.findById(result.insertId);
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

    // Add other fields updates as necessary...

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
