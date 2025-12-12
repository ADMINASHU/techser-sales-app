"use client";

import { useSession } from "next-auth/react";
import { updateProfile } from "@/app/actions/userActions";
import { getLocations } from "@/app/actions/settingsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileSetupPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [locations, setLocations] = useState([]);
    const [region, setRegion] = useState("");
    const [branch, setBranch] = useState("");
    const [availableBranches, setAvailableBranches] = useState([]);

    useEffect(() => {
        getLocations().then(data => setLocations(data));
    }, []);

    useEffect(() => {
        if (region) {
            const loc = locations.find(l => l.name === region);
            setAvailableBranches(loc ? loc.branches.sort() : []);
            setBranch(""); // Reset branch when region changes
        } else {
            setAvailableBranches([]);
        }
    }, [region, locations]);

    async function clientAction(formData) {
        setLoading(true);
        // Manually append region and branch since they are controlled state
        formData.append("region", region);
        formData.append("branch", branch);

        const res = await updateProfile(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated!");
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="flex justify-center items-center py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>
                        Please provide additional details to finish setting up your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={clientAction}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input id="contactNumber" name="contactNumber" placeholder="+123..." required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" placeholder="123 Main St" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="region">Region</Label>
                                    <Select value={region} onValueChange={setRegion} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc._id} value={loc.name}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Select value={branch} onValueChange={setBranch} disabled={!region} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableBranches.map((b) => (
                                                <SelectItem key={b} value={b}>
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save & Continue"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
