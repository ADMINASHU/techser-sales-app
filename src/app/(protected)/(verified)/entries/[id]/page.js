import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { redirect } from "next/navigation";
import { formatInIST } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Navigation } from "lucide-react";
import EntryUserCard from "@/components/EntryUserCard";
import EntryMap from "@/components/EntryMap";

function Label({ children, className }) {
    return <p className={`text-xs uppercase tracking-wider ${className}`}>{children}</p>;
}

export default async function EntryDetailPage({ params, searchParams }) {
    const { id } = await params;
    const { from } = await searchParams;
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();

    // Validate ID
    const mongoose = (await import("mongoose")).default;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return redirect("/entries");
    }

    const entryDoc = await Entry.findById(id)
        .populate("userId", "name email image role designation region branch status contactNumber address")
        .populate("customerId");

    if (!entryDoc) {
        return <div>Entry not found</div>;
    }

    // Convert to plain JSON
    const entry = JSON.parse(JSON.stringify(entryDoc));

    const statusColor =
        entry.status === "Completed" ? "default" :
            entry.status === "In Process" ? "secondary" : "outline";

    const backLink = from === "dashboard" ? "/dashboard" : "/entries";
    const backText = from === "dashboard" ? "Back to Dashboard" : "Back to List";
    const isAdmin = session.user.role === 'admin';

    // Fallback logic from Modal
    const displayLocation = entry.customerId?.location || entry.location;
    const destinationName = entry.customerId?.name || entry.customerName;

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 p-4 lg:p-6">
            <div className="flex justify-between items-center">
                <Link href={backLink} className="inline-block">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white px-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {backText}
                    </Button>
                </Link>
                {/* Mobile Status Badge */}
                <Badge variant={statusColor} className="capitalize px-3 py-1 text-xs lg:hidden">{entry.status}</Badge>
            </div>

            {/* Header shifted to top - Hidden on mobile as it's in Navbar */}
            <div className="hidden lg:flex items-center justify-between px-1">
                <h1 className="text-2xl font-bold text-white">Visit Details</h1>
                <Badge variant={statusColor} className="capitalize px-3 py-1 text-xs">{entry.status}</Badge>
            </div>

            {/* Main Content Card mimicking the Modal layout */}
            <div className="w-full bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] min-h-[600px]">

                {/* Map Column - Left Side (2/3 on desktop) */}
                <div className="lg:w-2/3 h-[300px] lg:h-full relative bg-gray-900/50 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden shrink-0">
                    <EntryMap
                        location={displayLocation}
                        destinationName={destinationName}
                        stampInLocation={entry.stampIn?.location}
                        stampOutLocation={entry.stampOut?.location}
                        className="w-full h-full"
                    />
                </div>

                {/* Info Panel - Right Side (1/3 on desktop) */}
                <div className="lg:w-1/3 bg-[#0b0f19] p-6 lg:p-8 flex flex-col h-full lg:overflow-y-auto hide-scrollbar">

                    {/* Content */}
                    <div className="space-y-6 flex-1 pt-2">
                        {/* Visited By */}
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">VISITED BY</Label>
                            <EntryUserCard user={entry.userId} />
                        </div>

                        {/* Customer */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CUSTOMER</Label>
                            <p className="text-xl font-bold text-white leading-tight">
                                {entry.customerId?.name || entry.customerName}
                            </p>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">ADDRESS</Label>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                {entry.customerId?.customerAddress || entry.customerAddress}
                            </p>
                        </div>

                        {/* Contact Details Grid */}
                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CONTACT PERSON</Label>
                                <p className="text-sm text-white font-medium">
                                    {entry.customerId?.contactPerson || entry.contactPerson || "-"}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-500 font-medium text-[10px] tracking-[0.2em]">CONTACT NUMBER</Label>
                                <p className="text-sm text-white font-medium">
                                    {entry.customerId?.contactNumber || entry.contactNumber || "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                        {/* Timestamps */}
                        <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-medium uppercase tracking-wider">Stamp In</span>
                                <span className="text-white font-mono">
                                    {entry.stampIn?.time ? formatInIST(entry.stampIn.time, "p, dd MMM") : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-medium uppercase tracking-wider">Stamp Out</span>
                                <span className="text-white font-mono">
                                    {entry.stampOut?.time ? formatInIST(entry.stampOut.time, "p, dd MMM") : "-"}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
}
