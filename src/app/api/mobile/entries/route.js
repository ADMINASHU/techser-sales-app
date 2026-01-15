import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const targetUser = searchParams.get("user");
        const region = searchParams.get("region");
        const branch = searchParams.get("branch");
        const search = searchParams.get("search");

        let query = {};

        // 1. Role / User Filter
        if (user.role !== "admin") {
            query.userId = user.id;
        } else {
            if (targetUser && targetUser !== 'all') {
                query.userId = targetUser;
            }
            if (region && region !== 'all') query.userRegion = region;
            if (branch && branch !== 'all') query.userBranch = branch;
        }

        // 2. Status Filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // 3. Date Filter (Month/Year)
        if (year && year !== 'all') {
            const start = new Date(parseInt(year), month && month !== 'all' ? parseInt(month) : 0, 1);
            const end = new Date(parseInt(year), month && month !== 'all' ? parseInt(month) + 1 : 12, 0, 23, 59, 59);
            query.entryDate = { $gte: start, $lte: end };
        }

        // 4. Search Filter (Name, Address)
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { customerAddress: { $regex: search, $options: "i" } },
            ];
        }

        const entries = await Entry.find(query)
            .sort({ entryDate: -1 })
            .limit(100)
            .populate("userId", "name email")
            .populate("customerId", "name district customerAddress contactPerson contactNumber");

        return NextResponse.json({ success: true, entries });
    } catch (error) {
        console.error("Mobile API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json(); // Expected: { customerId, customerName, status, stampIn, ... }

        await dbConnect();

        // Verify customer exists
        const customer = await Customer.findById(body.customerId);
        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        // Create entry
        const newEntry = await Entry.create({
            ...body,
            userId: user.id,
            userRegion: user.region,
            userBranch: user.branch,
            entryDate: new Date(),
        });

        // Update customer entry count (optional, but good practice if schema has it)
        await Customer.findByIdAndUpdate(body.customerId, {
            $inc: { entryCount: 1 }
        });

        return NextResponse.json({ success: true, entry: newEntry });
    } catch (error) {
        console.error("Mobile Create Entry Error:", error);
        return NextResponse.json(
            { error: "Failed to create entry" },
            { status: 500 }
        );
    }
}
