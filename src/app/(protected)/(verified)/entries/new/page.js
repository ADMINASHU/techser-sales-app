"use client";

import { useSession } from "next-auth/react";
import { createEntry } from "@/app/actions/entryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/LocationPicker";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";


export default function NewEntryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/entries";
    const [loading, setLoading] = useState(false);
    const isSubmitting = useRef(false);

    // New Address Fields
    const [customerAddress, setCustomerAddress] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [purpose, setPurpose] = useState("");
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

    const handleLocationSelect = (data) => {
        setCustomerAddress(data.address);
        setDistrict(data.district);
        setState(data.state);
        setPincode(data.pincode);
        setCoordinates({ lat: data.lat, lng: data.lng });
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (isSubmitting.current) return;

        if (contactNumber.length !== 10) {
            toast.error("Contact number must be exactly 10 digits");
            return;
        }

        isSubmitting.current = true;
        setLoading(true);

        const formData = new FormData();
        formData.append("entryDate", entryDate);
        formData.append("customerName", customerName);
        formData.append("customerAddress", customerAddress);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("pincode", pincode);
        formData.append("contactPerson", contactPerson);
        formData.append("contactNumber", contactNumber);
        formData.append("purpose", purpose);

        if (coordinates.lat) formData.append("lat", coordinates.lat);
        if (coordinates.lng) formData.append("lng", coordinates.lng);

        const res = await createEntry(formData);

        if (res?.error) {
            isSubmitting.current = false;
            setLoading(false);
            toast.error(res.error);
        } else {
            toast.success("Entry created!");
            router.push(callbackUrl);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-2 sm:p-4">
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
                <CardContent className="pt-4 sm:pt-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 sm:space-y-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
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
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Full address"
                                    className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 min-h-[80px]"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson" className="text-gray-300">Contact Person</Label>
                                    <Input
                                        id="contactPerson"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        placeholder="Name of contact"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber" className="text-gray-300">Contact Number</Label>
                                    <Input
                                        id="contactNumber"
                                        type="number"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="Phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose" className="text-gray-300">Purpose of Visit</Label>
                                <Textarea
                                    id="purpose"
                                    name="purpose"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
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
                                <LoadingButton
                                    type="submit"
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20 px-8"
                                    loading={loading}
                                >
                                    Save Entry
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
