import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import EntryActionButtons from "@/components/EntryActionButtons";
import EntryMap from "@/components/EntryMap";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation, Edit } from "lucide-react";

export default async function EntryDetailPage({ params }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();
    await dbConnect();
    const entryDoc = await Entry.findById(id).populate("userId", "name email");

    if (!entryDoc) {
        return <div>Entry not found</div>;
    }

    // Convert to plain JSON to avoid Next.js serialization issues with Mongoose objects (IDs, Dates)
    const entry = JSON.parse(JSON.stringify(entryDoc));

    // Determine variant for badge
    const statusColor =
        entry.status === "Completed" ? "default" :
            entry.status === "In Process" ? "secondary" : "outline";

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <Link href="/entries">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col">
                        {/* Map Visualization */}
                        <div className="grow p-1">
                            <EntryMap
                                location={entry.location}
                                destinationName={entry.customerName}
                                stampInLocation={session.user.role === 'admin' ? entry.stampIn?.location : null}
                                stampOutLocation={session.user.role === 'admin' ? entry.stampOut?.location : null}
                                className="w-full border-none rounded-t-lg lg:rounded-lg h-[400px] lg:h-[calc(100vh-200px)] min-h-[400px]"
                            />
                        </div>
                    </Card>
                </div>

                {/* Right Column: details (Takes 1/3 width on desktop) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
                                    <Label className="text-muted-foreground">Customer</Label>
                                    <div className="font-medium">{entry.customerName}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Visited By</Label>
                                    <div className="font-medium">{entry.userId?.name} ({entry.userId?.email})</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Address</Label>
                                    <div className="font-medium mb-2">{entry.customerAddress}</div>
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
                                <div>
                                    <Label className="text-muted-foreground">Purpose</Label>
                                    <div className="font-medium">{entry.purpose}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stamp In:</span>
                                    <span>{entry.stampIn?.time ? format(new Date(entry.stampIn.time), "PPpp") : "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Stamp Out:</span>
                                    <span>{entry.stampOut?.time ? format(new Date(entry.stampOut.time), "PPpp") : "-"}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
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
                                <div className="w-full p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm text-center">
                                    Action allowed only on {format(new Date(entry.entryDate || entry.createdAt), "PP")}
                                </div>
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
