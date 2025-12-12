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
    const { customerName, customerAddress, district, state, pincode, lat, lng, region, branch, purpose, entryDate } = data;

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
            region,
            branch,
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
