"use client";

import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid } from "lucide-react";
import { clsx } from "clsx";
import { updateViewPreference } from "@/app/actions/userActions";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ViewPreferenceToggle() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    
    const currentView = session?.user?.viewPreference || "grid";

    const setView = async (view) => {
        if (loading) return;
        setLoading(true);
        try {
            await updateViewPreference(view);
            await update({ viewPreference: view });
        } catch (error) {
            console.error("Failed to update view preference", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center bg-white/5 border border-white/5 rounded-lg p-1 space-x-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                disabled={loading}
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
                disabled={loading}
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
