"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function CustomerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Keep state for logic continuity, though Region/Branch won't be interactive
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get("region") || "all",
  );
  const [selectedBranch, setSelectedBranch] = useState(
    searchParams.get("branch") || "all",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    const updateParam = (key, value) => {
      const current = params.get(key);
      if (value !== "all" && value !== "") {
        if (current !== value) {
          params.set(key, value);
          hasChanges = true;
        }
      } else {
        if (params.has(key)) {
          params.delete(key);
          hasChanges = true;
        }
      }
    };

    updateParam("region", selectedRegion);
    updateParam("branch", selectedBranch);
    updateParam("search", debouncedSearch);

    if (hasChanges) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [
    selectedRegion,
    selectedBranch,
    debouncedSearch,
    router,
    pathname,
    searchParams,
  ]);

  return (
    <div className="relative group w-full max-w-md">
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
        placeholder="Search by name or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white/5 border-white/10 text-gray-300 h-10 pl-9 pr-10 rounded-xl focus:ring-1 focus:ring-blue-500/50 transition-all hover:bg-white/10 shadow-lg"
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
  );
}
