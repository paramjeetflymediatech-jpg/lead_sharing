
import pool from '../../config/db';

export const Payment = {
  async find(query = {}) {
    return [];
  },
  async create(data) {
    return { _id: 1, ...data };
  }
};

export default Payment;
