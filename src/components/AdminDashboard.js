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

export default function AdminDashboard() {
    const [filters, setFilters] = useState({ users: [], locations: [] }); // locations: [{name, branches:[]}]
    const [filtersLoading, setFiltersLoading] = useState(true);

    // Default to current Month/Year
    const currentDate = new Date();
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

    // For export loading only (fetching loading is handled by SWR)
    const [loading, setLoading] = useState(false);

    // SWR: System Stats
    const { data: systemStats } = useSWR('system-stats', getSystemStats);

    // SWR: Recent Entries (Unfiltered)
    const { data: recentEntries = [], isLoading: recentLoading } = useSWR('recent-entries', () => getRawEntries({ limit: 10 }));

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
            keepPreviousData: true,
            revalidateOnFocus: false
        }
    );

    const fetchLoading = statsLoading;

    useEffect(() => {
        getFilters().then(data => {
            setFilters(data);
            setFiltersLoading(false);
        });
    }, []);

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
    const pendingEntries = totalEntries - completedEntries;

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

            {/* Stats Cards */}
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
                        <div className="text-4xl font-bold text-white mb-1">{fetchLoading ? "--" : totalEntries}</div>
                        <p className="text-xs text-gray-500">
                            Based on selected filters
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
                        <div className="text-4xl font-bold text-emerald-400 mb-1">{fetchLoading ? "--" : completedEntries}</div>
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
                        <div className="text-4xl font-bold text-rose-500 mb-1">{fetchLoading ? "--" : pendingEntries}</div>
                        <p className="text-xs text-gray-500">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* System Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* Admin Stats */}
                <Card className="bg-[#1a1f2e] border-violet-500/20 shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-24 h-24 text-violet-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-violet-300 uppercase tracking-wider">Admins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">
                            {systemStats ? `${systemStats.admins.verified} / ${systemStats.admins.total}` : "--"}
                        </div>
                        <p className="text-xs text-violet-400">
                            Verified / Total Admins
                        </p>
                    </CardContent>
                </Card>

                {/* User Stats */}
                <Card className="bg-[#1a1f2e] border-blue-500/20 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-300 uppercase tracking-wider">Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">
                            {systemStats ? `${systemStats.users.verified} / ${systemStats.users.total}` : "--"}
                        </div>
                        <p className="text-xs text-blue-400">
                            Verified / Total Users
                        </p>
                    </CardContent>
                </Card>

                {/* Location Stats */}
                <Card className="bg-[#1a1f2e] border-amber-500/20 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MapPin className="w-24 h-24 text-amber-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-300 uppercase tracking-wider">Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">
                            {systemStats ? `${systemStats.locations.branches} / ${systemStats.locations.regions}` : "--"}
                        </div>
                        <p className="text-xs text-amber-400">
                            Branches / Regions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Entries */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Entries</h2>
                    <Link href="/entries">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {recentLoading ? (
                    <div className="flex items-center justify-center p-12 glass-panel rounded-xl">
                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                    </div>
                ) : recentEntries.length === 0 ? (
                    <div className="glass-panel p-6 rounded-xl text-center text-gray-400">
                        No entries found.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
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
