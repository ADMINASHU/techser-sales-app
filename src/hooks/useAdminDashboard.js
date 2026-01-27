"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import {
  getReportData,
  getFilters,
  getRawEntries,
  getSystemStats,
} from "@/app/actions/reportActions";
import { toast } from "sonner";

export function useAdminDashboard({
  initialSystemStats,
  initialRecentEntries,
  initialMonthlyEntries,
  initialFilters,
  currentUserRegion,
  serverDate,
  session,
}) {
  const [filters, setFilters] = useState(
    initialFilters || { users: [], locations: [] },
  );
  const [filtersLoading, setFiltersLoading] = useState(!initialFilters);

  const currentDate = useMemo(
    () => (serverDate ? new Date(serverDate) : new Date()),
    [serverDate],
  );

  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState(
    currentUserRegion || "all",
  );
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth().toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString(),
  );

  const [exporting, setExporting] = useState(false);

  // SWR: System Stats
  const { data: systemStats } = useSWR("system-stats", getSystemStats, {
    fallbackData: initialSystemStats,
  });

  // SWR: Recent Entries
  const { data: recentEntries = [], isLoading: recentLoading } = useSWR(
    "recent-entries",
    () => getRawEntries({ limit: 9 }),
    { fallbackData: initialRecentEntries },
  );

  // Stats Fetcher
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
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31, 23, 59, 59);
        }
      }
    }
    return await getRawEntries({
      userId: u,
      region: r,
      branch: b,
      startDate,
      endDate,
    });
  }, []);

  const { data: statsEntries = [], isLoading: statsLoading } = useSWR(
    !filtersLoading
      ? [
          "dashboard-stats",
          selectedUser,
          selectedRegion,
          selectedBranch,
          selectedMonth,
          selectedYear,
        ]
      : null,
    statsFetcher,
    {
      fallbackData: initialMonthlyEntries,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!initialFilters) {
      getFilters().then((data) => {
        setFilters(data);
        setFiltersLoading(false);
      });
    }
  }, [initialFilters]);

  const availableBranches = useMemo(() => {
    if (selectedRegion === "all") {
      const allBranches = new Set();
      filters.locations.forEach((loc) => {
        loc.branches.forEach((b) => allBranches.add(b));
      });
      return Array.from(allBranches).sort();
    } else {
      const region = filters.locations.find((l) => l.name === selectedRegion);
      return region ? region.branches.sort() : [];
    }
  }, [selectedRegion, filters.locations]);

  useEffect(() => {
    if (selectedRegion !== "all" && selectedBranch !== "all") {
      const region = filters.locations.find((l) => l.name === selectedRegion);
      if (region && !region.branches.includes(selectedBranch)) {
        setSelectedBranch("all");
      }
    }
  }, [selectedRegion, selectedBranch, filters.locations]);

  const handleDownload = async () => {
    setExporting(true);
    try {
      let startDate, endDate;
      if (selectedYear !== "all") {
        const year = parseInt(selectedYear);
        if (selectedMonth === "all") {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31, 23, 59, 59);
        } else {
          const month = parseInt(selectedMonth);
          startDate = new Date(year, month, 1);
          endDate = new Date(year, month + 1, 0, 23, 59, 59);
        }
      }

      const XLSX = await import("xlsx");
      const data = await getReportData({
        startDate,
        endDate,
        userId: selectedUser,
        region: selectedRegion,
        branch: selectedBranch,
      });

      if (data.length === 0) {
        toast.error("No data found for selected filters");
        setExporting(false);
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, "Sales_Report.xlsx");
      toast.success("Report downloaded");
    } catch (error) {
      toast.error("Failed to download report");
    }
    setExporting(false);
  };

  const handleReset = () => {
    setSelectedUser("all");
    setSelectedRegion(currentUserRegion || "all");
    setSelectedBranch("all");
    const now = new Date();
    setSelectedMonth(now.getMonth().toString());
    setSelectedYear(now.getFullYear().toString());
  };

  return {
    filters,
    filtersLoading,
    selectedUser,
    setSelectedUser,
    selectedRegion,
    setSelectedRegion,
    selectedBranch,
    setSelectedBranch,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    availableBranches,
    systemStats,
    recentEntries,
    recentLoading,
    statsEntries,
    statsLoading,
    exporting,
    handleDownload,
    handleReset,
  };
}
