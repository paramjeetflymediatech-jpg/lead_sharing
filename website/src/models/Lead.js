
// import pool from '../../config/db';

// const simpleLeadMapper = (row) => ({
//   _id: row.id,
//   job: row.job_id,
//   tradesperson: row.tradesperson_id,
//   message: row.message,
//   priceEstimate: row.price_estimate,
//   isUnlocked: row.is_unlocked,
//   createdAt: row.created_at,
//   updatedAt: row.updated_at
// });

// export const Lead = {
//   async find(query = {}) {
//     let sql = 'SELECT * FROM leads WHERE 1=1';
//     const params = [];

//     if (query.job) {
//       sql += ' AND job_id = ?';
//       params.push(query.job);
//     }
//     if (query.tradesperson) {
//       sql += ' AND tradesperson_id = ?';
//       params.push(query.tradesperson);
//     }
//     if (query.isUnlocked !== undefined) {
//       sql += ' AND is_unlocked = ?';
//       params.push(query.isUnlocked);
//     }

//     sql += ' ORDER BY created_at DESC';
//     const [rows] = await pool.query(sql, params);
//     return rows.map(simpleLeadMapper);
//   },

//   async findById(id) {
//     const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
//     return rows[0] ? simpleLeadMapper(rows[0]) : null;
//   },

//   async findOne(query) {
//     let sql = 'SELECT * FROM leads WHERE 1=1';
//     const params = [];

//     if (query._id) { sql += ' AND id = ?'; params.push(query._id); }
//     if (query.job) { sql += ' AND job_id = ?'; params.push(query.job); }
//     if (query.tradesperson) { sql += ' AND tradesperson_id = ?'; params.push(query.tradesperson); }
//     if (query.isUnlocked !== undefined) { sql += ' AND is_unlocked = ?'; params.push(query.isUnlocked); }

//     sql += ' LIMIT 1';
//     const [rows] = await pool.query(sql, params);
//     return rows[0] ? simpleLeadMapper(rows[0]) : null;
//   },

//   async countDocuments(query = {}) {
//     let sql = 'SELECT COUNT(*) as count FROM leads WHERE 1=1';
//     const params = [];

//     // Handle job query with $in operator (MongoDB style)
//     if (query.job) {
//       if (query.job.$in && Array.isArray(query.job.$in)) {
//         if (query.job.$in.length === 0) {
//           // Empty array - no results
//           return 0;
//         }
//         const placeholders = query.job.$in.map(() => '?').join(',');
//         sql += ` AND job_id IN (${placeholders})`;
//         params.push(...query.job.$in);
//       } else {
//         sql += ' AND job_id = ?';
//         params.push(query.job);
//       }
//     }

//     if (query.tradesperson) {
//       sql += ' AND tradesperson_id = ?';
//       params.push(query.tradesperson);
//     }
//     if (query.isUnlocked !== undefined) {
//       sql += ' AND is_unlocked = ?';
//       params.push(query.isUnlocked);
//     }

//     // Support for date range queries (MongoDB $gte style)
//     if (query.createdAt) {
//       if (query.createdAt.$gte) {
//         sql += ' AND created_at >= ?';
//         params.push(query.createdAt.$gte);
//       }
//       if (query.createdAt.$lte) {
//         sql += ' AND created_at <= ?';
//         params.push(query.createdAt.$lte);
//       }
//     }

//     const [rows] = await pool.query(sql, params);
//     return rows[0].count;
//   },

//   async create(leadData) {
//     const { job, tradesperson, message, priceEstimate, isUnlocked } = leadData;
//     const [result] = await pool.query(
//       'INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked) VALUES (?, ?, ?, ?, ?)',
//       [job, tradesperson, message || '', priceEstimate || null, isUnlocked || false]
//     );
//     return {
//       _id: result.insertId,
//       job,
//       tradesperson,
//       message,
//       priceEstimate,
//       isUnlocked: isUnlocked || false
//     };
//   },

//   async findByIdAndUpdate(id, updateData) {
//     const updates = [];
//     const values = [];

//     if (updateData.isUnlocked !== undefined) {
//       updates.push('is_unlocked = ?');
//       values.push(updateData.isUnlocked);
//     }
//     if (updateData.message !== undefined) {
//       updates.push('message = ?');
//       values.push(updateData.message);
//     }
//     if (updateData.priceEstimate !== undefined) {
//       updates.push('price_estimate = ?');
//       values.push(updateData.priceEstimate);
//     }

//     if (updates.length > 0) {
//       values.push(id);
//       await pool.query(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, values);
//     }

//     return this.findById(id);
//   }
// };

// export default Lead;



import pool from '../../config/db';

const simpleLeadMapper = (row) => ({
  _id: row.id,
  job: row.job_id,
  tradesperson: row.tradesperson_id,
  message: row.message,
  priceEstimate: row.price_estimate,
  isUnlocked: row.is_unlocked,
  status: row.status, // ✅ Add status field
  unlockedAt: row.unlocked_at, // ✅ Add unlocked_at field
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const Lead = {
  async find(query = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (query.job) {
      sql += ' AND job_id = ?';
      params.push(query.job);
    }
    if (query.tradesperson) {
      sql += ' AND tradesperson_id = ?';
      params.push(query.tradesperson);
    }
    if (query.isUnlocked !== undefined) {
      sql += ' AND is_unlocked = ?';
      params.push(query.isUnlocked);
    }
    // ✅ Add status filter
    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows.map(simpleLeadMapper);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows[0] ? simpleLeadMapper(rows[0]) : null;
  },

  async findOne(query) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (query._id) { sql += ' AND id = ?'; params.push(query._id); }
    if (query.job) { sql += ' AND job_id = ?'; params.push(query.job); }
    if (query.tradesperson) { sql += ' AND tradesperson_id = ?'; params.push(query.tradesperson); }
    if (query.isUnlocked !== undefined) { sql += ' AND is_unlocked = ?'; params.push(query.isUnlocked); }
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); } // ✅ Add status filter

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return rows[0] ? simpleLeadMapper(rows[0]) : null;
  },

  async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM leads WHERE 1=1';
    const params = [];

    // Handle job query with $in operator (MongoDB style)
    if (query.job) {
      if (query.job.$in && Array.isArray(query.job.$in)) {
        if (query.job.$in.length === 0) {
          // Empty array - no results
          return 0;
        }
        const placeholders = query.job.$in.map(() => '?').join(',');
        sql += ` AND job_id IN (${placeholders})`;
        params.push(...query.job.$in);
      } else {
        sql += ' AND job_id = ?';
        params.push(query.job);
      }
    }

    if (query.tradesperson) {
      sql += ' AND tradesperson_id = ?';
      params.push(query.tradesperson);
    }
    if (query.isUnlocked !== undefined) {
      sql += ' AND is_unlocked = ?';
      params.push(query.isUnlocked);
    }
    // ✅ Add status count
    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }

    // Support for date range queries (MongoDB $gte style)
    if (query.createdAt) {
      if (query.createdAt.$gte) {
        sql += ' AND created_at >= ?';
        params.push(query.createdAt.$gte);
      }
      if (query.createdAt.$lte) {
        sql += ' AND created_at <= ?';
        params.push(query.createdAt.$lte);
      }
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  },

  async create(leadData) {
    const { job, tradesperson, message, priceEstimate, isUnlocked, status } = leadData;
    const [result] = await pool.query(
      'INSERT INTO leads (job_id, tradesperson_id, message, price_estimate, is_unlocked, status) VALUES (?, ?, ?, ?, ?, ?)',
      [job, tradesperson, message || '', priceEstimate || null, isUnlocked || false, status || 'PENDING'] // ✅ Add status
    );
    return {
      _id: result.insertId,
      job,
      tradesperson,
      message,
      priceEstimate,
      isUnlocked: isUnlocked || false,
      status: status || 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  async findByIdAndUpdate(id, updateData) {
    const updates = [];
    const values = [];

    if (updateData.isUnlocked !== undefined) {
      updates.push('is_unlocked = ?');
      values.push(updateData.isUnlocked);
      // If unlocking, set unlocked_at
      if (updateData.isUnlocked === true) {
        updates.push('unlocked_at = NOW()');
      }
    }
    if (updateData.message !== undefined) {
      updates.push('message = ?');
      values.push(updateData.message);
    }
    if (updateData.priceEstimate !== undefined) {
      updates.push('price_estimate = ?');
      values.push(updateData.priceEstimate);
    }
    // ✅ Add status update
    if (updateData.status !== undefined) {
      updates.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.unlockedAt !== undefined) {
      updates.push('unlocked_at = ?');
      values.push(updateData.unlockedAt);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()'); // Always update timestamp
      values.push(id);
      await pool.query(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.findById(id);
  },

  // ✅ New method to update multiple leads for a job (for hiring)
  async updateLeadsByJob(jobId, updates) {
    const { hiredLeadId, statusUpdates } = updates;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // If hiring, update hired lead to HIRED and others to REJECTED
      if (hiredLeadId && statusUpdates === 'HIRING') {
        // Update hired lead
        await connection.query(
          `UPDATE leads SET status = 'HIRED', updated_at = NOW() WHERE id = ?`,
          [hiredLeadId]
        );
        
        // Update all other leads for this job to REJECTED
        await connection.query(
          `UPDATE leads SET status = 'REJECTED', updated_at = NOW() 
           WHERE job_id = ? AND id != ?`,
          [jobId, hiredLeadId]
        );
      }
      // If you want to batch update statuses
      else if (statusUpdates && Array.isArray(statusUpdates)) {
        for (const update of statusUpdates) {
          await connection.query(
            `UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?`,
            [update.status, update.leadId]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // ✅ New method to get leads by status
  async findByStatus(status, options = {}) {
    let sql = 'SELECT * FROM leads WHERE status = ?';
    const params = [status];

    if (options.tradespersonId) {
      sql += ' AND tradesperson_id = ?';
      params.push(options.tradespersonId);
    }

    if (options.jobId) {
      sql += ' AND job_id = ?';
      params.push(options.jobId);
    }

    sql += ' ORDER BY created_at DESC';
    
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const [rows] = await pool.query(sql, params);
    return rows.map(simpleLeadMapper);
  }
};

export default Lead;