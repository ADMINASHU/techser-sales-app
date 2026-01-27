"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, MapPin } from "lucide-react";

export function StatsOverview({ statsEntries, systemStats, loading }) {
  const totalEntries = statsEntries.length;
  const completedEntries = statsEntries.filter(
    (e) => e.status === "Completed",
  ).length;
  const inProcessCount = totalEntries - completedEntries;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <StatCard
        title="Total Entries"
        value={loading ? "--" : totalEntries}
        icon={
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        }
      />
      <StatCard
        title="Completed"
        value={loading ? "--" : completedEntries}
        icon={
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        }
        accentColor="text-emerald-400"
        hoverBorder="hover:border-emerald-500/30"
      />
      <StatCard
        title="In Process"
        value={loading ? "--" : inProcessCount}
        icon={
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        }
        accentColor="text-rose-500"
        hoverBorder="hover:border-rose-500/30"
      />

      <StatCard
        title="Admins"
        value={
          systemStats
            ? `${systemStats.admins.verified}/${systemStats.admins.total}`
            : "--"
        }
        icon={<ShieldCheck className="w-24 h-24" />}
        variant="accent"
        accentColor="text-violet-300"
        borderColor="border-violet-500/20"
        hoverBorder="hover:border-violet-500/40"
      />
      <StatCard
        title="Users"
        value={
          systemStats
            ? `${systemStats.users.verified}/${systemStats.users.total}`
            : "--"
        }
        icon={<Users className="w-24 h-24" />}
        variant="accent"
        accentColor="text-blue-300"
        borderColor="border-blue-500/20"
        hoverBorder="hover:border-blue-500/40"
      />
      <StatCard
        title="Locations"
        value={
          systemStats
            ? `${systemStats.locations.branches}/${systemStats.locations.regions}`
            : "--"
        }
        icon={<MapPin className="w-24 h-24" />}
        variant="accent"
        accentColor="text-amber-300"
        borderColor="border-amber-500/20"
        hoverBorder="hover:border-amber-500/40"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  accentColor = "text-white",
  borderColor = "",
  hoverBorder = "hover:border-white/20",
  variant = "default",
}) {
  return (
    <Card
      className={`glass-card shadow-lg relative overflow-hidden group transition-all ${borderColor} ${hoverBorder}`}
    >
      <div
        className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity ${
          variant === "accent"
            ? "opacity-[0.05] group-hover:opacity-[0.15]"
            : ""
        }`}
      >
        {icon}
      </div>
      <CardHeader className="pb-2 p-4">
        <CardTitle
          className={`text-xs font-medium uppercase tracking-wider relative z-10 ${
            variant === "accent" ? accentColor : "text-gray-400"
          }`}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={`text-2xl font-bold relative z-10 ${accentColor}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
