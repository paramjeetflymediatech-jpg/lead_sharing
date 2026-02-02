
import pool from '../../config/db';

const profileToMongoStyle = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    user: row.user_id,
    companyName: row.company_name,
    profileImage: row.profile_image,
    serviceAreas: row.service_areas ? JSON.parse(row.service_areas) : [],
    skills: row.skills ? JSON.parse(row.skills) : [],
    credits: row.credits,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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
    // Add other query fields if needed

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    return profileToMongoStyle(rows[0]);
  },

  async create(data) {
    const { user, companyName, profileImage, bio, phone, postcode, skills, serviceAreas, credits } = data;

    // Convert arrays to JSON strings
    const skillsJson = JSON.stringify(skills || []);
    const areasJson = JSON.stringify(serviceAreas || []);

    const [result] = await pool.query(
      `INSERT INTO tradesperson_profiles 
      (user_id, company_name, profile_image, bio, phone, postcode, skills, service_areas, credits)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user, companyName, profileImage || '', bio || '', phone || '', postcode || '', skillsJson, areasJson, credits || 5]
    );

    return {
      _id: result.insertId,
      user,
      companyName,
      // ... return other fields as needed
    };
  },

  async findOneAndUpdate(query, updateData, options = {}) {
    // Find the record first to get ID
    const profile = await this.findOne(query);

    if (!profile) {
      if (options.upsert) {
        // Create new
        const createData = { ...query, ...updateData };
        // Default credits 5 if not set
        if (createData.credits === undefined) createData.credits = 5;
        // Remove $inc or other operators if present (simplified)
        if (createData.$inc) delete createData.$inc;

        return this.create(createData);
      }
      return null;
    }

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      let column = null;
      let val = value;

      if (key === 'companyName') column = 'company_name';
      else if (key === 'profileImage') column = 'profile_image';
      else if (key === 'serviceAreas') { column = 'service_areas'; val = JSON.stringify(value); }
      else if (key === 'skills') { column = 'skills'; val = JSON.stringify(value); }
      else if (['bio', 'phone', 'postcode', 'credits'].includes(key)) column = key;

      // Handle nested updates like $inc for credits
      if (key === '$inc' && value.credits) {
        updates.push(`credits = credits + ?`);
        values.push(value.credits);
        continue;
      }

      if (column) {
        updates.push(`${column} = ?`);
        values.push(val);
      }
    }

    if (updates.length > 0) {
      values.push(profile.id); // Use the internal MySQL ID
      await pool.query(`UPDATE tradesperson_profiles SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (options.new) {
      return this.findOne({ user: profile.user }); // Re-fetch
    }
    return profile;
  }
};