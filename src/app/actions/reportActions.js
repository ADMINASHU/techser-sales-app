"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";
import Location from "@/models/Location";
import { formatInIST } from "@/lib/utils";

// Helper: Calculate distance between two coordinates in km (Haversine formula)
function calculateDistance(loc1, loc2) {
    if (!loc1?.lat || !loc1?.lng || !loc2?.lat || !loc2?.lng) return "";

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(loc2.lat - loc1.lat);
    const dLon = deg2rad(loc2.lng - loc1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(2); // Return as string with 2 decimals
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export async function getReportData({ startDate, endDate, userId, region, branch }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    let query = {};

    if (userId && userId !== "all") {
        query.userId = userId;
    } else if ((region && region !== "all") || (branch && branch !== "all")) {
        let userQuery = {};
        if (region && region !== "all") userQuery.region = region;
        if (branch && branch !== "all") userQuery.branch = branch;
        const matchingUsers = await User.find(userQuery, "_id").lean();
        query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    if (startDate && endDate) {
        query.entryDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const entries = await Entry.find(query)
        .populate("userId", "name email region branch role status image")
        .populate("customerId"); // Populate customer data

    // Format for Excel - Match Google Sheets column order exactly
    // Columns: Date | Status | Region | Branch | User Name | Customer Name | 
    // Customer Address | Contact Person & Number | Purpose | StampIn Time | 
    // StampOut Time | StampIn Distance | StampOut Distance | ID
    const data = entries.map(e => {
        const customer = e.customerId || {};
        const customerLoc = customer.location || e.location; // { lat, lng }
        const stampInLoc = e.stampIn?.location;
        const stampOutLoc = e.stampOut?.location;

        return {
            "Date": e.entryDate ? formatInIST(e.entryDate, "dd/MM/yyyy") : formatInIST(e.createdAt, "dd/MM/yyyy"),
            "Status": e.status || "Not Started",
            "Region": e.userRegion || e.userId?.region || "",
            "Branch": e.userBranch || e.userId?.branch || "",
            "User Name": e.userName || e.userId?.name || "",
            "Customer Name": e.customerName || customer.name || "",
            "Customer Address": customer.customerAddress || e.customerAddress || "",
            "Contact Person & Number": `${customer.contactPerson || e.contactPerson || ""} ${customer.contactNumber || e.contactNumber || ""}`.trim(),
            "StampIn Time": e.stampIn?.time ? formatInIST(e.stampIn.time, "dd/MM/yyyy HH:mm:ss") : "",
            "StampOut Time": e.stampOut?.time ? formatInIST(e.stampOut.time, "dd/MM/yyyy HH:mm:ss") : "",
            "StampIn Distance (km)": calculateDistance(customerLoc, stampInLoc),
            "StampOut Distance (km)": calculateDistance(customerLoc, stampOutLoc)
        };
    });

    return data;
}

export async function getRawEntries({ startDate, endDate, userId, region, branch, limit }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    let query = {};

    if (userId && userId !== "all") {
        query.userId = userId;
    } else if ((region && region !== "all") || (branch && branch !== "all")) {
        let userQuery = {};
        if (region && region !== "all") userQuery.region = region;
        if (branch && branch !== "all") userQuery.branch = branch;
        const matchingUsers = await User.find(userQuery, "_id").lean();
        query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    if (startDate && endDate) {
        query.entryDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // We sort by createdAt -1 to get recent ones
    let queryBuilder = Entry.find(query)
        .populate("userId", "name email region branch role status image")
        .populate("customerId")
        .sort({ createdAt: -1 });

    if (limit) {
        queryBuilder = queryBuilder.limit(limit);
    }

    const entries = await queryBuilder;

    return JSON.parse(JSON.stringify(entries));
}

export async function getFilters() {
    await dbConnect();
    const [users, locations] = await Promise.all([
        User.find({ role: "user" }, "name _id").lean(),
        Location.find({}).sort({ name: 1 }).lean()
    ]);

    return {
        users: JSON.parse(JSON.stringify(users)),
        locations: JSON.parse(JSON.stringify(locations)), // { _id, name, branches: [] }
    };
}

import { unstable_cache } from "next/cache";

const getCachedSystemStats = unstable_cache(
    async () => {
        // ... (data fetching logic)
        await dbConnect();
        
        const [totalAdmins, verifiedAdmins, totalUsers, verifiedUsers, locations] = await Promise.all([
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "admin", status: "verified" }),
            User.countDocuments({ role: "user" }),
            User.countDocuments({ role: "user", status: "verified" }),
            Location.find({}).lean()
        ]);

        const totalRegions = locations.length;
        const totalBranches = locations.reduce((acc, loc) => acc + (loc.branches?.length || 0), 0);

        return {
            admins: { total: totalAdmins, verified: verifiedAdmins },
            users: { total: totalUsers, verified: verifiedUsers },
            locations: { regions: totalRegions, branches: totalBranches }
        };
    },
    ['system-stats'],
    { revalidate: 300 } // Cache for 5 minutes
);

// Wrapper to secure it (Exported as getSystemStats to maintain compatibility)
export async function getSystemStats() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
         throw new Error("Unauthorized");
    }
    return getCachedSystemStats();
}
