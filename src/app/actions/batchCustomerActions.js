"use server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";

/**
 * Batch fetch active entry statuses for multiple customers
 * This replaces the N+1 query pattern in getCustomerActionStatus
 * 
 * @param {Array} customerIds - Array of customer IDs to check
 * @param {String} userId - User ID to check entries for
 * @returns {Object} Map of customerId -> activeEntry
 */
export async function batchGetCustomerActionStatus(customerIds, userId) {
    try {
        await dbConnect();

        // Single query to get all active entries for the given customers and user
        const activeEntries = await Entry.find({
            customerId: { $in: customerIds },
            userId,
            status: { $in: ["Not Started", "In Process"] }
        })
            .select("customerId status entryDate createdAt stampIn") // Include stampIn for duration display
            .sort({ createdAt: -1 })
            .lean();

        // Create a map of customerId -> most recent active entry
        const statusMap = {};
        for (const entry of activeEntries) {
            const customerId = entry.customerId.toString();
            // Only keep the first (most recent) entry per customer
            if (!statusMap[customerId]) {
                statusMap[customerId] = entry;
            }
        }

        // Serialize to plain objects for Client Components
        return JSON.parse(JSON.stringify(statusMap));
    } catch (error) {
        return {};
    }
}
