import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import InfiniteEntryList from "@/components/InfiniteEntryList";

export default async function EntryListContainer({ searchParams, session, view }) {
    await dbConnect();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const limit = 18; 
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

    if (params.month !== undefined && params.year !== undefined) {
        const month = parseInt(params.month);
        const year = parseInt(params.year);
        // Validate month and year
        if (!isNaN(month) && !isNaN(year)) {
             const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
    }

    if (params.status && params.status !== "all") {
        query.status = params.status;
    }

    if (params.search) {
        query.customerName = { $regex: params.search, $options: "i" };
    }

    if (params.region && params.region !== "all") {
        query.region = params.region;
    }

    if (params.branch && params.branch !== "all") {
        query.branch = params.branch;
    }

    // Fetch Entries
    const entries = await Entry.find(query)
        .sort({ entryDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email region branch")
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
