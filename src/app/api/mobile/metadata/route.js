import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Location from "@/models/Location";
import User from "@/models/User";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        await dbConnect();

        // 1. Locations (Regions & Branches)
        // Optimization: Lean query, projection
        const locations = await Location.find({}).lean().select("name branches");
        // Structure: [{ _id, name: "RegionName", branches: ["BranchA", "BranchB"] }]

        // 2. Users (For Admin filtering)
        let users = [];
        if (user.role === "admin") {
            users = await User.find({ role: { $ne: "admin" } }) // Optionally filter out super admins? Or show all.
                .lean()
                .select("name _id role region branch")
                .sort({ name: 1 });
        }

        return NextResponse.json({
            success: true,
            locations,
            users
        });

    } catch (error) {
        console.error("Mobile Metadata Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch metadata" },
            { status: 500 }
        );
    }
}
