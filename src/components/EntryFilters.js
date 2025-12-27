"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EntryFilters({ users = [], locations = [], isAdmin, showStatus = true, showSearch = true }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state from URL params or defaults
    const [selectedUser, setSelectedUser] = useState(searchParams.get("user") || "all");
    const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get("branch") || "all");
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "all");
    const [search, setSearch] = useState(searchParams.get("search") || "");

    // Initialize state - Default to All or specific param, prioritizing user choice logic in useEffect
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || currentDate.getFullYear().toString());

    const [debouncedSearch] = useDebounce(search, 500);


    // Derived branches based on selected region
    const availableBranches = selectedRegion === "all"
        ? Array.from(new Set(locations.flatMap(l => l.branches))).sort()
        : (locations.find(l => l.name === selectedRegion)?.branches.sort() || []);

    // Reset branch if region changes


    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        let hasChanges = false;

        const updateParam = (key, value) => {
            const current = params.get(key);
            if (value !== "all" && value !== "") {
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
        updateParam("search", debouncedSearch);

        // Only push if params actually changed
        if (hasChanges) {
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [selectedUser, selectedRegion, selectedBranch, selectedStatus, selectedMonth, selectedYear, debouncedSearch, router, pathname, searchParams]);

    const clearFilters = () => {
        setSelectedUser("all");
        setSelectedRegion("all");
        setSelectedBranch("all");
        setSelectedStatus("all");
        setSelectedMonth("all");
        setSelectedYear("all");
        setSearch("");
    };

    const months = [
        { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
        { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
        { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
        { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" },
    ];

    const statuses = ["Not Started", "In Process", "Completed"];
    const years = ["2025", "2026", "2027", "2028", "2029", "2030"];



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
                    <div className="flex-1 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

                        {/* Status */}
                        {showStatus && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Status</span>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        <SelectItem value="all">All</SelectItem>
                                        {statuses.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Admin Filters */}
                        {isAdmin && (
                            <>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Account</span>
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                            <SelectValue placeholder="User" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10">
                                            <SelectItem value="all">All</SelectItem>
                                            {users.map(u => (
                                                <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Region</span>
                                    <Select value={selectedRegion} onValueChange={(val) => {
                                        setSelectedRegion(val);
                                        setSelectedBranch("all");
                                    }}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                            <SelectValue placeholder="Region" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10">
                                            <SelectItem value="all">All Regions</SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc._id} value={loc.name}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Branch</span>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                            <SelectValue placeholder="Branch" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10">
                                            <SelectItem value="all">All Branches</SelectItem>
                                            {availableBranches.map((b) => (
                                                <SelectItem key={b} value={b}>
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {/* Month */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Month</span>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="all">All</SelectItem>
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
                                <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    <SelectItem value="all">All</SelectItem>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search - Full width on mobile */}
                        {showSearch && (
                            <div className="space-y-1.5 col-span-3 md:col-span-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Search</span>
                                <Input
                                    placeholder="Search customer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
