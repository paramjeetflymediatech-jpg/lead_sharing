import pool  from "../../config/db"

export const TradespersonRating = {
  async create({ jobId, homeownerId, tradespersonId, rating, review }) {
    const [result] = await pool.query(
      `INSERT INTO tradesperson_ratings 
       (job_id, homeowner_id, tradesperson_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, homeownerId, tradespersonId, rating, review || null]
    );
    
    // Update the average rating in tradesperson_profiles
    await this.updateAverageRating(tradespersonId);
    
    return result.insertId;
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
        DATE_FORMAT(tr.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
       FROM tradesperson_ratings tr
       WHERE tradesperson_id = ? 
       ORDER BY tr.created_at DESC`,
      [tradespersonId]
    );
    return rows;
  },

  async getAverageRating(tradespersonId) {
    const [rows] = await pool.query(
      `SELECT 
         AVG(rating) as average_rating,
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
    const ratingData = await this.getAverageRating(tradespersonId);
    
    await pool.query(
      `UPDATE tradesperson_profiles 
       SET average_rating = ?, total_ratings = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [ratingData.average_rating, ratingData.total_ratings, tradespersonId]
    );
    
    return ratingData;
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
    
    // Initialize all ratings
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    rows.forEach(row => {
      ratingDistribution[row.rating] = row.count;
    });
    
    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
    
    return {
      distribution: ratingDistribution,
      total
    };
  }
};