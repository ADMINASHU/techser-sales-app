import { Button } from "@/components/ui/button";
import DurationDisplay from "@/components/DurationDisplay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // [NEW]
import { format } from "date-fns";
import EntryCard from "@/components/EntryCard";

export default function UserDashboard({ totalEntries, completedEntries, recentEntries }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Total Entries (Balance Style) */}
                <Card className="bg-[#1a1f2e] border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white mb-1">{totalEntries}</div>
                        <p className="text-xs text-gray-500">
                            Lifetime visit records
                        </p>
                    </CardContent>
                </Card>

                {/* Completed (Income Style) */}
                <Card className="bg-[#1a1f2e] border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Completed Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-emerald-400 mb-1">{completedEntries}</div>
                        <p className="text-xs text-gray-500">
                            Successfully verified
                        </p>
                    </CardContent>
                </Card>

                {/* Pending (Expense Style) - Calculated */}
                <Card className="bg-[#1a1f2e] border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Pending / Others</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-rose-500 mb-1">{totalEntries - completedEntries}</div>
                        <p className="text-xs text-gray-500">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
                {recentEntries.length === 0 ? (
                    <div className="glass-panel p-6 rounded-xl text-center text-gray-400">
                        No entries found. Start by creating one!
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {recentEntries.map((entry) => (
                            <EntryCard
                                key={entry._id.toString()}
                                entry={JSON.parse(JSON.stringify(entry))}
                                isAdmin={false}
                                from="dashboard"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
