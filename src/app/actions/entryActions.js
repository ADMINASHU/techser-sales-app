"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer"; // Ensure Customer model is registered
import SystemSetting from "@/models/SystemSetting";
import { revalidatePath } from "next/cache";
import { appendEntryToSheet } from "@/lib/googleSheets";

import { z } from "zod";

const EntrySchema = z.object({
    customerName: z.string().min(1, "Customer Name is required"),
    customerAddress: z.string().min(5, "Valid Customer Address is required"),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    lat: z.coerce.number().optional(), // Coerce form string to number
    lng: z.coerce.number().optional(),
    contactPerson: z.string().optional(),
    contactNumber: z.string().optional(),
    // Fix: Don't default to new Date() here, or updates will overwrite existing dates with "now"
    entryDate: z.string().optional().transform((str) => str ? new Date(str) : undefined), 
});

export async function createEntry(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const data = Object.fromEntries(formData);
    const parsed = EntrySchema.safeParse(data);

    if (!parsed.success) {
         console.error("Validation Error:", parsed.error);
         return { error: "Invalid Entry Data: " + parsed.error.issues[0].message };
    }

    const { customerName, customerAddress, district, state, pincode, lat, lng, entryDate, contactPerson, contactNumber } = parsed.data;

    try {
        await dbConnect();
        const entry = await Entry.create({
            userId: session.user.id,
            customerName,
            customerAddress,
            district,
            state,
            pincode,
            location: {
                lat: lat,
                lng: lng,
            },
            contactPerson,
            contactNumber,
            // Explicit default to Now if undefined
            entryDate: entryDate || new Date(),
            status: "Not Started",
        });

        // Parallelize Side Effects (Notification & Sheet Sync)
        const sideEffects = [];

        // 1. Notify Admins
        // 1. Notify Admins - REMOVED per user request (only Stamp In/Out interactions matter)
        // sideEffects.push(notifyAdmins("Created Entry", entry, session.user));

        // 2. Sheet Sync (Conditional)
        sideEffects.push((async () => {
            const liveSyncSetting = await SystemSetting.findOne({ key: "liveSync" });
            const isLiveSyncOn = liveSyncSetting ? liveSyncSetting.value : true;

            if (isLiveSyncOn) {
                const entryWithCustomer = await Entry.findById(entry._id).populate("customerId");
                const entryData = entryWithCustomer.toObject();
                entryData.userEmail = session.user.email;
                entryData.userName = session.user.name;
                entryData.userRegion = session.user.region;
                entryData.userBranch = session.user.branch;
                const sheetResponse = await appendEntryToSheet(entryData);

                if (sheetResponse && sheetResponse.rowId) {
                    entry.googleSheetRowId = sheetResponse.rowId;
                    await entry.save();
                }
            }
        })());

        // Wait for all side effects to complete (or fail) without blocking each other
        await Promise.allSettled(sideEffects);

        revalidatePath("/entries");
        // revalidatePath("/dashboard"); // Removed to prevent Observer refresh in dev mode
        return { success: true, id: entry._id.toString() };
    } catch (error) {
        console.error("Create Entry Error:", error);
        return { error: "Failed to create entry" };
    }
}

export async function updateEntry(id, formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    if (session.user.role === "admin") {
        return { error: "Admins cannot edit entries." };
    }

    const data = Object.fromEntries(formData);
    // Reuse EntrySchema but make everything optional since update might be partial? 
    // Actually, update form usually resubmits all fields. Let's use strict parsing for safety or partial if widely used.
    // Based on `EditEntryForm`, it sends all data.
    const parsed = EntrySchema.safeParse(data);

    if (!parsed.success) {
         return { error: "Invalid Entry Data: " + parsed.error.issues[0].message };
    }

    const { customerName, customerAddress, district, state, pincode, lat, lng, entryDate, contactPerson, contactNumber } = parsed.data;

    try {
        await dbConnect();
        const entry = await Entry.findById(id);
        if (!entry) return { error: "Entry not found" };

        if (entry.userId.toString() !== session.user.id) {
            return { error: "Unauthorized" };
        }

        if (entry.status !== "Not Started" || (entry.stampIn && entry.stampIn.time)) {
            return { error: "Cannot edit an entry that has already started." };
        }

        entry.customerName = customerName;
        entry.customerAddress = customerAddress;
        entry.district = district;
        entry.state = state;
        entry.pincode = pincode;
        if (lat !== undefined && lng !== undefined) {
             entry.location = {
                lat: lat,
                lng: lng,
            };
        }
        entry.contactPerson = contactPerson;
        entry.contactNumber = contactNumber;
        if (entryDate) {
            entry.entryDate = entryDate;
        }

        await entry.save();

        revalidatePath("/entries");
        revalidatePath(`/entries/${id}`);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Update Entry Error:", error);
        return { error: "Failed to update entry" };
    }
}
import { updateEntryInSheet } from "@/lib/googleSheets";
import { triggerNotification } from "@/lib/knock";
import User from "@/models/User";
// import admin from "@/lib/firebaseAdmin";

// Helper specifically for Direct Firebase Push (Backend -> FCM -> Device)
// Firebase Push Validation Removed
/*
async function sendFirebasePush(title, body) {
   // Function removed by request
}
*/

// Helper for notifications (Knock for In-App + Firebase for Push)
async function notifyAdmins(action, entry, actor) {
    try {
        // A. Knock (In-App Feed)
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

        // B. Firebase (Push Notification)
        // Construct a message based on action
        const title = `New Activity: ${action}`;
        const body = `${actor.name} ${action} for ${entry.customerName}`;

        // Fire and forget (don't await strictly if we don't want to block)
        // Fire and forget (don't await strictly if we don't want to block)
        // await sendFirebasePush(title, body); // DISABLED by user request

    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

export async function stampIn(entryId, location) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();

        // Use atomic update to prevent race conditions
        const entry = await Entry.findOneAndUpdate(
            { _id: entryId, $or: [{ "stampIn.time": { $exists: false } }, { "stampIn.time": null }] },
            {
                $set: {
                    status: "In Process",
                    stampIn: {
                        time: new Date(),
                        location: location,
                    }
                }
            },
            { new: true }
        ).populate("userId", "name email region branch");

        if (!entry) {
            console.log(`[StampIn] Entry ${entryId} already stamped in. Skipping.`);
            return { success: true };
        }

        // Parallelize Side Effects
        const sideEffects = [];

        // 1. Notify
        sideEffects.push(notifyAdmins("Stamped In", entry, session.user));

        // 2. Sync
        if (entry.googleSheetRowId) {
            sideEffects.push((async () => {
                const liveSyncSetting = await SystemSetting.findOne({ key: "liveSync" });
                const isLiveSyncOn = liveSyncSetting ? liveSyncSetting.value : true;

                // PRE-FETCH Full Entry if we are possibly going to sync
                // Actually, we can check liveSync first, then fetch entry only if needed
                if (isLiveSyncOn) {
                     const fullEntry = await Entry.findById(entryId).populate("customerId");
                     if (fullEntry) {
                        const entryData = { ...fullEntry.toObject() };
                        entryData.userName = entry.userId?.name || session.user.name;
                        entryData.userRegion = entry.userId?.region || session.user.region;
                        entryData.userBranch = entry.userId?.branch || session.user.branch;
                        await updateEntryInSheet(entryData);
                     }
                }
            })());
        }

        await Promise.allSettled(sideEffects);

        revalidatePath(`/entries`);
        // revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Stamp In Error:", error);
        return { error: "Failed to stamp in" };
    }
}

export async function stampOut(entryId, location) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();

        // Use atomic update to prevent race conditions
        const entry = await Entry.findOneAndUpdate(
            { _id: entryId, status: "In Process" },
            {
                $set: {
                    status: "Completed",
                    stampOut: {
                        time: new Date(),
                        location: location,
                    }
                }
            },
            { new: true }
        ).populate("userId", "name email region branch"); // populate customerId not strictly needed here if we re-fetch

        if (!entry) {
            console.log(`[StampOut] Entry ${entryId} already completed or not in process. Skipping.`);
            return { success: true };
        }

        // Parallelize Side Effects
        const sideEffects = [];

        // 1. Notify
        sideEffects.push(notifyAdmins("Stamped Out", entry, session.user));

        // 2. Sync
        if (entry.googleSheetRowId) {
            sideEffects.push((async () => {
                // Fetch Setting
                const liveSyncSetting = await SystemSetting.findOne({ key: "liveSync" });
                const isLiveSyncOn = liveSyncSetting ? liveSyncSetting.value : true;

                if (isLiveSyncOn) {
                    const fullEntry = await Entry.findById(entryId).populate("customerId");
                    if (fullEntry) {
                         const entryData = { ...fullEntry.toObject() };
                         entryData.userName = entry.userId?.name || session.user.name;
                         entryData.userRegion = entry.userId?.region || session.user.region;
                         entryData.userBranch = entry.userId?.branch || session.user.branch;
                         await updateEntryInSheet(entryData);
                    }
                }
            })());
        }

        await Promise.allSettled(sideEffects);

        revalidatePath(`/entries`);
        // revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Stamp Out Error:", error);
        return { error: "Failed to stamp out" };
    }
}

export async function deleteEntry(entryId) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    // RESTRICTION: Admins cannot delete entries (as per "user only" request)
    if (session.user.role === "admin") {
        return { error: "Admins are not allowed to delete entries." };
    }

    try {
        await dbConnect();

        // Optional: Ensure the user actually owns the entry being deleted
        const entry = await Entry.findById(entryId);
        if (!entry) return { error: "Entry not found" };

        if (entry.userId.toString() !== session.user.id) {
            return { error: "You are not authorized to delete this entry" };
        }

        await Entry.findByIdAndDelete(entryId);
        revalidatePath("/entries");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}

// ... existing imports ...

export async function fetchEntries({ page = 1, limit = 30, filters = {}, skip: customSkip }) {
    try {
        const session = await auth();
        if (!session) {
            throw new Error("Unauthorized");
        }
        await dbConnect();

        // Use customSkip if provided, otherwise calculate from page/limit
        const skip = customSkip !== undefined ? customSkip : (page - 1) * limit;
        const isAdmin = session.user.role === "admin";
        const query = {};

        // ... rest of function ...

        // 1. Role-based Base Query
        if (!isAdmin) {
            query.userId = session.user.id;
        } else {
            if (filters.user && filters.user !== "all") {
                query.userId = filters.user;
            }
        }

        // 2. Date Filter
        if (filters.year && filters.year !== "all") {
            const year = parseInt(filters.year);
            if (!isNaN(year)) {
                let startDate, endDate;
                if (filters.month && filters.month !== "all") {
                    const month = parseInt(filters.month);
                    if (!isNaN(month)) {
                        startDate = new Date(year, month, 1);
                        endDate = new Date(year, month + 1, 0, 23, 59, 59);
                    }
                } else {
                    // Entire Year
                    startDate = new Date(year, 0, 1);
                    endDate = new Date(year, 11, 31, 23, 59, 59);
                }

                if (startDate && endDate) {
                    query.entryDate = {
                        $gte: startDate,
                        $lte: endDate
                    };
                }
            }
        }

        // 3. Status Filter
        if (filters.status && filters.status !== "all") {
            query.status = filters.status;
        }

        // 4. Search Filter
        if (filters.search) {
            const searchRegex = { $regex: filters.search, $options: "i" };
            query.$or = [
                { customerName: searchRegex },
                { customerAddress: searchRegex }
            ];
        }

        // 5. Region & Branch Filters
        if (!query.userId && ((filters.region && filters.region !== "all") || (filters.branch && filters.branch !== "all"))) {
            let userQuery = {};
            if (filters.region && filters.region !== "all") userQuery.region = filters.region;
            if (filters.branch && filters.branch !== "all") userQuery.branch = filters.branch;
            const matchingUsers = await User.find(userQuery, "_id").lean();
            query.userId = { $in: matchingUsers.map(u => u._id) };
        }

        // Fetch Entries
        const entries = await Entry.find(query)
            .sort({ entryDate: -1 }) // Sort by Entry Date 
            .skip(skip)
            .limit(limit)
            .select("customerName entryDate status createdAt updatedAt userId customerId stampIn stampOut googleSheetRowId")
            .populate("userId", "name email region branch role designation image status")
            .populate("customerId", "name customerAddress contactPerson contactNumber location") // Populate specific customer details
            .lean();


        // Serialize
        const serializedEntries = entries.map(entry => ({
            ...entry,
            _id: entry._id.toString(),
            userId: entry.userId ? {
                ...entry.userId,
                _id: entry.userId._id.toString()
            } : null,
            customerId: entry.customerId ? {
                ...entry.customerId,
                _id: entry.customerId._id.toString()
            } : null,
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
            entryDate: entry.entryDate ? new Date(entry.entryDate).toISOString() : null,
            // Ensure any other serialized fields needed
        }));

        return {
            entries: serializedEntries,
            hasMore: entries.length === limit
        };

    } catch (error) {
        console.error("Error fetching entries:", error);
        throw new Error("Failed to fetch entries");
    }
}
