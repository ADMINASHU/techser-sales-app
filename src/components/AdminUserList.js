"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useInView } from "react-intersection-observer";
import { getUsers } from "@/app/actions/adminActions";
import { Loader2, Search, X } from "lucide-react";
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
import dynamic from "next/dynamic";
import AdminUserRow from "./AdminUserRow";
import AdminUserCard from "./AdminUserCard";

const UserProfileModal = dynamic(() => import("./UserProfileModal"), {
  ssr: false,
});
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUserList({
  initialData,
  locations = [],
  currentUserRegion,
  session,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [users, setUsers] = useState(initialData.users);
  const [hasMore, setHasMore] = useState(
    initialData.currentPage < initialData.totalPages,
  );
  const [page, setPage] = useState(initialData.currentPage);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [region, setRegion] = useState(
    searchParams.get("region") || currentUserRegion || "all",
  );
  const [branch, setBranch] = useState(searchParams.get("branch") || "all");

  // Debounced URL update
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 500);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Sync state with initialData when it changes (Server Filter)
  useEffect(() => {
    setUsers(initialData.users);
    setHasMore(initialData.currentPage < initialData.totalPages);
    setPage(initialData.currentPage);
  }, [initialData]);

  // Handle Filter Changes
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset sub-filter if Region changes
    if (key === "region") {
      params.delete("branch");
      setBranch("all");
    }

    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const currentSearch = searchParams.get("search") || "";

      const res = await getUsers({
        page: nextPage,
        limit: 10,
        search: currentSearch,
        region: region === "all" ? "" : region,
        branch: branch === "all" ? "" : branch,
      });

      if (res && res.users) {
        setUsers((prev) => {
          const newUsers = res.users.filter(
            (u) => !prev.some((p) => p._id === u._id),
          );
          return [...prev, ...newUsers];
        });
        setHasMore(res.currentPage < res.totalPages);
        setPage(res.currentPage);
      }
    } catch (error) {
      console.error("Load More Error", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams, region, branch]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  // Derived branches
  const getAvailableBranches = () => {
    if (!region || region === "all") {
      const allBranches = new Set();
      locations.forEach((loc) => {
        loc.branches.forEach((b) => allBranches.add(b));
      });
      return Array.from(allBranches).sort();
    } else {
      const loc = locations.find((l) => l.name === region);
      return loc ? loc.branches.sort() : [];
    }
  };

  const availableBranches = getAvailableBranches();

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
                  setSearch("");
                  setRegion(currentUserRegion || "all");
                  setBranch("all");
                  const params = new URLSearchParams();
                  if (currentUserRegion) {
                    params.set("region", currentUserRegion);
                  }
                  router.push(`${pathname}?${params.toString()}`); // Reset to admin's region
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
              >
                Reset
              </Button>
            </div>

            {/* Filters Grid */}
            <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Region
                </span>
                <Select
                  value={region}
                  onValueChange={(val) => {
                    setRegion(val);
                    updateFilters("region", val);
                  }}
                  disabled={
                    currentUserRegion && session?.user?.role === "super_user"
                  }
                >
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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Branch
                </span>
                <Select
                  value={branch}
                  onValueChange={(val) => {
                    setBranch(val);
                    updateFilters("branch", val);
                  }}
                >
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

              <div className="space-y-1.5 col-span-2 md:col-span-1 relative group w-full max-w-md">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Search
                </span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-300 z-10">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      handleSearch(e.target.value);
                    }}
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
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-xl overflow-hidden glass-panel border border-white/5 shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/5">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="hidden md:table-cell text-gray-200 uppercase tracking-wider font-semibold w-12 text-center text-xs">
                #
              </TableHead>
              <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Name
              </TableHead>
              <TableHead className="hidden lg:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Contact Number
              </TableHead>
              <TableHead className="hidden xl:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Email
              </TableHead>
              <TableHead className="hidden md:table-cell text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Branch / Region
              </TableHead>
              <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Role
              </TableHead>
              <TableHead className="text-gray-200 uppercase tracking-wider font-semibold text-xs">
                Status
              </TableHead>
              {session?.user?.role === "admin" && (
                <TableHead className="text-right text-gray-200 uppercase tracking-wider font-semibold text-xs">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <TableRow className="hover:bg-white/5 border-white/5">
                <TableCell
                  colSpan={session?.user?.role === "admin" ? 8 : 7}
                  className="text-center py-8 text-gray-400"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => (
                <AdminUserRow
                  key={user._id}
                  user={user}
                  index={idx + 1}
                  session={session}
                  onViewProfile={handleViewProfile}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl border border-white/5">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          users.map((user) => (
            <AdminUserCard
              key={user._id}
              user={user}
              session={session}
              onViewProfile={handleViewProfile}
            />
          ))
        )}
      </div>

      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}
      {!hasMore && users.length > 0 && (
        <div className="text-center text-xs text-gray-500 py-4">
          End of user list
        </div>
      )}

      {/* Shared Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          session={session}
          showActions={session?.user?.id !== selectedUser._id}
        />
      )}
    </div>
  );
}
