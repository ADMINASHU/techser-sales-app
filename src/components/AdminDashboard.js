"use client";

import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { DashboardHeader } from "./Dashboard/DashboardHeader";
import { DashboardFilters } from "./Dashboard/DashboardFilters";
import { StatsOverview } from "./Dashboard/StatsOverview";
import { RecentEntriesSection } from "./Dashboard/RecentEntriesSection";

export default function AdminDashboard(props) {
  const {
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
  } = useAdminDashboard(props);

  if (filtersLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        onDownload={handleDownload}
        loading={exporting}
        disabled={statsLoading || statsEntries.length === 0}
      />

      <DashboardFilters
        filters={filters}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableBranches={availableBranches}
        onReset={handleReset}
        isSuperUser={props.session?.user?.role === "super_user"}
      />

      <StatsOverview
        statsEntries={statsEntries}
        systemStats={systemStats}
        loading={statsLoading}
      />

      <RecentEntriesSection entries={recentEntries} loading={recentLoading} />
    </div>
  );
}
