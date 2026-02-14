
// import pool from '../../config/db';

// const subCategoryToMongoStyle = (row) => {
//   if (!row) return null;
//   return {
//     ...row,
//     _id: row.id,
//     name: row.name,
//     category: row.category_id,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at
//   };
// };


// export const SubCategory = {
//   async find(query = {}) {
//     let sql = `
//       SELECT s.*, c.name as category_name, c.slug as category_slug 
//       FROM sub_categories s
//       LEFT JOIN categories c ON s.category_id = c.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (query.category) {
//       sql += ' AND s.category_id = ?';
//       params.push(query.category);
//     }

//     sql += ' ORDER BY s.name ASC';

//     const [rows] = await pool.query(sql, params);

//     return rows.map(row => ({
//       ...subCategoryToMongoStyle(row),
//       // Enhance with category object to mimic populate
//       category: row.category_name ? { _id: row.category_id, name: row.category_name, slug: row.category_slug } : row.category_id
//     }));
//   },

//   async findOne(query) {
//     let sql = `
//       SELECT s.*, c.name as category_name, c.slug as category_slug 
//       FROM sub_categories s
//       LEFT JOIN categories c ON s.category_id = c.id
//       WHERE 1=1
//     `;
//     const params = [];
//     if (query.name) {
//       sql += ' AND s.name = ?';
//       params.push(query.name);
//     }
//     if (query._id) {
//       sql += ' AND s.id = ?';
//       params.push(query._id);
//     }
//     if (query.category) {
//       sql += ' AND s.category_id = ?';
//       params.push(query.category);
//     }
//     if (query.slug) {
//       sql += ' AND s.slug = ?';
//       params.push(query.slug);
//     }

//     sql += ' LIMIT 1';
//     const [rows] = await pool.query(sql, params);
//     const row = rows[0];
//     if (!row) return null;

//     return {
//       ...subCategoryToMongoStyle(row),
//       category: row.category_name ? { _id: row.category_id, name: row.category_name, slug: row.category_slug } : row.category_id
//     };
//   },

//   async create(data) {
//     const { name, slug, category } = data;
//     const categoryId = category; // mapped from data.category

//     const [result] = await pool.query(
//       'INSERT INTO sub_categories (name, slug, category_id) VALUES (?, ?, ?)',
//       [name, slug, categoryId]
//     );
//     return { _id: result.insertId, name, slug, category: categoryId };
//   },

//   async findByIdAndUpdate(id, data, options = {}) {
//     // Stub implementation
//     return { _id: id, ...data };
//   },

//   async findByIdAndDelete(id) {
//     // Stub implementation
//     return true;
//   }
// };

// export default SubCategory;



import pool from "../../config/db.js";

const subCategoryToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const SubCategory = {
  async find(query = {}) {
    let sql = `
      SELECT s.*, c.name AS category_name, c.slug AS category_slug
      FROM sub_categories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (query.category) {
      sql += " AND s.category_id = ?";
      params.push(query.category);
    }

    sql += " ORDER BY s.name ASC";

    const [rows] = await pool.query(sql, params);

    return rows.map((row) => ({
      ...subCategoryToMongoStyle(row),
      category: row.category_name
        ? {
          _id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
        : row.category_id,
    }));
  },

  async findOne(query) {
    let sql = `
      SELECT s.*, c.name AS category_name, c.slug AS category_slug
      FROM sub_categories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (query._id) {
      sql += " AND s.id = ?";
      params.push(query._id);
    }
    if (query.slug) {
      sql += " AND s.slug = ?";
      params.push(query.slug);
    }

    sql += " LIMIT 1";

    const [rows] = await pool.query(sql, params);
    const row = rows[0];
    if (!row) return null;

    return {
      ...subCategoryToMongoStyle(row),
      category: row.category_name
        ? {
          _id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
        : row.category_id,
    };
  },

  async create(data) {
    const { name, slug, category } = data;

    const [result] = await pool.query(
      "INSERT INTO sub_categories (name, slug, category_id) VALUES (?, ?, ?)",
      [name, slug, category]
    );

    return { _id: result.insertId, name, slug, category };
  },

  // ✅ FIXED UPDATE
  async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.name) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.slug) {
      updates.push("slug = ?");
      values.push(data.slug);
    }
    if (data.category) {
      updates.push("category_id = ?");
      values.push(data.category);
    }

    if (!updates.length) return null;

    values.push(id);

    const [result] = await pool.query(
      `UPDATE sub_categories SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return { _id: id, ...data };
  },

  // ✅ FIXED DELETE (MOST IMPORTANT)
  async findByIdAndDelete(id) {
    const [result] = await pool.query(
      "DELETE FROM sub_categories WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

export default SubCategory;

