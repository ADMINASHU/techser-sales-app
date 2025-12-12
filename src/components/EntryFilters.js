"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EntryFilters({ users = [], locations = [], isAdmin }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params or defaults
    const [selectedUser, setSelectedUser] = useState(searchParams.get("user") || "all");
    const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get("branch") || "all");
    
    // Initialize state - Default to "all" (All Time)
    const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || "all");
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "all");

    // Derived branches based on selected region
    const availableBranches = selectedRegion === "all" 
        ? Array.from(new Set(locations.flatMap(l => l.branches))).sort()
        : (locations.find(l => l.name === selectedRegion)?.branches.sort() || []);

    // Update URL when filters change
    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        let hasChanges = false;
        
        const updateParam = (key, value) => {
            const current = params.get(key);
            if (value !== "all") {
                if (current !== value) {
                    params.set(key, value);
                    hasChanges = true;
                }
            } else {
                if (params.has(key)) {
                    params.delete(key);
                    hasChanges = true;
                }
            }
        };

        updateParam("user", selectedUser);
        updateParam("region", selectedRegion);
        updateParam("branch", selectedBranch);
        updateParam("month", selectedMonth);
        updateParam("year", selectedYear);
        
        // Only push if params actually changed
        if (hasChanges) {
             params.set("page", "1"); // Reset page on filter change
             router.push(`/entries?${params.toString()}`);
        }
    }, [selectedUser, selectedRegion, selectedBranch, selectedMonth, selectedYear, router, searchParams]);

    const clearFilters = () => {
        setSelectedUser("all");
        setSelectedRegion("all");
        setSelectedBranch("all");
        setSelectedMonth("all"); // Reset to All
        setSelectedYear("all"); // Reset to All
    };

    const months = [
        { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
        { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
        { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
        { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" },
    ];

    const currentDate = new Date();
    const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - i).toString());

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
                    
                    {/* User Filter (Admin Only) */}
                    {isAdmin && (
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">User</span>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger><SelectValue placeholder="User" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Region Filter */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Region</span>
                        <Select value={selectedRegion} onValueChange={(val) => {
                            setSelectedRegion(val);
                            setSelectedBranch("all"); // Reset branch
                        }}>
                            <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {locations.map(loc => (
                                    <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Branch Filter */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Branch</span>
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {availableBranches.map(b => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Month</span>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {months.map(m => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Year</span>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
}
