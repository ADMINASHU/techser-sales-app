"use client";

import { useState } from "react";
import { stampIn, stampOut } from "@/app/actions/entryActions";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

export default function EntryActionButtons({ entry, role }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Admins don't need to stamp in/out
    if (role === 'admin') return null;

    const handleAction = async (actionType) => {
        setLoading(true);

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Placeholder for address until Maps API is set up
                const location = {
                    lat: latitude,
                    lng: longitude,
                    address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                };

                let res;
                if (actionType === "in") {
                    res = await stampIn(entry._id, location);
                } else {
                    res = await stampOut(entry._id, location);
                }

                setLoading(false);
                if (res?.error) {
                    toast.error(res.error);
                } else {
                    toast.success(actionType === "in" ? "Stamped In!" : "Stamped Out!");
                    router.refresh();
                }
            },
            (error) => {
                console.error(error);
                toast.error("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    if (entry.status === "Not Started") {
        return (
            <LoadingButton onClick={() => handleAction("in")} loading={loading} className="w-full bg-green-600 hover:bg-green-700">
                <MapPin className="mr-2 h-4 w-4" />
                Stamp In
            </LoadingButton>
        );
    }

    if (entry.status === "In Process") {
        return (
            <LoadingButton onClick={() => handleAction("out")} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                <MapPin className="mr-2 h-4 w-4" />
                Stamp Out
            </LoadingButton>
        );
    }

    if (entry.status === "Completed") {
        return (
            <Button disabled className="w-full" variant="outline">
                Completed
            </Button>
        );
    }

    return null;
}
