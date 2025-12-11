"use client";

import { useState, useEffect } from "react";
import { getReportData, getFilters } from "@/app/actions/reportActions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
    const [filters, setFilters] = useState({ users: [], regions: [], branches: [] });
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [date, setDate] = useState({ from: undefined, to: undefined });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getFilters().then(setFilters);
    }, []);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const data = await getReportData({
                startDate: date?.from,
                endDate: date?.to,
                userId: selectedUser,
                region: selectedRegion,
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
                <CardContent className="grid gap-4 md:grid-cols-4">
                    {/* User Filter */}
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select User" />
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
                            <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {filters.regions.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date Range Picker */}
                    <div className={cn("grid gap-2")}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Placeholders */}
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
