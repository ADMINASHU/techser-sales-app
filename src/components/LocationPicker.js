"use client";

import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng, getZipCode, getDetails } from "use-places-autocomplete";
import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

const libraries = ["places"];

export default function LocationPicker({ onLocationSelect }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (loadError) {
        return (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm">
                <p className="font-medium">Error loading Google Maps</p>
                <p>{loadError.message}</p>
                <p className="mt-2 text-xs opacity-80">
                    If you are the developer, check your API key restrictions in Google Cloud Console.
                    Allow: <code>{window.location.origin}/*</code>
                </p>
            </div>
        );
    }

    if (!isLoaded) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return <MapInterface onLocationSelect={onLocationSelect} />;
}

function MapInterface({ onLocationSelect }) {
    const mapCenter = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []); // Default to India center
    const [center, setCenter] = useState(mapCenter);
    const [zoom, setZoom] = useState(5);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState("");
    
    // Autocomplete hook
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
    });

    const mapRef = useRef();
    const onLoad = (map) => (mapRef.current = map);

    // Initial load - Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setMarkerPosition(pos);
                    setZoom(15);
                    handleReverseGeocode(pos);
                },
                () => {
                    // toast.error("Could not fetch location");
                }
            );
        }
    }, []);

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
        try {
            const results = await getGeocode({ address });
            const { lat, lng } = getLatLng(results[0]);
            const pos = { lat, lng };
            setCenter(pos);
            setMarkerPosition(pos);
            setZoom(17);
            
            // Process address components
            processAddressComponents(results[0], pos);
        } catch (error) {
            toast.error("Error finding address");
        }
    };

    const handleMapClick = (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(pos);
        handleReverseGeocode(pos);
    };

    const handleDragEnd = (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(pos);
        handleReverseGeocode(pos);
    };

    const handleReverseGeocode = async (pos) => {
        try {
            const results = await getGeocode({ location: pos });
            if (results[0]) {
                setValue(results[0].formatted_address, false);
                processAddressComponents(results[0], pos);
            }
        } catch (error) {
            console.error("Geocoding error: ", error);
        }
    };

    const processAddressComponents = (result, pos) => {
        const addressComponents = result.address_components;
        let district = "";
        let state = "";
        let pincode = "";
        // Simplified address extraction
        addressComponents.forEach(component => {
             const types = component.types;
             if (types.includes("administrative_area_level_2") || types.includes("locality")) {
                 district = component.long_name;
             }
             if (types.includes("administrative_area_level_1")) {
                 state = component.long_name;
             }
             if (types.includes("postal_code")) {
                 pincode = component.long_name;
             }
        });

        setSelectedAddress(result.formatted_address);

        onLocationSelect({
            address: result.formatted_address,
            district,
            state,
            pincode,
            lat: pos.lat,
            lng: pos.lng
        });
    };

    const getCurrentLocation = () => {
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setMarkerPosition(pos);
                    setZoom(17);
                    handleReverseGeocode(pos);
                }
            );
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative z-10">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Search for an area, locality..."
                    className="w-full bg-white dark:bg-black"
                />
                {status === "OK" && (
                    <ul className="absolute z-20 w-full bg-white dark:bg-black border rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div className="h-[300px] w-full rounded-md overflow-hidden relative border">
                <GoogleMap
                    zoom={zoom}
                    center={center}
                    mapContainerClassName="w-full h-full"
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                    onLoad={onLoad}
                    onClick={handleMapClick}
                >
                    {markerPosition && (
                        <MarkerF
                            position={markerPosition}
                            draggable={true}
                            onDragEnd={handleDragEnd}
                        />
                    )}
                </GoogleMap>
                <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-4 center-x left-1/2 -translate-x-1/2 shadow-md"
                    onClick={(e) => { e.preventDefault(); getCurrentLocation(); }}
                    type="button"
                >
                    <Navigation className="w-4 h-4 mr-2" />
                    Use current location
                </Button>
            </div>

            {/* Selected Address Display */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                 <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-sm">Selected Location</p>
                        <p className="text-sm text-muted-foreground">{selectedAddress || "No location selected"}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
}
