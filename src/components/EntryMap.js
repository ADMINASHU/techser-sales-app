"use client";

import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation, MapPin } from "lucide-react";
import { toast } from "sonner";

const libraries = ["places"];

export default function EntryMap({ location, destinationName }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (loadError) {
        return (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm">
                Error loading map: {loadError.message}
            </div>
        );
    }

    if (!isLoaded) return <div className="h-[300px] flex items-center justify-center bg-muted"><Loader2 className="animate-spin" /></div>;

    return <MapInterface location={location} destinationName={destinationName} />;
}

function MapInterface({ location, destinationName }) {
    // If no valid location data, show placeholder
    if (!location?.lat || !location?.lng) {
        return (
            <div className="h-[200px] w-full bg-muted/30 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground p-4">
                <MapPin className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Location coordinates not available for this entry.</p>
            </div>
        );
    }

    const destination = useMemo(() => ({ 
        lat: location.lat, 
        lng: location.lng
    }), [location]);

    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(destination);
    
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
                () => console.log("User location access denied")
            );
        }
    }, []);

    const handleGetDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-3">
            <div className="h-[300px] w-full rounded-md overflow-hidden relative border">
                <GoogleMap
                    zoom={15}
                    center={mapCenter}
                    mapContainerClassName="w-full h-full"
                    options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                    }}
                >
                    {/* Destination Marker */}
                    <MarkerF 
                        position={destination} 
                        title={destinationName || "Destination"}
                    />

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

            <Button 
                onClick={handleGetDirections} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions to {destinationName || "Location"}
            </Button>
        </div>
    );
}
