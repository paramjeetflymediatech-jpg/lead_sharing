import pool from "../../config/db.js";

export const Location = {
  async find() {
    const [rows] = await pool.query(
      "SELECT * FROM locations ORDER BY name ASC"
    );
    return rows.map(row => ({
      ...row,
      _id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async findOne(query) {
    let sql = "SELECT * FROM locations WHERE 1=1";
    const params = [];

    if (query._id) {
      sql += " AND id = ?";
      params.push(query._id);
    }
    if (query.slug) {
      sql += " AND slug = ?";
      params.push(query.slug);
    }

    sql += " LIMIT 1";

    const [rows] = await pool.query(sql, params);
    if (!rows.length) return null;

    const row = rows[0];
    return {
      ...row,
      _id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  async create(data) {
    const { name, slug } = data;
    const [result] = await pool.query(
      "INSERT INTO locations (name, slug) VALUES (?, ?)",
      [name, slug]
    );
    return { _id: result.insertId, name, slug };
  },

  async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push("slug = ?");
      values.push(data.slug);
    }

    if (!updates.length) return null;

    values.push(id);

    const [result] = await pool.query(
      `UPDATE locations SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findOne({ _id: id });
  },

  async findByIdAndDelete(id) {
    const [result] = await pool.query(
      "DELETE FROM locations WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
};

export default Location;
