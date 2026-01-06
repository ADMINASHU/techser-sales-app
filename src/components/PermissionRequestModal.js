"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNotification } from "./FCMNotificationProvider";

export default function PermissionRequestModal({ open, onOpenChange, onSuccess }) {
    const { permission: notificationPermission, requestPermission: requestNotificationPermission } = useNotification();
    const [locationGranted, setLocationGranted] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (open) {
            checkLocationPermission();
        }
    }, [open]);

    const checkLocationPermission = async () => {
        setChecking(true);
        if ("geolocation" in navigator) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setLocationGranted(result.state === 'granted');

                result.onchange = () => {
                    setLocationGranted(result.state === 'granted');
                };
            } catch (e) {
                // Fallback for browsers that don't support permissions query
                setLocationGranted(false);
            }
        }
        setChecking(false);
    };

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setLocationGranted(true);
                    toast.success("Location access granted!");
                },
                (error) => {
                    console.error("Location error:", error);
                    toast.error("Could not get location access.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    const handleRequestNotifications = async () => {
        await requestNotificationPermission();
    };

    const handleContinue = () => {
        if (locationGranted && notificationPermission === "granted") {
            onSuccess();
            onOpenChange(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
                <DialogTitle className="sr-only">Request Permissions</DialogTitle>
                <Card className="w-full bg-[#0A0A0B] border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="pt-6 pb-4 text-center">
                        <CardTitle className="text-2xl font-bold text-white mb-2">
                            Permissions Required
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            To perform this action, we need access to your location and notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-6 pb-8">
                        <div className="grid gap-3">
                            {/* Location Permission */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${locationGranted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${locationGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">Location Access</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Required for stamping</p>
                                        </div>
                                    </div>
                                    {locationGranted ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={requestLocation}
                                            className="h-7 text-xs bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                                        >
                                            Allow
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications Permission */}
                            <div className={`p-4 rounded-xl border transition-all duration-300 ${notificationPermission === "granted" ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${notificationPermission === "granted" ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">Notifications</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Required for updates</p>
                                        </div>
                                    </div>
                                    {notificationPermission === "granted" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRequestNotifications}
                                            className="h-7 text-xs bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                                        >
                                            Allow
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 border-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleContinue}
                            disabled={!locationGranted || notificationPermission !== "granted"}
                        >
                            Continue Action
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
