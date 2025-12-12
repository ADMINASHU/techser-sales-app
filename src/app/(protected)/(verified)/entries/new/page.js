"use client";

import { useSession } from "next-auth/react";
import { createEntry } from "@/app/actions/entryActions";
import { getLocations } from "@/app/actions/settingsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/LocationPicker";
import { X } from "lucide-react";
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
import { useState, useEffect } from "react";

export default function NewEntryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [locations, setLocations] = useState([]);
    const [region, setRegion] = useState(session?.user?.region || "");
    const [branch, setBranch] = useState(session?.user?.branch || "");
    const [availableBranches, setAvailableBranches] = useState([]);

    // New Address Fields
    const [customerAddress, setCustomerAddress] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        getLocations().then(data => setLocations(data));
    }, []);

    useEffect(() => {
        if (region) {
            const loc = locations.find(l => l.name === region);
            setAvailableBranches(loc ? loc.branches.sort() : []);

            if (branch) {
                const isValid = loc ? loc.branches.includes(branch) : false;
                if (!isValid) setBranch("");
            }
        } else {
            setAvailableBranches([]);
        }
    }, [region, locations]);

    useEffect(() => {
        if (session?.user?.region && locations.length > 0 && !region) {
            setRegion(session.user.region);
        }
        if (session?.user?.branch && locations.length > 0 && !branch) {
            setBranch(session.user.branch);
        }
    }, [session, locations]);

    const handleLocationSelect = (data) => {
        setCustomerAddress(data.address);
        setDistrict(data.district);
        setState(data.state);
        setPincode(data.pincode);
        setCoordinates({ lat: data.lat, lng: data.lng });
    };

    async function clientAction(formData) {
        setLoading(true);

        formData.append("region", region);
        formData.append("branch", branch);
        formData.append("entryDate", entryDate);

        // Append controlled inputs
        formData.set("customerAddress", customerAddress);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("pincode", pincode);
        if (coordinates.lat) {
            formData.append("lat", coordinates.lat);
        }
        if (coordinates.lng) {
            formData.append("lng", coordinates.lng);
        }

        const res = await createEntry(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Entry created!");
            router.push("/dashboard");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-4">
            <Card className="w-full max-w-2xl bg-[#1a1f2e] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-white">Add New Visit Entry</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">Track your customer visits and locations</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <form action={clientAction}>
                        <div className="space-y-5">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entryDate" className="text-gray-300">Date of Visit</Label>
                                    <Input
                                        type="date"
                                        id="entryDate"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerName" className="text-gray-300">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        placeholder="e.g. Techser Inc."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Map & Address Picker */}
                            <div className="space-y-2">
                                <Label className="text-gray-300">Select Location</Label>
                                <div className="rounded-lg overflow-hidden border border-white/10">
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerAddress" className="text-gray-300">Address Details</Label>
                                <Input
                                    id="customerAddress"
                                    name="customerAddress"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Full address"
                                    className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">District</Label>
                                    <Input
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        name="district"
                                        placeholder="District"
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">State</Label>
                                    <Input
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        name="state"
                                        placeholder="State"
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Pincode</Label>
                                    <Input
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        name="pincode"
                                        placeholder="Pincode"
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose" className="text-gray-300">Purpose of Visit</Label>
                                <Textarea
                                    id="purpose"
                                    name="purpose"
                                    className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 min-h-[100px]"
                                    placeholder="Enter visitation details..."
                                    required
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20 px-8"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Entry"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
