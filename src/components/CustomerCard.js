"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, User, Trash2, Home, Navigation } from "lucide-react";
import { deleteCustomer } from "@/app/actions/customerActions";
import { toast } from "sonner";
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

export default function CustomerCard({ customer, isAdmin, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const res = await deleteCustomer(customer._id);
        setIsDeleting(false);
        setShowDeleteDialog(false);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Customer deleted");
        }
    };

    return (
        <>
            <div
                onClick={() => onEdit(customer)}
                className="glass-card p-4 rounded-xl relative overflow-hidden group active:scale-[0.98] transition-all duration-300 transform-gpu h-full flex flex-col cursor-pointer"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
                </div>

                <div className="flex items-start justify-between gap-4 mb-2 relative z-10">
                    <h3 className="text-lg font-semibold text-white truncate">{customer.name}</h3>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] py-0 px-1.5 font-medium whitespace-nowrap h-4">
                            {customer.region}
                        </Badge>
                        <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 text-[9px] py-0 px-1.5 font-medium whitespace-nowrap h-4">
                            {customer.branch}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-3 flex-1 relative z-10">
                    <div className="flex items-start gap-3 text-sm text-gray-400">
                        <Home className="w-4 h-4 mt-0.5 text-blue-500/50 shrink-0" />
                        <p className="line-clamp-2">{customer.customerAddress}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4 text-blue-500/50 shrink-0" />
                            <p className="truncate">{customer.contactPerson}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Phone className="w-4 h-4 text-blue-500/50 shrink-0" />
                            <p className="truncate">{customer.contactNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-auto relative z-10">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteDialog(true);
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {customer.location?.lat && (
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${customer.location.lat},${customer.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button variant="secondary" size="sm" className="h-8 text-xs bg-white/10 hover:bg-white/20 border-white/10 text-blue-400">
                                <Navigation className="w-3 h-3 mr-1.5" />
                                Get Directions
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="glass-card border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This will permanently delete the customer &quot;{customer.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Customer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
