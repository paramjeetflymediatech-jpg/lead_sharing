
import pool from '@/../config/db.js';
import { Job } from './Job.js';
import { Payment } from './Payment.js';

const userToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id, // Alias id as _id for compatibility
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile_image: row.profile_image, // Ensure this field is passed through
    profileImage: row.profile_image   // Add camelCase alias for convenience
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
    const { email, password, name, role, phone } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name, role, phone) VALUES (?, ?, ?, ?, ?)',
      [email, password, name, role, phone]
    );

    return {
      _id: result.insertId,
      email,
      password,
      name,
      role,
      phone
    };
  },

  async saveAuthToken(userId, token, expiresAt, deviceInfo = {}) {
    const { deviceId = null, deviceType = null } = deviceInfo;

    // Legacy column update
    await pool.query(
      'UPDATE users SET auth_token = ?, auth_token_expires = ? WHERE id = ?',
      [token, expiresAt, userId]
    );

    // New multi-session support with device info
    await pool.query(
      'INSERT INTO auth_tokens (user_id, token, expires_at, device_id, device_type) VALUES (?, ?, ?, ?, ?)',
      [userId, token, expiresAt, deviceId, deviceType]
    );
  },

  async findToken(token) {
    const [rows] = await pool.query(
      'SELECT user_id, device_id, device_type FROM auth_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async revokeAuthToken(token) {
    // Revoke from users table (legacy)
    await pool.query('UPDATE users SET auth_token = NULL, auth_token_expires = NULL WHERE auth_token = ?', [token]);

    // Revoke from auth_tokens table (new)
    await pool.query('DELETE FROM auth_tokens WHERE token = ?', [token]);
  },

  async savePushToken(userId, token, platform = 'mobile') {
    await pool.query(
      'INSERT INTO push_tokens (user_id, token, platform) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE user_id = ?',
      [userId, token, platform, userId]
    );
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
    try {
      // 0. Get Tradesperson Profile ID first (if exists)
      const [profiles] = await pool.query('SELECT id FROM tradesperson_profiles WHERE user_id = ?', [id]);
      const profileId = profiles[0]?.id;

      // 1. Delete messages (both sent and received)
      await pool.query('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [id, id]);

      // 2. Delete tradesperson_ratings
      // As homeowner (using user_id)
      await pool.query('DELETE FROM tradesperson_ratings WHERE homeowner_id = ?', [id]);

      // As tradesperson (using profile_id)
      if (profileId) {
        await pool.query('DELETE FROM tradesperson_ratings WHERE tradesperson_id = ?', [profileId]);
      }

      // 3. Delete leads (as tradesperson - using profile_id)
      if (profileId) {
        await pool.query('DELETE FROM leads WHERE tradesperson_id = ?', [profileId]);
      }

      // 4. Delete payments (associated with user)
      await Payment.deleteByUserId(id);

      // 5. Delete jobs (as homeowner)
      const [jobs] = await pool.query('SELECT id FROM jobs WHERE homeowner_id = ?', [id]);
      if (jobs.length > 0) {
        // Use Job model for cascading delete
        const jobIds = jobs.map(j => j.id);
        // We can't easily use Job.deleteMany with array of IDs if it expects query object for mongo style
        // But Job.deleteMany implementation in Job.js iterates over rows found by query.
        // Let's just use loop here to be safe and use Job model logic
        for (const job of jobs) {
          await Job.deleteOne({ _id: job.id });
        }
      }

      // 6. Nullify hired_tradesperson_id in jobs if this user was hired (as tradesperson - using profile_id)
      if (profileId) {
        await pool.query('UPDATE jobs SET hired_tradesperson_id = NULL WHERE hired_tradesperson_id = ?', [profileId]);
      }

      // 7. Delete tradesperson_profiles
      await pool.query('DELETE FROM tradesperson_profiles WHERE user_id = ?', [id]);

      // 8. Delete associated media (local files)
      // Note: Admin route handles file cleanup via getAssociatedMedia. 
      // Here we focus on DB cleanup. File cleanup should ideally be handled by a service or job.

      // 9. Finally delete the user
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in User.findByIdAndDelete (manual cascade):', error);
      throw error;
    }
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
  },

  // Pending user methods for delayed registration
  async createPending(userData) {
    const { email, password, name, role, phone, companyName } = userData;

    // DEBUG
    const [dbRes] = await pool.query("SELECT DATABASE() as db");
    console.log(`[User.createPending] Using DB: ${dbRes[0].db}`);

    const [result] = await pool.query(
      'INSERT INTO pending_users (email, password, name, role, phone, company_name) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, role, phone, companyName]
    );

    console.log(`[User.createPending] INSERT SUCCESS. ID: ${result.insertId}`);

    // DEBUG: Dump table
    const [all] = await pool.query("SELECT id, email FROM pending_users");
    console.log(`[User.createPending] Current table state: ${JSON.stringify(all)}`);

    return {
      id: result.insertId,
      _id: result.insertId,
      email,
      name,
      role,
      phone,
      companyName
    };
  },

  async findPendingById(id) {
    const [rows] = await pool.query('SELECT * FROM pending_users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async deletePending(id) {
    await pool.query('DELETE FROM pending_users WHERE id = ?', [id]);
  }
};
