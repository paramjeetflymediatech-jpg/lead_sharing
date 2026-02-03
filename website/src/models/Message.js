import pool from '../../config/db';

export const Message = {
    // Create a new message
    async create({ senderId, receiverId, jobId, content }) {
        const [result] = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, job_id, content, created_at, is_read) 
       VALUES (?, ?, ?, ?, NOW(), false)`,
            [senderId, receiverId, jobId, content]
        );
        return this.findById(result.insertId);
    },

    // Find a specific message
    async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM messages WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    // Get conversations for a user
    // This is a complex query to group messages by conversation partner and job
    async getConversations(userId) {
        // This query finds the latest message for each conversation
        const sql = `
      SELECT 
        m.*,
        u.name as other_user_name,
        u.email as other_user_email,
        u.role as other_user_role,
        j.description as job_description,
        j.title as job_title -- Assuming jobs have titles or use description
      FROM messages m
      JOIN (
        SELECT 
          MAX(id) as last_message_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY 
          LEAST(sender_id, receiver_id), 
          GREATEST(sender_id, receiver_id),
          job_id
      ) latest ON m.id = latest.last_message_id
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END
      LEFT JOIN jobs j ON m.job_id = j.id
      ORDER BY m.created_at DESC
    `;

        try {
            const [rows] = await pool.query(sql, [userId, userId, userId]);
            return rows.map(row => ({
                id: row.id, // Message ID, essentially serving as conversation ID for latest
                jobId: row.job_id,
                otherUserId: row.sender_id === userId ? row.receiver_id : row.sender_id,
                otherUserName: row.other_user_name,
                otherUserRole: row.other_user_role,
                lastMessage: row.content,
                timestamp: row.created_at,
                isRead: row.sender_id === userId ? true : !!row.is_read,
                jobTitle: row.job_title || row.job_description?.substring(0, 30) + '...'
            }));
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    },

    // Get messages for a specific conversation (user + job)
    async getMessages(userId, otherUserId, jobId) {
        const sql = `
      SELECT * FROM messages 
      WHERE 
        ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
        AND job_id = ?
      ORDER BY created_at ASC
    `;
        const [rows] = await pool.query(sql, [userId, otherUserId, otherUserId, userId, jobId]);
        return rows.map(row => ({
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            text: row.content,
            createdAt: row.created_at,
            isRead: !!row.is_read
        }));
    },

    // Mark messages as read
    async markAsRead(userId, otherUserId, jobId) {
        await pool.query(
            `UPDATE messages SET is_read = true 
       WHERE sender_id = ? AND receiver_id = ? AND job_id = ?`,
            [otherUserId, userId, jobId]
        );
    }
};
