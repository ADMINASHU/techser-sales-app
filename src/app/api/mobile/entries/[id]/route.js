import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";
import { revalidatePath } from "next/cache";

import { sendNotificationToUsers } from "@/lib/fcmNotification";
import User from "@/models/User";

// Helper for notifications
async function notifyAdmins(action, entry, actor) {
  try {
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

export async function PUT(req, { params }) {
  try {
    const user = await verifyAuth(req);

    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json(); // Expected: { status, stampOut, location, ... }

    await dbConnect();

    const entry = await Entry.findById(id);

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Authorization check
    if (user.role !== "admin" && entry.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this entry" },
        { status: 403 },
      );
    }

    // Logic for "Stamp Out" or general update
    if (body.status === "Completed" && body.stampOut) {
      // Ensure stampIn exists
      if (!entry.stampIn) {
        return NextResponse.json(
          { error: "Cannot stamp out without stamp in" },
          { status: 400 },
        );
      }
    }

    const updatedEntry = await Entry.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }, // Return updated doc
    );

    // NOTIFICATION
    if (body.status === "Completed") {
      notifyAdmins("Stamped Out", updatedEntry, {
        name: user.name,
      }).catch((err) => console.error("Notification Error:", err));
    }

    revalidatePath("/customer-log");
    revalidatePath("/customers");

    return NextResponse.json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error("Mobile Update Entry Error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    await dbConnect();

    const entry = await Entry.findById(id);

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Authorization check
    if (user.role !== "admin" && entry.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this entry" },
        { status: 403 },
      );
    }

    await Entry.findByIdAndDelete(id);

    // Optionally decrement customer count logic here if needed,
    // but complex to track if it was "Completed" or not.
    // For now, simplicity.

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Mobile Delete Entry Error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
