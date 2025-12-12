"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EntryFilters({ users = [], locations = [], isAdmin }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Initialize state from URL params or defaults
    const [selectedUser, setSelectedUser] = useState(searchParams.get("user") || "all");
    const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get("branch") || "all");
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "all");

    // Initialize state - Default to All or specific param, prioritizing user choice logic in useEffect
    const currentDate = new Date();
    // Logic change: If URL has month/year, use it. Else default to all or let page logic handle.
    // For visual sync, we read exactly what's in params, defaulting to "all" if missing/cleared
    const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || currentDate.getFullYear().toString());


    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ... existing useEffect for searchParams ... (Line 36)

    // Derived branches based on selected region
    const availableBranches = selectedRegion === "all"
        ? Array.from(new Set(locations.flatMap(l => l.branches))).sort()
        : (locations.find(l => l.name === selectedRegion)?.branches.sort() || []);

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
        updateParam("status", selectedStatus);
        updateParam("month", selectedMonth);
        updateParam("year", selectedYear);

        // Only push if params actually changed
        if (hasChanges) {
            // Reset page only if filter actually changes (user interaction), not initial load
            // But simpler logic: always reset page on filter change
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [selectedUser, selectedRegion, selectedBranch, selectedStatus, selectedMonth, selectedYear, router, pathname, searchParams]);

    const clearFilters = () => {
        setSelectedUser("all");
        setSelectedRegion("all");
        setSelectedBranch("all");
        setSelectedStatus("all");
        setSelectedMonth("all");
        setSelectedYear("all");
    };

    const months = [
        { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
        { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
        { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
        { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" },
    ];

    const statuses = ["Not Started", "In Process", "Completed"];

    const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - i).toString());

    if (!mounted) {
        return (
            <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl p-4">
                <div className="h-10 bg-white/5 rounded animate-pulse w-full"></div>
            </div>
        );
    }


    return (
        <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl">
            <div className="p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            </div>
                            <span className="font-semibold text-white">Filters</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
                        >
                            Clear
                        </Button>
                    </div>

                    {/* Filters Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Status */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Status</span>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {statuses.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* User (Admin) */}
                        {isAdmin && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Account</span>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="All Accounts" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Month */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Month</span>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="all">All Months</SelectItem>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Year</span>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
