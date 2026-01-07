"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { calculateDistance, DUPLICATE_THRESHOLD_METERS } from "@/lib/geoUtils";

/**
 * Check for duplicate/nearby customers at a given location
 * @param {Object} params - Parameters
 * @param {number} params.lat - Latitude of new customer location
 * @param {number} params.lng - Longitude of new customer location
 * @param {string} params.region - Region to filter customers
 * @param {string} params.branch - Branch to filter customers
 * @returns {Promise<Array>} Array of nearby customers with distance
 */
export async function checkDuplicateCustomer({ lat, lng, region, branch }) {
    const session = await auth();
    if (!session) return { error: "Not authenticated" };

    // Validate inputs
    if (!lat || !lng || !region || !branch) {
        return { nearbyCustomers: [] };
    }

    try {
        await dbConnect();

        // Query customers in same region/branch with valid coordinates
        const customers = await Customer.find({
            region,
            branch,
            "location.lat": { $exists: true, $ne: null },
            "location.lng": { $exists: true, $ne: null },
        })
            .select("name customerAddress location district state")
            .lean();

        // Calculate distances and filter by threshold
        const nearbyCustomers = customers
            .map((customer) => {
                const distance = calculateDistance(
                    lat,
                    lng,
                    customer.location.lat,
                    customer.location.lng
                );

                return {
                    _id: customer._id.toString(),
                    name: customer.name,
                    customerAddress: customer.customerAddress,
                    district: customer.district,
                    state: customer.state,
                    distance: Math.round(distance), // Round to nearest meter
                };
            })
            .filter((customer) => customer.distance <= DUPLICATE_THRESHOLD_METERS)
            .sort((a, b) => a.distance - b.distance); // Sort by closest first

        return { nearbyCustomers: JSON.parse(JSON.stringify(nearbyCustomers)) };
    } catch (error) {
        return { error: "Failed to check for duplicates" };
    }
}
