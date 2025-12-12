"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function UserProfileModal({ user, open, onOpenChange }) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Name:</span>
                        <span className="col-span-3">{user.name}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Email:</span>
                        <span className="col-span-3">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Role:</span>
                        <span className="col-span-3 capitalize">{user.role}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Status:</span>
                        <span className="col-span-3 capitalize">{user.status}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Region:</span>
                        <span className="col-span-3">{user.region || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Branch:</span>
                        <span className="col-span-3">{user.branch || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Contact:</span>
                        <span className="col-span-3">{user.contactNumber || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold text-right col-span-1">Address:</span>
                        <span className="col-span-3">{user.address || "N/A"}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
