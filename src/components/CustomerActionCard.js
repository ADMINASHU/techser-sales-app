"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, LogIn, LogOut, Clock, History } from "lucide-react";
import { customerStampIn, customerStampOut } from "@/app/actions/unifiedStampActions";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/LoadingButton";
import DurationDisplay from "@/components/DurationDisplay";
import { Timer } from "lucide-react";

export default function CustomerActionCard({ customer, activeEntry, userId, hasActiveStampIn }) {
    const [loading, setLoading] = useState(false);

    const handleStamp = async (type) => {
        setLoading(true);

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const location = {
                    lat: latitude,
                    lng: longitude,
                    address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                };

                let res;
                if (type === "in") {
                    res = await customerStampIn(customer._id, location);
                } else {
                    res = await customerStampOut(customer._id, location);
                }

                setLoading(false);
                if (res?.error) {
                    toast.error(res.error);
                } else {
                    toast.success(type === "in" ? "Stamped In!" : "Stamped Out!");
                    window.location.reload(); // Refresh to update status
                }
            },
            (error) => {
                console.error(error);
                toast.error("Unable to retrieve your location");
                setLoading(false);
            }
        );
    };

    const isStampedIn = activeEntry && activeEntry.status === "In Process";
    const isCompleted = activeEntry && activeEntry.status === "Completed";
    const isThisCustomerActive = isStampedIn;
    const canStampIn = !hasActiveStampIn || isThisCustomerActive;

    return (
        <div className={`glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 transform-gpu ${isStampedIn ? "border-yellow-500/30 ring-1 ring-yellow-500/10 shadow-[0_0_25px_rgba(234,179,8,0.1)]" : ""
            }`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                {isCompleted ? (
                    <div className="w-16 h-16 bg-emerald-500 rounded-full blur-xl"></div>
                ) : isStampedIn ? (
                    <div className="w-16 h-16 bg-yellow-500 rounded-full blur-xl"></div>
                ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
                )}
            </div>

            {/* Status Indicator Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-20 ${isStampedIn ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                    isCompleted ? "bg-emerald-500" : "bg-blue-500/20"
                }`} />

            <div className="flex justify-between items-start mb-2 gap-4 relative z-10">
                <h3 className="text-lg font-semibold text-white truncate">{customer.name}</h3>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant="outline" className={`text-[9px] py-0 px-1.5 font-medium h-4 ${customer.entryCount > 0 ? "bg-white/5 text-emerald-400 border-white/10" : "bg-white/5 text-gray-500 border-white/10"
                        }`}>
                        <History className="w-3 h-3 mr-1" />
                        {customer.entryCount || 0} Visits
                    </Badge>
                </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-gray-400 mb-2 font-medium relative z-10">
                <MapPin className="w-4 h-4 mt-1 text-blue-500/50 shrink-0" />
                <p className="">{customer.customerAddress}</p>
            </div>

            {activeEntry && (isStampedIn || isCompleted) && (
                <div className="flex items-center justify-center gap-1.5 mb-2 py-1.5 px-3 rounded-full bg-white/5 border border-white/5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-500 w-fit mx-auto relative z-10">
                    <Timer className={`w-3.5 h-3.5 ${isStampedIn ? "text-yellow-500 animate-pulse" : "text-emerald-400"}`} />
                    <DurationDisplay
                        startTime={activeEntry.stampIn?.time}
                        endTime={activeEntry.stampOut?.time}
                        status={activeEntry.status}
                    />
                </div>
            )}

            <div className="flex gap-3 mt-auto relative z-10">
                {!isStampedIn && !isCompleted && (
                    <div className="flex-1 relative group/tooltip">
                        <LoadingButton
                            onClick={() => handleStamp("in")}
                            loading={loading}
                            disabled={!canStampIn}
                            className={`w-full ${canStampIn
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                                } font-bold h-12 rounded-xl shadow-lg border-0`}
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Stamp In
                        </LoadingButton>
                        {!canStampIn && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10">
                                Please stamp out from the current visit first
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        )}
                    </div>
                )}

                {isStampedIn && (
                    <LoadingButton
                        onClick={() => handleStamp("out")}
                        loading={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl shadow-lg border-0"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Stamp Out
                    </LoadingButton>
                )}

                {isCompleted && (
                    <Button
                        disabled
                        className="flex-1 bg-gray-500/10 text-emerald-400 border-emerald-500/20 font-bold h-12 rounded-xl border"
                    >
                        <Clock className="w-5 h-5 mr-2" />
                        Completed Today
                    </Button>
                )}
            </div>
        </div>
    );
}
