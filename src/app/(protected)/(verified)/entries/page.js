import { Suspense } from "react";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getFilters } from "@/app/actions/reportActions";
import EntryFilters from "@/components/EntryFilters"; // [NEW]
import DeleteEntryButton from "@/components/DeleteEntryButton"; // [NEW]
import DurationDisplay from "@/components/DurationDisplay"; // [NEW]
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";

export default async function EntriesPage({ searchParams }) {
    const session = await auth();
    await dbConnect();

    // Fetch filter data for dropdowns
    const filtersData = await getFilters();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
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
            <Suspense fallback={<div className="text-gray-400">Loading filters...</div>}>
                <EntryFilters
                    users={filtersData.users}
                    locations={filtersData.locations}
                    isAdmin={isAdmin}
                />
            </Suspense>

            {/* Mobile View: Stacked Glass Cards */}
            <div className="grid gap-4 md:hidden">
                {entries.map((entry) => (
                    <Link key={entry._id.toString()} href={`/entries/${entry._id}`} className="block">
                        <div className="glass-card p-4 rounded-xl relative overflow-hidden group active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                {entry.status === 'Completed' ?
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full blur-xl"></div> :
                                    <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
                                }
                            </div>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <h3 className="text-lg font-semibold text-white truncate pr-2">{entry.customerName}</h3>
                                <Badge variant="outline" className={
                                    entry.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }>
                                    {entry.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-3 truncate">{entry.customerAddress}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-300">{format(new Date(entry.entryDate || entry.createdAt), "PP")}</span>
                                    <DurationDisplay
                                        startTime={entry.stampIn?.time}
                                        endTime={entry.stampOut?.time}
                                        status={entry.status}
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Desktop View: Glass Table */}
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
                                <tr key={entry._id.toString()} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/5 p-2 rounded-lg">
                                                <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold">
                                                    {entry.customerName?.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-base">{entry.customerName}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{entry.customerAddress}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.status === 'Completed'
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${entry.status === 'Completed' ? "bg-emerald-400" : "bg-blue-400"
                                                }`}></span>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {format(new Date(entry.entryDate || entry.createdAt), "PP")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <DurationDisplay
                                            startTime={entry.stampIn?.time}
                                            endTime={entry.stampOut?.time}
                                            status={entry.status}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link href={`/entries/${entry._id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10 hover:text-white">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                </Button>
                                            </Link>
                                            {!isAdmin && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DeleteEntryButton entryId={entry._id.toString()} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {entries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No entries found</h3>
                        <p className="text-gray-400 max-w-sm">
                            Try adjusting your filters or create a new entry to get started.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 pt-4">
                {page > 1 && (
                    <Link href={`/entries?page=${page - 1}`}>
                        <Button variant="outline" className="glass-panel text-white hover:bg-white/10 border-white/10">Previous</Button>
                    </Link>
                )}
                {skip + entries.length < total && (
                    <Link href={`/entries?page=${page + 1}`}>
                        <Button variant="outline" className="glass-panel text-white hover:bg-white/10 border-white/10">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
