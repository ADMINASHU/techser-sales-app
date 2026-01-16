"use client";

import { useState, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { formatInIST, calculateDistance } from "@/lib/utils";
import DurationDisplay from "@/components/DurationDisplay";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import AddCommentButton from "@/components/AddCommentButton";
import AdminEntryDetailsModal from "@/components/AdminEntryDetailsModal";
import EntryDetailsModal from "@/components/EntryDetailsModal";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";

const EntryCard = memo(function EntryCard({ entry, isAdmin }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session } = useSession();

    const handleCardClick = () => {
        setIsModalOpen(true);
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
        <>
            <div
                onClick={handleCardClick}
                className={`glass-card p-4 rounded-xl relative overflow-hidden group active:scale-[0.98] transition-all duration-300 transform-gpu h-full flex flex-col cursor-pointer ${isAdmin && isUnverified
                    ? "border-red-500/50 ring-1 ring-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.1)] bg-red-500/5"
                    : entry.status === 'In Process'
                        ? "border-yellow-500/30 ring-1 ring-yellow-500/10 shadow-[0_0_25px_rgba(234,179,8,0.1)]"
                        : ""
                    }`}
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 p-2 transition-opacity pointer-events-none">
                    {isAdmin && isUnverified ? (
                        <ShieldAlert className="w-32 h-32 text-red-500/20 absolute -top-4 -right-4 rotate-12 z-0" />
                    ) : entry.status === 'Completed' ? (
                        <div className="w-16 h-16 bg-emerald-500 rounded-full blur-xl opacity-10 group-hover:opacity-20"></div>
                    ) : entry.status === 'In Process' ? (
                        <div className="w-16 h-16 bg-yellow-500 rounded-full blur-xl opacity-10 group-hover:opacity-20"></div>
                    ) : (
                        <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl opacity-10 group-hover:opacity-20"></div>
                    )}
                </div>

                {/* Admin View: User & Location Details */}
                {isAdmin && (
                    <div className="mb-3 pb-3 border-b border-white/5 flex items-center justify-between gap-2 relative z-10">
                        <p className="text-sm font-semibold text-blue-400 truncate">
                            {entry.userId?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                            {entry.userId?.branch || entry.branch} / {entry.userId?.region || entry.region}
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-start mb-2 relative z-10 gap-2">
                    <h3 className="text-base font-semibold text-white truncate">{entry.customerName}</h3>
                    <Badge variant="outline" className={`flex-shrink-0 ${entry.status === 'Completed'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : entry.status === 'In Process'
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                        {entry.status}
                    </Badge>
                </div>

                {/* Address - Full Display */}
                <div className="relative mb-3 flex-1 z-10">
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {entry.customerId?.customerAddress || entry.customerAddress || "No address available"}
                    </p>

                    {/* Comment Display (Visible to all users) */}
                    {entry.comment && (
                        <div className="mt-2 px-2 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-xs text-yellow-400 line-clamp-2">
                                {entry.comment}
                            </p>
                        </div>
                    )}

                    {/* Distance Display (Only for Admin & Unverified) */}
                    {isAdmin && isUnverified && (inDistance !== null || outDistance !== null) && (
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

                <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                        <span className="text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatInIST(entry.entryDate || entry.createdAt, "PP")}
                        </span>

                        <div className="flex items-center gap-2">
                            {/* Duration Badge */}
                            {(entry.status === 'In Process' || entry.status === 'Completed') && (
                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 shadow-sm ${entry.status === 'Completed'
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

                            {/* Comment & Delete Buttons (Only if not admin) */}
                            {!isAdmin && (
                                <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center gap-1" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}>
                                    <AddCommentButton entryId={entry._id.toString()} currentComment={entry.comment || ""} />
                                    <DeleteEntryButton entryId={entry._id.toString()} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isAdmin ? (
                <AdminEntryDetailsModal
                    entry={entry}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    session={session}
                />
            ) : (
                <EntryDetailsModal
                    entry={entry}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
});

export default EntryCard;
