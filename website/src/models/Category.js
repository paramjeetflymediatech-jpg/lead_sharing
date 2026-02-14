
import pool from '../../config/db.js';

const categoryToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const Category = {
  async find(query = {}) {
    let sql = 'SELECT * FROM categories ORDER BY name ASC';
    const [rows] = await pool.query(sql);
    return rows.map(categoryToMongoStyle);
  },

  async findOne(query) {
    let sql = 'SELECT * FROM categories WHERE 1=1';
    const params = [];
    if (query.slug) {
      sql += ' AND slug = ?';
      params.push(query.slug);
    }
    if (query._id) {
      sql += ' AND id = ?';
      params.push(query._id);
    }

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return categoryToMongoStyle(rows[0]);
  },

  async create(data) {
    const { name, slug } = data;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    return { _id: result.insertId, name, slug };
  },

  async findByIdAndUpdate(id, data, options = {}) {
    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return { _id: id, ...data }; // Stub return
  },

  async findByIdAndDelete(id) {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Category;
