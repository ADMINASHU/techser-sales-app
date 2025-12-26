"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";
import Location from "@/models/Location";
import { format } from "date-fns";

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

    // Format for Excel - Match Google Sheets column order exactly
    // Columns: Date | Status | Region | Branch | User Name | Customer Name | 
    // Customer Address | Contact Person & Number | Purpose | StampIn Time | 
    // StampOut Time | StampIn Distance | StampOut Distance | ID
    const data = entries.map(e => {
        const customerLoc = e.location; // { lat, lng }
        const stampInLoc = e.stampIn?.location;
        const stampOutLoc = e.stampOut?.location;

        return {
            "Date": e.entryDate ? format(new Date(e.entryDate), "dd/MM/yyyy HH:mm:ss") : format(new Date(e.createdAt), "dd/MM/yyyy HH:mm:ss"),
            "Status": e.status || "Not Started",
            "Region": e.userRegion || e.userId?.region || "",
            "Branch": e.userBranch || e.userId?.branch || "",
            "User Name": e.userName || e.userId?.name || "",
            "Customer Name": e.customerName || "",
            "Customer Address": e.customerAddress || "",
            "Contact Person & Number": `${e.contactPerson || ""} ${e.contactNumber || ""}`.trim(),
            "Purpose": e.purpose || "",
            "StampIn Time": e.stampIn?.time ? format(new Date(e.stampIn.time), "dd/MM/yyyy HH:mm:ss") : "",
            "StampOut Time": e.stampOut?.time ? format(new Date(e.stampOut.time), "dd/MM/yyyy HH:mm:ss") : "",
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
