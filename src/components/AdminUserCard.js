"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, Loader2, ShieldAlert } from "lucide-react";
import { deleteUser, verifyUser, declineUser, updateUserRole } from "@/app/actions/adminActions";
import { toast } from "sonner";
import UserProfileModal from "./UserProfileModal";
import UserCard from "./UserCard";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUserCard({ user }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleAction = async (e, actionFn, ...args) => {
        if (isLoading) return; // Immediate guard
        if (e && e.stopPropagation) e.stopPropagation();
        setIsLoading(true);
        try {
            const result = await actionFn(...args);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Update successful! Notification sent.");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const actions = (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                onClick={(e) => handleAction(e, updateUserRole, user._id, user.role === "admin" ? "user" : "admin")}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
                {user.role === "admin" ? "Make User" : "Make Admin"}
            </Button>

            {(user.status === "pending" || user.status === "declined") && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    onClick={(e) => handleAction(e, verifyUser, user._id)}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                    Verify
                </Button>
            )}

            {(user.status === "pending" || user.status === "verified") && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={(e) => handleAction(e, declineUser, user._id)}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5 mr-1" />}
                    Decline
                </Button>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                }}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );

    return (
        <>
            <UserCard 
                user={user} 
                onClick={() => setShowProfile(true)} 
                actions={actions}
            />
            
            <UserProfileModal user={user} open={showProfile} onOpenChange={setShowProfile} />

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="glass-panel border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the user
                            account and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            handleAction(e, deleteUser, user._id);
                            setShowDeleteConfirm(false);
                        }} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
