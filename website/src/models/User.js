
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
    const user = rows[0] ? userToMongoStyle(rows[0]) : null;
    if (!user) return null;

    return {
      lean: () => Promise.resolve(user),
      ...user
    };
  },

  async find(query = {}, options = {}) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    // Role filtering
    if (query.role) {
      if (typeof query.role === 'object' && query.role.$ne) {
        sql += ' AND role != ?';
        params.push(query.role.$ne);
      } else {
        sql += ' AND role = ?';
        params.push(query.role);
      }
    }

    // Search filtering (Name or Email) - using LIKE
    if (query.$or) {
      const orConditions = [];
      query.$or.forEach(condition => {
        if (condition.name && condition.name.$regex) {
          orConditions.push('name LIKE ?');
          params.push(`%${condition.name.$regex}%`);
        }
        if (condition.email && condition.email.$regex) {
          orConditions.push('email LIKE ?');
          params.push(`%${condition.email.$regex}%`);
        }
      });
      if (orConditions.length > 0) {
        sql += ` AND (${orConditions.join(' OR ')})`;
      }
    }

    // Default sort by created_at DESC
    sql += ' ORDER BY created_at DESC';

    // Pagination
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(options.limit));

      if (options.skip) {
        sql += ' OFFSET ?';
        params.push(parseInt(options.skip));
      }
    }

    const [rows] = await pool.query(sql, params);
    return rows.map(userToMongoStyle);
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
      if (typeof query.role === 'object' && query.role.$ne) {
        sql += ' AND role != ?';
        params.push(query.role.$ne);
      } else {
        sql += ' AND role = ?';
        params.push(query.role);
      }
    }

    if (query.email && !query.$or) {
      sql += ' AND email = ?';
      params.push(query.email);
    }

    // Search filtering (Name or Email) - using LIKE
    if (query.$or) {
      const orConditions = [];
      query.$or.forEach(condition => {
        if (condition.name && condition.name.$regex) {
          orConditions.push('name LIKE ?');
          params.push(`%${condition.name.$regex}%`);
        }
        if (condition.email && condition.email.$regex) {
          orConditions.push('email LIKE ?');
          params.push(`%${condition.email.$regex}%`);
        }
      });
      if (orConditions.length > 0) {
        sql += ` AND (${orConditions.join(' OR ')})`;
      }
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  },

  async findByIdAndDelete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getAssociatedMedia(id) {
    const mediaFiles = [];

    // 1. Get profile image from tradesperson_profiles
    const [tpRows] = await pool.query('SELECT profile_image FROM tradesperson_profiles WHERE user_id = ?', [id]);
    if (tpRows[0]?.profile_image) {
      mediaFiles.push(tpRows[0].profile_image);
    }

    // 2. Get media from jobs (homeowner jobs)
    const [jobRows] = await pool.query('SELECT media FROM jobs WHERE homeowner_id = ?', [id]);
    jobRows.forEach(row => {
      if (row.media) {
        try {
          const media = JSON.parse(row.media);
          if (Array.isArray(media)) {
            media.forEach(item => {
              if (item.url) mediaFiles.push(item.url);
            });
          }
        } catch (e) {
          console.error('Error parsing job media:', e);
        }
      }
    });

    return mediaFiles;
  }
};
