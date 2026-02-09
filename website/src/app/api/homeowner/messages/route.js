import { NextResponse } from "next/server";
import db from "../../../../../config/db";

/**
 * GET /api/homeowner/messages
 * Fetch all conversations for the logged-in homeowner
 */
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // Auth check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all unique conversations for this homeowner
    // A conversation is identified by job_id and the other user (tradesperson)
    const [conversations] = await db.query(`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as tradesperson_id,
        m.job_id
      FROM messages m
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY job_id, tradesperson_id
    `, [userId, userId, userId]);

    // For each conversation, get the details
    const conversationsWithDetails = [];

    for (const conv of conversations) {
      const [details] = await db.query(`
        SELECT 
          u.name as tradesperson_name,
          u.email as tradesperson_email,
          tp.company_name,
          j.description as job_title,
          j.status as job_status,
          j.homeowner_id
        FROM users u
        LEFT JOIN tradesperson_profiles tp ON u.id = tp.user_id
        INNER JOIN jobs j ON j.id = ?
        WHERE u.id = ?
        LIMIT 1
      `, [conv.job_id, conv.tradesperson_id]);

      if (details.length === 0) continue;

      // Get the latest message and conversation status
      const [latestMsg] = await db.query(`
        SELECT 
          content,
          created_at,
          sender_id,
          conversation_status,
          conversation_accepted_by_homeowner,
          conversation_accepted_by_tradesperson
        FROM messages
        WHERE job_id = ? 
          AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
        ORDER BY created_at DESC
        LIMIT 1
      `, [conv.job_id, userId, conv.tradesperson_id, conv.tradesperson_id, userId]);

      // Get unread count
      const [unreadResult] = await db.query(`
        SELECT COUNT(*) as count
        FROM messages
        WHERE job_id = ? 
          AND sender_id = ? 
          AND receiver_id = ?
          AND is_read = FALSE
      `, [conv.job_id, conv.tradesperson_id, userId]);

      const detail = details[0];
      const latest = latestMsg[0] || {};

      conversationsWithDetails.push({
        id: `${conv.job_id}-${conv.tradesperson_id}`,
        jobId: conv.job_id,
        tradespersonId: conv.tradesperson_id,
        tradespersonName: detail.company_name || detail.tradesperson_name,
        tradespersonEmail: detail.tradesperson_email,
        jobTitle: detail.job_title,
        jobStatus: detail.job_status,
        conversationStatus: latest.conversation_status || 'ACTIVE',
        acceptedByMe: Boolean(latest.conversation_accepted_by_homeowner),
        acceptedByThem: Boolean(latest.conversation_accepted_by_tradesperson),
        lastMessage: latest.content || '',
        lastMessageTime: latest.created_at,
        lastMessageSenderId: latest.sender_id,
        unreadCount: parseInt(unreadResult[0]?.count) || 0,
        isClosed: latest.conversation_status === 'CLOSED' ||
          detail.job_status === 'COMPLETED' ||
          detail.job_status === 'CANCELLED'
      });
    }

    // Sort by last message time
    conversationsWithDetails.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return NextResponse.json({
      success: true,
      conversations: conversationsWithDetails
    });
  } catch (error) {
    console.error("HOMEOWNER MESSAGES API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message
      },
      { status: 500 }
    );
  }
}
