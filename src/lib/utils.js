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

// Haversine formula to calculate distance between two points in meters
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
}
