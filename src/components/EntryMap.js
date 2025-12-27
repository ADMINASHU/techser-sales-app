"use client";

import { useLoadScript, GoogleMap, MarkerF, CircleF } from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation, MapPin } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils"; // [NEW]

const libraries = ["places", "geometry"];

export default function EntryMap({ location, destinationName, stampInLocation, stampOutLocation, className }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
        id: "google-map-script",
    });

    if (loadError) {
        return (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm">
                Error loading map: {loadError.message}
            </div>
        );
    }

    if (!isLoaded) return <div className={cn("flex items-center justify-center bg-muted h-[300px]", className)}><Loader2 className="animate-spin" /></div>;

    return <MapInterface
        location={location}
        destinationName={destinationName}
        stampInLocation={stampInLocation}
        stampOutLocation={stampOutLocation}
        className={className}
    />;
}

function MapInterface({ location, destinationName, stampInLocation, stampOutLocation, className }) {
    const destination = useMemo(() => {
        if (!location?.lat || !location?.lng) return null;
        return {
            lat: location.lat,
            lng: location.lng
        };
    }, [location]);

    const stampIn = useMemo(() => {
        return stampInLocation?.lat && stampInLocation?.lng ? {
            lat: stampInLocation.lat,
            lng: stampInLocation.lng
        } : null;
    }, [stampInLocation]);

    const stampOut = useMemo(() => {
        return stampOutLocation?.lat && stampOutLocation?.lng ? {
            lat: stampOutLocation.lat,
            lng: stampOutLocation.lng
        } : null;
    }, [stampOutLocation]);

    const [userLocation, setUserLocation] = useState(null);


    // Calculate Distances and Radius
    const distances = useMemo(() => {
        if (!window.google || !destination) return { radius: 0, in: null, out: null };

        const destLatLng = new window.google.maps.LatLng(destination);
        let maxDist = 0;
        let inDist = null;
        let outDist = null;

        if (stampIn) {
            inDist = window.google.maps.geometry.spherical.computeDistanceBetween(
                destLatLng,
                new window.google.maps.LatLng(stampIn)
            );
            if (inDist > maxDist) maxDist = inDist;
        }

        if (stampOut) {
            outDist = window.google.maps.geometry.spherical.computeDistanceBetween(
                destLatLng,
                new window.google.maps.LatLng(stampOut)
            );
            if (outDist > maxDist) maxDist = outDist;
        }

        return { radius: maxDist, in: inDist, out: outDist };
    }, [destination, stampIn, stampOut]);

    // Get user location for context (optional, helps visualization)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => console.log("User location access denied or timed out"),
                { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true } // Optimization
            );
        }
    }, []);

    // If no valid location data, show placeholder
    if (!destination) {
        return (
            <div className={cn("bg-muted/30 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground p-4 h-[200px] w-full", className)}>
                <MapPin className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Location coordinates not available for this entry.</p>
            </div>
        );
    }

    const handleGetDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className={cn("rounded-md overflow-hidden relative border h-[300px] w-full grow", className)}>
                {/* Distance Legend Overlay */}
                {(distances.in !== null || distances.out !== null) && (
                    <div className="absolute bottom-2 left-2 bg-white p-2.5 rounded-md shadow-lg text-xs space-y-2 z-10 border border-gray-200 min-w-[140px]">
                        <div className="font-bold text-gray-900 border-b border-gray-100 pb-1">Dist from Customer</div>
                        {distances.in !== null && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>
                                    <span className="font-semibold text-gray-700">IN</span>
                                </div>
                                <span className="font-bold text-gray-900">{Math.round(distances.in)} m</span>
                            </div>
                        )}
                        {distances.out !== null && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
                                    <span className="font-semibold text-gray-700">OUT</span>
                                </div>
                                <span className="font-bold text-gray-900">{Math.round(distances.out)} m</span>
                            </div>
                        )}
                    </div>
                )}

                <GoogleMap
                    key={`${destination.lat}-${destination.lng}`}
                    zoom={15}
                    center={destination}
                    mapContainerClassName="w-full h-full"
                    options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                    }}
                >
                    {/* Radius Circle */}
                    {distances.radius > 0 && (
                        <CircleF
                            center={destination}
                            radius={distances.radius}
                            options={{
                                strokeColor: "#FF0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 1,
                                fillColor: "#FF0000",
                                fillOpacity: 0.10,
                            }}
                        />
                    )}

                    {/* Destination Marker - Default Red Pin */}
                    <MarkerF
                        position={destination}
                        title={destinationName || "Destination"}
                        label={{
                            text: "C",
                            color: "white",
                            fontWeight: "bold"
                        }}
                    />

                    {/* Stamp In Marker - Green Pin */}
                    {stampIn && (
                        <MarkerF
                            position={stampIn}
                            title="Stamp In Location"
                            label={{
                                text: "IN",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "11px"
                            }}
                            icon={{
                                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", // Standard Pin Path
                                anchor: { x: 12, y: 22 }, // Bottom tip
                                labelOrigin: { x: 12, y: 9 }, // Center of the pin head
                                scale: 2, // Larger scale to fit 2-letter text
                                fillOpacity: 1,
                                strokeWeight: 1,
                                fillColor: '#22c55e', // Green
                                strokeColor: '#166534',
                            }}
                        />
                    )}

                    {/* Stamp Out Marker - Orange Pin */}
                    {stampOut && (
                        <MarkerF
                            position={stampOut}
                            title="Stamp Out Location"
                            label={{
                                text: "OUT",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "10px"
                            }}
                            icon={{
                                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                                anchor: { x: 12, y: 22 },
                                labelOrigin: { x: 12, y: 9 }, // Center of the pin head
                                scale: 2, // Larger scale
                                fillOpacity: 1,
                                strokeWeight: 1,
                                fillColor: '#f97316', // Orange
                                strokeColor: '#c2410c',
                            }}
                        />
                    )}

                    {/* User Location Marker */}
                    {userLocation && (
                        <MarkerF
                            position={userLocation}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 7,
                                fillOpacity: 1,
                                strokeWeight: 2,
                                fillColor: '#4285F4',
                                strokeColor: 'white',
                            }}
                            title="You are here"
                        />
                    )}
                </GoogleMap>
            </div>

        </div>
    );
}
