// import pool  from "../../config/db"

// export const TradespersonRating = {
//   async create({ jobId, homeownerId, tradespersonId, rating, review }) {
//     const [result] = await pool.query(
//       `INSERT INTO tradesperson_ratings 
//        (job_id, homeowner_id, tradesperson_id, rating, review)
//        VALUES (?, ?, ?, ?, ?)`,
//       [jobId, homeownerId, tradespersonId, rating, review || null]
//     );

//     // Update the average rating in tradesperson_profiles
//     await this.updateAverageRating(tradespersonId);

//     return result.insertId;
//   },

//   async findByJob(jobId) {
//     const [rows] = await pool.query(
//       `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
//       [jobId]
//     );
//     return rows[0] || null;
//   },

//   async findByTradesperson(tradespersonId) {
//     const [rows] = await pool.query(
//       `SELECT 
//         tr.*,
//         DATE_FORMAT(tr.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
//        FROM tradesperson_ratings tr
//        WHERE tradesperson_id = ? 
//        ORDER BY tr.created_at DESC`,
//       [tradespersonId]
//     );
//     return rows;
//   },

//   async getAverageRating(tradespersonId) {
//     const [rows] = await pool.query(
//       `SELECT 
//          AVG(rating) as average_rating,
//          COUNT(*) as total_ratings
//        FROM tradesperson_ratings 
//        WHERE tradesperson_id = ?`,
//       [tradespersonId]
//     );

//     const result = rows[0];
//     return {
//       average_rating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0,
//       total_ratings: result.total_ratings || 0
//     };
//   },

//   async updateAverageRating(tradespersonId) {
//     const ratingData = await this.getAverageRating(tradespersonId);

//     await pool.query(
//       `UPDATE tradesperson_profiles 
//        SET average_rating = ?, total_ratings = ?, updated_at = NOW()
//        WHERE user_id = ?`,
//       [ratingData.average_rating, ratingData.total_ratings, tradespersonId]
//     );

//     return ratingData;
//   },

//   async findByHomeownerAndTradesperson(homeownerId, tradespersonId) {
//     const [rows] = await pool.query(
//       `SELECT * FROM tradesperson_ratings 
//        WHERE homeowner_id = ? AND tradesperson_id = ? 
//        ORDER BY created_at DESC`,
//       [homeownerId, tradespersonId]
//     );
//     return rows;
//   },

//   async getTradespersonStats(tradespersonId) {
//     const [rows] = await pool.query(
//       `SELECT 
//          rating,
//          COUNT(*) as count
//        FROM tradesperson_ratings 
//        WHERE tradesperson_id = ?
//        GROUP BY rating
//        ORDER BY rating DESC`,
//       [tradespersonId]
//     );

//     // Initialize all ratings
//     const ratingDistribution = {
//       5: 0, 4: 0, 3: 0, 2: 0, 1: 0
//     };

//     rows.forEach(row => {
//       ratingDistribution[row.rating] = row.count;
//     });

//     const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

//     return {
//       distribution: ratingDistribution,
//       total
//     };
//   }
// };












import pool from "../../config/db"

export const TradespersonRating = {
  async create({ jobId, homeownerId, tradespersonId, rating, review }) {
    console.log("🔥 CREATING NEW RATING");
    console.log("Job ID:", jobId);
    console.log("Tradesperson ID (user_id):", tradespersonId);
    console.log("Homeowner ID:", homeownerId);
    console.log("Rating:", rating);

    try {
      // 1. First insert the rating
      const [result] = await pool.query(
        `INSERT INTO tradesperson_ratings 
         (job_id, homeowner_id, tradesperson_id, rating, review, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [jobId, homeownerId, tradespersonId, rating, review || null]
      );

      console.log("✅ Rating inserted with ID:", result.insertId);

      // 2. IMPORTANT: Update the tradesperson profile stats
      // Import the TradespersonProfile model
      const { TradespersonProfile } = await import('./TradespersonProfile.js');

      // Update rating stats for this tradesperson
      await TradespersonProfile.updateRatingStatsForUser(tradespersonId);

      return result.insertId;
    } catch (error) {
      console.error("❌ Error creating rating:", error);
      throw error;
    }
  },

  async forceUpdateProfileStats(tradespersonId) {
    console.log("🔄 FORCE UPDATING PROFILE STATS FOR:", tradespersonId);

    try {
      // Import the TradespersonProfile model
      const { TradespersonProfile } = await import('./TradespersonProfile.js');

      // Use the new helper method
      return await TradespersonProfile.updateRatingStatsForUser(tradespersonId);
    } catch (error) {
      console.error("❌ Error updating profile stats:", error);
      throw error;
    }
  },

  async findByJob(jobId) {
    const [rows] = await pool.query(
      `SELECT * FROM tradesperson_ratings WHERE job_id = ? LIMIT 1`,
      [jobId]
    );
    return rows[0] || null;
  },

  async findByTradesperson(tradespersonId) {
    const [rows] = await pool.query(
      `SELECT 
        tr.*,
        u.name as homeowner_name,
        j.title as job_title,
        DATE_FORMAT(tr.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
       FROM tradesperson_ratings tr
       LEFT JOIN users u ON tr.homeowner_id = u.id
       LEFT JOIN jobs j ON tr.job_id = j.id
       WHERE tradesperson_id = ? 
       ORDER BY tr.created_at DESC`,
      [tradespersonId]
    );
    return rows;
  },

  async getAverageRating(tradespersonId) {
    const [rows] = await pool.query(
      `SELECT 
         COALESCE(AVG(rating), 0) as average_rating,
         COUNT(*) as total_ratings
       FROM tradesperson_ratings 
       WHERE tradesperson_id = ?`,
      [tradespersonId]
    );

    const result = rows[0];
    return {
      average_rating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0,
      total_ratings: result.total_ratings || 0
    };
  },

  async updateAverageRating(tradespersonId) {
    console.log("📞 updateAverageRating called for:", tradespersonId);
    return await this.forceUpdateProfileStats(tradespersonId);
  },

  async findByHomeownerAndTradesperson(homeownerId, tradespersonId) {
    const [rows] = await pool.query(
      `SELECT * FROM tradesperson_ratings 
       WHERE homeowner_id = ? AND tradesperson_id = ? 
       ORDER BY created_at DESC`,
      [homeownerId, tradespersonId]
    );
    return rows;
  },

  async getTradespersonStats(tradespersonId) {
    const [rows] = await pool.query(
      `SELECT 
         rating,
         COUNT(*) as count
       FROM tradesperson_ratings 
       WHERE tradesperson_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [tradespersonId]
    );

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    rows.forEach(row => {
      ratingDistribution[row.rating] = row.count;
    });

    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

    return {
      distribution: ratingDistribution,
      total
    };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM tradesperson_ratings WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdAndUpdate(id, updateData) {
    const updates = [];
    const values = [];

    if (updateData.rating !== undefined) {
      updates.push('rating = ?');
      values.push(updateData.rating);
    }
    if (updateData.review !== undefined) {
      updates.push('review = ?');
      values.push(updateData.review);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE tradesperson_ratings SET ${updates.join(', ')} WHERE id = ?`, values);

      // Get the tradespersonId to update stats
      const rating = await this.findById(id);
      if (rating) {
        await this.forceUpdateProfileStats(rating.tradesperson_id);
      }
    }

    return this.findById(id);
  },

  async deleteOne(query) {
    if (!query._id) return { deletedCount: 0 };

    // Get tradespersonId before deletion to update stats
    const rating = await this.findById(query._id);
    if (!rating) return { deletedCount: 0 };

    const [result] = await pool.query(
      `DELETE FROM tradesperson_ratings WHERE id = ?`,
      [query._id]
    );

    if (result.affectedRows > 0) {
      await this.forceUpdateProfileStats(rating.tradesperson_id);
    }

    return {
      deletedCount: result.affectedRows
    };
  }
};