"use client";

import { useState } from "react";
import { syncOldEntries } from "@/app/actions/syncActions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Database } from "lucide-react";

export default function SyncButton({ sheetId }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSync = async () => {
        setIsLoading(true);
        try {
            toast.info("Starting sync...", { description: "This may take a while depending on the number of entries." });

            const result = await syncOldEntries();

            if (result.success) {
                toast.success("Sync Completed", { description: result.message });
            } else {
                toast.error("Sync Failed", { description: result.error });
            }
        } catch (error) {
            toast.error("An error occurred during sync");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-md bg-card/50">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Google Sheet Sync
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
                Manually sync all existing entries to the configured Google Sheet.
                Use this if entries are missing or if you updated the sheet structure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSync} disabled={isLoading} variant="secondary" className="w-full sm:w-auto h-11 text-base">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        "Sync All Entries"
                    )}
                </Button>

                {sheetId && (
                    <Button variant="outline" asChild className="w-full sm:w-auto h-11 text-base">
                        <a
                            href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                        >
                            <Database className="w-4 h-4" />
                            Open Google Sheet
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
