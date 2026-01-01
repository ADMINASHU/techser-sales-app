"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { appendEntryToSheet, clearSheet } from "@/lib/googleSheets";

export async function syncOldEntries() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        await dbConnect();
        
        // 1. Clear Sheet first
        await clearSheet();

        // Fetch all entries with populated user details
        const entries = await Entry.find({})
            .sort({ createdAt: 1 }) // Oldest first
            .populate("userId", "name email region branch")
            .populate("customerId")
            .lean();

        let successCount = 0;
        let failCount = 0;

        for (const entry of entries) {
            // Prepare data object similar to createEntry
            const entryData = {
                ...entry,
                _id: entry._id.toString(),
                userEmail: entry.userId?.email || "",
                userName: entry.userId?.name || "",
                userRegion: entry.userId?.region || "",
                userBranch: entry.userId?.branch || "",
            };

            // Call the shared append function
            const result = await appendEntryToSheet(entryData);
            if (result) {
                // If the sync was successful, save the Google Sheet Row ID to the entry
                // This allows future updates (if any) to work for these backfilled entries
                if (result.rowId) {
                    await Entry.findByIdAndUpdate(entry._id, {
                        googleSheetRowId: result.rowId
                    });
                }
                successCount++;
            } else {
                failCount++;
            }
        }

        return { 
            success: true, 
            message: `Synced ${successCount} entries. Failed: ${failCount}` 
        };

    } catch (error) {
        console.error("Bulk Sync Error:", error);
        return { error: "Failed to sync entries" };
    }
}
