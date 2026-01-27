"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DashboardHeader({ onDownload, loading, disabled }) {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <h1 className="text-xl md:text-3xl font-bold tracking-tight">
        Admin Dashboard
      </h1>
      <Button
        size="sm"
        onClick={onDownload}
        disabled={loading || disabled}
        className="bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 border-0 h-8 text-xs px-3"
      >
        <Download className="mr-2 h-3.5 w-3.5" />
        {loading ? "Generating..." : "Export"}
      </Button>
    </div>
  );
}
