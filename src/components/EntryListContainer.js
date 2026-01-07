import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import InfiniteEntryList from "@/components/InfiniteEntryList";

export default async function EntryListContainer({ searchParams, session, view }) {
    await dbConnect();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    
    // Reduced from 18 to 12 for better mobile performance
    // Users can scroll to load more via infinite scroll
    const limit = 12;
    const skip = (page - 1) * limit;

    const isAdmin = session.user.role === "admin";

    // Build Query
    const query = {};

    // 1. Role-based Base Query
    if (!isAdmin) {
        query.userId = session.user.id;
    } else {
        if (params.user && params.user !== "all") {
            query.userId = params.user;
        }
    }

    // 2. Date Filter
    if (params.year && params.year !== "all") {
        const year = parseInt(params.year);
        if (!isNaN(year)) {
            let startDate, endDate;
            if (params.month && params.month !== "all") {
                const month = parseInt(params.month);
                if (!isNaN(month)) {
                    startDate = new Date(year, month, 1);
                    endDate = new Date(year, month + 1, 0, 23, 59, 59);
                }
            } else {
                // Entire Year
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59);
            }

            if (startDate && endDate) {
                query.entryDate = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }
    }

    if (params.status && params.status !== "all") {
        query.status = params.status;
    }

    if (params.search) {
        const searchRegex = { $regex: params.search, $options: "i" };
        query.$or = [
            { customerName: searchRegex },
            { customerAddress: searchRegex }
        ];
    }

    // 5. Region & Branch Filters
    if (!query.userId && ((params.region && params.region !== "all") || (params.branch && params.branch !== "all"))) {
        const User = (await import("@/models/User")).default;
        let userQuery = {};
        if (params.region && params.region !== "all") userQuery.region = params.region;
        if (params.branch && params.branch !== "all") userQuery.branch = params.branch;
        const matchingUsers = await User.find(userQuery, "_id").lean();
        query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    // Fetch Entries
    const entries = await Entry.find(query)
        .sort({ entryDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email region branch role designation image status contactNumber address")
        .populate("customerId", "name customerAddress contactPerson contactNumber location")
        .lean(); // Use lean for performance since we serialize to JSON anyway

    // Serialize MongoDB IDs
    const serializedEntries = JSON.parse(JSON.stringify(entries));

    return (
        <InfiniteEntryList
            initialEntries={serializedEntries}
            searchParams={params}
            isAdmin={isAdmin}
            view={view}
        />
    );
}
