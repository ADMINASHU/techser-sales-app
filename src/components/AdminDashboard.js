"use client";

import { useState, useEffect } from "react";
import { getReportData, getFilters } from "@/app/actions/reportActions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function AdminDashboard() {
    const [filters, setFilters] = useState({ users: [], locations: [] }); // locations: [{name, branches:[]}]
    
    // Default to current Month/Year
    const currentDate = new Date();
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
    
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        getFilters().then(data => {
            setFilters(data);
            setDataLoading(false);
        });
    }, []);

    // Derived branches based on selected region
    const getAvailableBranches = () => {
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
    };

    const availableBranches = getAvailableBranches();

    // Reset branch when region changes if current branch is not valid for new region
    useEffect(() => {
        if (selectedRegion !== "all" && selectedBranch !== "all") {
             const region = filters.locations.find(l => l.name === selectedRegion);
             if (region && !region.branches.includes(selectedBranch)) {
                 setSelectedBranch("all");
             }
        }
    }, [selectedRegion, filters.locations]);


    const months = [
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

    const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - i).toString());

    // Compute Date Range from Month/Year
    const getDateRange = () => {
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
        return { startDate, endDate };
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            
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

    if (dataLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Button onClick={handleDownload} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Generating..." : "Export Report"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {/* User Filter */}
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                            <SelectValue placeholder="User" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {filters.users.map(u => (
                                <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Region Filter */}
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {filters.locations.map(loc => (
                                <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Branch Filter (Dependent) */}
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            {availableBranches.map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Month Filter */}
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year Filter */}
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Placeholders - In a real app these would be calculated based on the filtered data too */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Entries</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">--</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Verified Users</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">--</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Regions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">--</div></CardContent>
                </Card>
            </div>
        </div>
    );
}
