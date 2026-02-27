import { NextResponse } from "next/server";
import db from "../../../../../config/db";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // Auth check
    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all DISTINCT conversations for this tradesperson.
    // Use a derived table to always correctly identify the OTHER user (homeowner),
    // regardless of whether tradesperson was sender or receiver.
    const [conversations] = await db.query(`
      SELECT
        conv.job_id,
        conv.homeowner_id,
        u.name as homeowner_name,
        u.email as homeowner_email,
        u.profile_image as homeowner_image,
        j.description as job_title,
        j.status as job_status,
        (
          SELECT conversation_status FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as conversation_status,
        (
          SELECT conversation_accepted_by_homeowner FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as accepted_by_them,
        (
          SELECT conversation_accepted_by_tradesperson FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as accepted_by_me,
        (
          SELECT content FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_time,
        (
          SELECT sender_id FROM messages
          WHERE job_id = conv.job_id
            AND ((sender_id = ? AND receiver_id = conv.homeowner_id)
                 OR (sender_id = conv.homeowner_id AND receiver_id = ?))
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_sender_id,
        (
          SELECT COUNT(*) FROM messages
          WHERE job_id = conv.job_id
            AND sender_id = conv.homeowner_id
            AND receiver_id = ?
            AND is_read = FALSE
        ) as unread_count
      FROM (
        SELECT DISTINCT
          job_id,
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as homeowner_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ) conv
      INNER JOIN users u ON conv.homeowner_id = u.id
      INNER JOIN jobs j ON conv.job_id = j.id
      ORDER BY last_message_time DESC
    `, [
      userId, userId,  // conversation_status subquery
      userId, userId,  // accepted_by_them subquery
      userId, userId,  // accepted_by_me subquery
      userId, userId,  // last_message subquery
      userId, userId,  // last_message_time subquery
      userId, userId,  // last_message_sender_id subquery
      userId,          // unread_count receiver_id
      userId,          // CASE WHEN sender_id = ?
      userId, userId   // WHERE sender_id = ? OR receiver_id = ?
    ]);

    // Format the conversations
    const formattedConversations = conversations.map(conv => ({
      id: `${conv.job_id}-${conv.homeowner_id}`,
      jobId: conv.job_id,
      homeownerId: conv.homeowner_id,
      homeownerName: conv.homeowner_name,
      homeownerEmail: conv.homeowner_email,
      homeownerProfileImage: conv.homeowner_image,
      jobTitle: conv.job_title,
      jobStatus: conv.job_status,
      conversationStatus: conv.conversation_status,
      acceptedByMe: Boolean(conv.accepted_by_me),
      acceptedByThem: Boolean(conv.accepted_by_them),
      lastMessage: conv.last_message,
      lastMessageTime: conv.last_message_time,
      lastMessageSenderId: conv.last_message_sender_id,
      unreadCount: parseInt(conv.unread_count) || 0,
      isClosed: conv.conversation_status === 'CLOSED' ||
        conv.job_status === 'COMPLETED' ||
        conv.job_status === 'CANCELLED'
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error("CONVERSATIONS API ERROR:", error);
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
