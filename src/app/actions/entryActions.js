"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { revalidatePath } from "next/cache";
import { appendEntryToSheet } from "@/lib/googleSheets";

export async function createEntry(formData) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    const { customerName, customerAddress, region, branch, purpose } = Object.fromEntries(formData);

    try {
        await dbConnect();
        const entry = await Entry.create({
            userId: session.user.id,
            customerName,
            customerAddress,
            region,
            branch,
            purpose,
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

export async function stampIn(entryId, location) {
    try {
        await dbConnect();
        await Entry.findByIdAndUpdate(entryId, {
            "stampIn.time": new Date(),
            "stampIn.location": location,
            status: "In Process",
        });
        revalidatePath(`/entries`);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to stamp in" };
    }
}

export async function stampOut(entryId, location) {
    try {
        await dbConnect();
        await Entry.findByIdAndUpdate(entryId, {
            "stampOut.time": new Date(),
            "stampOut.location": location,
            status: "Completed",
        });
        revalidatePath(`/entries`);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to stamp out" };
    }
}

export async function deleteEntry(entryId) {
    try {
        await dbConnect();
        await Entry.findByIdAndDelete(entryId);
        revalidatePath("/entries");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}
