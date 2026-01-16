import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        await dbConnect();

        // Remove token from fcmTokens array
        await User.findByIdAndUpdate(session.user.id, {
            $pull: { fcmTokens: token }
        });

        return NextResponse.json({ success: true, message: "Token deleted" });
    } catch (error) {
        console.error("Error deleting FCM token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
