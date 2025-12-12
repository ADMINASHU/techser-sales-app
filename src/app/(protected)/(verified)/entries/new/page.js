"use client";

import { useSession } from "next-auth/react";
import { createEntry } from "@/app/actions/entryActions";
import { getLocations } from "@/app/actions/settingsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/LocationPicker"; // [NEW]
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
        console.log("Client Action Triggered");
        console.log("Coordinates State:", coordinates);
        
        formData.append("region", region);
        formData.append("branch", branch);
        
        // Append controlled inputs
        formData.set("customerAddress", customerAddress);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("pincode", pincode);
        if (coordinates.lat) {
            formData.append("lat", coordinates.lat);
            console.log("Appended lat:", coordinates.lat);
        }
        if (coordinates.lng) {
            formData.append("lng", coordinates.lng);
            console.log("Appended lng:", coordinates.lng);
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
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Visit Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={clientAction}>
                        <div className="space-y-4">
                            {/* Hidden User Email - Fixed */}
                            
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input id="customerName" name="customerName" required />
                            </div>

                            {/* Map & Address Picker */}
                            <div className="space-y-2">
                                <Label>Select Location</Label>
                                <LocationPicker onLocationSelect={handleLocationSelect} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Address Details</Label>
                                <Input 
                                    id="customerAddress" 
                                    name="customerAddress" 
                                    value={customerAddress} 
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Full address"
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>District</Label>
                                    <Input 
                                        value={district} 
                                        onChange={(e) => setDistrict(e.target.value)} 
                                        name="district" 
                                        placeholder="District" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input 
                                        value={state} 
                                        onChange={(e) => setState(e.target.value)} 
                                        name="state" 
                                        placeholder="State" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input 
                                        value={pincode} 
                                        onChange={(e) => setPincode(e.target.value)} 
                                        name="pincode" 
                                        placeholder="Pincode" 
                                    />
                                </div>
                            </div>

                            {/* Hidden Region & Branch (Auto-filled) */}
                            {false && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Region</Label>
                                        <Select value={region} onValueChange={setRegion} required>
                                            <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                                            <SelectContent>
                                                {locations.map((loc) => (
                                                    <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Branch</Label>
                                        <Select value={branch} onValueChange={setBranch} disabled={!region} required>
                                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                            <SelectContent>
                                                {availableBranches.map((b) => (
                                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

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
