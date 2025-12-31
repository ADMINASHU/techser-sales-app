"use client";

import { useEffect, useState } from "react";

export default function DurationDisplay({ startTime, endTime, status, hideLabel = false }) {
    // If not started, show nothing or placeholder


    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        if (status === "In Process") {
            const interval = setInterval(() => setNow(new Date()), 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    // Prevent hydration mismatch by only rendering once mounted
    if (!mounted) {
        return <span className="text-xs opacity-0">Loading...</span>;
    }

    const start = new Date(startTime);
    const end = status === "Completed" && endTime ? new Date(endTime) : now;


    // If end is before start (sanity check), use start
    const safeEnd = end < start ? start : end;

    const diffMs = safeEnd - start;

    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)));

    const format = (num) => num.toString().padStart(2, '0');

    const parts = [];
    if (hours > 0) parts.push(`${hours} hrs`);
    if (minutes > 0) parts.push(`${format(minutes)} mins`);
    // Always show seconds if other parts exist, or if seconds > 0, or if total is 0 (fallback)
    if (seconds > 0 || parts.length === 0) parts.push(`${format(seconds)} secs`);

    // If not started, show nothing or placeholder
    if (status === "Not Started" || !startTime) return null;

    return (
        <span className="text-xs" suppressHydrationWarning>
            {!hideLabel && <span className="font-semibold text-muted-foreground mr-1">Duration:</span>}
            <span className="font-mono">
                {parts.join(" ")}
            </span>
        </span>
    );
}
