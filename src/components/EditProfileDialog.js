"use client";

import { useState, useEffect } from "react";
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
import { updateProfile, changePassword } from "@/app/actions/userActions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditProfileDialog({ user }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Profile State
    const [formData, setFormData] = useState({
        contactNumber: user.contactNumber || "",
        address: user.address || "",
        region: user.region || "",
        branch: user.branch || "",
    });

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
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contactNumber" className="text-right">Contact</Label>
                        <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleProfileChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">Branch</Label>
                        <Input
                            id="branch"
                            name="branch"
                            value={formData.branch}
                            onChange={handleProfileChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="region" className="text-right">Region</Label>
                        <Input
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleProfileChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleProfileChange}
                            className="col-span-3"
                        />
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <button
                            type="button"
                            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            {isPasswordSectionOpen ? "- Cancel Password Change" : "+ Change Password"}
                        </button>
                    </div>

                    {isPasswordSectionOpen && (
                        <div className="grid gap-4 bg-muted/30 p-4 rounded-md">
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required={isPasswordSectionOpen}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
