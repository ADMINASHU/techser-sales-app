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
import { useRouter } from "next/navigation";

export default function CustomerActionCard({ customer, activeEntry, userId, hasActiveStampIn }) {
    const router = useRouter();
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

            <div className="flex gap-3 mt-auto relative z-10">
                {!isStampedIn && !isCompleted && (
                    <div className="flex-1 relative group/tooltip">
                        <LoadingButton
                            onClick={() => handleStamp("in")}
                            loading={loading}
                            disabled={!canStampIn}
                            className={`w-full ${canStampIn
                                ? "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                                } font-bold h-12 rounded-xl border-0 transition-all duration-300 active:scale-[0.98]`}
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
                        className="flex-1 bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-rose-500/20 border-0 transition-all duration-300 active:scale-[0.98] flex flex-row items-center justify-between px-4 group ring-1 ring-white/10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-full">
                                <LogOut className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base">Stamp Out</span>
                        </div>

                        <div className="flex items-center gap-2 pl-3 border-l border-white/10 h-6">
                            <Timer className="w-4 h-4 text-white animate-pulse" />
                            <DurationDisplay
                                startTime={activeEntry.stampIn?.time}
                                endTime={activeEntry.stampOut?.time}
                                status={activeEntry.status}
                                hideLabel={true}
                            />
                        </div>
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
