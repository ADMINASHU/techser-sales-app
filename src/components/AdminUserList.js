"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminUserRow from "./AdminUserRow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUserList({ initialData, locations = [] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // State for filters
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [region, setRegion] = useState(searchParams.get("region") || "all");
    const [branch, setBranch] = useState(searchParams.get("branch") || "all");

    // Debounce search to avoid too many requests
    const [debouncedSearch] = useDebounce(search, 500);
    const [debouncedRegion] = useDebounce(region, 500);
    const [debouncedBranch] = useDebounce(branch, 500);

    const handleSearch = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1"); // Reset to page 1 on filter change
        router.replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedSearch) params.set("search", debouncedSearch);
        else params.delete("search");

        if (debouncedRegion && debouncedRegion !== "all") params.set("region", debouncedRegion);
        else params.delete("region");

        if (debouncedBranch && debouncedBranch !== "all") params.set("branch", debouncedBranch);
        else params.delete("branch");

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }, [debouncedSearch, debouncedRegion, debouncedBranch]);

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Derived branches
    const getAvailableBranches = () => {
        if (!region || region === "all") {
            // Show all branches flattened? Or none? User preference usually "All".
            // Flatten all
            const allBranches = new Set();
            locations.forEach(loc => {
                loc.branches.forEach(b => allBranches.add(b));
            });
            return Array.from(allBranches).sort();
        } else {
            const loc = locations.find(l => l.name === region);
            return loc ? loc.branches.sort() : [];
        }
    };

    const availableBranches = getAvailableBranches();

    // Reset branch if region changes
    useEffect(() => {
        if (region !== "all" && branch !== "all") {
            const loc = locations.find(l => l.name === region);
            if (loc && !loc.branches.includes(branch)) {
                setBranch("all");
            }
        }
    }, [region, locations]);

    if (!mounted) {
        return null; // Or a loading spinner
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="glass-panel border-white/5 rounded-xl shadow-2xl">
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
                                    setSearch("");
                                    setRegion("all");
                                    setBranch("all");
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
                            >
                                Reset
                            </Button>
                        </div>

                        {/* Filters Grid */}
                        <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Region</span>
                                <Select value={region} onValueChange={setRegion}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
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
                                <Select value={branch} onValueChange={setBranch}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
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

                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Search</span>
                                <Input
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="hidden md:table-cell text-gray-200 uppercase tracking-wider font-semibold w-12 text-center text-xs">#</TableHead>
                            <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">Name</TableHead>
                            <TableHead className="hidden lg:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">Contact Number</TableHead>
                            <TableHead className="hidden xl:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">Email</TableHead>
                            <TableHead className="hidden md:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">Branch / Region</TableHead>
                            <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">Role</TableHead>
                            <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">Status</TableHead>
                            <TableHead className="text-right text-gray-200 uppercase tracking-wider font-semibold text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-white/5">
                        {initialData.users.length === 0 ? (
                            <TableRow className="hover:bg-white/5 border-white/5">
                                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.users.map((user, idx) => (
                                <AdminUserRow
                                    key={user._id}
                                    user={user}
                                    index={(initialData.currentPage - 1) * 10 + idx + 1}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.currentPage - 1)}
                    disabled={initialData.currentPage <= 1}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                >
                    Previous
                </Button>
                <div className="text-sm text-gray-400">
                    Page {initialData.currentPage} of {initialData.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.currentPage + 1)}
                    disabled={initialData.currentPage >= initialData.totalPages}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
