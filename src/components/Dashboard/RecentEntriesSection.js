"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, SearchX } from "lucide-react";
import EntryCard from "@/components/EntryCard";

export function RecentEntriesSection({ entries, loading }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <Link href="/entries">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {entries.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center glass-panel rounded-xl border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">
            No recent entries
          </h3>
          <p className="text-gray-400 max-w-sm">
            New entries will appear here once they are submitted.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry._id.toString()}
              entry={entry}
              isAdmin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
