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
    const updateCustomerPromise = Customer.findByIdAndUpdate(customerId, { $inc: { entryCount: 1 } });

    const notificationPromise = notifyAdmins("Stamped In", entry, {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });

    // We await them to ensure execution in serverless environment
    await Promise.all([updateCustomerPromise, notificationPromise]);

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
    // Perform this in parallel with any other cleanup if needed
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
