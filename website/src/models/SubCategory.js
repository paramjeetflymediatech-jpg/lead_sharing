
import pool from '../../config/db';

const subCategoryToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    name: row.name,
    category: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};


export const SubCategory = {
  async find(query = {}) {
    let sql = 'SELECT * FROM sub_categories ORDER BY name ASC';
    const [rows] = await pool.query(sql);
    return rows.map(subCategoryToMongoStyle);
  },

  async findOne(query) {
    let sql = 'SELECT * FROM sub_categories WHERE 1=1';
    const params = [];
    if (query.name) {
      sql += ' AND name = ?';
      params.push(query.name);
    }
    if (query._id) {
      sql += ' AND id = ?';
      params.push(query._id);
    }
    if (query.category) {
      sql += ' AND category_id = ?';
      params.push(query.category);
    }

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return subCategoryToMongoStyle(rows[0]);
  },

  async create(data) {
    // ... insert logic
    // Stub for now to prevent build errors
    return { _id: 1, ...data };
  },

  async findByIdAndUpdate(id, data, options = {}) {
    // Stub implementation
    return { _id: id, ...data };
  },

  async findByIdAndDelete(id) {
    // Stub implementation
    return true;
  }
};

export default SubCategory;
