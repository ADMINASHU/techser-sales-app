"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export default function CustomerFilters({ locations = [], isAdmin = false }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Keep state for logic continuity, though Region/Branch won't be interactive
    const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get("branch") || "all");
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
    }, [selectedRegion, selectedBranch, debouncedSearch, router, pathname, searchParams]);

    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
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
