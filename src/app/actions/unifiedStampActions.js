"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { revalidatePath, revalidateTag } from "next/cache";
import { sendNotificationToUsers } from "@/lib/fcmNotification";

// Helper for notifications
async function notifySupervisors(action, entry, actor) {
  try {
    // 1. Try to find Super Users in the same region first (ONLY if actor is not a super_user)
    let recipients = [];
    if (actor.role !== "super_user") {
      recipients = await User.find({
        role: "super_user",
        region: entry.userRegion,
      })
        .select("_id")
        .lean();
    }

    let recipientIds = recipients.map((r) => r._id.toString());
    let titlePrefix = "Regional Update";

    // 2. Fallback to Regional Administrators if no Super User exists in that region
    if (recipientIds.length === 0) {
      recipients = await User.find({
        role: "admin",
        region: entry.userRegion,
      })
        .select("_id")
        .lean();
      recipientIds = recipients.map((r) => r._id.toString());
      // titlePrefix stays "Regional Update"
    }

    // 3. Final Fallback to all Administrators if no regional supervisor exists
    if (recipientIds.length === 0) {
      recipients = await User.find({ role: "admin" }).select("_id").lean();
      recipientIds = recipients.map((r) => r._id.toString());
      titlePrefix = "New Activity";
    }

    if (recipientIds.length > 0) {
      await sendNotificationToUsers({
        userIds: recipientIds,
        notification: {
          title: `${titlePrefix}: ${action}`,
          body: `${actor.name} ${action} for ${entry.customerName}`,
          tag: `entry-${entry._id}-${action}`, // Unique tag for this event
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

export async function customerStampIn(customerId, location) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  try {
    await dbConnect();

    // 2. Parallelize Data Fetching: Customer, and Existing Entry;

    const [customer, existingEntry] = await Promise.all([
      Customer.findById(customerId).lean(),
      Entry.findOne({
        customerId,
        userId: session.user.id,
        status: { $in: ["In Process"] },
      }).lean(),
    ]);

    // 3. Logic Checks
    if (!customer) return { error: "Customer not found" };
    if (existingEntry)
      return { error: "Already stamped in for this customer today" };

    // 4. Create new entry and Increment Customer Entry Count
    // Execute DB writes in parallel where possible, or sequentially if strict consistency needed.
    // Here we can run Entry.create and Customer.update in parallel?
    // Safety first: Create entry, then update customer.

    const entry = await Entry.create({
      userId: session.user.id,
      customerId: customer._id,
      customerName: customer.name, // Keep for search index
      entryDate: new Date(),
      status: "In Process",
      stampIn: {
        time: new Date(),
        location: location,
      },
      // Denormalized user data
      userRegion: session.user.region,
      userBranch: session.user.branch,
    });

    // Fire-and-forget logic for optimization:
    // Update Customer count and Notify Admins can happen without blocking the return.
    // However, Vercel Serverless needs `waitUntil` or await. Safe bet is `Promise.all`.

    // We increment count effectively.
    const updateCustomerPromise = Customer.findByIdAndUpdate(customerId, {
      $inc: { entryCount: 1 },
    });

    const notificationPromise = notifySupervisors("Stamped In", entry, {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    });

    // We await them to ensure execution in serverless environment
    await Promise.all([updateCustomerPromise, notificationPromise]);

    revalidatePath("/customer-log");
    revalidatePath("/entries");
    revalidatePath("/dashboard");
    revalidateTag("entries", "max"); // Invalidate cached entry lists
    return { success: true };
  } catch (error) {
    return { error: "Failed to stamp in" };
  }
}

export async function customerStampOut(customerId, location) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  try {
    await dbConnect();

    // Parallelize updates
    const entry = await Entry.findOneAndUpdate(
      {
        customerId,
        userId: session.user.id,
        status: "In Process",
      },
      {
        $set: {
          status: "Completed",
          stampOut: {
            time: new Date(),
            location: location,
          },
        },
      },
      { new: true, sort: { createdAt: -1 } },
    ).lean(); // Removed critical-path populates

    if (!entry) {
      return { error: "No active stamp-in found for this customer" };
    }

    // Notify admins about stamp out
    // Perform this in parallel with any other cleanup if needed
    await notifySupervisors("Stamped Out", entry, {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    });

    revalidatePath("/customer-log");
    revalidatePath("/entries");
    revalidatePath("/dashboard");
    revalidateTag("entries", "max");
    return { success: true };
  } catch (error) {
    return { error: "Failed to stamp out" };
  }
}
