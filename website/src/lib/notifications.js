
import axios from 'axios';
import { pusherServer } from './pusher.js';
import pool from '../../config/db.js';
import { User } from '../models/User.js';

/**
 * Send a push notification to a user via Expo
 * @param {number} userId - The user ID to notify
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data object to include in the notification
 * @param {string} type - Notification type (e.g., 'MESSAGE', 'LEAD_UNLOCKED', 'JOB_HIRED')
 */
export async function sendNotification(userId, title, body, data = {}, type = 'GENERAL') {
    try {
        console.log(`[Notification] Sending to user ${userId}: ${title}`);

        // 1. Save to database for history
        await pool.query(
            'INSERT INTO notifications (user_id, title, body, data, type) VALUES (?, ?, ?, ?, ?)',
            [userId, title, body, JSON.stringify(data), type]
        );

        // 2. Trigger real-time update via Pusher
        try {
            await pusherServer.trigger(`user-${userId}`, 'notification', {
                title,
                body,
                data,
                type,
                createdAt: new Date().toISOString()
            });
        } catch (pusherErr) {
            console.error('[Notification] Pusher error:', pusherErr.message);
        }

        // 3. Send Push Notification via Expo
        const tokens = await User.getPushTokens(userId);

        if (tokens && tokens.length > 0) {
            const messages = tokens.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data: { ...data, type },
            }));

            // Expo documentation recommends sending in chunks if there are many messages
            // For now, we'll send them as a single array if it's small
            try {
                const headers = {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                };

                if (process.env.EXPO_ACCESS_TOKEN) {
                    headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
                }

                const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, { headers });
                console.log(`[Notification] Expo push sent to ${tokens.length} device(s). Status: ${response.status}`);
            } catch (expoErr) {
                console.error('[Notification] Expo API error:', expoErr.response?.data || expoErr.message);
            }
        } else {
            console.log(`[Notification] No push tokens found for user ${userId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('[Notification] Error in sendNotification:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Convenience method for common notification types
 */
export const NotificationService = {
    // New Lead unlocked for Homeowner
    leadUnlocked: (homeownerId, jobTitle, tradespersonName, jobId) => {
        return sendNotification(
            homeownerId,
            'New Quote Received!',
            `${tradespersonName} has provided a quote for your job "${jobTitle}".`,
            { jobId },
            'LEAD_UNLOCKED'
        );
    },

    // Tradesperson hired
    tradespersonHired: (tradespersonId, jobTitle, jobId) => {
        return sendNotification(
            tradespersonId,
            'You have been hired!',
            `Congratulations! You have been hired for the job "${jobTitle}".`,
            { jobId },
            'JOB_HIRED'
        );
    },

    // New message
    newMessage: (receiverId, senderName, content, jobId, conversationId) => {
        return sendNotification(
            receiverId,
            `New message from ${senderName}`,
            content.length > 50 ? `${content.substring(0, 47)}...` : content,
            { jobId, conversationId },
            'MESSAGE'
        );
    },

    // Verification Update
    verificationUpdate: (tradespersonId, status, reason = null) => {
        const title = status === 'APPROVED' ? 'Profile Verified!' : 'Verification Update';
        const body = status === 'APPROVED'
            ? 'Your tradesperson profile has been approved. You can now start unlocking leads!'
            : `Your verification requires attention. ${reason || 'Please check your profile details.'}`;

        return sendNotification(
            tradespersonId,
            title,
            body,
            { status, reason },
            'VERIFICATION_UPDATE'
        );
    },

    // Notify all admins
    notifyAdmins: async (title, body, data = {}, type = 'ADMIN_ALERT') => {
        try {
            const [admins] = await pool.query("SELECT id FROM users WHERE role = 'ADMIN'");
            const results = await Promise.all(
                admins.map(admin => sendNotification(admin.id, title, body, data, type))
            );
            return { success: true, count: admins.length };
        } catch (error) {
            console.error('[Notification] Error notifying admins:', error);
            return { success: false, error: error.message };
        }
    }
};
