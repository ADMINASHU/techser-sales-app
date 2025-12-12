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

    const entries = await Entry.find(query).populate("userId", "name email");

    // Format for Excel
    const data = entries.map(e => ({
        ID: e._id.toString(),
        User: e.userId?.name || "Unknown",
        Email: e.userId?.email || "Unknown",
        Customer: e.customerName,
        Address: e.customerAddress,
        Region: e.region,
        Branch: e.branch,
        Purpose: e.purpose,
        Status: e.status,
        StampIn: e.stampIn?.time ? new Date(e.stampIn.time).toLocaleString() : "",
        StampOut: e.stampOut?.time ? new Date(e.stampOut.time).toLocaleString() : "",
        Date: new Date(e.createdAt).toLocaleDateString(),
    }));

    return data;
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
