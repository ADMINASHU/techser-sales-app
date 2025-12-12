import { Suspense } from "react";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getFilters } from "@/app/actions/reportActions";
import EntryCard from "@/components/EntryCard";
import EntryFilters from "@/components/EntryFilters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ViewToggle from "@/components/ViewToggle";
import EntryTableRow from "@/components/EntryTableRow";

export default async function EntriesPage({ searchParams }) {
    const session = await auth();
    await dbConnect();

    // Fetch filter data for dropdowns
    const filtersData = await getFilters();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const view = params.view || "grid"; // Default view
    const limit = 30;
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

    if (params.status) {
        query.status = params.status;
    }

    // Fetch Entries with populated User for Admins
    const entries = await Entry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email");

    const total = await Entry.countDocuments(query);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Entry Log</h1>
                {/* Hide New Entry Button for Admins */}
                {!isAdmin && (
                    <Link href="/entries/new">
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
                <div className="flex justify-end">
                    <ViewToggle />
                </div>
            </div>

            {/* Data Grids */}
            <div className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:hidden'}`}>
                {entries.map((entry) => (
                    <EntryCard
                        key={entry._id.toString()}
                        entry={JSON.parse(JSON.stringify(entry))}
                        isAdmin={isAdmin}
                    />
                ))}
            </div>

            {/* Desktop View: Glass Table */}
            {view === 'list' && (
                <div className="hidden md:block rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-200 uppercase tracking-wider font-semibold border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry) => (
                                    <EntryTableRow
                                        key={entry._id.toString()}
                                        entry={JSON.parse(JSON.stringify(entry))}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No entries found</h3>
                    <p className="text-gray-400 max-w-sm">
                        Try adjusting your filters or create a new entry to get started.
                    </p>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 pt-4">
                {page > 1 && (
                    <Link href={`/entries?page=${page - 1}&view=${view}`}>
                        <Button variant="outline" className="glass-panel text-white hover:bg-white/10 border-white/10">Previous</Button>
                    </Link>
                )}
                {skip + entries.length < total && (
                    <Link href={`/entries?page=${page + 1}&view=${view}`}>
                        <Button variant="outline" className="glass-panel text-white hover:bg-white/10 border-white/10">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
