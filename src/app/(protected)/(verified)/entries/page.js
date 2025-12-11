import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";

export default async function EntriesPage({ searchParams }) {
    const session = await auth();
    await dbConnect();

    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Build Query
    const query = { userId: session.user.id };
    if (params.status) {
        query.status = params.status;
    }
    // Implement Search logic if needed (e.g., regex on customerName)
    // Implement Date filtering logic

    const entries = await Entry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Entry.countDocuments(query);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Entry Log</h1>
                <Link href="/entries/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </Link>
            </div>

            {/* Filters can go here using a Client Component to update URL params */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                    <Link key={entry._id} href={`/entries/${entry._id}`}>
                        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium truncate">{entry.customerName}</CardTitle>
                                <Badge variant={entry.status === 'Completed' ? 'default' : 'secondary'}>
                                    {entry.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-2 truncate">{entry.customerAddress}</p>
                                <div className="text-xs text-muted-foreground">
                                    <div>Branch: {entry.branch}</div>
                                    <div>Date: {format(new Date(entry.createdAt), "PP")}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {entries.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No entries found.</p>
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
