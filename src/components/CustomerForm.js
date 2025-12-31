"use client";

import { createCustomer, updateCustomer } from "@/app/actions/customerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/LocationPicker";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { toast } from "sonner";
import { useState, useRef } from "react";

export default function CustomerForm({ initialData = null, user = null, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const isSubmitting = useRef(false);

    const [name, setName] = useState(initialData?.name || "");
    const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || "");
    const [district, setDistrict] = useState(initialData?.district || "");
    const [state, setState] = useState(initialData?.state || "");
    const [pincode, setPincode] = useState(initialData?.pincode || "");
    const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || "");
    const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || "");
    const [region] = useState(initialData?.region || user?.region || "");
    const [branch] = useState(initialData?.branch || user?.branch || "");
    const [coordinates, setCoordinates] = useState({ 
        lat: initialData?.location?.lat || null, 
        lng: initialData?.location?.lng || null 
    });

    const isEdit = !!initialData;

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

        if (!region || !branch) {
            toast.error("Access Denied: Your user profile is missing 'Region' or 'Branch' assignments. Please contact an administrator to update your profile.");
            return;
        }

        isSubmitting.current = true;
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("customerAddress", customerAddress);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("pincode", pincode);
        formData.append("contactPerson", contactPerson);
        formData.append("contactNumber", contactNumber);
        formData.append("region", region);
        formData.append("branch", branch);

        if (coordinates.lat) formData.append("lat", coordinates.lat);
        if (coordinates.lng) formData.append("lng", coordinates.lng);

        let res;
        if (isEdit) {
            res = await updateCustomer(initialData._id, formData);
        } else {
            res = await createCustomer(formData);
        }

        if (res?.error) {
            isSubmitting.current = false;
            setLoading(false);
            toast.error(res.error);
        } else {
            toast.success(isEdit ? "Customer updated!" : "Customer created!");
            onSuccess?.();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Customer Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                    placeholder="e.g. Techser Inc."
                    required
                />
            </div>

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
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Full address"
                    className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 min-h-[80px]"
                    required
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-gray-300 text-xs">District</Label>
                    <Input
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="District"
                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-300 text-xs">State</Label>
                    <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-300 text-xs">Pincode</Label>
                    <Input
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode"
                        className="bg-[#1e293b]/80 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50 text-sm"
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

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                    Cancel
                </Button>
                <LoadingButton
                    type="submit"
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20 px-8"
                    loading={loading}
                >
                    {isEdit ? "Update Customer" : "Save Customer"}
                </LoadingButton>
            </div>
        </form>
    );
}
