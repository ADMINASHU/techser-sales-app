"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Loader2, Search } from "lucide-react";

export default function AdminCustomerTable({
  initialCustomers,
  initialHasMore,
  locations, // { users: [], locations: [] }
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [ref, inView] = useInView();

  // Filters State
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        return Array.from(new Set(locations.locations.flatMap((l) => l.branches))).sort();
    }
    const region = locations.locations.find((l) => l.name === selectedRegion);
    return region ? region.branches.sort() : [];
  }, [selectedRegion, locations.locations]);

  // 2. Calculate Available Users (Cascading from Region & Branch)
  const availableUsers = useMemo(() => {
    return locations.users.filter(user => {
      if (selectedRegion !== "all" && user.region !== selectedRegion) return false;
      if (selectedBranch !== "all" && user.branch !== selectedBranch) return false;
      return true;
    });
  }, [selectedRegion, selectedBranch, locations.users]);

  // 3. Reset Filters Logic
  useEffect(() => {
      if (selectedRegion !== "all" && selectedBranch !== "all") {
         const region = locations.locations.find(l => l.name === selectedRegion);
         if (region && !region.branches.includes(selectedBranch)) {
             setSelectedBranch("all");
         }
      }
  }, [selectedRegion, selectedBranch, locations.locations]);

  useEffect(() => {
      if (selectedUser !== "all") {
          const userExists = availableUsers.find(u => u._id === selectedUser);
          if (!userExists) {
              setSelectedUser("all");
          }
      }
  }, [selectedRegion, selectedBranch, availableUsers, selectedUser]);


  const fetchCustomers = useCallback(
    async (isLoadMore = false) => {
      setLoading(true);
      const skip = isLoadMore ? customers.length : 0;
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
        setCustomers((prev) => [...prev, ...res.customers]);
      } else {
        setCustomers(res.customers);
      }
      setHasMore(res.hasMore);
      setLoading(false);
    },
    [selectedMonth, selectedYear, selectedRegion, selectedBranch, selectedUser, searchQuery, customers.length]
  );

  // Trigger fetch on filter change
  useEffect(() => {
    fetchCustomers(false);
  }, [selectedMonth, selectedYear, selectedRegion, selectedBranch, selectedUser, searchQuery]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchCustomers(true);
    }
  }, [inView, hasMore, loading, fetchCustomers]);

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
      <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-4 shadow-lg">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or address..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[110px] bg-white/5 border-white/10">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[90px] bg-white/5 border-white/10">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[130px] bg-white/5 border-white/10">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {locations.locations.map((loc) => (
                  <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[130px] bg-white/5 border-white/10">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {availableBranches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                <SelectValue placeholder="Created By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {availableUsers.map((u) => (
                  <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden glass-card shadow-xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[70px] text-gray-400 font-semibold">Sno.</TableHead>
              <TableHead className="text-gray-400 font-semibold">Customer Name</TableHead>
              <TableHead className="text-right text-gray-400 font-semibold w-[120px]">Visits</TableHead>
              <TableHead className="text-right text-gray-400 font-semibold w-[150px]">Total Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={customer._id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-white text-base">{customer.name}</span>
                    <span className="text-xs text-gray-500 mt-1 max-w-lg truncate">
                      {customer.customerAddress}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                    <span className={`inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-md text-xs font-bold ${customer.visitCount > 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-600 bg-white/5'}`}>
                        {customer.visitCount}
                    </span>
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-400 font-medium">
                  {formatDuration(customer.totalDuration)}
                </TableCell>
              </TableRow>
            ))}
            
            {loading && (
                <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex justify-center items-center gap-2 text-blue-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Loading data...</span>
                        </div>
                    </TableCell>
                </TableRow>
            )}

             {!loading && customers.length === 0 && (
                <TableRow className="hover:bg-transparent">
                     <TableCell colSpan={4} className="h-40 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                           <Search className="h-8 w-8 opacity-20" />
                           <p>No customers found matching the selected filters.</p>
                        </div>
                     </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div ref={ref} className="h-4 w-full" />
    </div>
  );
}