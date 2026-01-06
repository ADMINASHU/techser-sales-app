"use client";

import { useState, useOptimistic, startTransition } from "react";
import { stampIn, stampOut } from "@/app/actions/entryActions";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import PermissionRequestModal from "@/components/PermissionRequestModal";
import { useNotification } from "@/components/FCMNotificationProvider";

export default function EntryActionButtons({ entry, role }) {
    // ... imports 
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const { permission: notificationPermission } = useNotification();

    // ... optimistic state ...
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        entry.status,
        (currentStatus, newStatus) => newStatus
    );

    // Admins don't need to stamp in/out
    if (role === 'admin') return null;

    const handleActionClick = (actionType) => {
        if (notificationPermission !== "granted") {
            setPendingAction(actionType);
            setShowPermissionModal(true);
            return;
        }
        handleAction(actionType);
    };

    const handleAction = async (actionType) => {
        if (loading) return;
        setLoading(true);

        const newStatus = actionType === "in" ? "In Process" : "Completed";

        // Optimistic update moved inside success path or kept? 
        // Keeping it here makes UI snappy, but if permission fails via location error it might revert.
        // We'll keep it here for now.
        startTransition(() => {
            setOptimisticStatus(newStatus);
        });

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };

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
                if (error.code === error.PERMISSION_DENIED) {
                    setPendingAction(actionType);
                    setShowPermissionModal(true);
                    // Revert optimistic update? logic gets complex with optimistic UI. 
                    // Ideally we revert, but since this triggers a modal, user will retry.
                    // The optimistic state will likely persist until refresh or next action.
                } else {
                    let msg = "Unable to retrieve your location";
                    if (error.code === error.TIMEOUT) msg = "Location request timed out. Please check GPS.";
                    toast.error(msg);
                }
                setLoading(false);
            },
            options
        );
    };

    const handlePermissionSuccess = () => {
        if (pendingAction) {
            // To avoid optimistic glitch, we could force the action.
            // But careful with state.
            handleAction(pendingAction);
            setPendingAction(null);
        }
    };

    if (optimisticStatus === "Not Started") {
        return (
            <>
                <LoadingButton onClick={() => handleActionClick("in")} loading={loading} className="w-full bg-green-600 hover:bg-green-700">
                    <MapPin className="mr-2 h-4 w-4" />
                    Stamp In
                </LoadingButton>
                <PermissionRequestModal
                    open={showPermissionModal}
                    onOpenChange={setShowPermissionModal}
                    onSuccess={handlePermissionSuccess}
                />
            </>
        );
    }

    if (optimisticStatus === "In Process") {
        return (
            <>
                <LoadingButton onClick={() => handleActionClick("out")} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    <MapPin className="mr-2 h-4 w-4" />
                    Stamp Out
                </LoadingButton>
                <PermissionRequestModal
                    open={showPermissionModal}
                    onOpenChange={setShowPermissionModal}
                    onSuccess={handlePermissionSuccess}
                />
            </>
        );
    }

    if (optimisticStatus === "Completed") {
        return (
            <Button disabled className="w-full" variant="outline">
                Completed
            </Button>
        );
    }

    return null;
}
