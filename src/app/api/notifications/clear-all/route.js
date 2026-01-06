import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        await Notification.deleteMany({ userId: session.user.id });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error clearing notifications:", error);
        return NextResponse.json(
            { error: "Failed to clear notifications" },
            { status: 500 }
        );
    }
}
