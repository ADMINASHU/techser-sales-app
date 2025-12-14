"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { revalidatePath } from "next/cache";
import { appendEntryToSheet } from "@/lib/googleSheets";

export async function createEntry(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const data = Object.fromEntries(formData);
    console.log("Server createEntry Received Data:", data);
    const { customerName, customerAddress, district, state, pincode, lat, lng, purpose, entryDate, contactPerson, contactNumber } = data;

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
                lat: lat ? parseFloat(lat) : undefined,
                lng: lng ? parseFloat(lng) : undefined,
            },
            contactPerson,
            contactNumber,
            purpose,
            entryDate: entryDate ? new Date(entryDate) : new Date(),
            status: "Not Started",
        });

        const entryData = entry.toObject();
        entryData.userEmail = session.user.email;
        await appendEntryToSheet(entryData);

        revalidatePath("/entries");
        revalidatePath("/dashboard");
        return { success: true, id: entry._id.toString() };
    } catch (error) {
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
    const { customerName, customerAddress, district, state, pincode, lat, lng, purpose, entryDate, contactPerson, contactNumber } = data;

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
        if (lat && lng) {
            entry.location = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            };
        }
        entry.contactPerson = contactPerson;
        entry.contactNumber = contactNumber;
        entry.purpose = purpose;
        if (entryDate) {
            entry.entryDate = new Date(entryDate);
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

import { triggerNotification } from "@/lib/knock";
import User from "@/models/User";

// Helper for notifications
async function notifyAdmins(action, entry, actor) {
    try {
        const admins = await User.find({ role: "admin" }).select("_id");
        const recipientIds = admins.map(a => a._id.toString());

        if (recipientIds.length === 0) return;

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
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

export async function stampIn(entryId, location) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();
        const updatedEntry = await Entry.findByIdAndUpdate(
            entryId,
            {
                "stampIn.time": new Date(),
                "stampIn.location": location,
                status: "In Process",
            },
            { new: true }
        );

        // Trigger Notification
        await notifyAdmins("Stamped In", updatedEntry, session.user);

        revalidatePath(`/entries`);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to stamp in" };
    }
}

export async function stampOut(entryId, location) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    try {
        await dbConnect();
        const updatedEntry = await Entry.findByIdAndUpdate(
            entryId,
            {
                "stampOut.time": new Date(),
                "stampOut.location": location,
                status: "Completed",
            },
            { new: true }
        );

        // Trigger Notification
        await notifyAdmins("Stamped Out", updatedEntry, session.user);

        revalidatePath(`/entries`);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
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
        if (filters.month !== undefined && filters.year !== undefined && filters.month !== "all" && filters.year !== "all") {
            const month = parseInt(filters.month);
            const year = parseInt(filters.year);
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // 3. Status Filter
        if (filters.status && filters.status !== "all") {
            query.status = filters.status;
        }

        // 4. Search Filter
        if (filters.search) {
            query.customerName = { $regex: filters.search, $options: "i" };
        }

        // 5. Region & Branch Filters
        if (filters.region && filters.region !== "all") {
            query.region = filters.region;
        }

        if (filters.branch && filters.branch !== "all") {
            query.branch = filters.branch;
        }

        // Fetch Entries
        const entries = await Entry.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "name email region branch")
            .lean();

        // Serialize
        const serializedEntries = entries.map(entry => ({
            ...entry,
            _id: entry._id.toString(),
            userId: entry.userId ? {
                ...entry.userId,
                _id: entry.userId._id.toString()
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
