"use client";

import { useSession } from "next-auth/react";
import { createEntry } from "@/app/actions/entryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEntryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Default values could be from user profile if we want
    const [region, setRegion] = useState(session?.user?.region || "");
    const [branch, setBranch] = useState(session?.user?.branch || "");

    async function clientAction(formData) {
        setLoading(true);
        formData.append("region", region);
        formData.append("branch", branch);

        const res = await createEntry(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Entry created!");
            router.push("/entries");
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Visit Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={clientAction}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>User Email</Label>
                                <Input value={session?.user?.email || ""} disabled />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input id="customerName" name="customerName" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Customer Address</Label>
                                <Input id="customerAddress" name="customerAddress" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Select value={region} onValueChange={setRegion} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="North">North</SelectItem>
                                            <SelectItem value="South">South</SelectItem>
                                            <SelectItem value="East">East</SelectItem>
                                            <SelectItem value="West">West</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Branch</Label>
                                    <Select value={branch} onValueChange={setBranch} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Main">Main Branch</SelectItem>
                                            <SelectItem value="Downtown">Downtown</SelectItem>
                                            <SelectItem value="Uptown">Uptown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Visit</Label>
                                <Textarea id="purpose" name="purpose" required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Entry"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
