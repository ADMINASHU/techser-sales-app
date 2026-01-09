import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        await Notification.updateMany(
            { userId: session.user.id, read: false },
            { read: true }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to mark all notifications as read" },
            { status: 500 }
        );
    }
}
