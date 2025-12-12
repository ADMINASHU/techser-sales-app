import { Suspense } from "react";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { getFilters } from "@/app/actions/reportActions";
import EntryFilters from "@/components/EntryFilters"; // [NEW]
import DeleteEntryButton from "@/components/DeleteEntryButton"; // [NEW]
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
        // ... (User filter logic remains)
        if (params.user && params.user !== "all") {
            query.userId = params.user;
        }
    }

    // ... (Location filters remain)

    // 3. Date Filters
    // Only filter by date if explicitly selected (or provided in params)
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
        .populate("userId", "name email"); // Populate user name

    const total = await Entry.countDocuments(query);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Entry Log</h1>
                {/* Hide New Entry Button for Admins */}
                {!isAdmin && (
                    <Link href="/entries/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Entry
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filter Component */}
            <Suspense fallback={<div>Loading filters...</div>}>
                <EntryFilters 
                    users={filtersData.users} 
                    locations={filtersData.locations} 
                    isAdmin={isAdmin}
                />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                    <Link key={entry._id.toString()} href={`/entries/${entry._id}`}>
                        <Card className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium truncate">{entry.customerName}</CardTitle>
                                <Badge variant={entry.status === 'Completed' ? 'default' : 'secondary'}>
                                    {entry.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2 truncate">{entry.customerAddress}</p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {/* Show User Name for Admins */}
                                    {(isAdmin || entry.userId) && (
                                        <div className="font-semibold text-primary">
                                            User: {entry.userId?.name || "Unknown"}
                                        </div>
                                    )}
                                    <div>Branch: {entry.branch}</div>
                                    <div>Date: {format(new Date(entry.createdAt), "PP")}</div>
                                </div>
                            </CardContent>
                            {!isAdmin && (
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                     <DeleteEntryButton entryId={entry._id.toString()} />
                                </div>
                            )}
                        </Card>
                    </Link>
                ))}
                {entries.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No entries found for the selected filters.</p>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 pt-4">
                {page > 1 && (
                    <Link href={`/entries?page=${page - 1}`}>
                        <Button variant="outline">Previous</Button>
                    </Link>
                )}
                {skip + entries.length < total && (
                    <Link href={`/entries?page=${page + 1}`}>
                        <Button variant="outline">Next</Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
