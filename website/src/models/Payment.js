
// // src/models/Payment.js
// import pool from "../../config/db"

// const paymentToMongoStyle = (row) => {
//   if (!row) return null;
//   return {
//     ...row,
//     _id: row.id.toString(),
//     id: row.id,
//     tradespersonId: row.tradesperson_id,
//     userId: row.user_id,
//     stripeSessionId: row.stripe_session_id,
//     stripePaymentIntentId: row.stripe_payment_intent_id,
//     amount: parseFloat(row.amount),
//     createdAt: row.created_at,
//     updatedAt: row.updated_at
//   };
// };

// export const Payment = {
//   async create(data) {
//     const {
//       tradespersonId,
//       userId,
//       stripeSessionId,
//       stripePaymentIntentId,
//       plan,
//       amount,
//       currency = 'GBP',
//       credits,
//       status = 'pending'
//     } = data;

//     try {
//       const [result] = await pool.query(
//         `INSERT INTO payments 
//         (tradesperson_id, user_id, stripe_session_id, stripe_payment_intent_id, 
//          plan, amount, currency, credits, status, created_at, updated_at)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//         [tradespersonId, userId, stripeSessionId, stripePaymentIntentId, 
//          plan, amount, currency, credits, status]
//       );

//       return this.findById(result.insertId);
//     } catch (error) {
//       console.error('Error creating payment:', error);
//       throw error;
//     }
//   },

//   async findById(id) {
//     try {
//       const [rows] = await pool.query(
//         'SELECT * FROM payments WHERE id = ? LIMIT 1',
//         [id]
//       );
//       return paymentToMongoStyle(rows[0]);
//     } catch (error) {
//       console.error('Error finding payment by id:', error);
//       return null;
//     }
//   },

//   async findByTradespersonId(tradespersonId, limit = 10) {
//     try {
//       const [rows] = await pool.query(
//         'SELECT * FROM payments WHERE tradesperson_id = ? ORDER BY created_at DESC LIMIT ?',
//         [tradespersonId, limit]
//       );
//       return rows.map(paymentToMongoStyle);
//     } catch (error) {
//       console.error('Error finding payments by tradesperson:', error);
//       return [];
//     }
//   },

//   async updateStatus(sessionId, status, paymentIntentId = null) {
//     try {
//       const updates = ['status = ?', 'updated_at = NOW()'];
//       const values = [status, sessionId];

//       if (paymentIntentId) {
//         updates.push('stripe_payment_intent_id = ?');
//         values.unshift(paymentIntentId);
//       }

//       const [result] = await pool.query(
//         `UPDATE payments SET ${updates.join(', ')} WHERE stripe_session_id = ?`,
//         values
//       );
//       return result.affectedRows > 0;
//     } catch (error) {
//       console.error('Error updating payment status:', error);
//       return false;
//     }
//   }
// };



// src/models/Payment.js
import pool from "../../config/db";

/**
 * Convert MySQL row → Mongo-like object
 */
const paymentToMongoStyle = (row) => {
  if (!row) return null;

  return {
    ...row,
    _id: row.id.toString(),
    id: row.id,
    tradespersonId: row.tradesperson_id,
    userId: row.user_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amount: parseFloat(row.amount),
    credits: row.credits,
    status: row.status,
    plan: row.plan,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const Payment = {
  /**
   * Create a new payment (called when checkout session is created)
   */
  async create(data) {
    const {
      tradespersonId,
      userId,
      stripeSessionId,
      stripePaymentIntentId = null,
      plan,
      amount,
      currency = "GBP",
      credits,
      status = "pending",
    } = data;

    const [result] = await pool.query(
      `
      INSERT INTO payments 
      (tradesperson_id, user_id, stripe_session_id, stripe_payment_intent_id,
       plan, amount, currency, credits, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        tradespersonId,
        userId,
        stripeSessionId,
        stripePaymentIntentId,
        plan,
        amount,
        currency,
        credits,
        status,
      ]
    );

    return this.findById(result.insertId);
  },

  /**
   * Find payment by primary ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [id]
    );

    return paymentToMongoStyle(rows[0]);
  },

  /**
   * 🔑 REQUIRED FOR STRIPE WEBHOOK IDEMPOTENCY
   */
  async findBySessionId(sessionId) {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE stripe_session_id = ? LIMIT 1",
      [sessionId]
    );

    return paymentToMongoStyle(rows[0]);
  },

  /**
   * Get payments for a tradesperson
   */
  async findByTradespersonId(tradespersonId, limit = 10) {
    const [rows] = await pool.query(
      `
      SELECT * FROM payments
      WHERE tradesperson_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [tradespersonId, limit]
    );

    return rows.map(paymentToMongoStyle);
  },

  /**
   * Update payment status from Stripe webhook
   */
  async updateStatus(sessionId, status, paymentIntentId = null) {
    const updates = ["status = ?", "updated_at = NOW()"];
    const values = [status];

    if (paymentIntentId) {
      updates.push("stripe_payment_intent_id = ?");
      values.push(paymentIntentId);
    }

    values.push(sessionId);

    const [result] = await pool.query(
      `
      UPDATE payments
      SET ${updates.join(", ")}
      WHERE stripe_session_id = ?
      `,
      values
    );

    return result.affectedRows > 0;
  },
};
