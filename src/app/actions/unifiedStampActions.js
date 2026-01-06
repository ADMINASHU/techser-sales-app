"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import User from "@/models/User";
import SystemSetting from "@/models/SystemSetting";
import { revalidatePath } from "next/cache";
import { sendNotificationToUsers } from "@/lib/fcmNotification";

// Helper for notifications
async function notifyAdmins(action, entry, actor) {
    try {
        const admins = await User.find({ role: "admin" }).select("_id");
        const adminIds = admins.map(a => a._id.toString());

        if (adminIds.length > 0) {
            await sendNotificationToUsers({
                userIds: adminIds,
                notification: {
                    title: `New Activity: ${action}`,
                    body: `${actor.name} ${action} for ${entry.customerName}`
                },
                data: {
                    type: "entry-action",
                    action: String(action || ""),
                    customerName: String(entry.customerName || ""),
                    entryId: entry._id.toString(),
                    location: String(entry.customerAddress || entry.stampIn?.location?.address || ""),
                    link: `/entries/${entry._id}`
                }
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

        // 2. Parallelize Data Fetching: Customer, Existing Entry, and System Setting
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const [customer, existingEntry] = await Promise.all([
            Customer.findById(customerId),
            Entry.findOne({
                customerId,
                userId: session.user.id,
                status: { $in: ["Not Started", "In Process"] },
                entryDate: { $gte: today, $lte: endOfToday }
            })
        ]);

        if (!customer) return { error: "Customer not found" };

        // const isLiveSyncOn = true; // Removed to enforce background check with default OFF

        // 3. Logic Checks
        if (existingEntry) {
            if (existingEntry.status === "In Process") {
                return { error: "Already stamped in for this customer today" };
            }
            // If "Not Started", we can just use this entry
            existingEntry.status = "In Process";
            existingEntry.stampIn = {
                time: new Date(),
                location: location
            };
            await existingEntry.save();

            await notifyAdmins("Stamped In", existingEntry, session.user);
            revalidatePath("/customer-log");
            return { success: true };
        }

        // 3. Create new entry
        const entry = await Entry.create({
            userId: session.user.id,
            customerId: customer._id,
            customerName: customer.name, // Keep for search index
            entryDate: new Date(),
            status: "In Process",
            stampIn: {
                time: new Date(),
                location: location
            },
            // Denormalized user data
            userRegion: session.user.region,
            userBranch: session.user.branch,
        });

        // No background tasks - Google Sheets integration removed

        revalidatePath("/customer-log");
        revalidatePath("/entries");
        return { success: true };
    } catch (error) {
        console.error("Customer Stamp In Error:", error);
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
                status: "In Process"
            },
            {
                $set: {
                    status: "Completed",
                    stampOut: {
                        time: new Date(),
                        location: location,
                    }
                }
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
            email: session.user.email
        });

        revalidatePath("/customer-log");
        revalidatePath("/entries");
        return { success: true };
    } catch (error) {
        console.error("Customer Stamp Out Error:", error);
        return { error: "Failed to stamp out" };
    }
}
