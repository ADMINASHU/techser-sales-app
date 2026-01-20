import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";
import { revalidatePath } from "next/cache";

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const targetUser = searchParams.get("user");
    const region = searchParams.get("region");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");

    let query = {};

    // 1. Role / User Filter
    if (user.role !== "admin") {
      query.userId = user.id;
    } else {
      if (targetUser && targetUser !== "all") {
        query.userId = targetUser;
      }
      if (region && region !== "all") query.userRegion = region;
      if (branch && branch !== "all") query.userBranch = branch;
    }

    // 1.5 Customer Filter
    const customerId = searchParams.get("customerId");
    if (customerId) {
      query.customerId = customerId;
    }

    // 2. Status Filter
    if (status && status !== "all") {
      query.status = status;
    }

    // 3. Date Filter (Month/Year)
    if (year && year !== "all") {
      const start = new Date(
        parseInt(year),
        month && month !== "all" ? parseInt(month) : 0,
        1,
      );
      const end = new Date(
        parseInt(year),
        month && month !== "all" ? parseInt(month) + 1 : 12,
        0,
        23,
        59,
        59,
      );
      query.entryDate = { $gte: start, $lte: end };
    }

    // 4. Search Filter (Name, Address)
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];
    }

    const entries = await Entry.find(query)
      .sort({ entryDate: -1 })
      .limit(100)
      .populate("userId", "name email")
      .populate(
        "customerId",
        "name district customerAddress contactPerson contactNumber",
      );

    // CACHE LOGIC: Generate ETag based on the most recently modified entry
    if (entries.length > 0) {
      // Find the latest update time among fetched entries
      // Note: Ideally sort by updatedAt, but here we scan valid set
      const latestEntry = entries.reduce((latest, current) => {
        return new Date(current.updatedAt) > new Date(latest.updatedAt)
          ? current
          : latest;
      }, entries[0]);

      const lastModified = new Date(latestEntry.updatedAt).getTime();
      const etag = `"${lastModified}"`;

      const ifNoneMatch = req.headers.get("if-none-match");

      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 });
      }

      return NextResponse.json(
        { success: true, entries },
        {
          headers: {
            ETag: etag,
            "Cache-Control": "no-cache, must-revalidate", // Force check with server
          },
        },
      );
    }

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("Mobile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import { sendNotificationToUsers } from "@/lib/fcmNotification";
import User from "@/models/User";

// Helper for notifications
async function notifyAdmins(action, entry, actor) {
  try {
    // Only notify admins in the same region as the entry
    const admins = await User.find({
      role: "admin",
      region: entry.userRegion,
    }).select("_id");
    const adminIds = admins.map((a) => a._id.toString());

    if (adminIds.length > 0) {
      await sendNotificationToUsers({
        userIds: adminIds,
        notification: {
          title: `New Activity: ${action}`,
          body: `${actor.name} ${action} for ${entry.customerName}`,
        },
        data: {
          link: `/entries/${entry._id}`,
        },
      });
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);

    if (!user) return unauthorizedResponse();

    const body = await req.json(); // Expected: { customerId, customerName, status, stampIn, ... }

    await dbConnect();

    // Verify customer exists
    const customer = await Customer.findById(body.customerId);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // DUPLICATE CHECK: Check if already stamped in
    const existingEntry = await Entry.findOne({
      customerId: body.customerId,
      userId: user.id,
      status: { $in: ["In Process"] },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Already stamped in for this customer" },
        { status: 409 },
      );
    }

    // Create entry
    const newEntry = await Entry.create({
      ...body,
      userId: user.id,
      userRegion: user.region,
      userBranch: user.branch,
      entryDate: new Date(),
    });

    // Update customer entry count
    await Customer.findByIdAndUpdate(body.customerId, {
      $inc: { entryCount: 1 },
    });

    // NOTIFICATION
    // NOTIFICATION (Fire and Forget)
    notifyAdmins("Stamped In", newEntry, {
      name: user.name,
    }).catch((err) => console.error("Notification Error:", err));

    revalidatePath("/customer-log");
    revalidatePath("/customers");

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error("Mobile Create Entry Error:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}
