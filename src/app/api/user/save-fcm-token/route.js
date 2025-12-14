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

        // Add token to fcmTokens array if not already present
        await User.findByIdAndUpdate(session.user.id, {
            $addToSet: { fcmTokens: token }
        });

        return NextResponse.json({ success: true, message: "Token saved" });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
