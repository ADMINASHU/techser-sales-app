import React from "react";

export default function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Bar Skeleton */}
      <div className="glass-panel border-white/5 mb-8 rounded-xl shadow-2xl">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Header Section */}
            <div className="flex items-center justify-between lg:w-48 lg:border-r border-white/10 pr-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/10" />
                <div className="h-5 w-16 bg-white/10 rounded" />
              </div>
              <div className="h-8 w-12 bg-white/10 rounded" />
            </div>

            {/* Filters Grid */}
            <div className="flex-1 grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {/* Generate 4 skeleton inputs */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-12 bg-white/10 rounded ml-1" />
                  <div className="h-10 w-full bg-white/5 rounded-xl border border-white/10" />
                </div>
              ))}
              {/* Search Skeleton (spans 2 on mobile) */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <div className="h-3 w-16 bg-white/10 rounded ml-1" />
                <div className="h-10 w-full bg-white/5 rounded-xl border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-white/10 overflow-hidden glass-card shadow-xl">
        {/* Table Header */}
        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-2">
          <div className="hidden sm:block w-[70px] h-4 bg-white/10 rounded mx-2" />
          <div className="flex-1 h-4 bg-white/10 rounded mx-2" />
          <div className="hidden sm:block w-[120px] h-4 bg-white/10 rounded mx-2" />
          <div className="w-[100px] h-4 bg-white/10 rounded mx-2 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/5">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="p-4 flex items-center gap-4">
              <div className="hidden sm:block w-[30px] h-4 bg-white/5 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 sm:w-48 bg-white/10 rounded" />
                <div className="h-3 w-48 sm:w-64 bg-white/5 rounded" />
              </div>
              <div className="hidden sm:block w-[40px] h-6 bg-white/5 rounded" />
              <div className="w-[60px] h-5 bg-white/5 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
