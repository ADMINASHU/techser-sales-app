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

        const count = await Notification.countDocuments({
            userId: session.user.id,
            read: false
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error("Error counting unread notifications:", error);
        return NextResponse.json(
            { error: "Failed to count notifications" },
            { status: 500 }
        );
    }
}
