"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DurationDisplay from "@/components/DurationDisplay";
import DeleteEntryButton from "@/components/DeleteEntryButton";

export default function EntryCard({ entry, isAdmin }) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/entries/${entry._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="glass-card p-4 rounded-xl relative overflow-hidden group active:scale-[0.98] transition-all h-full flex flex-col cursor-pointer"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                {entry.status === 'Completed' ? (
                    <div className="w-16 h-16 bg-emerald-500 rounded-full blur-xl"></div>
                ) : entry.status === 'In Process' ? (
                    <div className="w-16 h-16 bg-yellow-500 rounded-full blur-xl"></div>
                ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
                )}
            </div>

            <div className="flex justify-between items-start mb-2 relative z-10 pr-8">
                <h3 className="text-lg font-semibold text-white truncate">{entry.customerName}</h3>
                <Badge variant="outline" className={
                    entry.status === 'Completed'
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : entry.status === 'In Process'
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }>
                    {entry.status}
                </Badge>
            </div>

            {/* Address - Full Display (up to 3 lines) */}
            <div className="relative mb-3 flex-1">
                <p className="text-sm text-gray-400 line-clamp-3 group-hover:text-gray-300 transition-colors">
                    {entry.customerAddress}
                </p>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                    <span className="text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(new Date(entry.entryDate || entry.createdAt), "PP")}
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Duration Badge */}
                        {(entry.status === 'In Process' || entry.status === 'Completed') && (
                            <div className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 shadow-sm ${entry.status === 'Completed'
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <DurationDisplay
                                    startTime={entry.stampIn?.time}
                                    endTime={entry.stampOut?.time}
                                    status={entry.status}
                                />
                            </div>
                        )}

                        {/* Delete Button (Only if not admin) */}
                        {!isAdmin && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}>
                                <DeleteEntryButton entryId={entry._id.toString()} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
