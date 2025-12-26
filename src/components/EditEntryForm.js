"use client";

import { updateEntry } from "@/app/actions/entryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/LocationPicker";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function EditEntryForm({ entry }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isSubmitting = useRef(false);

    // Initial State from Entry
    const [customerName, setCustomerName] = useState(entry.customerName || "");
    const [customerAddress, setCustomerAddress] = useState(entry.customerAddress || "");
    const [district, setDistrict] = useState(entry.district || "");
    const [state, setState] = useState(entry.state || "");
    const [pincode, setPincode] = useState(entry.pincode || "");
    const [contactPerson, setContactPerson] = useState(entry.contactPerson || "");
    const [contactNumber, setContactNumber] = useState(entry.contactNumber || "");
    const [coordinates, setCoordinates] = useState({
        lat: entry.location?.lat || null,
        lng: entry.location?.lng || null
    });
    // Format date for input type="date"
    const formattedDate = entry.entryDate ? new Date(entry.entryDate).toISOString().split("T")[0] : "";
    const [entryDate, setEntryDate] = useState(formattedDate);
    const [purpose, setPurpose] = useState(entry.purpose || "");

    const handleLocationSelect = (data) => {
        setCustomerAddress(data.address);
        setDistrict(data.district);
        setState(data.state);
        setPincode(data.pincode);
        setCoordinates({ lat: data.lat, lng: data.lng });
    };

    async function clientAction(formData) {
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true);

        formData.append("entryDate", entryDate);
        formData.set("customerName", customerName);
        formData.set("customerAddress", customerAddress);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("pincode", pincode);
        formData.set("contactPerson", contactPerson);
        formData.set("contactNumber", contactNumber);
        formData.set("purpose", purpose);
        if (coordinates.lat) formData.append("lat", coordinates.lat);
        if (coordinates.lng) formData.append("lng", coordinates.lng);

        const res = await updateEntry(entry._id, formData);

        if (res?.error) {
            isSubmitting.current = false;
            setLoading(false);
            toast.error(res.error);
        } else {
            toast.success("Entry updated!");
            router.refresh();
            router.push(`/entries/${entry._id}`);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-2 sm:p-4">
            <Card className="w-full max-w-2xl bg-[#1a1f2e] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-white">Edit Visit Entry</CardTitle>
                        <p className="text-sm text-gray-400 mt-1">Update customer visits and locations</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                    <form action={clientAction}>
                        <div className="space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entryDate" className="text-gray-300">Date of Visit</Label>
                                    <Input
                                        type="date"
                                        id="entryDate"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerName" className="text-gray-300">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        placeholder="e.g. Techser Inc."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Update Location (Optional)</Label>
                                <div className="rounded-lg overflow-hidden border border-white/10">
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerAddress" className="text-gray-300">Address Details</Label>
                                <Textarea
                                    id="customerAddress"
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
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber" className="text-gray-300">Contact Number</Label>
                                    <Input
                                        id="contactNumber"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose" className="text-gray-300">Purpose of Visit</Label>
                                <Textarea
                                    id="purpose"
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
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20 px-8"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Update Entry"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
