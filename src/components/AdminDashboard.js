"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { getReportData, getFilters, getRawEntries, getSystemStats } from "@/app/actions/reportActions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ArrowRight, ShieldCheck, Users, MapPin } from "lucide-react";
// XLSX imported dynamically
import { toast } from "sonner";
import EntryCard from "@/components/EntryCard";
import Link from "next/link";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import EntryTableRow from "@/components/EntryTableRow";

export default function AdminDashboard({ 
    initialSystemStats, 
    initialRecentEntries, 
    initialMonthlyEntries, 
    initialFilters,
    currentUserRegion 
}) {
    const [filters, setFilters] = useState(initialFilters || { users: [], locations: [] }); // locations: [{name, branches:[]}]
    const [filtersLoading, setFiltersLoading] = useState(!initialFilters);

    // Default to current Month/Year
    const currentDate = new Date();
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState(currentUserRegion || "all");
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

    // For export loading only (fetching loading is handled by SWR)
    const [loading, setLoading] = useState(false);

    // SWR: System Stats
    const { data: systemStats } = useSWR('system-stats', getSystemStats, { fallbackData: initialSystemStats });

    // SWR: Recent Entries (Unfiltered)
    const { data: recentEntries = [], isLoading: recentLoading } = useSWR('recent-entries', () => getRawEntries({ limit: 10 }), { fallbackData: initialRecentEntries });

    // SWR: Main Stats
    const statsFetcher = useCallback(async ([_, u, r, b, m, y]) => {
        let startDate, endDate;
        
        if (y !== "all") {
            const year = parseInt(y);
            if (!isNaN(year)) {
                if (m !== "all") {
                    const month = parseInt(m);
                    if (!isNaN(month)) {
                        startDate = new Date(year, month, 1);
                        endDate = new Date(year, month + 1, 0, 23, 59, 59);
                    }
                } else {
                    // All months for a specific year
                    startDate = new Date(year, 0, 1);
                    endDate = new Date(year, 11, 31, 23, 59, 59);
                }
            }
        }
        
        return await getRawEntries({ userId: u, region: r, branch: b, startDate, endDate });
    }, []);

    const { data: statsEntries = [], isLoading: statsLoading } = useSWR(
        !filtersLoading ? ['dashboard-stats', selectedUser, selectedRegion, selectedBranch, selectedMonth, selectedYear] : null,
        statsFetcher,
        {
            fallbackData: initialMonthlyEntries,
            keepPreviousData: true,
            revalidateOnFocus: false
        }
    );

    const fetchLoading = statsLoading;

    useEffect(() => {
        if (!initialFilters) {
            getFilters().then(data => {
                setFilters(data);
                setFiltersLoading(false);
            });
        }
    }, [initialFilters]);

    // Derived branches based on selected region
    const availableBranches = useMemo(() => {
        if (selectedRegion === "all") {
            // Flatten all branches
            const allBranches = new Set();
            filters.locations.forEach(loc => {
                loc.branches.forEach(b => allBranches.add(b));
            });
            return Array.from(allBranches).sort();
        } else {
            const region = filters.locations.find(l => l.name === selectedRegion);
            return region ? region.branches.sort() : [];
        }
    }, [selectedRegion, filters.locations]);

    // Reset branch when region changes if current branch is not valid for new region
    useEffect(() => {
        if (selectedRegion !== "all" && selectedBranch !== "all") {
            const region = filters.locations.find(l => l.name === selectedRegion);
            if (region && !region.branches.includes(selectedBranch)) {
                setSelectedBranch("all");
            }
        }
    }, [selectedRegion, selectedBranch, filters.locations]);


    const months = [
        { value: "all", label: "All Months" },
        { value: "0", label: "January" },
        { value: "1", label: "February" },
        { value: "2", label: "March" },
        { value: "3", label: "April" },
        { value: "4", label: "May" },
        { value: "5", label: "June" },
        { value: "6", label: "July" },
        { value: "7", label: "August" },
        { value: "8", label: "September" },
        { value: "9", label: "October" },
        { value: "10", label: "November" },
        { value: "11", label: "December" },
    ];

    const years = ["all", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

    // Compute Date Range from Month/Year - Needed for Download logic
    const getDateRange = useCallback(() => {
        if (selectedYear === "all") return { startDate: null, endDate: null };
        
        const year = parseInt(selectedYear);
        if (isNaN(year)) return { startDate: null, endDate: null };

        if (selectedMonth === "all") {
            return {
                startDate: new Date(year, 0, 1),
                endDate: new Date(year, 11, 31, 23, 59, 59)
            };
        }

        const month = parseInt(selectedMonth);
        if (isNaN(month)) return { startDate: null, endDate: null };

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        return { startDate, endDate };
    }, [selectedMonth, selectedYear]);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const XLSX = await import("xlsx");

            // Use getReportData for export so we get the pre-formatted Excel data
            const data = await getReportData({
                startDate: startDate,
                endDate: endDate,
                userId: selectedUser,
                region: selectedRegion,
                branch: selectedBranch,
            });

            if (data.length === 0) {
                toast.error("No data found for selected filters");
                setLoading(false);
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
            XLSX.writeFile(workbook, "Sales_Report.xlsx");
            toast.success("Report downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download report");
        }
        setLoading(false);
    };



    if (filtersLoading) {
        return <DashboardSkeleton />;
    }

    // Calculations
    const totalEntries = statsEntries.length;
    const completedEntries = statsEntries.filter(e => e.status === "Completed").length;
    // Reverted: User wants "In Process" label to represent all pending work (Not Started + In Process)
    const displayCount = totalEntries - completedEntries;

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Button
                    size="sm"
                    onClick={handleDownload}
                    disabled={loading || fetchLoading || statsEntries.length === 0}
                    className="bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 border-0 h-8 text-xs px-3"
                >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    {loading ? "Generating..." : "Export"}
                </Button>
            </div>

            {/* Filters Section (Matching EntryFilters.js style) */}
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
                                onClick={() => {
                                    setSelectedUser("all");
                                    setSelectedRegion("all");
                                    setSelectedBranch("all");
                                    const now = new Date();
                                    setSelectedMonth(now.getMonth().toString());
                                    setSelectedYear(now.getFullYear().toString());
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
                            >
                                Reset
                            </Button>
                        </div>

                        {/* Filters Grid - 3 Columns */}
                        <div className="flex-1 grid gap-3 grid-cols-3 md:grid-cols-5">
                            {/* User Filter */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">User</span>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="User" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        <SelectItem value="all">All</SelectItem>
                                        {filters.users.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Region Filter */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Region</span>
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="Region" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        <SelectItem value="all">All</SelectItem>
                                        {filters.locations.map(loc => (
                                            <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Branch Filter */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Branch</span>
                                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="Branch" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        <SelectItem value="all">All</SelectItem>
                                        {availableBranches.map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Month Filter */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Month</span>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year Filter */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Year</span>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10">
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

            {/* Combined Stats Overview */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                {/* Total Entries */}
                <Card className="glass-card shadow-lg relative overflow-hidden group hover:border-white/20 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-white relative z-10">{fetchLoading ? "--" : totalEntries}</div>
                    </CardContent>
                </Card>

                {/* Completed */}
                <Card className="glass-card shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-emerald-500 group-hover:opacity-[0.1] transition-opacity">
                         <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-emerald-400 relative z-10">{fetchLoading ? "--" : completedEntries}</div>
                    </CardContent>
                </Card>

                {/* Pending */}
                <Card className="glass-card shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-rose-500 group-hover:opacity-[0.1] transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wider">In Process</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-rose-500 relative z-10">{fetchLoading ? "--" : displayCount}</div>
                    </CardContent>
                </Card>

                {/* Admin Stats */}
                <Card className="glass-card border-violet-500/20 shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.05] text-violet-500 group-hover:opacity-[0.15] transition-opacity">
                         <ShieldCheck className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-violet-300 uppercase tracking-wider relative z-10">Admins</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-white relative z-10">
                            {systemStats ? `${systemStats.admins.verified}/${systemStats.admins.total}` : "--"}
                        </div>
                    </CardContent>
                </Card>

                {/* User Stats */}
                <Card className="glass-card border-blue-500/20 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.05] text-blue-500 group-hover:opacity-[0.15] transition-opacity">
                        <Users className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-blue-300 uppercase tracking-wider relative z-10">Users</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-white relative z-10">
                            {systemStats ? `${systemStats.users.verified}/${systemStats.users.total}` : "--"}
                        </div>
                    </CardContent>
                </Card>

                {/* Location Stats */}
                <Card className="glass-card border-amber-500/20 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                    <div className="absolute -right-6 -bottom-6 opacity-[0.05] text-amber-500 group-hover:opacity-[0.15] transition-opacity">
                        <MapPin className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-amber-300 uppercase tracking-wider relative z-10">Locations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-white relative z-10">
                            {systemStats ? `${systemStats.locations.branches}/${systemStats.locations.regions}` : "--"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Entries */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recent Entries</h2>
                    <Link href="/entries">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {recentEntries.length === 0 && !recentLoading ? (
                    <div className="glass-panel p-6 rounded-xl text-center text-gray-400">
                        No entries found.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recentEntries.map((entry) => (
                            <EntryCard
                                key={entry._id.toString()}
                                entry={entry}
                                isAdmin={true}
                                from="dashboard"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
