import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { notificationIds } = await req.json(); // Array of IDs or "all"

    await dbConnect();

    if (notificationIds === "all") {
      await Notification.updateMany(
        { userId: user.id, read: false },
        { $set: { read: true } },
      );
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: user.id },
        { $set: { read: true } },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mobile Mark Read Error:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 },
    );
  }
}
