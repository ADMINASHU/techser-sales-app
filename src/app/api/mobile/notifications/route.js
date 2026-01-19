import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();

    // Fetch notifications (limit 20 for mobile)
    const notifications = await Notification.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Mobile Notification List Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
