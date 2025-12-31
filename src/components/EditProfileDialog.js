"use client";

import { useState, useEffect } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateProfile, changePassword } from "@/app/actions/userActions";
import { getLocations } from "@/app/actions/settingsActions";
import { toast } from "sonner";

export default function EditProfileDialog({ user, trigger }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Settings State
    const [locations, setLocations] = useState([]);
    const [availableBranches, setAvailableBranches] = useState([]);

    useEffect(() => {
        setMounted(true);
        getLocations().then(data => setLocations(data));
    }, []);

    // Profile State
    const [formData, setFormData] = useState({
        name: user.name || "",
        contactNumber: user.contactNumber || "",
        address: user.address || "",
        region: user.region || "",
        branch: user.branch || "",
        designation: user.designation || "",
    });

    // Update available branches when region changes
    useEffect(() => {
        if (formData.region) {
            const loc = locations.find(l => l.name === formData.region);
            setAvailableBranches(loc ? loc.branches.sort() : []);

            // Check if current branch is valid for new region
            if (formData.branch && loc && !loc.branches.includes(formData.branch)) {
                setFormData(prev => ({ ...prev, branch: "" }));
            }
        } else {
            setAvailableBranches([]);
        }
    }, [formData.region, formData.branch, locations]);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

    const handleProfileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update Profile Details
            const profileFormData = new FormData();
            Object.entries(formData).forEach(([key, value]) => profileFormData.append(key, value));

            const profileRes = await updateProfile(profileFormData);
            if (profileRes.error) throw new Error(profileRes.error);

            // 2. Change Password (if requested)
            if (isPasswordSectionOpen && passwordData.newPassword) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    throw new Error("New passwords do not match");
                }
                const passwordRes = await changePassword(passwordData.currentPassword, passwordData.newPassword);
                if (passwordRes.error) throw new Error(passwordRes.error);
                toast.success("Password changed successfully");
            }

            toast.success("Profile updated successfully");
            setOpen(false);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Edit Profile</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto hide-scrollbar bg-[#1a1f2e] border-white/10 shadow-2xl">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="text-white">Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-300">Display Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleProfileChange}
                            placeholder="Your Name"
                            className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contactNumber" className="text-gray-300">Contact Number (10 Digits)</Label>
                        <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setFormData(prev => ({ ...prev, contactNumber: val }));
                            }}
                            type="tel"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="designation" className="text-gray-300">Designation</Label>
                        <Input
                            id="designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleProfileChange}
                            placeholder="e.g. Sales Executive"
                            className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="region" className="text-gray-300">Region</Label>
                            <Select
                                value={formData.region}
                                onValueChange={(val) => handleSelectChange("region", val)}
                            >
                                <SelectTrigger className="w-full bg-[#1e293b]/50 border-white/10 text-white focus:ring-1 focus:ring-fuchsia-500/50">
                                    <SelectValue placeholder="Select Region" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
                                    {locations.map(loc => (
                                        <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="branch" className="text-gray-300">Branch</Label>
                            <Select
                                value={formData.branch}
                                onValueChange={(val) => handleSelectChange("branch", val)}
                                disabled={!formData.region}
                            >
                                <SelectTrigger className="w-full bg-[#1e293b]/50 border-white/10 text-white focus:ring-1 focus:ring-fuchsia-500/50 disabled:opacity-50">
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1f2e] border-white/10 text-white">
                                    {availableBranches.map(branch => (
                                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address" className="text-gray-300">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleProfileChange}
                            className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
                        />
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
                        >
                            {isPasswordSectionOpen ? "- Cancel Password Change" : "+ Change Password"}
                        </button>
                    </div>

                    {isPasswordSectionOpen && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                    className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                    className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                    className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50"
                                />
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            className="bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20"
                        >
                            Save changes
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
