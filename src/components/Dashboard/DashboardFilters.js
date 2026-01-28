"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

export function DashboardFilters({
  filters,
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
  onReset,
  isSuperUser,
}) {
  return (
    <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-6">
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
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </div>
              <span className="font-semibold text-white">Filters</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs font-medium"
            >
              Reset
            </Button>
          </div>

          <div className="flex-1 grid gap-3 grid-cols-3 md:grid-cols-5">
            <FilterSelect
              label="User"
              value={selectedUser}
              onValueChange={setSelectedUser}
              items={filters.users.map((u) => ({
                value: u._id,
                label: u.name,
              }))}
            />
            <FilterSelect
              label="Region"
              value={selectedRegion}
              onValueChange={setSelectedRegion}
              items={filters.locations.map((loc) => ({
                value: loc.name,
                label: loc.name,
              }))}
              disabled={isSuperUser}
            />
            <FilterSelect
              label="Branch"
              value={selectedBranch}
              onValueChange={setSelectedBranch}
              items={availableBranches.map((b) => ({ value: b, label: b }))}
            />
            <FilterSelect
              label="Month"
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              items={months}
            />
            <FilterSelect
              label="Year"
              value={selectedYear}
              onValueChange={setSelectedYear}
              items={years.map((y) => ({ value: y, label: y }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onValueChange, items, disabled }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
        {label}
      </span>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-white/5 border-white/10 text-gray-300 focus:ring-1 focus:ring-blue-500/50 h-10">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/10">
          <SelectItem value="all">All</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
