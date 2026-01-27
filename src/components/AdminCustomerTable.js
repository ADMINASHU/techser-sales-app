"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { getAdminCustomerAnalytics } from "@/app/actions/adminCustomerActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, SearchX } from "lucide-react";
import CustomerVisitsModal from "./CustomerVisitsModal";

export default function AdminCustomerTable({
  initialCustomers,
  initialHasMore,
  locations, // { users: [], locations: [] }
  isRestricted = false, // new prop
  session,
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [ref, inView] = useInView();

  // Filters State
  // Initialize with consistent default to prevent hydration mismatch
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth().toString());
    setSelectedYear(now.getFullYear().toString());
  }, []);
  const [selectedRegion, setSelectedRegion] = useState(
    session?.user?.region || "all",
  );
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Use ref for customers length to stabilize fetchCustomers
  const customersLengthRef = useRef(customers.length);
  useEffect(() => {
    customersLengthRef.current = customers.length;
  }, [customers.length]);

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

  // 1. Calculate Available Branches (Cascading from Region)
  const availableBranches = useMemo(() => {
    if (selectedRegion === "all") {
      return Array.from(
        new Set(locations.locations.flatMap((l) => l.branches)),
      ).sort();
    }
    const region = locations.locations.find((l) => l.name === selectedRegion);
    return region ? region.branches.sort() : [];
  }, [selectedRegion, locations.locations]);

  // 2. Calculate Available Users (Cascading from Region & Branch)
  const availableUsers = useMemo(() => {
    return locations.users.filter((user) => {
      if (selectedRegion !== "all" && user.region !== selectedRegion)
        return false;
      if (selectedBranch !== "all" && user.branch !== selectedBranch)
        return false;
      return true;
    });
  }, [selectedRegion, selectedBranch, locations.users]);

  // 3. Reset Filters Logic
  useEffect(() => {
    if (selectedRegion !== "all" && selectedBranch !== "all") {
      const region = locations.locations.find((l) => l.name === selectedRegion);
      if (region && !region.branches.includes(selectedBranch)) {
        setSelectedBranch("all");
      }
    }
  }, [selectedRegion, selectedBranch, locations.locations]);

  useEffect(() => {
    if (selectedUser !== "all") {
      const userExists = availableUsers.find((u) => u._id === selectedUser);
      if (!userExists) {
        setSelectedUser("all");
      }
    }
  }, [selectedRegion, selectedBranch, availableUsers, selectedUser]);

  // Use loadingRef to prevent dependency cycles
  const loadingRef = useRef(false);

  const fetchCustomers = useCallback(
    async (isLoadMore = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const skip = isLoadMore ? customersLengthRef.current : 0;
        const filters = {
          month: selectedMonth,
          year: selectedYear,
          region: selectedRegion,
          branch: selectedBranch,
          userId: selectedUser,
          search: searchQuery,
        };

        const res = await getAdminCustomerAnalytics({
          filters,
          skip,
          limit: 30,
        });

        if (isLoadMore) {
          setCustomers((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const newUnique = res.customers.filter(
              (c) => !existingIds.has(c._id),
            );
            return [...prev, ...newUnique];
          });
        } else {
          setCustomers(res.customers);
        }
        setHasMore(res.hasMore);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [
      selectedMonth,
      selectedYear,
      selectedRegion,
      selectedBranch,
      selectedUser,
      searchQuery,
    ],
  );

  // Trigger fetch on filter change
  useEffect(() => {
    fetchCustomers(false);
  }, [fetchCustomers]);

  // Infinite Scroll Trigger
  // Infinite Scroll Trigger
  useEffect(() => {
    if (inView && hasMore) {
      fetchCustomers(true);
    }
  }, [inView, hasMore, fetchCustomers]);

  // UPDATED: Format duration as HH:MM:SS
  const formatDuration = (ms) => {
    if (!ms) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      {/* Filters Bar - Updated to match EntryFilters.js */}
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
                onClick={() => {
                  const isSuperUser = session?.user?.role === "super_user";
                  setSelectedMonth("all");
                  setSelectedYear("all");
                  setSelectedRegion(isSuperUser ? session.user.region : "all");
                  setSelectedBranch("all");
                  setSelectedUser("all");
                  setSearchQuery("");
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
              >
                Clear
              </Button>
            </div>

            {/* Filters Grid */}
            <div
              className={`flex-1 grid gap-2 ${isRestricted ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"}`}
            >
              {/* Region - Hide if restricted */}
              {!isRestricted && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Region
                  </span>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                    disabled={session?.user?.role === "super_user"}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="glass-card-static border-white/10">
                      <SelectItem value="all">All Regions</SelectItem>
                      {locations.locations.map((loc) => (
                        <SelectItem key={loc._id} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Branch - Hide if restricted */}
              {!isRestricted && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Branch
                  </span>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent className="glass-card-static border-white/10">
                      <SelectItem value="all">All Branches</SelectItem>
                      {availableBranches.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User Selection - Hide if restricted */}
              {!isRestricted &&
                // Although not present in original view_file output, logic suggests there might be a User filter here if the grid-cols suggests more cols.
                // Wait, reading original code: There was NO user select dropdown in the view_file!
                // Ah, wait. Lines 223 - 348 show Region, Branch, Month, Year, Search.
                // There is NO User dropdown in the original code visible in step 31 (lines 223-348),
                // BUT there is logic for `selectedUser` and `availableUsers` in lines 46, 80-88, 100-107.
                // It seems the User dropdown was MISSING in the JSX in the original file I viewed?
                // Let me re-read lines 223-348.
                // 223: grid-cols...
                // 225: Region
                // 248: Branch
                // 271: Month
                // 291: Year
                // 311: Search
                // There is NO user dropdown.
                // However, `selectedUser` IS used in `fetchCustomers`.
                // If I am to hide filters, I should only hide Region/Branch.
                // If there was no User dropdown, I don't need to hide it.
                // BUT, if I am enabling non-admin, I am definitely hiding Region/Branch.
                // I will proceed with hiding Region/Branch.
                null}

              {/* Month */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Month
                </span>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="glass-card-static border-white/10">
                    <SelectItem value="all">All Months</SelectItem>
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
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 px-2 text-xs">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="glass-card-static border-white/10">
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div
                className={`space-y-1.5 relative group w-full ${isRestricted ? "col-span-2 md:col-span-1" : "col-span-2 md:col-span-1"}`}
              >
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Search
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-300 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10 pl-9 pr-10 rounded-xl transition-all hover:bg-white/10 shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      {!loading && customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">
            No report found
          </h3>
          <p className="text-gray-400 max-w-sm">
            We couldn&apos;t find any report matching your current filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden glass-card-static shadow-xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="hidden sm:table-cell sm:w-[70px] px-2 text-gray-400 font-semibold">
                  Sno.
                </TableHead>
                <TableHead className="px-2 text-gray-400 font-semibold">
                  Customer Name
                </TableHead>
                <TableHead className="text-right text-gray-400 font-semibold w-auto sm:w-[120px] px-2">
                  Visits
                </TableHead>
                <TableHead className="text-right text-gray-400 font-semibold w-auto sm:w-[150px] px-2">
                  Duration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow
                  key={customer._id}
                  className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell className="hidden sm:table-cell font-medium text-gray-500 px-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-2">
                    <div className="flex flex-col py-1">
                      <span className="font-medium text-white text-sm sm:text-base">
                        {customer.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 max-w-[180px] sm:max-w-lg truncate">
                        {customer.customerAddress}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-2">
                    <span
                      className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-md text-xs font-bold ${customer.visitCount > 0 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-gray-600 bg-white/5"}`}
                    >
                      {customer.visitCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-400 font-medium text-xs sm:text-base px-2">
                    {formatDuration(customer.totalDuration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div ref={ref} className="h-4 w-full" />

      {/* Visit Details Modal */}
      <CustomerVisitsModal
        customer={selectedCustomer}
        filters={{
          month: selectedMonth,
          year: selectedYear,
        }}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
