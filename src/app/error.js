"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground">
                    An unexpected error occurred. Please try again later.
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => reset()} variant="default">
                    Try Again
                </Button>
                <Button onClick={() => window.location.href = "/dashboard"} variant="outline">
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
