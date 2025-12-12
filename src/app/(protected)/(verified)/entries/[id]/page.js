import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import EntryActionButtons from "@/components/EntryActionButtons";
import EntryMap from "@/components/EntryMap"; // [NEW]
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EntryDetailPage({ params }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();
    const entryDoc = await Entry.findById(id);

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
        <div className="max-w-2xl mx-auto space-y-4">
            <Link href="/entries">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
            </Link>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Visit Details</CardTitle>
                    <Badge variant={statusColor}>{entry.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Customer</Label>
                            <div className="font-medium">{entry.customerName}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">User</Label>
                            <div className="font-medium">{session.user.name} ({session.user.email})</div>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-muted-foreground">Address</Label>
                            <div className="font-medium mb-2">{entry.customerAddress}</div>
                            {/* Map Visualization */}
                            <EntryMap 
                                location={entry.location} 
                                destinationName={entry.customerName} 
                            />
                        </div>
                        {/* <div>
                            <Label className="text-muted-foreground">Region</Label>
                            <div className="font-medium">{entry.region}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Branch</Label>
                            <div className="font-medium">{entry.branch}</div>
                        </div> */}
                        <div className="col-span-2">
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
                <CardFooter>
                    <EntryActionButtons entry={entry} />
                </CardFooter>
            </Card>
        </div>
    );
}

function Label({ children, className }) {
    return <p className={`text-xs uppercase tracking-wider ${className}`}>{children}</p>
}
