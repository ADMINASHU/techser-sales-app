"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid } from "lucide-react";
import { clsx } from "clsx";

export default function ViewToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view") || "list";

    const setView = (view) => {
        const params = new URLSearchParams(searchParams);
        params.set("view", view);
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center bg-white/5 border border-white/5 rounded-lg p-1 space-x-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className={clsx(
                    "h-8 w-8 p-0 rounded-md transition-all",
                    currentView === "list"
                        ? "bg-violet-500/20 text-violet-300 shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="List View"
            >
                <LayoutList className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("grid")}
                className={clsx(
                    "h-8 w-8 p-0 rounded-md transition-all",
                    currentView === "grid"
                        ? "bg-violet-500/20 text-violet-300 shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="Grid View"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
        </div>
    );
}
