"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Edit, X } from "lucide-react";
import { formatInIST } from "@/lib/utils";
import EntryUserCard from "@/components/EntryUserCard";
import EntryMap from "@/components/EntryMap";
import EntryActionButtons from "@/components/EntryActionButtons";
import Link from "next/link";
import { useEffect, useState } from "react";

function Label({ children, className }) {
    return <p className={`text-xs uppercase tracking-wider ${className}`}>{children}</p>;
}

export default function EntryDetailsModal({ entry, isOpen, onClose, session }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!entry || !mounted) return null;

    const statusColor =
        entry.status === "Completed" ? "default" :
            entry.status === "In Process" ? "secondary" : "outline";

    const isAdmin = session?.user?.role === 'admin';
    const isToday = new Date().toDateString() === new Date(entry.entryDate || entry.createdAt).toDateString();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">Visit Details</DialogTitle>
                        <Badge variant={statusColor}>{entry.status}</Badge>
                    </div>
                </DialogHeader>

                <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-3" : ""} gap-6 mt-4`}>
                    {/* Map Column (Admin Only) */}
                    {isAdmin && (
                        <div className="lg:col-span-2">
                            <div className="glass-panel rounded-xl overflow-hidden h-[400px] lg:h-[500px]">
                                <EntryMap
                                    location={entry.customerId?.location || entry.location}
                                    destinationName={entry.customerId?.name || entry.customerName}
                                    stampInLocation={entry.stampIn?.location}
                                    stampOutLocation={entry.stampOut?.location}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Details Column */}
                    <div className={`${isAdmin ? "lg:col-span-1" : "max-w-3xl mx-auto w-full"} space-y-4`}>
                        <div className="glass-panel p-4 rounded-xl space-y-4">
                            <div>
                                <Label className="text-muted-foreground mb-2">Visited By</Label>
                                <EntryUserCard user={entry.userId} />
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Customer</Label>
                                <div className="font-medium text-lg text-white">
                                    {entry.customerId?.name || entry.customerName}
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Address</Label>
                                <div className="font-medium mb-2 text-gray-300">
                                    {entry.customerId?.customerAddress || entry.customerAddress}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Contact Person</Label>
                                    <div className="font-medium text-sm sm:text-base">
                                        {entry.customerId?.contactPerson || entry.contactPerson || "-"}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Contact Number</Label>
                                    <div className="font-medium text-sm sm:text-base">
                                        {entry.customerId?.contactNumber || entry.contactNumber || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Stamp In:</span>
                                    <span className="text-gray-200 font-medium">
                                        {entry.stampIn?.time ? formatInIST(entry.stampIn.time, "PPpp") : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Stamp Out:</span>
                                    <span className="text-gray-200 font-medium">
                                        {entry.stampOut?.time ? formatInIST(entry.stampOut.time, "PPpp") : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {isAdmin && (
                                <>
                                    {(entry.customerId?.location?.lat || entry.location?.lat) && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${entry.customerId?.location?.lat || entry.location?.lat},${entry.customerId?.location?.lng || entry.location?.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full"
                                        >
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                                <Navigation className="w-4 h-4 mr-2" />
                                                Get Directions
                                            </Button>
                                        </a>
                                    )}

                                    {isToday ? (
                                        <EntryActionButtons entry={entry} role={session.user.role} />
                                    ) : (
                                        <div className="w-full p-4 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm text-center border border-yellow-500/20">
                                            Action allowed only on {formatInIST(entry.entryDate || entry.createdAt, "PP")}
                                        </div>
                                    )}
                                </>
                            )}

                            {!isAdmin && entry.status === 'Not Started' && (
                                <Link href={`/entries/${entry._id}/edit`} onClick={() => onClose()}>
                                    <Button variant="outline" className="w-full">
                                        <Edit className="w-4 h-4 mr-2" /> Edit Entry
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
