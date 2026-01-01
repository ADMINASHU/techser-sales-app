/**
 * Geolocation utility functions for distance calculations
 */

// Threshold for duplicate customer detection (in meters)
export const DUPLICATE_THRESHOLD_METERS = 50;

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Format distance for user-friendly display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
    if (meters < 1) {
        return "< 1 meter";
    } else if (meters < 1000) {
        return `${Math.round(meters)} meters`;
    } else {
        return `${(meters / 1000).toFixed(2)} km`;
    }
}

/**
 * Check if two coordinates are within a certain threshold distance
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @param {number} thresholdMeters - Threshold distance in meters
 * @returns {boolean} True if within threshold
 */
export function isWithinDistance(lat1, lng1, lat2, lng2, thresholdMeters) {
    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= thresholdMeters;
}
