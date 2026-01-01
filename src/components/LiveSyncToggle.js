"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { toggleLiveSync } from "@/app/actions/settingsActions";
import { toast } from "sonner";

export default function LiveSyncToggle({ initialEnabled }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (checked) => {
        setIsLoading(true);
        // Optimistic update
        setEnabled(checked);

        const result = await toggleLiveSync();
        
        if (result.success) {
            setEnabled(result.enabled);
            toast.success(result.enabled ? "Live Sync Enabled" : "Live Sync Disabled", {
                description: result.enabled 
                    ? "Entries will now sync to Google Sheets immediately." 
                    : "Entries will now be saved locally only."
            });
        } else {
            // Revert on failure
            setEnabled(!checked);
            toast.error("Failed to update setting", { description: result.error });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-md bg-card/50">
            <div className="space-y-0.5">
                <Label htmlFor="live-sync" className="text-base font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Live Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                    Automatically push entries to Google Sheets on creation.
                </p>
            </div>
            <div className="flex items-center gap-2">
                 {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
                <Switch
                    id="live-sync"
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
