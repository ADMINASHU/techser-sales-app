"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { appendEntryToSheet, updateEntryInSheet } from "@/lib/googleSheets";
import { triggerNotification } from "@/lib/knock";

// Helper for notifications
async function notifyAdmins(action, entry, actor) {
    try {
        const admins = await User.find({ role: "admin" }).select("_id");
        const recipientIds = admins.map(a => a._id.toString());

        if (recipientIds.length > 0) {
            await triggerNotification("entry-action", {
                recipients: recipientIds,
                actor: { id: actor.id, name: actor.name, email: actor.email },
                data: {
                    action,
                    customerName: entry.customerName,
                    entryId: entry._id.toString(),
                    timestamp: new Date().toISOString(),
                    location: entry.customerAddress,
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

        // 1. Get customer details
        const customer = await Customer.findById(customerId);
        if (!customer) return { error: "Customer not found" };

        // 2. Check if there's already an active entry for today for this customer/user
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const existingEntry = await Entry.findOne({
            customerId,
            userId: session.user.id,
            status: { $in: ["Not Started", "In Process"] },
            entryDate: { $gte: today, $lte: endOfToday }
        });

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
            }
        });

        // Sync to Google Sheets & Notify in parallel
        const entryData = entry.toObject();
        entryData.userEmail = session.user.email;
        entryData.userName = session.user.name;
        entryData.userRegion = session.user.region;
        entryData.userBranch = session.user.branch;

        const [sheetResponse, _] = await Promise.all([
            appendEntryToSheet(entryData),
            notifyAdmins("Stamped In", entry, session.user)
        ]);

        if (sheetResponse && sheetResponse.rowId) {
            entry.googleSheetRowId = sheetResponse.rowId;
            await entry.save();
        }

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

        // Find the active entry
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
        ).populate("userId", "name email region branch role designation image status");

        if (!entry) {
            return { error: "No active stamp-in found for this customer" };
        }

        const tasks = [notifyAdmins("Stamped Out", entry, session.user)];

        // Sync Update to Sheet
        if (entry.googleSheetRowId) {
            const entryData = { ...entry.toObject() };
            entryData.userName = entry.userId?.name || session.user.name;
            entryData.userRegion = entry.userId?.region || session.user.region;
            entryData.userBranch = entry.userId?.branch || session.user.branch;

            tasks.push(updateEntryInSheet(entryData));
        }

        await Promise.all(tasks);

        revalidatePath("/customer-log");
        revalidatePath("/entries");
        return { success: true };
    } catch (error) {
        console.error("Customer Stamp Out Error:", error);
        return { error: "Failed to stamp out" };
    }
}
