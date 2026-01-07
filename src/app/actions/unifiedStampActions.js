"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { sendNotificationToUsers } from "@/lib/fcmNotification";


// Helper for notifications
async function notifyAdmins(action, entry, actor) {
  try {
    // Only notify admins in the same region as the entry
    const admins = await User.find({
      role: "admin",
      region: entry.userRegion
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

export async function customerStampIn(customerId, location) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  try {
    await dbConnect();

    // 2. Parallelize Data Fetching: Customer, and Existing Entry;

    const [customer, existingEntry] = await Promise.all([
      Customer.findById(customerId),
      Entry.findOne({
        customerId,
        userId: session.user.id,
        status: { $in: ["In Process"] },
      }),
    ]);

    // 3. Logic Checks
    if (!customer) return { error: "Customer not found" };
    if (existingEntry)
      return { error: "Already stamped in for this customer today" };

    // 4. Create new entry
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

    await notifyAdmins("Stamped In", entry, {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });
    revalidatePath("/customer-log");
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
      { new: true, sort: { createdAt: -1 } }
    ); // Removed critical-path populates

    if (!entry) {
      return { error: "No active stamp-in found for this customer" };
    }

    // Notify admins about stamp out
    await notifyAdmins("Stamped Out", entry, {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });

    revalidatePath("/customer-log");
    return { success: true };
  } catch (error) {
    return { error: "Failed to stamp out" };
  }
}
