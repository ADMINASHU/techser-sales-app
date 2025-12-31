import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date in IST timezone (Asia/Kolkata)
 * works correctly on both server (UTC) and client (Local)
 */
export function formatInIST(date, formatStr = "PPpp") {
    if (!date) return "-";
    
    try {
        const dateObj = new Date(date);
        // Get the date parts in IST
        const istDateString = dateObj.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const istDate = new Date(istDateString);
        
        return format(istDate, formatStr);
    } catch (error) {
        console.error("Error formatting IST date:", error);
        return "-";
    }
}
