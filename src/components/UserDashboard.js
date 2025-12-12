import { Button } from "@/components/ui/button";
import DurationDisplay from "@/components/DurationDisplay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // [NEW]
import { format } from "date-fns";

export default function UserDashboard({ totalEntries, completedEntries, recentEntries }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEntries}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime entries
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedEntries}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
                {recentEntries.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No entries found. Start by creating one!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {recentEntries.map((entry) => (
                            <Link key={entry._id.toString()} href={`/entries/${entry._id}`} className="block min-w-0">
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
                                            <DurationDisplay
                                                startTime={entry.stampIn?.time}
                                                endTime={entry.stampOut?.time}
                                                status={entry.status}
                                            />
                                            <div>Date: {format(new Date(entry.entryDate || entry.createdAt), "PP")}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
