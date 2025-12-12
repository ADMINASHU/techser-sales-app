"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, Check, X } from "lucide-react";
import { verifyUser, declineUser, updateUserRole, deleteUser } from "@/app/actions/adminActions";
import { toast } from "sonner";
import UserProfileModal from "./UserProfileModal";

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

export default function AdminUserRow({ user }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleAction = async (actionFn, ...args) => {
        setIsLoading(true);
        try {
            const result = await actionFn(...args);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Action successful");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TableRow>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge
                        variant={
                            user.status === "verified"
                                ? "success"
                                : user.status === "declined"
                                    ? "destructive"
                                    : "outline"
                        }
                        className={
                            user.status === "verified"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : user.status === "declined"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                    >
                        {user.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    {user.region || "-"} / {user.branch || "-"}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowProfile(true)}>
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleAction(updateUserRole, user._id, user.role === "admin" ? "user" : "admin")}
                            >
                                {user.role === "admin" ? <ShieldAlert className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                Set as {user.role === "admin" ? "User" : "Admin"}
                            </DropdownMenuItem>
                            {user.status === "pending" && (
                                <>
                                    <DropdownMenuItem onClick={() => handleAction(verifyUser, user._id)}>
                                        <Check className="mr-2 h-4 w-4" /> Verify
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction(declineUser, user._id)}>
                                        <X className="mr-2 h-4 w-4" /> Decline
                                    </DropdownMenuItem>
                                </>
                            )}
                             <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600" 
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            <UserProfileModal user={user} open={showProfile} onOpenChange={setShowProfile} />
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            account and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            handleAction(deleteUser, user._id);
                            setShowDeleteConfirm(false);
                        }} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
