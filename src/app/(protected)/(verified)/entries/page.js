import { Suspense } from "react";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getFilters } from "@/app/actions/reportActions";
import EntryFilters from "@/components/EntryFilters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ViewToggle from "@/components/ViewToggle";
import InfiniteEntryList from "@/components/InfiniteEntryList";

export default async function EntriesPage({ searchParams }) {
    const session = await auth();
    await dbConnect();

    // Fetch filter data for dropdowns
    const filtersData = await getFilters();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    // Default to URL param -> User Preference -> "grid"
    const view = params.view || session?.user?.viewPreference || "grid"; 
    const limit = 18; // Default to Desktop limit (18) for initial render
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
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        query.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
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

    // Fetch Entries with populated User for Admins
    const entries = await Entry.find(query)
        .sort({ entryDate: -1 }) // Descending order
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email region branch");

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Entry Log</h1>
                {/* Hide New Entry Button for Admins */}
                {!isAdmin && (
                    <Link href="/entries/new?callbackUrl=/entries">
                        <Button className="glass-btn-primary">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Entry
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filter Component */}
            <div className="space-y-4">
                <Suspense fallback={<div className="text-gray-400">Loading filters...</div>}>
                    <EntryFilters
                        users={filtersData.users}
                        locations={filtersData.locations}
                        isAdmin={isAdmin}
                    />
                </Suspense>

                {/* View Toggle - Aligned Right */}
                <div className="hidden md:flex justify-end">
                    <ViewToggle />
                </div>
            </div>

            <InfiniteEntryList
                initialEntries={JSON.parse(JSON.stringify(entries))}
                searchParams={params}
                isAdmin={isAdmin}
                view={view}
            />
        </div>
    );
}
