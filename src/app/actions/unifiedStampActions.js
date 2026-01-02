"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import User from "@/models/User";
import SystemSetting from "@/models/SystemSetting";
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

            // await notifyAdmins("Stamped In", existingEntry, session.user);
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
        // Sync to Google Sheets
        // const tasks = [notifyAdmins("Stamped In", entry, session.user)];
        const tasks = [];
        let sheetPromise = Promise.resolve(null);

        // Fire-and-forget Google Sheet Sync
        (async () => {
            try {
                const liveSyncSetting = await SystemSetting.findOne({ key: "liveSync" });
                // Default to FALSE if setting is missing, per user request
                const shouldSync = liveSyncSetting ? liveSyncSetting.value : false; 
                
                if (!shouldSync) return;

                const entryData = entry.toObject();
                    // Explicitly attach the full customer object we already fetched
                    entryData.customerId = customer.toObject(); 
                    entryData.userEmail = session.user.email;
                    entryData.userName = session.user.name;
                    entryData.userRegion = session.user.region;
                    entryData.userBranch = session.user.branch;
                    
                    const sheetResponse = await appendEntryToSheet(entryData);
                    
                    if (sheetResponse && sheetResponse.rowId) {
                        entry.googleSheetRowId = sheetResponse.rowId;
                        await entry.save();
                    }
                } catch (err) {
                    console.error("Background Sheet Sync Error:", err);
                }
            })();

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
            ).populate("userId", "name email region branch role designation image status")
             .populate("customerId"); // Populate customer to get location/address for sheet

        if (!entry) {
            return { error: "No active stamp-in found for this customer" };
        }

        // const tasks = [notifyAdmins("Stamped Out", entry, session.user)];
        const tasks = [];

        // Sync Update to Sheet (Background)
        if (entry.googleSheetRowId) {
            (async () => {
                try {
                    const liveSyncSetting = await SystemSetting.findOne({ key: "liveSync" });
                    // Default to FALSE if setting is missing
                    const isLiveSyncOn = liveSyncSetting ? liveSyncSetting.value : false;

                    if (isLiveSyncOn) {
                        const entryData = { ...entry.toObject() };
                        entryData.userName = entry.userId?.name || session.user.name;
                        entryData.userRegion = entry.userId?.region || session.user.region;
                        entryData.userBranch = entry.userId?.branch || session.user.branch;
                        await updateEntryInSheet(entryData);
                    }
                } catch(err) {
                    console.error("Background Sheet Update Error:", err);
                }
            })();
        }

        revalidatePath("/customer-log");
        revalidatePath("/entries");
        return { success: true };
    } catch (error) {
        console.error("Customer Stamp Out Error:", error);
        return { error: "Failed to stamp out" };
    }
}
