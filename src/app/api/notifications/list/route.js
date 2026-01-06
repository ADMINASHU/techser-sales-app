import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit")) || 20;
        const skip = parseInt(searchParams.get("skip")) || 0;

        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await Notification.countDocuments({ userId: session.user.id });

        // Serialize _id to id for React key compatibility
        const serializedNotifications = notifications.map(notif => ({
            ...notif,
            id: notif._id.toString(),
            _id: undefined // Remove _id to avoid confusion
        }));

        return NextResponse.json({
            notifications: serializedNotifications,
            total,
            hasMore: skip + limit < total
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}
