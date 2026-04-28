import pool from "../../config/db.js";

const serviceToMongoStyle = (row) => {
  if (!row) return null;
  
  let parsedDescription = row.description;
  try {
    if (typeof row.description === 'string' && (row.description.startsWith('[') || row.description.startsWith('{'))) {
      parsedDescription = JSON.parse(row.description);
    }
  } catch(e) {}

  let parsedFaq = row.faq;
  try {
      if (typeof row.faq === 'string' && (row.faq.startsWith('[') || row.faq.startsWith('{'))) {
          parsedFaq = JSON.parse(row.faq);
      }
  } catch(e) {}

  return {
    ...row,
    _id: row.id,
    description: parsedDescription,
    location: row.location,
    category: row.category_id,
    isActive: row.is_active === 1,
    faq: parsedFaq,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const Service = {
  async find(query = {}) {
    let sql = `
      SELECT s.*, c.name AS category_name, c.slug AS category_slug
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (query.category) {
      sql += " AND s.category_id = ?";
      params.push(query.category);
    }

    if (query.isActive !== undefined) {
      sql += " AND s.is_active = ?";
      params.push(query.isActive ? 1 : 0);
    }

    sql += " ORDER BY s.name ASC";

    const [rows] = await pool.query(sql, params);

    return rows.map((row) => ({
      ...serviceToMongoStyle(row),
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
      FROM services s
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
      ...serviceToMongoStyle(row),
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
    const { name, slug, description, content, category_id, image, is_active, faq, location } = data;

    const [result] = await pool.query(
      "INSERT INTO services (name, slug, description, content, category_id, image, is_active, faq, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name, 
        slug, 
        typeof description === 'object' && description !== null ? JSON.stringify(description) : description, 
        content, 
        category_id, 
        image, 
        is_active ?? 1, 
        typeof faq === 'object' && faq !== null ? JSON.stringify(faq) : faq,
        location || null
      ]
    );

    return { _id: result.insertId, ...data };
  },

  async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    const fieldMap = {
      name: 'name',
      slug: 'slug',
      description: 'description',
      content: 'content',
      category_id: 'category_id',
      image: 'image',
      is_active: 'is_active',
      faq: 'faq',
      location: 'location'
    };

    for (const [key, value] of Object.entries(data)) {
      const col = fieldMap[key];
      if (col && value !== undefined) {
        updates.push(`${col} = ?`);
        values.push((key === 'faq' || key === 'description') && typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
      }
    }

    if (!updates.length) return null;

    values.push(id);

    const [result] = await pool.query(
      `UPDATE services SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findOne({ _id: id });
  },

  async findByIdAndDelete(id) {
    const [result] = await pool.query(
      "DELETE FROM services WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

export default Service;
