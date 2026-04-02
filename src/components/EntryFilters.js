"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function EntryFilters({
  users = [],
  locations = [],
  isAdmin,
  showStatus = true,
  showSearch = true,
  defaultRegion,
  session,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params or defaults
  const [selectedUser, setSelectedUser] = useState(
    searchParams.get("user") || "all",
  );
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get("region") || defaultRegion || "all",
  );
  const [selectedBranch, setSelectedBranch] = useState(
    searchParams.get("branch") || "all",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || "all",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Initialize state - Default to All or specific param, prioritizing user choice logic in useEffect
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get("month") || currentDate.getMonth().toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || currentDate.getFullYear().toString(),
  );

  const [debouncedSearch] = useDebounce(search, 500);

  // Derived branches based on selected region
  const availableBranches =
    selectedRegion === "all"
      ? Array.from(new Set(locations.flatMap((l) => l.branches))).sort()
      : locations.find((l) => l.name === selectedRegion)?.branches.sort() || [];

  // Update URL when filters change
  // Helper to update URL
  const updateUrl = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handlers for direct updates
  const handleUserChange = (val) => {
    setSelectedUser(val);
    updateUrl({ user: val });
  };
  const handleRegionChange = (val) => {
    setSelectedRegion(val);
    setSelectedBranch("all");
    updateUrl({ region: val, branch: "all" });
  };
  const handleBranchChange = (val) => {
    setSelectedBranch(val);
    updateUrl({ branch: val });
  };
  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    updateUrl({ status: val });
  };
  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    updateUrl({ month: val });
  };
  const handleYearChange = (val) => {
    setSelectedYear(val);
    updateUrl({ year: val });
  };

  // Search effect (debounced)
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, router, pathname, searchParams]);

  const clearFilters = () => {
    const isSuperUser = session?.user?.role === "super_user";
    const resetRegion = isSuperUser ? session.user.region : "all";

    setSelectedUser("all");
    setSelectedRegion(resetRegion);
    setSelectedBranch("all");
    setSelectedStatus("all");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSearch("");

    if (isSuperUser) {
      router.push(`${pathname}?region=${resetRegion}`);
    } else {
      router.push(pathname);
    }
  };

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

  const statuses = ["In Process", "Completed"];
  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  // Proper way to detect if we're on the client
  const mounted = useSyncExternalStore(
    () => () => {}, // subscribe: no-op
    () => true, // getSnapshot: returns true on client
    () => false, // getServerSnapshot: returns false on server
  );

  if (!mounted) return null; // Prevent hydration mismatch for Radix Select

  return (
    <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Header Section */}
          <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-filter"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Status
                </span>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="all">All</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Admin Filters */}
            {isAdmin && (
              <>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Account
                  </span>
                  <Select value={selectedUser} onValueChange={handleUserChange}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                      <SelectItem value="all">All</SelectItem>
                      {users
                        .filter((u) => {
                          if (
                            selectedRegion !== "all" &&
                            u.region !== selectedRegion
                          )
                            return false;
                          if (
                            selectedBranch !== "all" &&
                            u.branch !== selectedBranch
                          )
                            return false;
                          return true;
                        })
                        .map((u) => (
                          <SelectItem key={u._id} value={u._id}>
                            {u.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Region
                  </span>
                  <Select
                    value={selectedRegion}
                    onValueChange={handleRegionChange}
                    disabled={session?.user?.role === "super_user"}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
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
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Branch
                  </span>
                  <Select
                    value={selectedBranch}
                    onValueChange={handleBranchChange}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
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
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                Month
              </span>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="all">All</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                Year
              </span>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="all">All</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search - Full width on mobile */}
            {showSearch && (
              <div className="space-y-1.5 relative group col-span-3 md:col-span-2 lg:col-span-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Search
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-300 z-10">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 pl-9 pr-10 rounded-xl transition-all hover:bg-white/10 shadow-lg"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
