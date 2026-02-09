
// import pool from '../../config/db';

// const profileToMongoStyle = (row) => {
//   if (!row) return null;
//   return {
//     ...row,
//     _id: row.id.toString(), // Convert to string for consistency
//     id: row.id,
//     user: row.user_id,
//     companyName: row.company_name,
//     profileImage: row.profile_image,
//     serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
//     skills: row.skills ? JSON.parse(row.skills) : [],
//     credits: row.credits || 0,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at
//   };
// };

// export const TradespersonProfile = {
//   async findOne(query) {
//     let sql = 'SELECT * FROM tradesperson_profiles WHERE 1=1';
//     const params = [];

//     if (query.user) {
//       sql += ' AND user_id = ?';
//       params.push(query.user);
//     }

//     if (query._id) {
//       sql += ' AND id = ?';
//       params.push(query._id);
//     }

//     if (query.id) {
//       sql += ' AND id = ?';
//       params.push(query.id);
//     }

//     sql += ' LIMIT 1';
//     try {
//       const [rows] = await pool.query(sql, params);
//       return profileToMongoStyle(rows[0]);
//     } catch (error) {
//       console.error('Error in findOne:', error);
//       return null;
//     }
//   },

//   async create(data) {
//     const { user, companyName, profileImage, bio, phone, postcode, skills, serviceAreas, credits } = data;

//     // Convert arrays to JSON strings
//     const skillsJson = JSON.stringify(skills || []);
//     const areasJson = JSON.stringify(serviceAreas || []);

//     try {
//       const [result] = await pool.query(
//         `INSERT INTO tradesperson_profiles 
//         (user_id, company_name, profile_image, bio, phone, postcode, skills, service_areas, credits, created_at, updated_at)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [user, companyName || '', profileImage || '', bio || '', phone || '', postcode || '', skillsJson, areasJson, credits || 5]
//       );

//       return this.findOne({ id: result.insertId });
//     } catch (error) {
//       console.error('Error creating profile:', error);
//       throw error;
//     }
//   },

//   async findOneAndUpdate(query, updateData, options = {}) {
//     // Find the record first to get ID
//     const profile = await this.findOne(query);

//     if (!profile) {
//       if (options.upsert) {
//         // Create new
//         const createData = { ...query, ...updateData };
//         // Remove $inc or other operators if present
//         const cleanData = { ...createData };
//         delete cleanData.$inc;
//         delete cleanData.$set;

//         return this.create(cleanData);
//       }
//       return null;
//     }

//     const updates = [];
//     const values = [];

//     // Handle $inc operator for credits
//     if (updateData.$inc && updateData.$inc.credits) {
//       updates.push(`credits = credits + ?`);
//       values.push(updateData.$inc.credits);
//     }

//     // Handle $set operator
//     if (updateData.$set) {
//       for (const [key, value] of Object.entries(updateData.$set)) {
//         this.addUpdateField(key, value, updates, values);
//       }
//     }

//     // Handle direct updates (for backward compatibility)
//     for (const [key, value] of Object.entries(updateData)) {
//       if (!key.startsWith('$')) {
//         this.addUpdateField(key, value, updates, values);
//       }
//     }

//     // Always update timestamp
//     updates.push('updated_at = NOW()');

//     if (updates.length > 0) {
//       values.push(profile.id); // Use the internal MySQL ID
//       try {
//         await pool.query(
//           `UPDATE tradesperson_profiles SET ${updates.join(', ')} WHERE id = ?`, 
//           values
//         );
//       } catch (error) {
//         console.error('Error updating profile:', error);
//         throw error;
//       }
//     }

//     if (options.new) {
//       return this.findOne({ id: profile.id });
//     }
//     return profile;
//   },

//   // Helper method to add update fields
//   addUpdateField(key, value, updates, values) {
//     let column = null;
//     let val = value;

//     if (key === 'companyName') column = 'company_name';
//     else if (key === 'profileImage') column = 'profile_image';
//     else if (key === 'serviceAreas') { 
//       column = 'service_areas'; 
//       val = JSON.stringify(value || []); 
//     }
//     else if (key === 'skills') { 
//       column = 'skills'; 
//       val = JSON.stringify(value || []); 
//     }
//     else if (['bio', 'phone', 'postcode', 'credits'].includes(key)) column = key;

//     if (column) {
//       updates.push(`${column} = ?`);
//       values.push(val);
//     }
//   },

//   async findByIdAndUpdate(id, updateData, options = {}) {
//     return this.findOneAndUpdate({ _id: id }, updateData, options);
//   }

// };




import pool from '../../config/db';

const safeJsonParse = (str, fallback = []) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON Parse Error in TradespersonProfile:', e.message, 'Input:', str);
    return fallback;
  }
};

const profileToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id.toString(), // Convert to string for consistency
    id: row.id,
    user: row.user_id,
    companyName: row.company_name,
    profileImage: row.profile_image,
    serviceAreas: safeJsonParse(row.service_areas),
    skills: safeJsonParse(row.skills),
    credits: row.credits || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    average_rating: row.average_rating || 0,
    total_ratings: row.total_ratings || 0
  };
};

export const TradespersonProfile = {
  async findOne(query) {
    let sql = 'SELECT * FROM tradesperson_profiles WHERE 1=1';
    const params = [];

    if (query.user) {
      sql += ' AND user_id = ?';
      params.push(query.user);
    }

    if (query._id) {
      sql += ' AND id = ?';
      params.push(query._id);
    }

    if (query.id) {
      sql += ' AND id = ?';
      params.push(query.id);
    }

    sql += ' LIMIT 1';
    try {
      const [rows] = await pool.query(sql, params);
      return profileToMongoStyle(rows[0]);
    } catch (error) {
      console.error('Error in findOne:', error);
      return null;
    }
  },

  async create(data) {
    const { user, companyName, profileImage, bio, phone, postcode, skills, serviceAreas, credits } = data;

    // Convert arrays to JSON strings
    const skillsJson = JSON.stringify(skills || []);
    const areasJson = JSON.stringify(serviceAreas || []);

    try {
      const [result] = await pool.query(
        `INSERT INTO tradesperson_profiles 
        (user_id, company_name, profile_image, bio, phone, postcode, skills, service_areas, credits, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [user, companyName || '', profileImage || '', bio || '', phone || '', postcode || '', skillsJson, areasJson, credits || 5]
      );

      return this.findOne({ id: result.insertId });
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async findOneAndUpdate(query, updateData, options = {}) {
    // Find the record first to get ID
    const profile = await this.findOne(query);

    if (!profile) {
      if (options.upsert) {
        // Create new
        const createData = { ...query, ...updateData };
        // Remove $inc or other operators if present
        const cleanData = { ...createData };
        delete cleanData.$inc;
        delete cleanData.$set;

        return this.create(cleanData);
      }
      return null;
    }

    const updates = [];
    const values = [];

    // Handle $inc operator for credits
    if (updateData.$inc && updateData.$inc.credits) {
      updates.push(`credits = credits + ?`);
      values.push(updateData.$inc.credits);
    }

    // Handle $set operator
    if (updateData.$set) {
      for (const [key, value] of Object.entries(updateData.$set)) {
        this.addUpdateField(key, value, updates, values);
      }
    }

    // Handle direct updates (for backward compatibility)
    for (const [key, value] of Object.entries(updateData)) {
      if (!key.startsWith('$')) {
        this.addUpdateField(key, value, updates, values);
      }
    }

    // Always update timestamp
    updates.push('updated_at = NOW()');

    if (updates.length > 0) {
      values.push(profile.id); // Use the internal MySQL ID
      try {
        await pool.query(
          `UPDATE tradesperson_profiles SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    }

    if (options.new) {
      return this.findOne({ id: profile.id });
    }
    return profile;
  },

  // Helper method to add update fields
  addUpdateField(key, value, updates, values) {
    let column = null;
    let val = value;

    if (key === 'companyName') column = 'company_name';
    else if (key === 'profileImage') column = 'profile_image';
    else if (key === 'serviceAreas') {
      column = 'service_areas';
      val = JSON.stringify(value || []);
    }
    else if (key === 'skills') {
      column = 'skills';
      val = JSON.stringify(value || []);
    }
    else if (['bio', 'phone', 'postcode', 'credits', 'average_rating', 'total_ratings'].includes(key)) column = key;

    if (column) {
      updates.push(`${column} = ?`);
      values.push(val);
    }
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    return this.findOneAndUpdate({ _id: id }, updateData, options);
  },

  async updateRatingStats(userId, averageRating, totalRatings) {
    try {
      await pool.query(
        `UPDATE tradesperson_profiles 
         SET average_rating = ?, total_ratings = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [averageRating, totalRatings, userId]
      );
      return true;
    } catch (error) {
      console.error('Error updating rating stats:', error);
      throw error;
    }
  }

};

