import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";

export default function UserDashboard({ totalEntries, completedEntries, recentEntries }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/entries/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </Link>
            </div>

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
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="w-full">
                                            <div className="font-medium truncate">{entry.customerName}</div>
                                            <div className="text-sm text-muted-foreground truncate">{entry.branch} - {entry.purpose}</div>
                                        </div>
                                        <div className="w-full sm:w-auto sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end mt-2 sm:mt-0">
                                            <div className={`text-sm font-medium ${entry.status === 'Completed' ? 'text-green-600' :
                                                entry.status === 'In Process' ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                {entry.status}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(entry.createdAt), "MMM d, yyyy")}
                                            </div>
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
