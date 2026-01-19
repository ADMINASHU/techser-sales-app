import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedNotificationCount = unstable_cache(
  async (userId) => {
    await dbConnect();
    return await Notification.countDocuments({
      userId,
      read: false,
    });
  },
  ["notification-count"], // Base key
  { revalidate: 300 } // Fallback revalidation (5 mins)
);

export async function GET(req) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await getCachedNotificationCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Notification Count Error:", error);
    return NextResponse.json(
      { error: "Failed to count notifications" },
      { status: 500 }
    );
  }
}
