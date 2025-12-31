import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import EntryActionButtons from "@/components/EntryActionButtons";
import EntryMap from "@/components/EntryMap";
import EntryUserCard from "@/components/EntryUserCard";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { formatInIST } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation, Edit } from "lucide-react";

export default async function EntryDetailPage({ params, searchParams }) {
    const { id } = await params;
    const { from } = await searchParams;
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();
    
    // Validate ID to prevent CastError (e.g., if "new" is passed)
    const mongoose = (await import("mongoose")).default;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return redirect("/entries");
    }

    const entryDoc = await Entry.findById(id)
        .populate("userId", "name email image role designation region branch status")
        .populate("customerId"); // Populate customer data


    if (!entryDoc) {
        return <div>Entry not found</div>;
    }

    // Convert to plain JSON
    const entry = JSON.parse(JSON.stringify(entryDoc));

    // Determine variant for badge
    const statusColor =
        entry.status === "Completed" ? "default" :
            entry.status === "In Process" ? "secondary" : "outline";

    const backLink = from === "dashboard" ? "/dashboard" : "/entries";
    const backText = from === "dashboard" ? "Back to Dashboard" : "Back to List";

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <Link href={backLink}>
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {backText}
                </Button>
            </Link>

            <div className={`grid grid-cols-1 ${session.user.role === 'admin' ? "lg:grid-cols-3" : ""} gap-6`}>
                {session.user.role === 'admin' && (
                    <div className="lg:col-span-2">
                        <Card className="h-full flex flex-col glass-card overflow-hidden">
                            {/* Map Visualization */}
                            <div className="grow p-1">
                                <EntryMap
                                    location={entry.location}
                                    destinationName={entry.customerName}
                                    stampInLocation={entry.stampIn?.location}
                                    stampOutLocation={entry.stampOut?.location}
                                    className="w-full border-none rounded-t-lg lg:rounded-lg h-[400px] lg:h-[calc(100vh-200px)] min-h-[400px]"
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Right Column: details */}
                <div className={`${session.user.role === 'admin' ? "lg:col-span-1" : "max-w-3xl mx-auto w-full"} space-y-4`}>
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/5">
                            <CardTitle>Visit Details</CardTitle>
                            <div className="flex items-center gap-2">
                                {session.user.role !== 'admin' && entry.status === 'Not Started' && (
                                    <Link href={`/entries/${entry._id}/edit`}>
                                        <Button variant="outline" size="sm" className="h-8">
                                            <Edit className="w-3 h-3 mr-1" /> Edit
                                        </Button>
                                    </Link>
                                )}
                                <Badge variant={statusColor}>{entry.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 mt-4">
                            <div className="space-y-4">
                                 <div>
                                    <Label className="text-muted-foreground mb-2">Visited By</Label>
                                    <EntryUserCard user={entry.userId} />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Customer</Label>
                                    <div className="font-medium text-lg text-white">{entry.customerName}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Address</Label>
                                    <div className="font-medium mb-2 text-gray-300">{entry.customerAddress}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Contact Person</Label>
                                        <div className="font-medium text-sm sm:text-base">{entry.contactPerson || "-"}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Contact Number</Label>
                                        <div className="font-medium text-sm sm:text-base">{entry.contactNumber || "-"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Stamp In:</span>
                                    <span className="text-gray-200 font-medium">{entry.stampIn?.time ? formatInIST(entry.stampIn.time, "PPpp") : "-"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Stamp Out:</span>
                                    <span className="text-gray-200 font-medium">{entry.stampOut?.time ? formatInIST(entry.stampOut.time, "PPpp") : "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            {session.user.role === 'admin' && (
                                <>
                                    {entry.location?.lat && entry.location?.lng && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${entry.location.lat},${entry.location.lng}`}
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

                                    {new Date().toDateString() === new Date(entry.entryDate || entry.createdAt).toDateString() ? (
                                        <EntryActionButtons entry={entry} role={session.user.role} />
                                    ) : (
                                        <div className="w-full p-4 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm text-center border border-yellow-500/20">
                                            Action allowed only on {formatInIST(entry.entryDate || entry.createdAt, "PP")}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Label({ children, className }) {
    return <p className={`text-xs uppercase tracking-wider ${className}`}>{children}</p>
}
