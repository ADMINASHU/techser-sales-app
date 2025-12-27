"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DurationDisplay from "@/components/DurationDisplay";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import Link from "next/link";

export default function EntryTableRow({ entry, isAdmin, serialNumber }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/entries/${entry._id}`);
    };

    const formatTime = (isoString) => {
        if (!isoString) return "-";
        return format(new Date(isoString), "h:mm a");
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-white/5 transition-colors group cursor-pointer relative text-sm"
        >
            {/* Serial Number */}
            <td className="px-6 py-4 text-gray-400 font-mono">
                {String(serialNumber).padStart(2, '0')}
            </td>

            {/* Date */}
            <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                {format(new Date(entry.entryDate || entry.createdAt), "PP")}
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
                    <div className="font-medium text-white">{entry.userId?.name || "Unknown"}</div>
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
                        {entry.customerAddress || "No address"}
                    </div>
                </div>
            </td>

            {/* Actions (Hidden for Admin) */}
            {!isAdmin && (
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <DeleteEntryButton entryId={entry._id.toString()} />
                        </div>
                    </div>
                </td>
            )}
        </tr>
    );
}
