// Server-side FCM notification utility using Firebase Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let adminApp;

try {
    if (!admin.apps.length) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccount) {
            adminApp = admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount))
            });
        } else {
            console.warn("[FCM] Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_KEY missing");
        }
    } else {
        adminApp = admin.app();
    }
} catch (error) {
    console.error("[FCM] Failed to initialize Firebase Admin SDK:", error);
}

/**
 * Send FCM notification to multiple tokens
 * @param {Object} params - Notification parameters
 * @param {string[]} params.tokens - Array of FCM tokens
 * @param {Object} params.notification - Notification payload
 * @param {string} params.notification.title - Notification title
 * @param {string} params.notification.body - Notification body
 * @param {Object} params.data - Optional data payload
 * @returns {Promise<Object>} - Result with success/failure counts
 */
export async function sendFCMNotification({ tokens, notification, data = {} }) {
    if (!adminApp) {
        console.warn("[FCM] Skipping notification: Firebase Admin SDK not initialized");
        return { success: false, error: "Firebase Admin not initialized" };
    }

    if (!tokens || tokens.length === 0) {
        console.warn("[FCM] No tokens provided for notification");
        return { success: false, error: "No FCM tokens provided" };
    }

    try {
        console.log(`[FCM] Sending to ${tokens.length} tokens...`);

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: {
                ...data,
                // Add timestamp for client-side handling
                timestamp: new Date().toISOString(),
            },
            // Android specific options
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                }
            },
            // iOS specific options
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    }
                }
            }
        };

        // Send to multiple tokens
        const response = await admin.messaging().sendEachForMulticast({
            tokens,
            ...message
        });

        // Collect invalid/expired tokens for cleanup
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                console.log(`[FCM] Token ${idx} failed:`, errorCode);

                // These error codes indicate the token is invalid and should be removed
                if (errorCode === 'messaging/registration-token-not-registered' ||
                    errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/invalid-argument') {
                    invalidTokens.push(tokens[idx]);
                }
            }
        });

        console.log(`[FCM] Results: ${response.successCount} successful, ${response.failureCount} failed, ${invalidTokens.length} stale tokens identified`);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
            invalidTokens // Return for cleanup by caller
        };
    } catch (error) {
        console.error("[FCM] Error sending notification:", error);
        return { success: false, error: error.message, invalidTokens: [] };
    }
}

/**
 * Send notification to specific users by their IDs
 * @param {Object} params - Notification parameters
 * @param {string[]} params.userIds - Array of user IDs
 * @param {Object} params.notification - Notification payload
 * @param {Object} params.data - Optional data payload
 * @param {boolean} params.saveToDb - Whether to save notification to database (default: true)
 * @returns {Promise<Object>} - Result with success/failure counts
 */
export async function sendNotificationToUsers({ userIds, notification, data = {}, saveToDb = true }) {
    try {
        // Import models dynamically to avoid circular dependencies
        const { default: User } = await import('@/models/User');
        const { default: Notification } = await import('@/models/Notification');

        // Fetch users and get their FCM tokens
        const users = await User.find({ _id: { $in: userIds } }, 'fcmTokens').lean();

        // Flatten all FCM tokens from all users
        const tokens = users.reduce((acc, user) => {
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                acc.push(...user.fcmTokens);
            }
            return acc;
        }, []);

        console.log(`[FCM] Preparing to send to ${userIds.length} users, ${tokens.length} total tokens`);

        // Save notification to database for each user
        if (saveToDb) {
            const notificationDocs = userIds.map(userId => ({
                userId,
                title: notification.title,
                body: notification.body,
                data: data,
                link: data?.link || null,
                read: false
            }));

            await Notification.insertMany(notificationDocs);
        }

        // Send FCM notification
        if (tokens.length === 0) {
            console.warn("[FCM] No FCM tokens found for specified users");
            return { success: true, successCount: 0, failureCount: 0, message: "No FCM tokens available" };
        }

        const result = await sendFCMNotification({ tokens, notification, data });

        // Clean up invalid tokens from database
        if (result.invalidTokens && result.invalidTokens.length > 0) {
            console.log(`[FCM] Removing ${result.invalidTokens.length} invalid tokens from database`);

            await User.updateMany(
                { _id: { $in: userIds } },
                { $pull: { fcmTokens: { $in: result.invalidTokens } } }
            );

            console.log(`[FCM] Stale tokens cleaned up successfully`);
        }

        return result;
    } catch (error) {
        console.error("[FCM] Error sending notification to users:", error);
        return { success: false, error: error.message };
    }
}
