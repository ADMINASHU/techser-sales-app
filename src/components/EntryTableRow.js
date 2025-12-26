"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DurationDisplay from "@/components/DurationDisplay";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import Link from "next/link";

export default function EntryTableRow({ entry, isAdmin }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/entries/${entry._id}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-white/5 transition-colors group cursor-pointer relative"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold">
                            {entry.customerName?.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-white text-base">{entry.customerName}</div>
                        <div className="relative group/address">
                            <div className="text-xs text-gray-500 truncate max-w-[200px] group-hover:text-gray-300 transition-colors cursor-help">
                                {entry.customerAddress}
                            </div>
                            {/* Address Tooltip */}
                            <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1f2e] border border-white/10 p-2 rounded-md shadow-xl text-xs text-gray-200 opacity-0 group-hover/address:opacity-100 pointer-events-none transition-opacity z-50 hidden group-hover/address:block">
                                {entry.customerAddress}
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
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
            </td>
            <td className="px-6 py-4 text-gray-300">
                {format(new Date(entry.entryDate || entry.createdAt), "PP")}
            </td>
            <td className="px-6 py-4">
                <DurationDisplay
                    startTime={entry.stampIn?.time}
                    endTime={entry.stampOut?.time}
                    status={entry.status}
                />
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Explicit View Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-white/10 hover:text-white opacity-100 lg:opacity-50 lg:group-hover:opacity-100 transition-opacity"
                        onClick={handleRowClick}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Button>

                    {!isAdmin && (
                        <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <DeleteEntryButton entryId={entry._id.toString()} />
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
