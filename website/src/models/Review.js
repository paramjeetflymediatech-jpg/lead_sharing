
import pool from '../../config/db';

export const Review = {
  async find(query = {}) {
    return [];
  },
  async create(data) {
    return { _id: 1, ...data };
  }
};

export default Review;
