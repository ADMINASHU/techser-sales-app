"use client";

import { createCustomer, updateCustomer } from "@/app/actions/customerActions";
import { checkDuplicateCustomer } from "@/app/actions/checkDuplicateCustomer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import LocationPicker from "@/components/LocationPicker";
import DuplicateCustomerWarning from "@/components/DuplicateCustomerWarning";
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
    const [isActive, setIsActive] = useState(initialData?.isActive !== undefined ? initialData.isActive : true);
    const [coordinates, setCoordinates] = useState({ 
        lat: initialData?.location?.lat || null, 
        lng: initialData?.location?.lng || null 
    });

    // Duplicate detection states
    const [nearbyCustomers, setNearbyCustomers] = useState([]);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [duplicateCheckDone, setDuplicateCheckDone] = useState(false);
    const [checkingDuplicates, setCheckingDuplicates] = useState(false);

    const isEdit = !!initialData;

    const handleLocationSelect = async (data) => {
        setCustomerAddress(data.address);
        setDistrict(data.district);
        setState(data.state);
        setPincode(data.pincode);
        setCoordinates({ lat: data.lat, lng: data.lng });

        // Only check for duplicates when adding new customer (not editing)
        if (!isEdit && data.lat && data.lng && region && branch) {
            setCheckingDuplicates(true);
            setDuplicateCheckDone(false);
            
            try {
                const result = await checkDuplicateCustomer({
                    lat: data.lat,
                    lng: data.lng,
                    region,
                    branch,
                });

                if (result.error) {
                    toast.error(result.error);
                    setDuplicateCheckDone(true);
                } else if (result.nearbyCustomers && result.nearbyCustomers.length > 0) {
                    setNearbyCustomers(result.nearbyCustomers);
                    setShowDuplicateWarning(true);
                    setDuplicateCheckDone(false); // Don't mark as done until user acknowledges
                } else {
                    setNearbyCustomers([]);
                    setDuplicateCheckDone(true);
                }
            } catch (error) {
                console.error("Duplicate check error:", error);
                toast.error("Failed to check for duplicates");
                setDuplicateCheckDone(true); // Allow submission even if check fails
            } finally {
                setCheckingDuplicates(false);
            }
        }
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
        formData.append("isActive", isActive);

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
        <>
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

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="text-gray-300 font-medium">Customer Status</Label>
                        <p className="text-xs text-gray-500">
                            {isActive ? (
                                <>Active customers appear on <br /> check-in-out page</>
                            ) : (
                                <>Inactive customers are hidden from <br /> check-in-out page</>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-gray-500"}`}>
                            {isActive ? "Active" : "Inactive"}
                        </span>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Select Location</Label>
                        {checkingDuplicates && (
                            <span className="text-xs text-amber-400 animate-pulse">
                                Checking for duplicates...
                            </span>
                        )}
                    </div>
                    <div className="rounded-lg overflow-hidden border border-white/10">
                        <LocationPicker 
                            onLocationSelect={handleLocationSelect}
                            initialCoordinates={initialData?.location ? {
                                lat: initialData.location.lat,
                                lng: initialData.location.lng
                            } : null}
                        />
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
                        className="bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20 px-8"
                        loading={loading}
                        disabled={checkingDuplicates}
                    >
                        {isEdit ? "Update Customer" : "Save Customer"}
                    </LoadingButton>
                </div>
            </form>

            {/* Duplicate Warning Dialog */}
            <DuplicateCustomerWarning
                nearbyCustomers={nearbyCustomers}
                open={showDuplicateWarning}
                onOpenChange={setShowDuplicateWarning}
                onProceed={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateCheckDone(true);
                }}
                onCancel={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateCheckDone(false);
                    // Optionally reset location or let user adjust
                }}
            />
        </>
    );
}
