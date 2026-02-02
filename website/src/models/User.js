
import pool from '../../config/db';

const userToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id, // Alias id as _id for compatibility
  };
};

export const User = {
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return {
      lean: () => Promise.resolve(userToMongoStyle(rows[0])), // Mock lean() for compatibility
      ...userToMongoStyle(rows[0])
    };
  },

  async findOne(query) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (query.email) {
      sql += ' AND email = ?';
      params.push(query.email);
    }

    // Add other fields as needed
    if (query.passwordResetToken) {
      sql += ' AND password_reset_token = ?';
      params.push(query.passwordResetToken);
    }

    // Add logic for other fields if encountered...

    sql += ' LIMIT 1';

    const [rows] = await pool.query(sql, params);
    return userToMongoStyle(rows[0]);
  },

  async create(userData) {
    const { email, password, name, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, password, name, role]
    );

    return {
      _id: result.insertId,
      email,
      password,
      name,
      role
    };
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    // Prepare update query
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      // simple snake_case conversion for known fields or keep as is if column name matches
      let column = key;
      if (key === 'passwordResetToken') column = 'password_reset_token';
      if (key === 'passwordResetExpires') column = 'password_reset_expires';

      updates.push(`${column} = ?`);
      values.push(value);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (options.new) {
      return this.findById(id);
    }
  },

  async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params = [];

    if (query.role) {
      sql += ' AND role = ?';
      params.push(query.role);
    }
    if (query.email) {
      sql += ' AND email = ?';
      params.push(query.email);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  },

  async findByIdAndDelete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};
