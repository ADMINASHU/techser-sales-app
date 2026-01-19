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

    const count = await Notification.countDocuments({
      userId: user.id,
      read: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Mobile Notification Count Error:", error);
    return NextResponse.json(
      { error: "Failed to count notifications" },
      { status: 500 },
    );
  }
}
