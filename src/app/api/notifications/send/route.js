import { auth } from "@/auth";
import { sendNotificationToUsers, sendFCMNotification } from "@/lib/fcmNotification";
import { NextResponse } from "next/server";

/**
 * POST /api/notifications/send
 * Send FCM push notification to users
 * 
 * Body:
 * - userIds: string[] - Array of user IDs to notify
 * - tokens: string[] - (Optional) Direct FCM tokens
 * - notification: { title: string, body: string }
 * - data: object - (Optional) Additional data payload
 */
export async function POST(req) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { userIds, tokens, notification, data = {} } = body;

        // Validate notification payload
        if (!notification?.title || !notification?.body) {
            return NextResponse.json(
                { error: "Notification title and body are required" },
                { status: 400 }
            );
        }

        let result;

        // Send directly to tokens if provided
        if (tokens && tokens.length > 0) {
            result = await sendFCMNotification({ tokens, notification, data });
        }
        // Otherwise send to users by ID
        else if (userIds && userIds.length > 0) {
            result = await sendNotificationToUsers({ userIds, notification, data });
        }
        else {
            return NextResponse.json(
                { error: "Either userIds or tokens must be provided" },
                { status: 400 }
            );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            successCount: result.successCount,
            failureCount: result.failureCount
        });

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
