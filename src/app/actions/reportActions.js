"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";
import Location from "@/models/Location";

export async function getReportData({ startDate, endDate, userId, region, branch }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    let query = {};

    if (userId && userId !== "all") query.userId = userId;
    if (region && region !== "all") query.region = region;
    if (branch && branch !== "all") query.branch = branch;

    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const entries = await Entry.find(query).populate("userId", "name email region branch");

    // Format for Excel
    const data = entries.map(e => ({
        Date: new Date(e.createdAt).toLocaleDateString(),
        User: e.userId?.name || "Unknown",
        // Email: e.userId?.email || "Unknown", // Removed as per request
        Region: e.userId?.region || e.region || "", // Prioritize User's region
        Branch: e.userId?.branch || e.branch || "", // Prioritize User's branch
        Customer: e.customerName,
        Address: e.customerAddress,
        Purpose: e.purpose,
        Status: e.status,
        StampIn: e.stampIn?.time ? new Date(e.stampIn.time).toLocaleString() : "",
        StampOut: e.stampOut?.time ? new Date(e.stampOut.time).toLocaleString() : "",
    }));

    return data;
}

export async function getRawEntries({ startDate, endDate, userId, region, branch, limit }) {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    let query = {};

    if (userId && userId !== "all") query.userId = userId;
    if (region && region !== "all") query.region = region;
    if (branch && branch !== "all") query.branch = branch;

    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // We sort by createdAt -1 to get recent ones
    let queryBuilder = Entry.find(query).populate("userId", "name email region branch").sort({ createdAt: -1 });

    if (limit) {
        queryBuilder = queryBuilder.limit(limit);
    }

    const entries = await queryBuilder;

    return JSON.parse(JSON.stringify(entries));
}

export async function getFilters() {
    await dbConnect();
    // Exclude admins from the user dropdown as they likely don't have sales data
    const users = await User.find({ role: "user" }, "name _id");

    // Fetch Locations (Hierarchy)
    const locations = await Location.find({}).sort({ name: 1 });

    return {
        users: JSON.parse(JSON.stringify(users)),
        locations: JSON.parse(JSON.stringify(locations)), // { _id, name, branches: [] }
    };
}

export async function getSystemStats() {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    // User Stats
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const verifiedAdmins = await User.countDocuments({ role: "admin", status: "verified" });

    const totalUsers = await User.countDocuments({ role: "user" });
    const verifiedUsers = await User.countDocuments({ role: "user", status: "verified" });

    // Location Stats
    const locations = await Location.find({}); // Need all to count branches
    const totalRegions = locations.length;
    const totalBranches = locations.reduce((acc, loc) => acc + (loc.branches?.length || 0), 0);

    return {
        admins: { total: totalAdmins, verified: verifiedAdmins },
        users: { total: totalUsers, verified: verifiedUsers },
        locations: { regions: totalRegions, branches: totalBranches }
    };
}
