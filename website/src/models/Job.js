
// import pool from '../../config/db';

// const detailedJobMapper = (row) => ({
//   _id: row.id,
//   description: row.description,
//   status: row.status,
//   createdAt: row.created_at,
//   updatedAt: row.updated_at,
//   budgetMin: row.budget_min,
//   budgetMax: row.budget_max,
//   // Populate objects if names exist, otherwise fall back to ID
//   homeowner: row.homeowner_name ? { _id: row.homeowner_id, name: row.homeowner_name, email: row.homeowner_email } : row.homeowner_id,
//   category: row.category_name ? { _id: row.category_id, name: row.category_name } : row.category_id,
//   subCategory: row.sub_category_name ? { _id: row.sub_category_id, name: row.sub_category_name } : row.sub_category_id,

//   location: { city: row.city || '', postcode: row.postcode || '' },
//   contactName: row.contact_name,
//   contactEmail: row.contact_email,
//   contactPhone: row.contact_phone,
//   jobStage: row.job_stage,
//   ownership: row.ownership,
//   startTime: row.start_time,
// });

// export const Job = {
//   async find(query = {}) {
//     let sql = `
//       SELECT 
//         j.*,
//         c.name as category_name,
//         sc.name as sub_category_name,
//         u.name as homeowner_name,
//         u.email as homeowner_email
//       FROM jobs j
//       LEFT JOIN categories c ON j.category_id = c.id
//       LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
//       LEFT JOIN users u ON j.homeowner_id = u.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (query.status) {
//       sql += ' AND j.status = ?';
//       params.push(query.status);
//     }
//     if (query.homeowner) {
//       sql += ' AND j.homeowner_id = ?';
//       params.push(query.homeowner);
//     }
//     if (query._id) {
//       sql += ' AND j.id = ?';
//       params.push(query._id);
//     }

//     sql += ' ORDER BY j.created_at DESC';
//     const [rows] = await pool.query(sql, params);
//     return rows.map(detailedJobMapper);
//   },

//   async findById(id) {
//     const results = await this.find({ _id: id });
//     return results[0] || null;
//   },

//   async findOne(query) {
//     const results = await this.find(query);
//     return results[0] || null;
//   },

//   async countDocuments(query = {}) {
//     let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
//     const params = [];

//     if (query.status) {
//       sql += ' AND status = ?';
//       params.push(query.status);
//     }
//     if (query.homeowner) {
//       sql += ' AND homeowner_id = ?';
//       params.push(query.homeowner);
//     }

//     const [rows] = await pool.query(sql, params);
//     return rows[0].count;
//   },

//   async create(data) {
//     const {
//       description,
//       homeowner,
//       category,
//       subCategory,
//       budgetMin,
//       budgetMax,
//       city,
//       postcode,
//       contactName,
//       contactEmail,
//       contactPhone,
//       jobStage,
//       ownership,
//       startTime,
//       status = 'OPEN'
//     } = data;

//     const [result] = await pool.query(
//       `INSERT INTO jobs (description, homeowner_id, category_id, sub_category_id, budget_min, budget_max, city, postcode, contact_name, contact_email, contact_phone, job_stage, ownership, start_time, status) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         description,
//         homeowner,
//         category,
//         subCategory,
//         budgetMin || 0,
//         budgetMax || 0,
//         city || '',
//         postcode || '',
//         contactName || '',
//         contactEmail || '',
//         contactPhone || '',
//         jobStage || 'PLANNING',
//         ownership || 'OWN',
//         startTime || 'FLEXIBLE',
//         status
//       ]
//     );

//     // Return the created job, ideally fetching it to get all fields including defaults
//     return this.findById(result.insertId);
//   },

//   async findByIdAndUpdate(id, updateData, options = {}) {
//     const updates = [];
//     const values = [];

//     if (updateData.status) {
//       updates.push('status = ?');
//       values.push(updateData.status);
//     }
//     if (updateData.description) {
//       updates.push('description = ?');
//       values.push(updateData.description);
//     }
//     if (updateData.budgetMin !== undefined) {
//       updates.push('budget_min = ?');
//       values.push(updateData.budgetMin);
//     }
//     if (updateData.budgetMax !== undefined) {
//       updates.push('budget_max = ?');
//       values.push(updateData.budgetMax);
//     }

//     // Add other fields updates as necessary...

//     if (updates.length > 0) {
//       values.push(id);
//       await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, values);
//     }

//     if (options.new) {
//       return this.findById(id);
//     }
//   }
// };

// export default Job;






















// import pool from '../../config/db';

// const detailedJobMapper = (row) => ({
//   _id: row.id,
//   description: row.description,
//   status: row.status,
//   createdAt: row.created_at,
//   updatedAt: row.updated_at,
//   budgetMin: row.budget_min,
//   budgetMax: row.budget_max,
//   // Populate objects if names exist, otherwise fall back to ID
//   homeowner: row.homeowner_name ? { _id: row.homeowner_id, name: row.homeowner_name, email: row.homeowner_email } : row.homeowner_id,
//   category: row.category_name ? { _id: row.category_id, name: row.category_name } : row.category_id,
//   subCategory: row.sub_category_name ? { _id: row.sub_category_id, name: row.sub_category_name } : row.sub_category_id,

//   location: { city: row.city || '', postcode: row.postcode || '' },
//   contactName: row.contact_name,
//   contactEmail: row.contact_email,
//   contactPhone: row.contact_phone,
//   jobStage: row.job_stage,
//   ownership: row.ownership,
//   startTime: row.start_time,
//   media: row.media ? JSON.parse(row.media) : [],
// });

// export const Job = {
//   async find(query = {}) {
//     let sql = `
//       SELECT 
//         j.*,
//         c.name as category_name,
//         sc.name as sub_category_name,
//         u.name as homeowner_name,
//         u.email as homeowner_email
//       FROM jobs j
//       LEFT JOIN categories c ON j.category_id = c.id
//       LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
//       LEFT JOIN users u ON j.homeowner_id = u.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (query.status) {
//       sql += ' AND j.status = ?';
//       params.push(query.status);
//     }
//     if (query.homeowner) {
//       sql += ' AND j.homeowner_id = ?';
//       params.push(query.homeowner);
//     }
//     if (query._id) {
//       sql += ' AND j.id = ?';
//       params.push(query._id);
//     }

//     sql += ' ORDER BY j.created_at DESC';
//     const [rows] = await pool.query(sql, params);
//     return rows.map(detailedJobMapper);
//   },

//   async findById(id) {
//     const results = await this.find({ _id: id });
//     return results[0] || null;
//   },

//   async findOne(query) {
//     const results = await this.find(query);
//     return results[0] || null;
//   },

//   async countDocuments(query = {}) {
//     let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
//     const params = [];

//     if (query.status) {
//       sql += ' AND status = ?';
//       params.push(query.status);
//     }
//     if (query.homeowner) {
//       sql += ' AND homeowner_id = ?';
//       params.push(query.homeowner);
//     }

//     const [rows] = await pool.query(sql, params);
//     return rows[0].count;
//   },

//   async create(data) {
//     const {
//       description,
//       homeowner,
//       category,
//       subCategory,
//       budgetMin,
//       budgetMax,
//       city,
//       postcode,
//       contactName,
//       contactEmail,
//       contactPhone,
//       jobStage,
//       ownership,
//       startTime,
//       status = 'OPEN',
//       media = []
//     } = data;

//     const [result] = await pool.query(
//       `INSERT INTO jobs (description, homeowner_id, category_id, sub_category_id, budget_min, budget_max, city, postcode, contact_name, contact_email, contact_phone, job_stage, ownership, start_time, status, media) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         description,
//         homeowner,
//         category,
//         subCategory,
//         budgetMin || 0,
//         budgetMax || 0,
//         city || '',
//         postcode || '',
//         contactName || '',
//         contactEmail || '',
//         contactPhone || '',
//         jobStage || 'PLANNING',
//         ownership || 'OWN',
//         startTime || 'FLEXIBLE',
//         status,
//         JSON.stringify(media)
//       ]
//     );

//     // Return the created job, ideally fetching it to get all fields including defaults
//     return this.findById(result.insertId);
//   },

//   async findByIdAndUpdate(id, updateData, options = {}) {
//     const updates = [];
//     const values = [];

//     // Handle $set operator if present
//     const dataToUpdate = updateData.$set || updateData;

//     if (dataToUpdate.status !== undefined) {
//       updates.push('status = ?');
//       values.push(dataToUpdate.status);
//     }
//     if (dataToUpdate.description !== undefined) {
//       updates.push('description = ?');
//       values.push(dataToUpdate.description);
//     }
//     if (dataToUpdate.budgetMin !== undefined) {
//       updates.push('budget_min = ?');
//       values.push(dataToUpdate.budgetMin);
//     }
//     if (dataToUpdate.budgetMax !== undefined) {
//       updates.push('budget_max = ?');
//       values.push(dataToUpdate.budgetMax);
//     }
//     if (dataToUpdate.category !== undefined) {
//       updates.push('category_id = ?');
//       values.push(dataToUpdate.category);
//     }
//     if (dataToUpdate.subCategory !== undefined) {
//       updates.push('sub_category_id = ?');
//       values.push(dataToUpdate.subCategory);
//     }
//     if (dataToUpdate.location !== undefined) {
//       if (dataToUpdate.location.city !== undefined) {
//         updates.push('city = ?');
//         values.push(dataToUpdate.location.city);
//       }
//       if (dataToUpdate.location.postcode !== undefined) {
//         updates.push('postcode = ?');
//         values.push(dataToUpdate.location.postcode);
//       }
//     }
//     if (dataToUpdate.contactName !== undefined) {
//       updates.push('contact_name = ?');
//       values.push(dataToUpdate.contactName);
//     }
//     if (dataToUpdate.contactEmail !== undefined) {
//       updates.push('contact_email = ?');
//       values.push(dataToUpdate.contactEmail);
//     }
//     if (dataToUpdate.contactPhone !== undefined) {
//       updates.push('contact_phone = ?');
//       values.push(dataToUpdate.contactPhone);
//     }
//     if (dataToUpdate.jobStage !== undefined) {
//       updates.push('job_stage = ?');
//       values.push(dataToUpdate.jobStage);
//     }
//     if (dataToUpdate.ownership !== undefined) {
//       updates.push('ownership = ?');
//       values.push(dataToUpdate.ownership);
//     }
//     if (dataToUpdate.startTime !== undefined) {
//       updates.push('start_time = ?');
//       values.push(dataToUpdate.startTime);
//     }
//     if (dataToUpdate.media !== undefined) {
//       updates.push('media = ?');
//       values.push(JSON.stringify(dataToUpdate.media));
//     }

//     // Always update the updated_at timestamp
//     updates.push('updated_at = NOW()');

//     if (updates.length > 0) {
//       values.push(id);
//       await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, values);
//     }

//     if (options.new) {
//       return this.findById(id);
//     }

//     return null;
//   },

//   async findOneAndUpdate(query, updateData, options = {}) {
//     // Find the record first
//     const record = await this.findOne(query);
//     if (!record) {
//       return null;
//     }

//     // Update using the ID
//     return this.findByIdAndUpdate(record._id, updateData, options);
//   },

//   async deleteOne(query) {
//     const params = [];
//     let sql = 'DELETE FROM jobs WHERE 1=1';

//     if (query._id) {
//       sql += ' AND id = ?';
//       params.push(query._id);
//     }
//     if (query.homeowner) {
//       sql += ' AND homeowner_id = ?';
//       params.push(query.homeowner);
//     }

//     const [result] = await pool.query(sql, params);
//     return {
//       deletedCount: result.affectedRows
//     };
//   },

//   async deleteMany(query) {
//     const params = [];
//     let sql = 'DELETE FROM jobs WHERE 1=1';

//     if (query.status) {
//       sql += ' AND status = ?';
//       params.push(query.status);
//     }
//     if (query.homeowner) {
//       sql += ' AND homeowner_id = ?';
//       params.push(query.homeowner);
//     }

//     const [result] = await pool.query(sql, params);
//     return {
//       deletedCount: result.affectedRows
//     };
//   }
// };

// export default Job;





















import pool from '../../config/db.js';

const detailedJobMapper = (row) => ({
  _id: row.id,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  budgetMin: row.budget_min,
  budgetMax: row.budget_max,
  hasRated: row.has_rated || false, // NEW FIELD
  // Populate objects if names exist, otherwise fall back to ID
  homeowner: row.homeowner_name ? { _id: row.homeowner_id, name: row.homeowner_name, email: row.homeowner_email } : row.homeowner_id,
  category: row.category_name ? { _id: row.category_id, name: row.category_name } : row.category_id,
  subCategory: row.sub_category_name ? { _id: row.sub_category_id, name: row.sub_category_name } : row.sub_category_id,
  hiredTradesperson: row.hired_tradesperson_id,
  hiredTradespersonName: row.hired_tradesperson_name, // NEW FIELD for tradesperson name
  hiredAt: row.hired_at,
  location: { city: row.city || '', postcode: row.postcode || '' },
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  jobStage: row.job_stage,
  ownership: row.ownership,
  startTime: row.start_time,
  media: row.media ? JSON.parse(row.media) : [],
});

export const Job = {
  async find(query = {}) {
    let sql = `
      SELECT 
        j.*,
        c.name as category_name,
        sc.name as sub_category_name,
        u.name as homeowner_name,
        u.email as homeowner_email,
        t.name as hired_tradesperson_name
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN sub_categories sc ON j.sub_category_id = sc.id
      LEFT JOIN users u ON j.homeowner_id = u.id
      LEFT JOIN users t ON j.hired_tradesperson_id = t.id
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
      status = 'OPEN',
      media = []
    } = data;

    const [result] = await pool.query(
      `INSERT INTO jobs (description, homeowner_id, category_id, sub_category_id, budget_min, budget_max, city, postcode, contact_name, contact_email, contact_phone, job_stage, ownership, start_time, status, media) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        status,
        JSON.stringify(media)
      ]
    );

    // Return the created job, ideally fetching it to get all fields including defaults
    return this.findById(result.insertId);
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const updates = [];
    const values = [];

    // Handle $set operator if present
    const dataToUpdate = updateData.$set || updateData;

    if (dataToUpdate.status !== undefined) {
      updates.push('status = ?');
      values.push(dataToUpdate.status);
    }
    if (dataToUpdate.description !== undefined) {
      updates.push('description = ?');
      values.push(dataToUpdate.description);
    }
    if (dataToUpdate.budgetMin !== undefined) {
      updates.push('budget_min = ?');
      values.push(dataToUpdate.budgetMin);
    }
    if (dataToUpdate.budgetMax !== undefined) {
      updates.push('budget_max = ?');
      values.push(dataToUpdate.budgetMax);
    }
    if (dataToUpdate.category !== undefined) {
      updates.push('category_id = ?');
      values.push(dataToUpdate.category);
    }
    if (dataToUpdate.subCategory !== undefined) {
      updates.push('sub_category_id = ?');
      values.push(dataToUpdate.subCategory);
    }
    if (dataToUpdate.location !== undefined) {
      if (dataToUpdate.location.city !== undefined) {
        updates.push('city = ?');
        values.push(dataToUpdate.location.city);
      }
      if (dataToUpdate.location.postcode !== undefined) {
        updates.push('postcode = ?');
        values.push(dataToUpdate.location.postcode);
      }
    }
    if (dataToUpdate.contactName !== undefined) {
      updates.push('contact_name = ?');
      values.push(dataToUpdate.contactName);
    }
    if (dataToUpdate.contactEmail !== undefined) {
      updates.push('contact_email = ?');
      values.push(dataToUpdate.contactEmail);
    }
    if (dataToUpdate.contactPhone !== undefined) {
      updates.push('contact_phone = ?');
      values.push(dataToUpdate.contactPhone);
    }
    if (dataToUpdate.jobStage !== undefined) {
      updates.push('job_stage = ?');
      values.push(dataToUpdate.jobStage);
    }
    if (dataToUpdate.ownership !== undefined) {
      updates.push('ownership = ?');
      values.push(dataToUpdate.ownership);
    }
    if (dataToUpdate.startTime !== undefined) {
      updates.push('start_time = ?');
      values.push(dataToUpdate.startTime);
    }
    if (dataToUpdate.media !== undefined) {
      updates.push('media = ?');
      values.push(JSON.stringify(dataToUpdate.media));
    }
    // NEW: Handle has_rated field
    if (dataToUpdate.hasRated !== undefined) {
      updates.push('has_rated = ?');
      values.push(dataToUpdate.hasRated);
    }
    // NEW: Handle hired_tradesperson_id
    if (dataToUpdate.hiredTradesperson !== undefined) {
      updates.push('hired_tradesperson_id = ?');
      values.push(dataToUpdate.hiredTradesperson);
    }
    // NEW: Handle hired_at
    if (dataToUpdate.hiredAt !== undefined) {
      updates.push('hired_at = ?');
      values.push(dataToUpdate.hiredAt);
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = NOW()');

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (options.new) {
      return this.findById(id);
    }

    return null;
  },

  async findOneAndUpdate(query, updateData, options = {}) {
    // Find the record first
    const record = await this.findOne(query);
    if (!record) {
      return null;
    }

    // Update using the ID
    return this.findByIdAndUpdate(record._id, updateData, options);
  },

  async deleteOne(query) {
    const params = [];
    if (!query._id) return { deletedCount: 0 };

    const jobId = query._id;

    try {
      // 1. Delete messages related to this job
      await pool.query('DELETE FROM messages WHERE job_id = ?', [jobId]);

      // 2. Delete tradesperson_ratings related to this job
      await pool.query('DELETE FROM tradesperson_ratings WHERE job_id = ?', [jobId]);

      // 3. Delete leads related to this job
      await pool.query('DELETE FROM leads WHERE job_id = ?', [jobId]);

      // 4. Finally delete the job itself
      let sql = 'DELETE FROM jobs WHERE id = ?';
      const [result] = await pool.query(sql, [jobId]);

      return {
        deletedCount: result.affectedRows
      };
    } catch (error) {
      console.error('Error in Job.deleteOne (cascade):', error);
      throw error;
    }
  },

  async deleteMany(query) {
    // Basic implementation for deleteMany - could be optimized with transaction if needed
    const params = [];
    let findSql = 'SELECT id FROM jobs WHERE 1=1';

    if (query.status) {
      findSql += ' AND status = ?';
      params.push(query.status);
    }
    if (query.homeowner) {
      findSql += ' AND homeowner_id = ?';
      params.push(query.homeowner);
    }

    const [rows] = await pool.query(findSql, params);
    let totalDeleted = 0;

    for (const row of rows) {
      const res = await this.deleteOne({ _id: row.id });
      totalDeleted += res.deletedCount;
    }

    return {
      deletedCount: totalDeleted
    };
  }
};

export default Job;
