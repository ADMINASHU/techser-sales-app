"use client";

import { useRouter } from "next/navigation";
import { formatInIST, calculateDistance } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DurationDisplay from "@/components/DurationDisplay";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function EntryTableRow({ entry, isAdmin, serialNumber }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/entries/${entry._id}`);
    };

    const formatTime = (isoString) => {
        if (!isoString) return "-";
        return formatInIST(isoString, "h:mm a");
    };

    // Distance Calculation Logic
    const customerLoc = entry.customerId?.location || entry.location;
    const stampInLoc = entry.stampIn?.location;
    const stampOutLoc = entry.stampOut?.location;

    let inDistance = null;
    let outDistance = null;

    if (customerLoc?.lat && customerLoc?.lng) {
        if (stampInLoc?.lat && stampInLoc?.lng) {
            inDistance = calculateDistance(customerLoc.lat, customerLoc.lng, stampInLoc.lat, stampInLoc.lng);
        }
        if (stampOutLoc?.lat && stampOutLoc?.lng) {
            outDistance = calculateDistance(customerLoc.lat, customerLoc.lng, stampOutLoc.lat, stampOutLoc.lng);
        }
    }

    const isUnverified = (inDistance !== null && inDistance > 100) || (outDistance !== null && outDistance > 100);

    const formatDist = (meters) => {
        if (meters === null) return "-";
        if (meters > 1000) return `${(meters / 1000).toFixed(1)} km`;
        return `${meters} m`;
    };

    return (
        <tr
            onClick={handleRowClick}
            className={`transition-colors group cursor-pointer relative text-sm ${
                isAdmin && isUnverified ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-white/5"
            }`}
        >
            {/* Serial Number */}
            <td className="px-6 py-4 text-gray-400 font-mono">
                {String(serialNumber).padStart(2, '0')}
            </td>

            {/* Date */}
            <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                {formatInIST(entry.entryDate || entry.createdAt, "PP")}
            </td>

            {/* Timings (Stamp In / Out) */}
            <td className="px-6 py-4 text-gray-300 whitespace-nowrap font-mono text-xs">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-500/70 w-8">In:</span>
                        <span>{entry.stampIn?.time ? formatTime(entry.stampIn.time) : "-"}</span>
                    </div>
                    {(entry.stampOut?.time || entry.status === 'Completed') && (
                        <div className="flex items-center gap-2">
                            <span className="text-red-500/70 w-8">Out:</span>
                            <span>{entry.stampOut?.time ? formatTime(entry.stampOut.time) : "-"}</span>
                        </div>
                    )}
                </div>
            </td>

            {/* Visited By */}
            {isAdmin && (
                <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2">
                        {isUnverified && <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />}
                        <div className="font-medium text-white">{entry.userId?.name || "Unknown"}</div>
                    </div>
                </td>
            )}

            {/* Status / Duration */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                    <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.status === 'Completed'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : entry.status === 'In Process'
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${entry.status === 'Completed' ? "bg-emerald-400" : entry.status === 'In Process' ? "bg-yellow-400" : "bg-blue-400"
                                }`}></span>
                            {entry.status}
                        </span>
                    </div>
                    {/* Duration with Label */}
                    <div>
                        <DurationDisplay
                            startTime={entry.stampIn?.time}
                            endTime={entry.stampOut?.time}
                            status={entry.status}
                            hideLabel={false}
                        />
                    </div>
                </div>
            </td>

            {/* Region / Branch (Admin Only) */}
            {isAdmin && (
                <td className="px-6 py-4 text-gray-300">
                    <div className="flex flex-col">
                        <span className="font-medium text-white">{entry.userId?.region || "-"}</span>
                        <span className="text-xs text-gray-500">{entry.userId?.branch || "-"}</span>
                    </div>
                </td>
            )}

            {/* Customer & Address */}
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-white text-base">{entry.customerName}</div>
                    {/* Full Address (Removed Truncation) */}
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors whitespace-pre-wrap">
                        {entry.customerId?.customerAddress || entry.customerAddress || "No address"}
                    </div>
                    {isAdmin && (inDistance !== null || outDistance !== null) && (
                        <div className="mt-1 flex gap-3 text-xs font-mono">
                            {inDistance !== null && (
                                <span className={inDistance > 100 ? "text-red-400 font-bold" : "text-emerald-400"}>
                                    In: {formatDist(inDistance)}
                                </span>
                            )}
                            {outDistance !== null && (
                                <span className={outDistance > 100 ? "text-red-400 font-bold" : "text-emerald-400"}>
                                    Out: {formatDist(outDistance)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </td>

            {/* Actions (Hidden for Admin) */}
            {!isAdmin && (
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <DeleteEntryButton entryId={entry._id.toString()} />
                        </div>
                    </div>
                </td>
            )}
        </tr>
    );
}
