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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                
                <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc._id} value={loc.name}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {availableBranches.map((b) => (
                            <SelectItem key={b} value={b}>
                                {b}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Region / Branch</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.users.map((user) => (
                                <AdminUserRow key={user._id} user={user} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.currentPage - 1)}
                    disabled={initialData.currentPage <= 1}
                >
                    Previous
                </Button>
                <div className="text-sm">
                    Page {initialData.currentPage} of {initialData.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(initialData.currentPage + 1)}
                    disabled={initialData.currentPage >= initialData.totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
