"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatInIST } from "@/lib/utils";
import EntryUserCard from "@/components/EntryUserCard";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const EntryMap = dynamic(() => import('@/components/EntryMap'), {
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-900"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>,
    ssr: false
});

function Label({ children, className }) {
    return <p className={`text-xs uppercase tracking-wider ${className}`}>{children}</p>;
}

export default function AdminEntryDetailsModal({ entry, isOpen, onClose, session }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!entry || !mounted) return null;

    const statusColor =
        entry.status === "Completed" ? "default" :
            entry.status === "In Process" ? "secondary" : "outline";


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[80vw] sm:max-w-[80vw] max-w-5xl p-0 overflow-hidden bg-[#0b0f19] border-white/10 sm:rounded-2xl h-[80vh] sm:h-[680px] max-h-[80vh] flex flex-col">
                {/* Mobile Header (Visible only on mobile, above map) */}
                <div className="lg:hidden p-4 pr-12 border-b border-white/5 flex items-center justify-between bg-[#0b0f19] shrink-0">
                    <DialogTitle className="text-lg font-bold text-white">Visit Details</DialogTitle>
                    <Badge variant={statusColor} className="capitalize px-2 py-0.5 text-[10px]">{entry.status}</Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full overflow-y-auto lg:overflow-hidden hide-scrollbar">
                    {/* Map Column - Left Side (2/3) */}
                    <div className="lg:col-span-2 h-[250px] lg:h-full relative bg-gray-900/50 border-r border-white/5 overflow-hidden shrink-0">
                        <EntryMap
                            location={entry.customerId?.location || entry.location}
                            destinationName={entry.customerId?.name || entry.customerName}
                            stampInLocation={entry.stampIn?.location}
                            stampOutLocation={entry.stampOut?.location}
                            className="w-full h-full"
                        />
                    </div>

                    {/* Info Panel - Right Side (1/3) */}
                    <div className="lg:col-span-1 bg-[#0b0f19] p-6 lg:p-8 h-auto lg:h-full lg:overflow-y-auto flex flex-col relative hide-scrollbar">
                        {/* Header inside the panel (Visible only on desktop) */}
                        <div className="hidden lg:flex items-center justify-between mb-6">
                            <DialogTitle className="text-xl font-bold text-white">Visit Details</DialogTitle>
                            <Badge variant={statusColor} className="capitalize px-2 py-0.5 text-[10px]">{entry.status}</Badge>
                        </div>

                        {/* Content */}
                        <div className="space-y-5">
                            {/* Visited By */}
                            <div className="space-y-1.5">
                                <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">VISITED BY</Label>
                                <EntryUserCard user={entry.userId} />
                            </div>

                            {/* Customer */}
                            <div className="space-y-1">
                                <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CUSTOMER</Label>
                                <p className="text-lg font-bold text-white leading-tight">
                                    {entry.customerId?.name || entry.customerName}
                                </p>
                            </div>

                            {/* Address */}
                            <div className="space-y-1">
                                <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">ADDRESS</Label>
                                <p className="text-[13px] text-gray-300 leading-snug font-medium">
                                    {entry.customerId?.customerAddress || entry.customerAddress}
                                </p>
                            </div>

                            {/* Contact Details Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CONTACT PERSON</Label>
                                    <p className="text-[13px] text-white font-medium">
                                        {entry.customerId?.contactPerson || entry.contactPerson || "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CONTACT NUMBER</Label>
                                    <p className="text-[13px] text-white font-medium">
                                        {entry.customerId?.contactNumber || entry.contactNumber || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                            {/* Timestamps */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Stamp In:</span>
                                    <span className="text-white font-medium">
                                        {entry.stampIn?.time ? formatInIST(entry.stampIn.time, "PPP, p") : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Stamp Out:</span>
                                    <span className="text-white font-medium">
                                        {entry.stampOut?.time ? formatInIST(entry.stampOut.time, "PPP, p") : "-"}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
